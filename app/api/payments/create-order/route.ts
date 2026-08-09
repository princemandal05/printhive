import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/utils/supabase/server'
import { updateOrderStatus } from '@/utils/order-lifecycle'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const adminSupabase = await createAdminClient()

    // 1. Authenticate caller
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized: Log in required to initiate payment' }, { status: 401 })
    }

    let body: Record<string, unknown>
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const { orderId, notes } = body
    if (!orderId || typeof orderId !== 'string' || !orderId.trim()) {
      return NextResponse.json({ error: 'Valid orderId is required' }, { status: 400 })
    }

    // 2. Fetch order record from database — NEVER trust client-supplied amount
    const { data: order, error: fetchErr } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId.trim())
      .maybeSingle()

    if (fetchErr) {
      console.error('Failed to fetch order from database:', fetchErr.message)
      return NextResponse.json({ error: 'Database query failed' }, { status: 500 })
    }

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // 3. Verify caller owns the order or is Admin
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
    const isAdmin = profile?.role === 'admin'
    const orderBuyerId = order.buyer_id || order.user_id

    if (!isAdmin && (!orderBuyerId || orderBuyerId !== user.id)) {
      return NextResponse.json({ error: 'Forbidden: You do not own this order' }, { status: 403 })
    }

    // 4. Calculate authoritative order amount server-side from database records & items
    let serverCalculatedSubtotal = 0
    const items = Array.isArray(order.items) ? order.items : []

    if (items.length > 0) {
      for (const item of items) {
        const itemId = item?.id
        const qty = Math.max(1, Number(item?.quantity) || 1)
        let itemPrice = 0

        if (itemId) {
          // Attempt lookup in products catalog table
          const { data: dbProduct } = await supabase
            .from('products')
            .select('price')
            .eq('id', itemId)
            .maybeSingle()

          if (dbProduct && typeof dbProduct.price === 'number' && dbProduct.price > 0) {
            itemPrice = dbProduct.price
          } else {
            // Attempt lookup in designs catalog table
            const { data: dbDesign } = await supabase
              .from('designs')
              .select('price')
              .eq('id', itemId)
              .maybeSingle()

            if (dbDesign && typeof dbDesign.price === 'number' && dbDesign.price > 0) {
              itemPrice = dbDesign.price
            } else {
              // Custom CAD / print-on-demand item price fallback
              itemPrice = Math.max(0, Number(item?.price) || 0)
            }
          }
        } else {
          itemPrice = Math.max(0, Number(item?.price) || 0)
        }

        serverCalculatedSubtotal += itemPrice * qty
      }
    }

    // Fallback if order has stored price or legacy amount
    const dbStoredAmount = Number(order.total_amount || order.total_price || order.total || order.price || order.amount)
    const baseSubtotal = serverCalculatedSubtotal > 0 ? serverCalculatedSubtotal : (dbStoredAmount > 0 ? dbStoredAmount : 0)

    if (!baseSubtotal || isNaN(baseSubtotal) || baseSubtotal <= 0) {
      return NextResponse.json({ error: 'Invalid order amount: no valid stored or calculated item price exists' }, { status: 400 })
    }

    // Reproduce checkout rules: subtotal + shipping (₹99 if subtotal < ₹999) + 18% GST
    const shippingFee = baseSubtotal < 999 ? 99 : 0
    const gstFee = Math.round(baseSubtotal * 0.18)
    const orderAmount = baseSubtotal + shippingFee + gstFee

    // 5. Precise Integer Paisa Arithmetic (70/15/15 Escrow Split)
    const amountInPaisa = Math.round(orderAmount * 100)
    const printerPayoutPaisa = Math.floor(amountInPaisa * 0.70)
    const designerRoyaltyPaisa = Math.floor(amountInPaisa * 0.15)
    const platformFeePaisa = amountInPaisa - (printerPayoutPaisa + designerRoyaltyPaisa)

    const printerPayout = printerPayoutPaisa / 100
    const designerRoyalty = designerRoyaltyPaisa / 100
    const platformFee = platformFeePaisa / 100

    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET
    const allowMock = process.env.ALLOW_MOCK_PAYMENTS === 'true' || process.env.NODE_ENV === 'development'

    let razorpayOrderId: string | null = null

    // 6. Call Razorpay API server-side if credentials exist
    if (keyId && keySecret && !keyId.startsWith('rzp_test_mock')) {
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
          receipt: `rcpt_${orderId.slice(0, 10)}`,
          notes: (typeof notes === 'object' && notes ? notes : { app: 'PrintHive', order_id: orderId }),
        }),
      })

      if (!rzpResponse.ok) {
        const errorData = await rzpResponse.json().catch(() => ({}))
        console.error('Razorpay order creation API error:', errorData)
        return NextResponse.json(
          { error: errorData.error?.description || 'Razorpay order creation failed' },
          { status: 502 }
        )
      }

      const rzpData = await rzpResponse.json()
      razorpayOrderId = rzpData.id
    } else if (allowMock) {
      // Allowed sandbox/development mock mode
      razorpayOrderId = `order_${Math.random().toString(36).substring(2, 14)}`
    } else {
      return NextResponse.json({ error: 'Razorpay payment Gateway credentials not configured' }, { status: 500 })
    }

    if (!razorpayOrderId) {
      return NextResponse.json({ error: 'Failed to generate Razorpay order ID' }, { status: 500 })
    }

    // 7. Handle Supabase write errors explicitly
    const { error: txnErr } = await adminSupabase.from('transactions').insert({
      order_id: orderId,
      razorpay_order_id: razorpayOrderId,
      amount: orderAmount,
      currency: 'INR',
      status: 'created',
      printer_payout: printerPayout,
      designer_royalty: designerRoyalty,
      platform_fee: platformFee,
      created_at: new Date().toISOString(),
    })

    if (txnErr) {
      console.error('Database write error on transaction insert:', txnErr.message)
      return NextResponse.json({ error: 'Failed to record payment transaction in database' }, { status: 500 })
    }

    const { error: updateOrderErr } = await adminSupabase
      .from('orders')
      .update({
        razorpay_order_id: razorpayOrderId,
        status: 'PENDING_PAYMENT',
        total_amount: orderAmount,
        total_price: orderAmount,
        total: orderAmount,
        printer_payout: printerPayout,
        printer_share: printerPayout,
        designer_royalty: designerRoyalty,
        designer_share: designerRoyalty,
        platform_fee: platformFee,
        platform_share: platformFee,
      })
      .eq('id', orderId)

    if (updateOrderErr) {
      console.error('Database write error on order update:', updateOrderErr.message)
      return NextResponse.json({ error: 'Failed to update order payment status in database' }, { status: 500 })
    }

    // 8. Log state transition
    const transitionResult = await updateOrderStatus(
      supabase,
      orderId,
      'PENDING_PAYMENT',
      'Razorpay order created server-side.',
      user.id,
      order.status
    )

    if (!transitionResult.success) {
      console.warn('Failed to record order status transition history:', transitionResult.error)
    }

    return NextResponse.json({
      success: true,
      razorpayOrderId,
      keyId: keyId || 'rzp_test_mock',
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
    const error = err as Error
    console.error('Payment order creation exception:', error)
    return NextResponse.json({ error: 'Payment order creation failed' }, { status: 500 })
  }
}
