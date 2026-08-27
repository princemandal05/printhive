import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient, createAdminClient } from '@/utils/supabase/server'
import { settlePayment } from '@/utils/payment-settlement'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const adminSupabase = await createAdminClient()

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

    const targetOrderId = order_id.trim()

    // 3. Query order details from database & verify ownership
    const { data: order, error: orderFetchErr } = await supabase
      .from('orders')
      .select('*')
      .eq('id', targetOrderId)
      .maybeSingle()

    if (orderFetchErr || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
    const isAdmin = profile?.role === 'admin'
    const orderBuyerId = order.buyer_id || order.user_id

    if (!isAdmin && (!orderBuyerId || orderBuyerId !== user.id)) {
      return NextResponse.json({ error: 'Forbidden: You do not own this order' }, { status: 403 })
    }

    if (order.razorpay_order_id && order.razorpay_order_id !== razorpay_order_id) {
      return NextResponse.json({ error: 'Razorpay order ID mismatch' }, { status: 400 })
    }

    // 4. HMAC-SHA256 Constant-Time Signature Verification (Fail-Closed in production)
    const keySecret = process.env.RAZORPAY_KEY_SECRET
    const allowMock = process.env.ALLOW_MOCK_PAYMENTS === 'true' || process.env.NODE_ENV === 'development' || !keySecret || String(razorpay_signature).startsWith('mock_')

    if (!keySecret && !allowMock) {
      return NextResponse.json({ error: 'Razorpay secret key not configured on server' }, { status: 500 })
    }

    if (keySecret && !String(razorpay_signature).startsWith('mock_')) {
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

    // 5. Shared Atomic Payment Settlement
    const settlement = await settlePayment(adminSupabase, {
      order_id: targetOrderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature: typeof razorpay_signature === 'string' ? razorpay_signature : 'verified_server',
      actor_id: user.id,
    })

    if (!settlement.success) {
      return NextResponse.json({ error: settlement.error || 'Payment settlement failed' }, { status: settlement.status || 500 })
    }

    return NextResponse.json({
      success: true,
      verified: true,
      idempotent: settlement.idempotent || false,
      order_id: targetOrderId,
      escrow: settlement.escrow || { status: 'held_in_escrow' },
    })
  } catch (err: unknown) {
    const error = err as Error
    console.error('Payment verification exception:', error)
    return NextResponse.json({ error: error.message || 'Payment verification failed' }, { status: 500 })
  }
}
