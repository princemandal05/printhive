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
      return NextResponse.json({ error: insertError.message || 'Failed to submit bid' }, { status: 500 })
    }

    return NextResponse.json({ success: true, bid }, { status: 201 })
  } catch (error: any) {
    console.error('Unexpected error in design request bids API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
