import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createAdminClient } from '@/utils/supabase/server'
import { settlePayment } from '@/utils/payment-settlement'

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
    const razorpayOrderId = payment?.order_id || payload.payload?.order?.entity?.id

    const supabase = await createAdminClient()

    // Handle Order & Escrow Status Updates Asynchronously with Shared Atomic Settlement
    if (event === 'payment.captured' || event === 'order.paid') {
      if (paymentId) {
        const settlement = await settlePayment(supabase, {
          razorpay_order_id: razorpayOrderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: signature,
          actor_id: 'razorpay_webhook',
        })

        if (!settlement.success) {
          console.error('Razorpay Webhook settlement failure:', settlement.error)
          return NextResponse.json({ error: settlement.error || 'Settlement failed' }, { status: settlement.status || 500 })
        }

        return NextResponse.json({ success: true, message: 'Webhook payment settled', idempotent: settlement.idempotent })
      }
    }

    return NextResponse.json({ success: true, received: true })
  } catch (err: unknown) {
    const error = err as Error
    console.error('Razorpay webhook handler error:', error)
    return NextResponse.json({ error: error.message || 'Webhook processing failed' }, { status: 500 })
  }
}
