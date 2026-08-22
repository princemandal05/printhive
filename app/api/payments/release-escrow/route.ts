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

    // 3. Verify user authorization (Admin or Printer Owner assigned to the order)
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
    const isAdmin = profile?.role === 'admin'
    const isAssignedPrinter = order.printer_id === user.id

    if (!isAdmin && !isAssignedPrinter) {
      return NextResponse.json({ error: 'Forbidden: Only the assigned printer or an admin can release escrow funds' }, { status: 403 })
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

    // 6. Atomic State-Guarded Order Update (Propagate errors if order status update fails)
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

    // 7. Atomic State-Guarded Escrow Payouts Update (Only update held payouts; preserve original released_at if present)
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
      console.error('Failed to release escrow payouts:', payoutErr.message)
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
