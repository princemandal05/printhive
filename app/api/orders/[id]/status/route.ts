import { createClient, createAdminClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { sendNotification } from '@/utils/notifications'
import {
  ORDER_LIFECYCLE_STEPS,
  isValidStatusTransition,
  normalizeOrderStatus,
  toDbOrderStatus,
  type OrderStatus,
} from '@/utils/order-lifecycle'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const adminDb = await createAdminClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized: Please log in to update order status' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const { status, notes } = body

    if (!status) {
      return NextResponse.json({ error: 'Missing required status parameter' }, { status: 400 })
    }

    const targetStatus = normalizeOrderStatus(status)

    // Query order using admin client to read authoritative state
    const { data: order, error: orderError } = await adminDb
      .from('orders')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Query latest canonical status from order_status_history
    const { data: latestHistory } = await adminDb
      .from('order_status_history')
      .select('status')
      .eq('order_id', id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const currentCanonicalStatus = latestHistory?.status
      ? normalizeOrderStatus(latestHistory.status)
      : normalizeOrderStatus(order.status || 'PENDING_PAYMENT')

    if (currentCanonicalStatus === targetStatus) {
      return NextResponse.json({ success: true, status: targetStatus, order })
    }

    // Authorize caller based on order participant roles
    const { data: profile } = await adminDb.from('profiles').select('role').eq('id', user.id).maybeSingle()
    const isAdmin = profile?.role === 'admin'
    const isSeller = order.seller_id === user.id
    const isPrinterOwner = order.printer_owner_id === user.id
    const isDesigner = order.designer_id === user.id
    const isBuyer = order.buyer_id === user.id

    // Check if user owns the printer assigned to this order
    let isAssignedPrinter = false
    if (order.printer_id) {
      const { data: printer } = await adminDb.from('printers').select('owner_id').eq('id', order.printer_id).maybeSingle()
      if (printer?.owner_id === user.id) {
        isAssignedPrinter = true
      }
    }

    const isAuthorizedParticipant = isAdmin || isSeller || isPrinterOwner || isAssignedPrinter || isDesigner || isBuyer

    if (!isAuthorizedParticipant) {
      return NextResponse.json({ error: 'Forbidden: You are not authorized to update this order' }, { status: 403 })
    }

    // Granular Role-Specific Action Validation Matrix:
    // 1. PAYMENT_CONFIRMED can ONLY be initiated by verified Razorpay webhooks/settlement handler, never via PATCH status endpoint!
    if (targetStatus === 'PAYMENT_CONFIRMED' && !isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: Payment confirmation is automated via Razorpay cryptographic verification only.' },
        { status: 403 }
      )
    }

    // 2. Buyer Permissions: Can only cancel pending orders or confirm receipt of package (DELIVERED / COMPLETED)
    if (isBuyer && !isAdmin && !isPrinterOwner && !isAssignedPrinter && !isSeller) {
      const allowedBuyerTransitions = ['CANCELLED', 'DELIVERED', 'COMPLETED']
      if (!allowedBuyerTransitions.includes(targetStatus)) {
        return NextResponse.json(
          { error: 'Forbidden: Buyers cannot directly advance fulfillment or manufacturing steps.' },
          { status: 403 }
        )
      }
    }

    // 3. Printer Hub Permissions: Manufacturing & fulfillment states
    if ((isPrinterOwner || isAssignedPrinter) && !isAdmin) {
      const allowedPrinterTransitions = ['PRINTER_ACCEPTED', 'PRINTING', 'QUALITY_CHECK', 'READY', 'DISPATCHED', 'CANCELLED']
      if (!allowedPrinterTransitions.includes(targetStatus)) {
        return NextResponse.json(
          { error: `Forbidden: Printer Hubs cannot transition orders to ${targetStatus}` },
          { status: 403 }
        )
      }
    }

    // 4. Seller Permissions: Physical store product dispatch
    if (isSeller && !isPrinterOwner && !isAssignedPrinter && !isAdmin) {
      const allowedSellerTransitions = ['READY', 'DISPATCHED', 'CANCELLED']
      if (!allowedSellerTransitions.includes(targetStatus)) {
        return NextResponse.json(
          { error: `Forbidden: Sellers cannot transition orders to ${targetStatus}` },
          { status: 403 }
        )
      }
    }

    // 5. Designer Permissions: Designers cannot transition physical manufacturing states
    if (isDesigner && !isSeller && !isPrinterOwner && !isAssignedPrinter && !isAdmin && !isBuyer) {
      return NextResponse.json(
        { error: 'Forbidden: 3D CAD Designers cannot directly modify physical order fulfillment states.' },
        { status: 403 }
      )
    }

    // Validate lifecycle transition
    if (!isValidStatusTransition(currentCanonicalStatus, targetStatus)) {
      console.warn(`Invalid state transition: ${currentCanonicalStatus} -> ${targetStatus}`)
      return NextResponse.json(
        { error: `Invalid transition from ${currentCanonicalStatus} to ${targetStatus}` },
        { status: 400 }
      )
    }

    const stepInfo = ORDER_LIFECYCLE_STEPS.find((s) => s.key === targetStatus)
    const defaultNotes = stepInfo ? stepInfo.description : `Order status updated to ${targetStatus}`
    const dbStatus = toDbOrderStatus(targetStatus)

    // 1. Update status in orders table using admin database client
    const { data: updatedOrder, error: updateError } = await adminDb
      .from('orders')
      .update({
        status: dbStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .maybeSingle()

    if (updateError) {
      console.error('Error updating order status in database:', updateError)
      return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 })
    }

    // 2. Insert audit entry into order_status_history
    const { error: historyErr } = await adminDb.from('order_status_history').insert({
      order_id: id,
      status: targetStatus,
      notes: notes || defaultNotes,
      updated_by: user.id,
      created_at: new Date().toISOString(),
    })

    if (historyErr) {
      console.error('Error recording order status history:', historyErr)
      // Compensate orders status on history failure
      await adminDb.from('orders').update({ status: toDbOrderStatus(currentCanonicalStatus) }).eq('id', id)
      return NextResponse.json({ error: 'Status update failed to record audit trail' }, { status: 500 })
    }

    // 3. Send real-time notification to buyer
    if (order.buyer_id) {
      await sendNotification(adminDb, {
        userId: order.buyer_id,
        title: `📦 Order #${id.slice(0, 8)} ${stepInfo?.label || targetStatus}`,
        message: notes || defaultNotes,
        type: 'order',
        link: `/orders/${id}`,
      })
    }

    return NextResponse.json({ success: true, status: targetStatus, order: updatedOrder })
  } catch (error: any) {
    console.error('Unexpected error in order status PATCH handler:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
