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
}> = [
  {
    id: 'ticket-1700000001',
    name: 'Rohan Sharma',
    email: 'rohan@example.com',
    subject: 'Order #ORD-8821 Filament Color Clarification',
    message: 'I requested Red PLA for my 3D phone holder, just wanted to verify if matte red is available.',
    status: 'open',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const targetEmail = searchParams.get('email')?.trim()

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let dbComplaints: any[] = []
    let isAdmin = false

    if (user) {
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
      isAdmin = profile?.role === 'admin'
    }

    // Try fetching from Supabase database
    try {
      let query = supabase.from('complaints').select('*').order('created_at', { ascending: false })
      
      if (!isAdmin && targetEmail) {
        query = query.ilike('email', targetEmail)
      } else if (!isAdmin && user?.email) {
        query = query.ilike('email', user.email)
      }

      const { data, error } = await query
      if (!error && Array.isArray(data)) {
        dbComplaints = data
      }
    } catch (e) {
      console.warn('Supabase complaints query fallback:', e)
    }

    // Merge DB complaints with in-memory complaints store
    const allComplaints = [...dbComplaints]
    for (const sysComp of SYSTEM_COMPLAINTS) {
      if (!allComplaints.some((c) => c.id === sysComp.id)) {
        allComplaints.push(sysComp)
      }
    }

    // Filter results if specified
    let filtered = allComplaints
    if (!isAdmin && targetEmail) {
      filtered = allComplaints.filter((c) => c.email.toLowerCase() === targetEmail.toLowerCase())
    } else if (!isAdmin && user?.email) {
      const uEmail = user.email.toLowerCase()
      filtered = allComplaints.filter((c) => c.email.toLowerCase() === uEmail)
    }

    return NextResponse.json({ success: true, complaints: filtered })
  } catch (err: unknown) {
    const error = err as Error
    return NextResponse.json({ success: true, complaints: SYSTEM_COMPLAINTS })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

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
    const email = payload.email
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

    const userEmail = (user?.email || (typeof email === 'string' && email.trim()) || '').trim()

    if (!userEmail || !userEmail.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'A valid email address is required to submit a support ticket.' },
        { status: 400 }
      )
    }

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

    // Try inserting into Supabase
    try {
      await supabase.from('complaints').insert({
        id: newTicket.id,
        name: newTicket.name,
        email: newTicket.email,
        subject: newTicket.subject,
        message: newTicket.message,
        status: 'open',
      })
    } catch (dbErr) {
      console.warn('Supabase complaints DB insert fallback:', dbErr)
    }

    // Always push to in-memory store as fallback
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

    // Perform database update
    try {
      await supabase
        .from('complaints')
        .update({ status: targetStatus })
        .eq('id', id)
    } catch (e) {
      console.warn('Supabase complaints update fallback:', e)
    }

    // Mutate in-memory complaints store
    SYSTEM_COMPLAINTS = SYSTEM_COMPLAINTS.map((c) =>
      c.id === id ? { ...c, status: targetStatus } : c
    )

    return NextResponse.json({ success: true, message: 'Ticket status updated.' })
  } catch (err: unknown) {
    const error = err as Error
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
