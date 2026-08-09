import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { updateOrderStatus } from '@/utils/order-lifecycle'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { amount, orderId, notes } = body

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid order amount' }, { status: 400 })
    }

    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET

    const amountInPaisa = Math.round(amount * 100)

    // 70/15/15 Business Calculation
    const printerPayout = Math.round(amount * 0.70)
    const designerRoyalty = Math.round(amount * 0.15)
    const platformFee = amount - (printerPayout + designerRoyalty)

    let razorpayOrderId = `order_${Math.random().toString(36).substring(2, 12)}`

    // Call Razorpay API server-side if keyId and keySecret are configured
    if (keyId && keySecret && !keyId.startsWith('rzp_test_mock')) {
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
            receipt: `rcpt_${(orderId || 'demo').slice(0, 10)}`,
            notes: notes || { app: 'PrintHive' },
          }),
        })

        if (rzpResponse.ok) {
          const rzpData = await rzpResponse.json()
          razorpayOrderId = rzpData.id
        }
      } catch (err) {
        console.warn('Razorpay server order creation fallback:', err)
      }
    }

    const supabase = await createClient()

    // Log transaction record in database
    if (orderId) {
      await supabase.from('transactions').insert({
        order_id: orderId,
        razorpay_order_id: razorpayOrderId,
        amount,
        currency: 'INR',
        status: 'created',
        printer_payout: printerPayout,
        designer_royalty: designerRoyalty,
        platform_fee: platformFee,
        created_at: new Date().toISOString(),
      })

      // Update order with razorpay_order_id & state
      await supabase
        .from('orders')
        .update({ razorpay_order_id: razorpayOrderId, status: 'PENDING_PAYMENT' })
        .eq('id', orderId)

      await updateOrderStatus(supabase, orderId, 'PENDING_PAYMENT', 'Razorpay order created server-side.')
    }

    return NextResponse.json({
      success: true,
      razorpayOrderId,
      keyId: keyId || 'rzp_test_mock',
      amount: amountInPaisa,
      currency: 'INR',
      breakdown: {
        total: amount,
        printerPayout,
        designerRoyalty,
        platformFee,
      },
    })
  } catch (err: unknown) {
    const error = err as Error
    console.error('Payment order creation error:', error)
    return NextResponse.json({ error: error.message || 'Failed to create payment order' }, { status: 500 })
  }
}
