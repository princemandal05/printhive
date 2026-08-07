import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: Request) {
  try {
    const bodyText = await request.text()
    const signature = request.headers.get('x-razorpay-signature')
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET

    // Require both signature and webhook secret config
    if (!signature || !secret) {
      return NextResponse.json({ error: 'Missing Razorpay webhook signature or secret configuration' }, { status: 400 })
    }

    // Verify Razorpay HMAC-SHA256 Signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(bodyText)
      .digest('hex')

    if (signature !== expectedSignature) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 })
    }

    const payload = JSON.parse(bodyText)
    const event = payload.event
    const payment = payload.payload?.payment?.entity
    const orderId = payment?.order_id || payload.payload?.order?.entity?.id

    // Handle Order & Escrow Status Updates Asynchronously
    if (event === 'payment.captured' || event === 'order.paid') {
      const supabase = await createClient()

      if (orderId) {
        const { error } = await supabase
          .from('orders')
          .update({
            status: 'confirmed',
            escrow_status: 'held_in_escrow',
            razorpay_payment_id: payment?.id || null,
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
