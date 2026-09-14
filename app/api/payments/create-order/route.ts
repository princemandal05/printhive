import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/utils/supabase/server'
import { updateOrderStatus, toDbOrderStatus, normalizeOrderStatus } from '@/utils/order-lifecycle'

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

    // Extract valid UUID from compound cart IDs (e.g. design-UUID-timestamp or UUID-material-color)
    const targetUuid = rawId.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i)?.[0] || null

    if (targetUuid && !rawId.startsWith('pod-')) {
      // 1. Authoritative check in designs table using validated UUID
      const { data: dbDesign } = await adminSupabase
        .from('designs')
        .select('price')
        .eq('id', targetUuid)
        .maybeSingle()

      if (dbDesign && typeof dbDesign.price === 'number' && dbDesign.price >= 0) {
        const infill = Math.max(10, Math.min(100, Number(item?.infill) || 20))
        const scale = Math.max(10, Math.min(500, Number(item?.scale) || 100))
        const finish = String(item?.surfaceFinish || '')
        const finishSurcharge = finish === 'Smoothed (vapor/sanded)' ? 80 : finish === 'Painted' ? 180 : 0
        const infillMultiplier = 1 + (infill - 20) / 100
        const scaleMultiplier = Math.pow(scale / 100, 2)

        // For open-source free models (price === 0), physical printing starts at 250 base + 180 manufacturing
        const effectiveBase = dbDesign.price === 0 ? 250 : dbDesign.price + 180
        const serverDerivedPrice = Math.max(50, Math.round(effectiveBase * infillMultiplier * scaleMultiplier) + finishSurcharge)

        // Validate client value only as a lower-bound check
        if (typeof item?.price === 'number' && item.price < serverDerivedPrice) {
          return {
            success: false,
            error: `Item "${item?.title || item?.name || rawId}" price cannot be lower than server-derived cost (₹${serverDerivedPrice}).`,
          }
        }
        unitPrice = serverDerivedPrice
      } else {
        // 2. Authoritative check in products table using validated UUID
        const { data: dbProduct } = await adminSupabase
          .from('products')
          .select('price')
          .eq('id', targetUuid)
          .maybeSingle()

        if (dbProduct && typeof dbProduct.price === 'number' && dbProduct.price >= 0) {
          let serverDerivedPrice = dbProduct.price
          const matName = String(item?.material || item?.name || '').toUpperCase()
          const matMult = matName.includes('RESIN') ? 1.4 : matName.includes('PETG') ? 1.15 : 1.0
          serverDerivedPrice = Math.max(50, Math.round(serverDerivedPrice * matMult))

          // Validate client value only as a lower-bound check
          if (typeof item?.price === 'number' && item.price < serverDerivedPrice) {
            return {
              success: false,
              error: `Product "${item?.title || item?.name || rawId}" price cannot be lower than catalog price (₹${serverDerivedPrice}).`,
            }
          }
          unitPrice = serverDerivedPrice
        }
      }
    }

    // 3. Custom Print-on-Demand (POD) Sliced File Uploads (e.g. 'pod-1787823908195')
    if (unitPrice === null && (rawId.startsWith('pod-') || item?.type === 'custom_print' || item?.isCustomPrint)) {
      let verifiedVolumeCm3: number | null = null

      // Look up design/asset metadata if persisted design_id exists
      const assetId = item?.design_id || targetUuid || (cleanId && !cleanId.startsWith('pod-') ? cleanId : null)
      const assetUuid = String(assetId).match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i)?.[0] || null

      if (assetUuid) {
        const { data: dbAsset } = await adminSupabase
          .from('designs')
          .select('id, price, tags')
          .eq('id', assetUuid)
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
          error: `Custom print item "${item?.title || item?.name || rawId}" lacks verified server volume metadata. Please re-slice the model in Print Studio before checkout.`,
        }
      }

      const volumeCm3 = Math.max(1, verifiedVolumeCm3)
      const material = String(item?.material || 'PLA').toUpperCase()
      const materialRatePerCm3 = material === 'RESIN' ? 8.5 : material === 'PETG' ? 4.5 : material === 'ABS' ? 5.0 : material === 'TPU' ? 6.0 : 3.5
      const infill = Math.max(10, Math.min(100, Number(item?.infill) || 20))
      const infillFactor = 0.3 + (infill / 100) * 0.7

      let basePrinterRate = 150
      const targetPrinterId = item?.printer_id || item?.hubId
      if (targetPrinterId) {
        const printerUuid = String(targetPrinterId).match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i)?.[0]
        if (printerUuid) {
          const { data: dbPrinter } = await adminSupabase
            .from('printers')
            .select('base_price')
            .eq('id', printerUuid)
            .maybeSingle()
          if (dbPrinter && typeof dbPrinter.base_price === 'number' && dbPrinter.base_price > 0) {
            basePrinterRate = dbPrinter.base_price
          }
        }
      }

      const serverDerivedPodPrice = Math.max(150, Math.round(basePrinterRate + (volumeCm3 * materialRatePerCm3 * infillFactor)))
      if (typeof item?.price === 'number' && item.price < serverDerivedPodPrice) {
        return {
          success: false,
          error: `Custom print item "${item?.title || item?.name || rawId}" price cannot be lower than server-derived rate (₹${serverDerivedPodPrice}).`,
        }
      }
      unitPrice = serverDerivedPodPrice
    }

    // 4. Custom Print Hub Selection fallback
    if (unitPrice === null && (item?.printer_id || item?.hubId)) {
      const targetPrinterId = item.printer_id || item.hubId
      const printerUuid = String(targetPrinterId).match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i)?.[0]
      if (printerUuid) {
        const { data: dbPrinter } = await adminSupabase
          .from('printers')
          .select('base_price')
          .eq('id', printerUuid)
          .maybeSingle()

        if (dbPrinter && typeof dbPrinter.base_price === 'number' && dbPrinter.base_price >= 0) {
          unitPrice = dbPrinter.base_price
        }
      }
    }

    // Reject unrecognized or malformed items lacking valid pricing derivation
    if (unitPrice === null || unitPrice === undefined || unitPrice < 0) {
      return {
        success: false,
        error: `Item "${item?.title || item?.name || rawId || 'Custom item'}" could not be verified.`,
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
    let orderAmount = 0
    let amountInPaisa = 0
    let printerPayout = 0
    let designerRoyalty = 0
    let platformFee = 0

    const orderItems = Array.isArray(order.items) ? order.items : []
    if (orderItems.length > 0) {
      const finRes = await calculateOrderFinancials(adminSupabase, orderItems)
      if (!finRes.success) {
        return NextResponse.json({ error: finRes.error }, { status: 400 })
      }
      orderAmount = finRes.data.orderAmount
      amountInPaisa = finRes.data.amountInPaisa
      printerPayout = finRes.data.printerPayout
      designerRoyalty = finRes.data.designerRoyalty
      platformFee = finRes.data.platformFee
    } else {
      // For orders without items array (e.g. print-on-demand or direct dispatch orders)
      const existingTotal = Number(order.total_amount || order.total_price || order.total || order.price || 0)
      if (existingTotal <= 0) {
        return NextResponse.json({ error: 'Order total is invalid or zero in database' }, { status: 400 })
      }
      orderAmount = existingTotal
      amountInPaisa = Math.round(orderAmount * 100)
      const printerPayoutPaisa = Math.floor(amountInPaisa * 0.70)
      const designerRoyaltyPaisa = Math.floor(amountInPaisa * 0.15)
      const platformFeePaisa = amountInPaisa - (printerPayoutPaisa + designerRoyaltyPaisa)
      printerPayout = Number(order.printer_share) || (printerPayoutPaisa / 100)
      designerRoyalty = Number(order.designer_share) || (designerRoyaltyPaisa / 100)
      platformFee = Number(order.platform_share) || (platformFeePaisa / 100)
    }

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
      razorpayOrderId = `mock_order_${Math.random().toString(36).substring(2, 14)}`
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

    const orderUpdatePayload: Record<string, any> = {
      razorpay_order_id: razorpayOrderId,
      total_amount: orderAmount,
      printer_share: printerPayout,
      designer_share: designerRoyalty,
      platform_share: platformFee,
      updated_at: new Date().toISOString(),
    }

    // Do not overwrite an advanced order's status (e.g. PRINTER_ACCEPTED, PRINTER_ASSIGNED)
    const currentCanonical = normalizeOrderStatus(order.status)
    if (currentCanonical === 'PENDING_PAYMENT') {
      orderUpdatePayload.status = toDbOrderStatus('PENDING_PAYMENT')
    }

    await adminSupabase
      .from('orders')
      .update(orderUpdatePayload)
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


