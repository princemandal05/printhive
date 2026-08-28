import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/utils/supabase/server'
import { updateOrderStatus } from '@/utils/order-lifecycle'

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
    let catalogPrice: number | null = null

    if (cleanId) {
      const { data: dbDesign } = await adminSupabase
        .from('designs')
        .select('price')
        .eq('id', cleanId)
        .maybeSingle()

      if (dbDesign && typeof dbDesign.price === 'number' && dbDesign.price >= 0) {
        catalogPrice = dbDesign.price
      } else {
        const { data: dbProduct } = await adminSupabase
          .from('products')
          .select('price')
          .eq('id', cleanId)
          .maybeSingle()

        if (dbProduct && typeof dbProduct.price === 'number' && dbProduct.price >= 0) {
          catalogPrice = dbProduct.price
        }
      }
    }

    // Support customized designs, custom sliced parts, and cart pricing overrides
    if (catalogPrice === null || catalogPrice === undefined) {
      if (typeof item?.price === 'number' && Number.isFinite(item.price) && item.price >= 0) {
        catalogPrice = item.price
      } else if (typeof item?.unitPrice === 'number' && Number.isFinite(item.unitPrice) && item.unitPrice >= 0) {
        catalogPrice = item.unitPrice
      } else if (typeof item?.subtotal === 'number' && Number.isFinite(item.subtotal) && item.subtotal >= 0) {
        catalogPrice = Math.round(item.subtotal / qty)
      } else {
        catalogPrice = 150 // Standard fallback base price for custom prints
      }
    }

    let finalPrice = typeof catalogPrice === 'number' && Number.isFinite(catalogPrice) && catalogPrice >= 0
      ? catalogPrice
      : 150

    subtotal += finalPrice * qty
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
        status: 'pending',
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

      // Record rich initial status in order_status_history
      await adminSupabase.from('order_status_history').insert({
        order_id: targetOrderId,
        status: initialStatus,
        notes: isCod ? 'Order placed with Pay on Delivery. Routing to nearby verified 3D printer hub.' : 'Order established, awaiting payment confirmation.',
        updated_by: user.id,
        created_at: new Date().toISOString(),
      })

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


