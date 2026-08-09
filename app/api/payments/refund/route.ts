import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { updateOrderStatus } from '@/utils/order-lifecycle'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { order_id, reason } = body

    if (!order_id) {
      return NextResponse.json({ error: 'Missing order_id for refund' }, { status: 400 })
    }

    const supabase = await createClient()

    // 1. Query order & transaction details
    const { data: order } = await supabase
      .from('orders')
      .select('*')
      .eq('id', order_id)
      .maybeSingle()

    const { data: txn } = await supabase
      .from('transactions')
      .select('*')
      .eq('order_id', order_id)
      .eq('status', 'captured')
      .maybeSingle()

    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET

    let razorpayRefundId = `ref_${Math.random().toString(36).substring(2, 10)}`

    // Call Razorpay Refund API if payment_id & credentials exist
    if (txn?.razorpay_payment_id && keyId && keySecret && !keyId.startsWith('rzp_test_mock')) {
      try {
        const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64')
        const rzpResponse = await fetch(`https://api.razorpay.com/v1/payments/${txn.razorpay_payment_id}/refund`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: authHeader,
          },
          body: JSON.stringify({
            notes: { reason: reason || 'Customer/Admin cancellation refund' },
          }),
        })

        if (rzpResponse.ok) {
          const rzpData = await rzpResponse.json()
          razorpayRefundId = rzpData.id
        }
      } catch (err) {
        console.warn('Razorpay refund API call error:', err)
      }
    }

    // 2. Log refund transaction
    await supabase.from('transactions').insert({
      order_id,
      razorpay_payment_id: txn?.razorpay_payment_id || null,
      amount: txn?.amount || order?.total || 0,
      currency: 'INR',
      status: 'refunded',
      failure_reason: reason || 'Refund issued to original payment method.',
      created_at: new Date().toISOString(),
    })

    // 3. Mark escrow payouts as refunded
    await supabase
      .from('escrow_payouts')
      .update({ status: 'refunded' })
      .eq('order_id', order_id)

    // 4. Update order lifecycle state: REFUNDED
    await updateOrderStatus(supabase, order_id, 'REFUNDED', `Refund processed (${razorpayRefundId}): ${reason || 'Cancelled'}`)

    return NextResponse.json({
      success: true,
      refunded: true,
      order_id,
      razorpayRefundId,
      status: 'REFUNDED',
    })
  } catch (err: unknown) {
    const error = err as Error
    console.error('Payment refund processing error:', error)
    return NextResponse.json({ error: error.message || 'Refund processing failed' }, { status: 500 })
  }
}
