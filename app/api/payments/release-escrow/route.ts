import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/utils/supabase/server'
import { updateOrderStatus } from '@/utils/order-lifecycle'

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

    // 4. Update escrow_payouts table from 'held' to 'released'
    const { data: updatedPayouts, error: payoutErr } = await adminSupabase
      .from('escrow_payouts')
      .update({
        status: 'released',
        released_at: new Date().toISOString(),
      })
      .eq('order_id', targetOrderId)
      .select()

    if (payoutErr) {
      console.error('Failed to release escrow payouts:', payoutErr.message)
      return NextResponse.json({ error: 'Database update failed for escrow release' }, { status: 500 })
    }

    // 5. Update order escrow_status to 'released'
    await adminSupabase
      .from('orders')
      .update({
        escrow_status: 'released',
        status: 'COMPLETED',
        updated_at: new Date().toISOString(),
      })
      .eq('id', targetOrderId)

    return NextResponse.json({
      success: true,
      released: true,
      order_id: targetOrderId,
      escrow_status: 'released',
      payoutsCount: updatedPayouts?.length || 0,
    })
  } catch (err: unknown) {
    const error = err as Error
    console.error('Escrow release exception:', error)
    return NextResponse.json({ error: error.message || 'Escrow release failed' }, { status: 500 })
  }
}
