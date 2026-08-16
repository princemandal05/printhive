import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

const VALID_STATUSES = ['PENDING_PAYMENT', 'PAID', 'PRINTING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  PENDING_PAYMENT: ['PAID', 'CANCELLED'],
  PAID: ['PRINTING', 'CANCELLED', 'REFUNDED'],
  PRINTING: ['SHIPPED', 'CANCELLED', 'REFUNDED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
  REFUNDED: [],
}

const PAYMENT_STATUS_MAP: Record<string, string> = {
  PAID: 'paid',
  REFUNDED: 'refunded',
  CANCELLED: 'cancelled',
  PENDING_PAYMENT: 'pending',
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { status, notes } = body

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: `Invalid status. Allowed values: ${VALID_STATUSES.join(', ')}` }, { status: 400 })
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const currentStatus = order.status || 'PENDING_PAYMENT'

    if (currentStatus === status) {
      return NextResponse.json({ success: true, order })
    }

    const allowedNext = ALLOWED_TRANSITIONS[currentStatus] || []
    if (!allowedNext.includes(status)) {
      return NextResponse.json(
        { error: `Invalid state transition: Cannot transition order from ${currentStatus} to ${status}` },
        { status: 400 }
      )
    }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
    const isAdmin = profile?.role === 'admin'
    const isSeller = order.seller_id === user.id
    const isPrinterOwner = order.printer_owner_id === user.id
    const isDesigner = order.designer_id === user.id
    const isBuyer = order.buyer_id === user.id

    if (!isSeller && !isPrinterOwner && !isDesigner && !isBuyer && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden: You cannot update status for this order' }, { status: 403 })
    }

    // Role-specific status restrictions:
    // Buyers can ONLY cancel pending payment orders; fulfillment/payment updates must come from webhook, seller, printer owner, or admin.
    if (isBuyer && !isAdmin && !isSeller && !isPrinterOwner) {
      if (status !== 'CANCELLED' || currentStatus !== 'PENDING_PAYMENT') {
        return NextResponse.json({ error: 'Forbidden: Buyers cannot set fulfillment or payment statuses directly' }, { status: 403 })
      }
    }

    const updateFields: Record<string, any> = { status }
    if (PAYMENT_STATUS_MAP[status]) {
      updateFields.payment_status = PAYMENT_STATUS_MAP[status]
    }

    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update(updateFields)
      .eq('id', id)
      .eq('status', currentStatus)
      .select('*')
      .maybeSingle()

    if (updateError) {
      console.error('Error updating order status:', updateError)
      return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 })
    }

    if (!updatedOrder) {
      return NextResponse.json(
        { error: 'Conflict: Order status was updated by another request. Please refresh and try again.' },
        { status: 409 }
      )
    }

    // Write audit record to order_status_history
    const { error: historyErr } = await supabase.from('order_status_history').insert({
      order_id: id,
      status,
      notes: notes || `Order status updated to ${status}`,
      updated_by: user.id,
    })

    if (historyErr) {
      console.error('Error recording order status history:', historyErr)
      return NextResponse.json({ error: 'Status updated, but failed to record audit trail' }, { status: 500 })
    }

    // Send real-time notification to buyer about order status change
    if (order.buyer_id) {
      await supabase.from('notifications').insert({
        user_id: order.buyer_id,
        title: `📦 Order ${status}`,
        message: `Your order #${id.slice(0, 8)} status was updated to ${status}.`,
        type: 'order',
        link: `/orders/${id}`,
      })
    }

    return NextResponse.json({ success: true, order: updatedOrder })
  } catch (error: any) {
    console.error('Unexpected error in order status PATCH handler:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
