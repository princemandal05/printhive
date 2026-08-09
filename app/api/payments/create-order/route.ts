import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { updateOrderStatus } from '@/utils/order-lifecycle'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

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

    if (!isAdmin && orderBuyerId && orderBuyerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden: You do not own this order' }, { status: 403 })
    }

    // 4. Load exact order total amount from database
    const orderAmount = Number(order.total_amount || order.total || order.price || order.amount)
    if (!orderAmount || isNaN(orderAmount) || orderAmount <= 0) {
      return NextResponse.json({ error: 'Invalid order amount stored in database' }, { status: 400 })
    }

    // 5. Precise Integer Paisa Arithmetic (70/15/15 Business Split)
    const amountInPaisa = Math.round(orderAmount * 100)
    const printerPayoutPaisa = Math.floor(amountInPaisa * 0.70)
    const designerRoyaltyPaisa = Math.floor(amountInPaisa * 0.15)
    const platformFeePaisa = amountInPaisa - (printerPayoutPaisa + designerRoyaltyPaisa)

    const printerPayout = printerPayoutPaisa / 100
    const designerRoyalty = designerRoyaltyPaisa / 100
    const platformFee = platformFeePaisa / 100

    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET

    let razorpayOrderId: string | null = null

    // 6. Call Razorpay API server-side if live credentials exist
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
    } else {
      // Demo/development sandbox mode when secret credentials are not configured
      razorpayOrderId = `order_${Math.random().toString(36).substring(2, 14)}`
    }

    if (!razorpayOrderId) {
      return NextResponse.json({ error: 'Failed to generate Razorpay order ID' }, { status: 500 })
    }

    // 7. Handle Supabase write errors explicitly
    const { error: txnErr } = await supabase.from('transactions').insert({
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

    const { error: updateOrderErr } = await supabase
      .from('orders')
      .update({ razorpay_order_id: razorpayOrderId, status: 'PENDING_PAYMENT' })
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
      return NextResponse.json({ error: transitionResult.error || 'Failed to update order status' }, { status: 400 })
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
    return NextResponse.json({ error: error.message || 'Failed to create payment order' }, { status: 500 })
  }
}
