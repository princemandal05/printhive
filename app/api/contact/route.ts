import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export let SYSTEM_COMPLAINTS: Array<{
  id: string
  name: string
  email: string
  subject: string
  message: string
  status: 'open' | 'resolved'
  created_at: string
}> = []

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !user.email) {
      return NextResponse.json({ error: 'Unauthorized: Log in to view support tickets.' }, { status: 401 })
    }

    const userEmail = user.email

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
    const isAdmin = profile?.role === 'admin'

    let query = supabase.from('complaints').select('*').order('created_at', { ascending: false })
    if (!isAdmin) {
      query = query.eq('email', userEmail)
    }

    const { data: dbComplaints, error } = await query

    if (error) {
      console.error('Supabase complaints query error:', error.message)
      return NextResponse.json({ error: 'Failed to fetch tickets from database' }, { status: 500 })
    }

    return NextResponse.json({ success: true, complaints: dbComplaints || [] })
  } catch (err: unknown) {
    const error = err as Error
    return NextResponse.json({ error: error.message || 'Failed to fetch tickets' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !user.email) {
      return NextResponse.json({ error: 'Unauthorized: Please log in to submit a ticket.' }, { status: 401 })
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
    }

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Request body must be a JSON object' }, { status: 400 })
    }

    const payload = body as Record<string, unknown>
    const name = payload.name
    const subject = payload.subject
    const message = payload.message

    if (
      typeof subject !== 'string' ||
      !subject.trim() ||
      typeof message !== 'string' ||
      !message.trim()
    ) {
      return NextResponse.json(
        { success: false, error: 'Valid subject and message strings are required.' },
        { status: 400 }
      )
    }

    const userEmail = user.email
    const ticketId = `ticket-${Date.now()}`
    const trimmedSubject = subject.trim()
    const trimmedMessage = message.trim()
    const ticketName = typeof name === 'string' && name.trim() ? name.trim() : userEmail.split('@')[0]

    const newTicket = {
      id: ticketId,
      name: ticketName,
      email: userEmail,
      subject: trimmedSubject,
      message: trimmedMessage,
      status: 'open' as const,
      created_at: new Date().toISOString(),
    }

    const { error: dbErr } = await supabase.from('complaints').insert({
      id: newTicket.id,
      name: newTicket.name,
      email: newTicket.email,
      subject: newTicket.subject,
      message: newTicket.message,
      status: 'open',
    })

    if (dbErr) {
      console.error('Supabase complaints insert error:', dbErr.message)
      return NextResponse.json({ error: 'Failed to insert ticket into database' }, { status: 500 })
    }

    SYSTEM_COMPLAINTS.unshift(newTicket)

    return NextResponse.json({
      success: true,
      message: 'Your support message has been sent directly to Support Desk!',
      ticket: newTicket,
    })
  } catch (err: unknown) {
    const error = err as Error
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to submit support ticket.' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Request body must be a JSON object' }, { status: 400 })
    }

    const payload = body as Record<string, unknown>
    const id = payload.id
    const rawStatus = payload.status

    if (!id || typeof id !== 'string' || !id.trim()) {
      return NextResponse.json({ error: 'Valid ticket ID required' }, { status: 400 })
    }

    let targetStatus: 'open' | 'resolved' = 'resolved'
    if (rawStatus !== undefined) {
      if (rawStatus !== 'open' && rawStatus !== 'resolved') {
        return NextResponse.json({ error: 'Invalid status value. Must be "open" or "resolved".' }, { status: 400 })
      }
      targetStatus = rawStatus
    }

    // Verify existing ticket presence and authorization
    const { data: existingTicket, error: fetchErr } = await supabase
      .from('complaints')
      .select('email')
      .eq('id', id)
      .maybeSingle()

    if (fetchErr) {
      console.error('Supabase complaint query error:', fetchErr.message)
      return NextResponse.json({ error: 'Database query failed' }, { status: 500 })
    }

    if (!existingTicket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    const { data: userProfile, error: profileErr } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()

    if (profileErr) {
      console.error('Supabase profile query error:', profileErr.message)
      return NextResponse.json({ error: 'Database query failed' }, { status: 500 })
    }

    const isAdmin = userProfile?.role === 'admin'
    const isOwner = existingTicket.email.toLowerCase() === user.email.toLowerCase()

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Forbidden: You do not own this ticket.' }, { status: 403 })
    }

    // Perform database update first
    const { error: updateErr } = await supabase
      .from('complaints')
      .update({ status: targetStatus })
      .eq('id', id)

    if (updateErr) {
      console.error('Supabase complaints update error:', updateErr.message)
      return NextResponse.json({ error: 'Failed to update ticket status in database' }, { status: 500 })
    }

    // Mutate in-memory complaints store ONLY after database update succeeds
    SYSTEM_COMPLAINTS = SYSTEM_COMPLAINTS.map((c) =>
      c.id === id ? { ...c, status: targetStatus } : c
    )

    return NextResponse.json({ success: true, message: 'Ticket status updated.' })
  } catch (err: unknown) {
    const error = err as Error
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
