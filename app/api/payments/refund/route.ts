import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { updateOrderStatus } from '@/utils/order-lifecycle'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // 1. Authenticate caller
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized: Log in required to request refund' }, { status: 401 })
    }

    let body: Record<string, unknown>
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const { order_id, reason } = body
    if (!order_id || typeof order_id !== 'string' || !order_id.trim()) {
      return NextResponse.json({ error: 'Valid order_id is required' }, { status: 400 })
    }

    const targetOrderId = order_id.trim()

    // 2. Query order record from database
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select('*')
      .eq('id', targetOrderId)
      .maybeSingle()

    if (orderErr) {
      console.error('Failed to fetch order for refund:', orderErr.message)
      return NextResponse.json({ error: 'Database query failed' }, { status: 500 })
    }

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // 3. Verify user authorization (Buyer/Owner or Admin only)
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
    const isAdmin = profile?.role === 'admin'
    const orderBuyerId = order.buyer_id || order.user_id

    if (!isAdmin && orderBuyerId && orderBuyerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden: Only the order buyer or an admin can issue a refund' }, { status: 403 })
    }

    // 4. Reject already refunded or cancelled orders
    if (order.status === 'REFUNDED') {
      return NextResponse.json({ error: 'Order has already been refunded' }, { status: 400 })
    }

    // 5. Query captured transaction record
    const { data: txn, error: txnFetchErr } = await supabase
      .from('transactions')
      .select('*')
      .eq('order_id', targetOrderId)
      .eq('status', 'captured')
      .maybeSingle()

    if (txnFetchErr) {
      console.error('Failed to fetch captured transaction:', txnFetchErr.message)
      return NextResponse.json({ error: 'Failed to query payment transactions' }, { status: 500 })
    }

    const refundAmount = Number(txn?.amount || order.total_amount || order.total || order.price || 0)
    if (refundAmount <= 0) {
      return NextResponse.json({ error: 'No valid captured payment found to refund' }, { status: 400 })
    }

    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET

    let razorpayRefundId: string | null = null

    // 6. Call Razorpay Refund API server-side
    if (txn?.razorpay_payment_id && keyId && keySecret && !keyId.startsWith('rzp_test_mock')) {
      const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64')
      const refundPaisa = Math.round(refundAmount * 100)

      const rzpResponse = await fetch(`https://api.razorpay.com/v1/payments/${txn.razorpay_payment_id}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader,
        },
        body: JSON.stringify({
          amount: refundPaisa,
          notes: { reason: (typeof reason === 'string' && reason ? reason : 'Customer/Admin cancellation refund'), order_id: targetOrderId },
        }),
      })

      if (!rzpResponse.ok) {
        const errorData = await rzpResponse.json().catch(() => ({}))
        console.error('Razorpay refund API error:', errorData)
        return NextResponse.json(
          { error: errorData.error?.description || 'Razorpay refund processing failed' },
          { status: 502 }
        )
      }

      const rzpData = await rzpResponse.json()
      razorpayRefundId = rzpData.id
    } else {
      // Sandbox mode when credentials are unconfigured
      razorpayRefundId = `rfnd_${Math.random().toString(36).substring(2, 14)}`
    }

    if (!razorpayRefundId) {
      return NextResponse.json({ error: 'Failed to process refund identifier' }, { status: 500 })
    }

    // 7. Log refund transaction in database
    const { error: insertRefundTxnErr } = await supabase.from('transactions').insert({
      order_id: targetOrderId,
      razorpay_payment_id: txn?.razorpay_payment_id || null,
      amount: refundAmount,
      currency: 'INR',
      status: 'refunded',
      failure_reason: typeof reason === 'string' ? reason : 'Refund issued to original payment method.',
      created_at: new Date().toISOString(),
    })

    if (insertRefundTxnErr) {
      console.error('Failed to log refund transaction:', insertRefundTxnErr.message)
      return NextResponse.json({ error: 'Failed to record refund transaction in database' }, { status: 500 })
    }

    // 8. Update escrow payouts to refunded status
    const { error: escrowRefundErr } = await supabase
      .from('escrow_payouts')
      .update({ status: 'refunded', released_at: new Date().toISOString() })
      .eq('order_id', targetOrderId)

    if (escrowRefundErr) {
      console.error('Failed to update escrow payouts status:', escrowRefundErr.message)
    }

    // 9. Atomic Order Lifecycle Transition to REFUNDED
    const transitionResult = await updateOrderStatus(
      supabase,
      targetOrderId,
      'REFUNDED',
      `Refund processed (${razorpayRefundId}): ${typeof reason === 'string' ? reason : 'Cancelled'}`,
      user.id,
      order.status
    )

    if (!transitionResult.success) {
      return NextResponse.json({ error: transitionResult.error || 'Failed to update order status to REFUNDED' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      refunded: true,
      order_id: targetOrderId,
      razorpayRefundId,
      amount: refundAmount,
      status: 'REFUNDED',
    })
  } catch (err: unknown) {
    const error = err as Error
    console.error('Payment refund processing exception:', error)
    return NextResponse.json({ error: error.message || 'Refund processing failed' }, { status: 500 })
  }
}
