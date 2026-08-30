import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required to submit a bid' }, { status: 401 })
    }

    let body: any
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON request payload' }, { status: 400 })
    }

    const { request_id, price, days, note } = body

    if (!request_id || typeof request_id !== 'string') {
      return NextResponse.json({ error: 'request_id is required' }, { status: 400 })
    }

    const parsedPrice = Number(price)
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      return NextResponse.json({ error: 'price must be a finite non-negative number' }, { status: 400 })
    }

    const parsedDays = Number(days)
    if (!Number.isFinite(parsedDays) || parsedDays < 1 || !Number.isInteger(parsedDays)) {
      return NextResponse.json({ error: 'days must be a finite positive integer (at least 1 day)' }, { status: 400 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, role, rating')
      .eq('id', user.id)
      .maybeSingle()

    if (profile?.role !== 'designer' && profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Only verified 3D CAD Designers can submit proposal bids for custom briefs.' },
        { status: 403 }
      )
    }

    // Verify target design request exists and is currently open
    const { data: designReq } = await supabase
      .from('design_requests')
      .select('id, status, buyer_id')
      .eq('id', request_id)
      .maybeSingle()

    if (!designReq) {
      return NextResponse.json({ error: 'Design brief request not found' }, { status: 404 })
    }

    if (designReq.status && designReq.status !== 'open' && designReq.status !== 'active') {
      return NextResponse.json({ error: 'This custom design brief is no longer accepting bids' }, { status: 400 })
    }

    if (designReq.buyer_id === user.id) {
      return NextResponse.json({ error: 'Cannot place a bid on your own design brief request' }, { status: 400 })
    }

    // Check for duplicate bids from this designer
    const { data: existingBid } = await supabase
      .from('design_request_bids')
      .select('id')
      .eq('request_id', request_id)
      .eq('designer_id', user.id)
      .maybeSingle()

    if (existingBid) {
      return NextResponse.json({ error: 'You have already submitted an active bid for this brief' }, { status: 409 })
    }

    const designerName = profile?.full_name || user.email?.split('@')[0] || 'Designer'
    const designerRating = Number(profile?.rating || 0)

    const noteText = note ? String(note) : ''
    const candidatePayloads = [
      { request_id, designer_id: user.id, designer_name: designerName, price: parsedPrice, days: parsedDays, note: noteText, rating: designerRating },
      { request_id, designer_id: user.id, designer_name: designerName, price: parsedPrice, turnaround_days: parsedDays, note: noteText, rating: designerRating },
      { request_id, designer_id: user.id, designer_name: designerName, price: parsedPrice, delivery_days: parsedDays, note: noteText, rating: designerRating },
      { request_id, designer_id: user.id, designer_name: designerName, price: parsedPrice, note: noteText },
      { request_id, designer_id: user.id, price: parsedPrice, note: noteText },
      { request_id, designer_id: user.id, price: parsedPrice },
    ]

    let bid: any = null
    let insertError: any = null

    for (const payload of candidatePayloads) {
      const { data: resData, error: err } = await (supabase
        .from('design_request_bids') as any)
        .insert(payload)
        .select('*')
        .maybeSingle()

      if (!err) {
        bid = resData || payload
        insertError = null
        break
      }
      insertError = err
      if (!err.message?.includes('Could not find the') && !err.message?.includes('column')) {
        break
      }
    }

    if (insertError) {
      console.error('Error submitting bid record:', insertError)
      if (insertError.code === '23505' || insertError.message?.includes('duplicate key') || insertError.message?.includes('unique constraint')) {
        return NextResponse.json({ error: 'You have already submitted an active bid for this brief' }, { status: 409 })
      }
      return NextResponse.json({ error: insertError.message || 'Failed to submit bid' }, { status: 500 })
    }

    return NextResponse.json({ success: true, bid }, { status: 201 })
  } catch (error: any) {
    console.error('Unexpected error in design request bids API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
