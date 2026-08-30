import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/utils/supabase/server'
import { updateOrderStatus, toDbOrderStatus } from '@/utils/order-lifecycle'

interface FinancialCalculationResult {
  subtotal: number
  shippingFee: number
  gstFee: number
  orderAmount: number
  amountInPaisa: number
  printerPayout: number
  designerRoyalty: number
  platformFee: number
}

async function calculateOrderFinancials(
  adminSupabase: any,
  items: any[]
): Promise<{ success: true; data: FinancialCalculationResult } | { success: false; error: string }> {
  if (!Array.isArray(items) || items.length === 0) {
    return { success: false, error: 'No items provided for pricing calculation' }
  }

  let subtotal = 0

  for (const item of items) {
    const rawId = String(item?.id || '').trim()
    const cleanId = rawId.startsWith('design-') ? rawId.slice(7) : rawId
    const qty = Math.max(1, Number(item?.quantity) || 1)
    let unitPrice: number | null = null

    if (cleanId && !rawId.startsWith('pod-')) {
      // 1. Authoritative check in designs table
      const { data: dbDesign } = await adminSupabase
        .from('designs')
        .select('price')
        .eq('id', cleanId)
        .maybeSingle()

      if (dbDesign && typeof dbDesign.price === 'number' && dbDesign.price >= 0) {
        const infill = Math.max(10, Math.min(100, Number(item?.infill) || 20))
        const scale = Math.max(10, Math.min(500, Number(item?.scale) || 100))
        const finish = String(item?.surfaceFinish || '')
        const finishSurcharge = finish === 'Smoothed (vapor/sanded)' ? 80 : finish === 'Painted' ? 180 : 0
        const infillMultiplier = 1 + (infill - 20) / 100
        const scaleMultiplier = Math.pow(scale / 100, 2)

        unitPrice = Math.max(50, Math.round(dbDesign.price * infillMultiplier * scaleMultiplier) + finishSurcharge)
      } else {
        // 2. Authoritative check in products table
        const { data: dbProduct } = await adminSupabase
          .from('products')
          .select('price')
          .eq('id', cleanId)
          .maybeSingle()

        if (dbProduct && typeof dbProduct.price === 'number' && dbProduct.price >= 0) {
          unitPrice = dbProduct.price
        }
      }
    }

    // 3. Custom Print-on-Demand (POD) Sliced File Uploads (e.g. 'pod-1787823908195')
    if (unitPrice === null && (rawId.startsWith('pod-') || item?.type === 'custom_print' || item?.isCustomPrint)) {
      let verifiedVolumeCm3: number | null = null

      // Look up design/asset metadata if persisted design_id exists
      const assetId = item?.design_id || (cleanId && !cleanId.startsWith('pod-') ? cleanId : null)
      if (assetId) {
        const { data: dbAsset } = await adminSupabase
          .from('designs')
          .select('id, price, tags')
          .eq('id', assetId)
          .maybeSingle()
        if (dbAsset) {
          const volTag = Array.isArray(dbAsset.tags) ? dbAsset.tags.find((t: string) => typeof t === 'string' && t.startsWith('vol_cm3:')) : null
          if (volTag) {
            const parsed = Number(volTag.split(':')[1])
            if (Number.isFinite(parsed) && parsed > 0) verifiedVolumeCm3 = parsed
          }
        }
      }

      // Reject when server-generated slicing/upload metadata is missing (never trust client volume properties)
      if (verifiedVolumeCm3 === null) {
        return {
          success: false,
          error: `Custom print item "${item?.title || rawId}" lacks verified server volume metadata. Please re-slice the model in Print Studio before checkout.`,
        }
      }

      const volumeCm3 = Math.max(1, verifiedVolumeCm3)
      const material = String(item?.material || 'PLA').toUpperCase()
      const materialRatePerCm3 = material === 'RESIN' ? 8.5 : material === 'PETG' ? 4.5 : material === 'ABS' ? 5.0 : material === 'TPU' ? 6.0 : 3.5 // PLA base
      const infill = Math.max(10, Math.min(100, Number(item?.infill) || 20))
      const infillFactor = 0.3 + (infill / 100) * 0.7

      let basePrinterRate = 150
      const targetPrinterId = item?.printer_id || item?.hubId
      if (targetPrinterId) {
        const { data: dbPrinter } = await adminSupabase
          .from('printers')
          .select('base_price')
          .eq('id', targetPrinterId)
          .maybeSingle()
        if (dbPrinter && typeof dbPrinter.base_price === 'number' && dbPrinter.base_price > 0) {
          basePrinterRate = dbPrinter.base_price
        }
      }

      const calculatedPodPrice = Math.round(basePrinterRate + (volumeCm3 * materialRatePerCm3 * infillFactor))
      unitPrice = Math.max(150, calculatedPodPrice)
    }

    // 4. Custom Print Hub Selection fallback
    if (unitPrice === null && (item?.printer_id || item?.hubId)) {
      const targetPrinterId = item.printer_id || item.hubId
      const { data: dbPrinter } = await adminSupabase
        .from('printers')
        .select('base_price')
        .eq('id', targetPrinterId)
        .maybeSingle()

      if (dbPrinter && typeof dbPrinter.base_price === 'number' && dbPrinter.base_price >= 0) {
        unitPrice = dbPrinter.base_price
      }
    }

    // Reject unrecognized or malformed items lacking valid pricing
    if (unitPrice === null || unitPrice === undefined || unitPrice < 0) {
      return {
        success: false,
        error: `Item "${item?.title || rawId || 'Custom item'}" could not be verified.`,
      }
    }

    // Exact line item total without lossy intermediate integer division
    const lineTotal = unitPrice * qty
    subtotal += lineTotal
  }

  const shippingFee = subtotal === 0 || subtotal > 1500 ? 0 : 99
  const gstFee = Math.round(subtotal * 0.18)
  const orderAmount = subtotal + shippingFee + gstFee

  const amountInPaisa = Math.round(orderAmount * 100)
  const printerPayoutPaisa = Math.floor(amountInPaisa * 0.70)
  const designerRoyaltyPaisa = Math.floor(amountInPaisa * 0.15)
  const platformFeePaisa = amountInPaisa - (printerPayoutPaisa + designerRoyaltyPaisa)

  return {
    success: true,
    data: {
      subtotal,
      shippingFee,
      gstFee,
      orderAmount,
      amountInPaisa,
      printerPayout: printerPayoutPaisa / 100,
      designerRoyalty: designerRoyaltyPaisa / 100,
      platformFee: platformFeePaisa / 100,
    },
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const adminSupabase = await createAdminClient()

    // 1. Authenticate caller
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized: Log in required to initiate payment' }, { status: 401 })
    }

    let body: Record<string, any>
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    let { orderId, items, shippingAddress, paymentMethod, isCod, notes } = body
    let targetOrderId = (typeof orderId === 'string' && orderId.trim()) ? orderId.trim() : null

    // 2. If client supplied items directly, establish order atomically server-side using adminSupabase
    if (!targetOrderId && Array.isArray(items) && items.length > 0) {
      targetOrderId = crypto.randomUUID()

      const finRes = await calculateOrderFinancials(adminSupabase, items)
      if (!finRes.success) {
        return NextResponse.json({ error: finRes.error }, { status: 400 })
      }

      const { orderAmount, amountInPaisa, printerPayout, designerRoyalty, platformFee } = finRes.data
      const initialStatus = isCod ? 'FINDING_PRINTER' : 'PENDING_PAYMENT'

      const { error: createOrderErr } = await adminSupabase.from('orders').insert({
        id: targetOrderId,
        buyer_id: user.id,
        buyer_email: user.email,
        status: toDbOrderStatus(initialStatus),
        payment_method: paymentMethod || (isCod ? 'cod' : 'upi'),
        total_amount: orderAmount,
        items,
        shipping_address: typeof shippingAddress === 'string' ? shippingAddress : JSON.stringify(shippingAddress || {}),
        printer_share: printerPayout,
        designer_share: designerRoyalty,
        platform_share: platformFee,
        created_at: new Date().toISOString(),
      })

      if (createOrderErr) {
        console.error('Failed to create order record server-side:', createOrderErr)
        return NextResponse.json({ error: 'Failed to create order record' }, { status: 500 })
      }

      // Record rich initial status in order_status_history with atomic compensating rollback
      const { error: historyErr } = await adminSupabase.from('order_status_history').insert({
        order_id: targetOrderId,
        status: initialStatus,
        notes: isCod ? 'Order placed with Pay on Delivery. Routing to nearby verified 3D printer hub.' : 'Order established, awaiting payment confirmation.',
        updated_by: user.id,
        created_at: new Date().toISOString(),
      })

      if (historyErr) {
        console.error('Failed to create order status history record:', historyErr)
        // Compensating rollback: Delete orphaned order record
        await adminSupabase.from('orders').delete().eq('id', targetOrderId)
        return NextResponse.json({ error: 'Failed to record initial order status history' }, { status: 500 })
      }

      // If Cash on Delivery, return early
      if (isCod) {
        return NextResponse.json({
          success: true,
          isCod: true,
          orderId: targetOrderId,
          amount: orderAmount,
        })
      }
    }

    if (!targetOrderId) {
      return NextResponse.json({ error: 'Valid orderId or items array is required' }, { status: 400 })
    }

    // 3. Fetch order record from database
    const { data: order, error: fetchErr } = await adminSupabase
      .from('orders')
      .select('*')
      .eq('id', targetOrderId)
      .maybeSingle()

    if (fetchErr || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // 4. Verify caller owns the order or is Admin
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
    const isAdmin = profile?.role === 'admin'
    const orderBuyerId = order.buyer_id || order.user_id

    if (!isAdmin && (!orderBuyerId || orderBuyerId !== user.id)) {
      return NextResponse.json({ error: 'Forbidden: You do not own this order' }, { status: 403 })
    }

    // 5. Calculate authoritative order amount server-side from database records & items
    const orderItems = Array.isArray(order.items) ? order.items : []
    const finRes = await calculateOrderFinancials(adminSupabase, orderItems)
    if (!finRes.success) {
      return NextResponse.json({ error: finRes.error }, { status: 400 })
    }

    const { orderAmount, amountInPaisa, printerPayout, designerRoyalty, platformFee } = finRes.data

    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET
    const hasLiveKeys = Boolean(keyId && keySecret && !keyId.startsWith('rzp_test_mock') && !keyId.includes('your_key'))
    const allowMock = process.env.ALLOW_MOCK_PAYMENTS === 'true' || process.env.NODE_ENV === 'development'

    let razorpayOrderId: string | null = null
    let isMock = false

    // 6. Call Razorpay API server-side if live credentials exist
    if (hasLiveKeys) {
      try {
        const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64')
        const rzpResponse = await fetch('https://api.razorpay.com/v1/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: authHeader,
          },
          body: JSON.stringify({
            amount: amountInPaisa,
            currency: 'INR',
            receipt: `rcpt_${targetOrderId.slice(0, 10)}`,
            notes: (typeof notes === 'object' && notes ? notes : { app: 'PrintHive', order_id: targetOrderId }),
          }),
        })

        if (!rzpResponse.ok) {
          const errorData = await rzpResponse.json().catch(() => ({}))
          console.error('Razorpay live order API error:', errorData)
          return NextResponse.json(
            { error: 'Payment gateway communication failed' },
            { status: 502 }
          )
        }

        const rzpData = await rzpResponse.json()
        razorpayOrderId = rzpData.id
      } catch (e) {
        console.error('Razorpay live network exception:', e)
        return NextResponse.json(
          { error: 'Payment gateway communication failed' },
          { status: 502 }
        )
      }
    } else if (allowMock) {
      isMock = true
      razorpayOrderId = `order_${Math.random().toString(36).substring(2, 14)}`
    } else {
      return NextResponse.json(
        { error: 'Payment gateway credentials not configured' },
        { status: 500 }
      )
    }

    // 7. Record transaction and update order in database
    await adminSupabase.from('transactions').insert({
      order_id: targetOrderId,
      razorpay_order_id: razorpayOrderId,
      amount: orderAmount,
      currency: 'INR',
      status: 'created',
      printer_payout: printerPayout,
      designer_royalty: designerRoyalty,
      platform_fee: platformFee,
      created_at: new Date().toISOString(),
    })

    await adminSupabase
      .from('orders')
      .update({
        razorpay_order_id: razorpayOrderId,
        status: 'PENDING_PAYMENT',
        total_amount: orderAmount,
        total_price: orderAmount,
        total: orderAmount,
        price: orderAmount,
        amount: orderAmount,
        printer_payout: printerPayout,
        printer_share: printerPayout,
        designer_royalty: designerRoyalty,
        designer_share: designerRoyalty,
        platform_fee: platformFee,
        platform_share: platformFee,
      })
      .eq('id', targetOrderId)

    return NextResponse.json({
      success: true,
      orderId: targetOrderId,
      razorpayOrderId,
      keyId: hasLiveKeys ? keyId : 'rzp_test_mock',
      isMock,
      amount: amountInPaisa,
      currency: 'INR',
      breakdown: {
        total: orderAmount,
        printerPayout,
        designerRoyalty,
        platformFee,
      },
    })
  } catch (err: unknown) {
    console.error('Payment order creation exception:', err)
    return NextResponse.json({ error: 'Payment order creation failed' }, { status: 500 })
  }
}


