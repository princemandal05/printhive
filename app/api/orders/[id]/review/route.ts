import { createClient, createAdminClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required to review order' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const rating = Number(body.rating) || 5
    const reviewText = body.text || ''

    // Fetch order to find printer hub or owner
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .maybeSingle()

    if (orderErr || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const printerId = order.printer_id || order.printer_hub_id
    const printerOwnerId = order.printer_owner_id || order.seller_id

    const adminSupabase = await createAdminClient()

    // If printerId or printerOwnerId exists, update printer hub rating & completed_orders
    if (printerId || printerOwnerId) {
      let printerQuery = adminSupabase.from('printers').select('*')
      if (printerId) {
        printerQuery = printerQuery.eq('id', printerId)
      } else {
        printerQuery = printerQuery.eq('owner_id', printerOwnerId)
      }

      const { data: printerData } = await printerQuery.maybeSingle()

      if (printerData) {
        const prevRating = Number(printerData.rating) || 0
        const prevCompleted = Number(printerData.completed_orders) || 0
        
        let newRating = rating
        if (prevCompleted > 0 && prevRating > 0) {
          newRating = Number(((prevRating * prevCompleted + rating) / (prevCompleted + 1)).toFixed(2))
        }

        await adminSupabase
          .from('printers')
          .update({
            rating: newRating,
            completed_orders: prevCompleted + 1,
          })
          .eq('id', printerData.id)
      }
    }

    return NextResponse.json({ success: true, message: 'Review submitted and rating updated successfully' })
  } catch (err: any) {
    console.error('Review submission error:', err)
    return NextResponse.json({ error: err.message || 'Failed to submit review' }, { status: 500 })
  }
}
