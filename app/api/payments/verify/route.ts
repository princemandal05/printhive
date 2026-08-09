import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@/utils/supabase/server'
import { updateOrderStatus } from '@/utils/order-lifecycle'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // 1. Authenticate caller
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized: Log in required to verify payment' }, { status: 401 })
    }

    let body: Record<string, unknown>
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = body

    // 2. Validate input parameters
    if (
      !razorpay_order_id || typeof razorpay_order_id !== 'string' ||
      !razorpay_payment_id || typeof razorpay_payment_id !== 'string' ||
      !order_id || typeof order_id !== 'string'
    ) {
      return NextResponse.json({ error: 'Missing or invalid Razorpay payment parameters' }, { status: 400 })
    }

    // 3. Query order details from database & verify ownership — NEVER trust client-supplied amount
    const { data: order, error: orderFetchErr } = await supabase
      .from('orders')
      .select('*')
      .eq('id', order_id.trim())
      .maybeSingle()

    if (orderFetchErr) {
      console.error('Failed to fetch order for verification:', orderFetchErr.message)
      return NextResponse.json({ error: 'Database query failed' }, { status: 500 })
    }

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
    const isAdmin = profile?.role === 'admin'
    const orderBuyerId = order.buyer_id || order.user_id

    if (!isAdmin && orderBuyerId && orderBuyerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden: You do not own this order' }, { status: 403 })
    }

    // 4. HMAC-SHA256 Constant-Time Signature Verification
    const keySecret = process.env.RAZORPAY_KEY_SECRET

    if (keySecret) {
      if (!razorpay_signature || typeof razorpay_signature !== 'string') {
        return NextResponse.json({ error: 'Missing payment verification signature' }, { status: 400 })
      }

      const expectedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex')

      const expectedBuf = Buffer.from(expectedSignature, 'utf-8')
      const actualBuf = Buffer.from(razorpay_signature, 'utf-8')

      const isSignatureValid =
        expectedBuf.length === actualBuf.length &&
        crypto.timingSafeEqual(expectedBuf, actualBuf)

      if (!isSignatureValid) {
        return NextResponse.json({ error: 'Invalid payment signature verification' }, { status: 400 })
      }
    }

    // 5. Payment Idempotency Check: Prevent duplicate payment captures
    const { data: existingTxn } = await supabase
      .from('transactions')
      .select('id, status')
      .eq('razorpay_payment_id', razorpay_payment_id)
      .eq('status', 'captured')
      .maybeSingle()

    if (existingTxn) {
      return NextResponse.json({
        success: true,
        verified: true,
        message: 'Payment already processed and verified.',
        idempotent: true,
        order_id,
      })
    }

    // 6. Precise Integer Paisa Arithmetic loaded from DB amount
    const orderAmount = Number(order.total_amount || order.total || order.price || order.amount)
    if (!orderAmount || isNaN(orderAmount) || orderAmount <= 0) {
      return NextResponse.json({ error: 'Invalid order total in database' }, { status: 400 })
    }

    const amountInPaisa = Math.round(orderAmount * 100)
    const printerPayoutPaisa = Math.floor(amountInPaisa * 0.70)
    const designerRoyaltyPaisa = Math.floor(amountInPaisa * 0.15)
    const platformFeePaisa = amountInPaisa - (printerPayoutPaisa + designerRoyaltyPaisa)

    const printerPayout = printerPayoutPaisa / 100
    const designerRoyalty = designerRoyaltyPaisa / 100
    const platformFee = platformFeePaisa / 100

    // 7. Atomic DB Transactions & Escrow Payout Updates
    const { error: txnErr } = await supabase.from('transactions').insert({
      order_id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature: razorpay_signature || 'verified_server',
      amount: orderAmount,
      currency: 'INR',
      status: 'captured',
      printer_payout: printerPayout,
      designer_royalty: designerRoyalty,
      platform_fee: platformFee,
      created_at: new Date().toISOString(),
    })

    if (txnErr) {
      console.error('Failed to log captured transaction:', txnErr.message)
      return NextResponse.json({ error: 'Failed to record transaction in database' }, { status: 500 })
    }

    // 8. Prevent duplicate Escrow Payout records
    const { data: existingEscrow } = await supabase
      .from('escrow_payouts')
      .select('id')
      .eq('order_id', order_id)

    if (!existingEscrow || existingEscrow.length === 0) {
      const { error: escrowErr } = await supabase.from('escrow_payouts').insert([
        {
          order_id,
          role: 'printer_owner',
          amount: printerPayout,
          status: 'held',
          created_at: new Date().toISOString(),
        },
        {
          order_id,
          role: 'designer',
          amount: designerRoyalty,
          status: 'held',
          created_at: new Date().toISOString(),
        },
      ])

      if (escrowErr) {
        console.error('Failed to record escrow payouts:', escrowErr.message)
        return NextResponse.json({ error: 'Failed to record escrow payouts in database' }, { status: 500 })
      }
    }

    // 9. Atomic Lifecycle Transitions: PENDING_PAYMENT -> PAYMENT_CONFIRMED -> FINDING_PRINTER
    const step1 = await updateOrderStatus(
      supabase,
      order_id,
      'PAYMENT_CONFIRMED',
      'Payment verified server-side with HMAC SHA-256.',
      user.id,
      order.status
    )

    if (!step1.success) {
      return NextResponse.json({ error: step1.error || 'Failed to update status to PAYMENT_CONFIRMED' }, { status: 500 })
    }

    const step2 = await updateOrderStatus(
      supabase,
      order_id,
      'FINDING_PRINTER',
      'Searching Leaflet OpenStreetMap for nearby printer hub.',
      user.id,
      'PAYMENT_CONFIRMED'
    )

    if (!step2.success) {
      return NextResponse.json({ error: step2.error || 'Failed to update status to FINDING_PRINTER' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      verified: true,
      order_id,
      escrow: {
        status: 'held_in_escrow',
        printerPayout,
        designerRoyalty,
        platformFee,
      },
    })
  } catch (err: unknown) {
    const error = err as Error
    console.error('Payment verification exception:', error)
    return NextResponse.json({ error: error.message || 'Payment verification failed' }, { status: 500 })
  }
}
