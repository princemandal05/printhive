import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/utils/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const adminSupabase = await createAdminClient()

    // 1. Authenticate caller
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized: Log in required' }, { status: 401 })
    }

    let body: Record<string, unknown>
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const { order_id } = body
    if (!order_id || typeof order_id !== 'string' || !order_id.trim()) {
      return NextResponse.json({ error: 'Valid order_id is required' }, { status: 400 })
    }

    const targetOrderId = order_id.trim()

    // 2. Fetch order record
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select('*')
      .eq('id', targetOrderId)
      .maybeSingle()

    if (orderErr || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // 3. Verify user authorization (Admin, Printer Owner assigned to the order, or Buyer confirming completion)
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
    const isAdmin = profile?.role === 'admin'
    
    let isAssignedPrinter = order.printer_owner_id === user.id
    if (!isAssignedPrinter && order.printer_id) {
      const { data: printer } = await adminSupabase
        .from('printers')
        .select('owner_id')
        .eq('id', order.printer_id)
        .maybeSingle()
      if (printer?.owner_id === user.id) {
        isAssignedPrinter = true
      }
    }

    const orderBuyerId = order.buyer_id || order.user_id
    const isBuyer = orderBuyerId === user.id

    if (!isAdmin && !isAssignedPrinter && !isBuyer) {
      return NextResponse.json({ error: 'Forbidden: Only the assigned printer hub, buyer, or an admin can release escrow funds' }, { status: 403 })
    }

    // 4. Conflict Check: Check if order escrow is already released
    if (order.escrow_status === 'released') {
      return NextResponse.json(
        { error: 'Escrow release conflict: Funds for this order have already been released.', order_id: targetOrderId, escrow_status: 'released' },
        { status: 409 }
      )
    }

    // 5. Query held payouts for this order
    const { data: heldPayouts, error: fetchPayoutErr } = await adminSupabase
      .from('escrow_payouts')
      .select('*')
      .eq('order_id', targetOrderId)
      .eq('status', 'held')

    if (fetchPayoutErr) {
      console.error('Failed to query held escrow payouts:', fetchPayoutErr.message)
      return NextResponse.json({ error: 'Database query failed for escrow payouts' }, { status: 500 })
    }

    if (!heldPayouts || heldPayouts.length === 0) {
      return NextResponse.json(
        { error: 'Escrow release conflict: No held payout records found for this order.', order_id: targetOrderId },
        { status: 409 }
      )
    }

    const releaseTimestamp = new Date().toISOString()
    const previousEscrowStatus = order.escrow_status || 'held_in_escrow'
    const previousOrderStatus = order.status || 'DELIVERED'

    // 6. State-Guarded Order Update
    const { error: orderUpdateErr } = await adminSupabase
      .from('orders')
      .update({
        escrow_status: 'released',
        status: 'COMPLETED',
        updated_at: releaseTimestamp,
      })
      .eq('id', targetOrderId)

    if (orderUpdateErr) {
      console.error('Failed to update order escrow status:', orderUpdateErr.message)
      return NextResponse.json({ error: `Order update failed: ${orderUpdateErr.message}` }, { status: 500 })
    }

    // 7. Atomic Escrow Payouts Release (with compensation rollback if payout update fails)
    const { data: updatedPayouts, error: payoutErr } = await adminSupabase
      .from('escrow_payouts')
      .update({
        status: 'released',
        released_at: releaseTimestamp,
      })
      .eq('order_id', targetOrderId)
      .eq('status', 'held')
      .select()

    if (payoutErr) {
      console.error('Failed to release escrow payouts, rolling back order update:', payoutErr.message)
      // Roll back orders table state to prevent financial inconsistency
      const { error: rollbackErr } = await adminSupabase.from('orders').update({
        escrow_status: previousEscrowStatus,
        status: previousOrderStatus,
        updated_at: new Date().toISOString(),
      }).eq('id', targetOrderId)

      if (rollbackErr) {
        console.error('CRITICAL: Financial state reconciliation needed for order:', targetOrderId, rollbackErr.message)
        return NextResponse.json({
          error: `Escrow payouts release failed and order rollback encountered an error. Financial reconciliation required for order ${targetOrderId}.`,
          order_id: targetOrderId,
          status: 'UNRESOLVED_RECONCILIATION_REQUIRED',
        }, { status: 500 })
      }

      return NextResponse.json({ error: `Escrow payouts update failed: ${payoutErr.message}` }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      released: true,
      order_id: targetOrderId,
      escrow_status: 'released',
      payoutsCount: updatedPayouts?.length || heldPayouts.length,
    })
  } catch (err: unknown) {
    const error = err as Error
    console.error('Escrow release exception:', error)
    return NextResponse.json({ error: error.message || 'Escrow release failed' }, { status: 500 })
  }
}
