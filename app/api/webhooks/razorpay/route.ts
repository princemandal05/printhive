import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createAdminClient } from '@/utils/supabase/server'

export async function POST(request: Request) {
  try {
    const bodyText = await request.text()
    const signature = request.headers.get('x-razorpay-signature')
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET

    // Require both signature and webhook secret configuration
    if (!signature || !secret) {
      return NextResponse.json({ error: 'Missing Razorpay webhook signature or secret configuration' }, { status: 400 })
    }

    // Constant-time HMAC-SHA256 signature verification
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(bodyText)
      .digest('hex')

    const sigBuffer = Buffer.from(signature)
    const expectedBuffer = Buffer.from(expectedSignature)

    if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 })
    }

    const payload = JSON.parse(bodyText)
    const event = payload.event
    const payment = payload.payload?.payment?.entity
    const paymentId = payment?.id
    const orderId = payment?.order_id || payload.payload?.order?.entity?.id

    // Use Service Role Admin client to bypass RLS for webhook updates
    const supabase = await createAdminClient()

    // Handle Order & Escrow Status Updates Asynchronously with Idempotency
    if (event === 'payment.captured' || event === 'order.paid') {
      if (orderId) {
        // Check if this payment event was already processed (Idempotency)
        const { data: existingOrder } = await supabase
          .from('orders')
          .select('id, status, razorpay_payment_id')
          .eq('razorpay_order_id', orderId)
          .maybeSingle()

        if (existingOrder && existingOrder.razorpay_payment_id === paymentId && existingOrder.status === 'confirmed') {
          // Already processed, return 200 OK
          return NextResponse.json({ success: true, message: 'Event already processed' })
        }

        const { error } = await supabase
          .from('orders')
          .update({
            status: 'confirmed',
            escrow_status: 'held_in_escrow',
            razorpay_payment_id: paymentId || null,
            updated_at: new Date().toISOString(),
          })
          .eq('razorpay_order_id', orderId)

        if (error) {
          console.error('Razorpay Webhook DB update error:', error.message)
          return NextResponse.json({ error: 'Failed to update order status in database' }, { status: 500 })
        }
      }
    }

    return NextResponse.json({ success: true, received: true })
  } catch (err: unknown) {
    const error = err as Error
    console.error('Razorpay webhook handler error:', error)
    return NextResponse.json({ error: error.message || 'Webhook processing failed' }, { status: 500 })
  }
}
