import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/utils/supabase/server'
import { updateOrderStatus } from '@/utils/order-lifecycle'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const adminSupabase = await createAdminClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body: Record<string, unknown>
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
    }

    const { orderId, reason } = body
    if (!orderId || typeof orderId !== 'string') {
      return NextResponse.json({ error: 'Valid orderId is required' }, { status: 400 })
    }

    const targetOrderId = orderId.trim()

    // Fetch order and verify ownership
    const { data: order, error: orderErr } = await adminSupabase
      .from('orders')
      .select('id, buyer_id, user_id, status')
      .eq('id', targetOrderId)
      .maybeSingle()

    if (orderErr || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
    const isAdmin = profile?.role === 'admin'
    const isOwner = (order.buyer_id || order.user_id) === user.id

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Only allow cancelling if still in PENDING_PAYMENT or pending
    if (order.status === 'PENDING_PAYMENT' || order.status === 'pending') {
      await adminSupabase
        .from('orders')
        .update({
          status: 'cancelled',
          payment_status: 'failed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', targetOrderId)

      await updateOrderStatus(
        adminSupabase,
        targetOrderId,
        'CANCELLED',
        typeof reason === 'string' ? reason : 'Payment modal dismissed or cancelled by buyer.',
        user.id,
        order.status
      )
    }

    return NextResponse.json({ success: true, message: 'Order marked as cancelled' })
  } catch (err: unknown) {
    const error = err as Error
    console.error('Payment cancellation error:', error)
    return NextResponse.json({ error: error.message || 'Cancellation failed' }, { status: 500 })
  }
}
