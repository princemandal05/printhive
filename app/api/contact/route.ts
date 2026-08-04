import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// Fallback in-memory store for support messages if database table is not yet migrated
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
    id: 'ticket-101',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    subject: '3D Print Delivery Status & Escrow Query',
    message: 'I ordered a custom PLA model 2 days ago. Can I get an updated delivery estimate from the printer owner?',
    status: 'open',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const emailParam = searchParams.get('email')

    const supabase = await createClient()
    let query = supabase.from('complaints').select('*').order('created_at', { ascending: false })
    
    if (emailParam) {
      query = query.eq('email', emailParam)
    }

    const { data: dbComplaints, error } = await query

    if (!error && dbComplaints && dbComplaints.length > 0) {
      return NextResponse.json({ success: true, complaints: dbComplaints })
    }

    let filtered = SYSTEM_COMPLAINTS
    if (emailParam) {
      filtered = SYSTEM_COMPLAINTS.filter((c) => c.email.toLowerCase() === emailParam.toLowerCase())
    }

    return NextResponse.json({ success: true, complaints: filtered })
  } catch (err: any) {
    return NextResponse.json({ success: true, complaints: SYSTEM_COMPLAINTS })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, subject, message } = body

    if (!email || !subject || !message) {
      return NextResponse.json(
        { success: false, error: 'Email, subject, and message are required.' },
        { status: 400 }
      )
    }

    const newTicket = {
      id: `ticket-${Date.now()}`,
      name: name || email.split('@')[0],
      email,
      subject,
      message,
      status: 'open' as const,
      created_at: new Date().toISOString(),
    }

    // Try inserting into Supabase database table
    try {
      const supabase = await createClient()
      const { error: dbErr } = await supabase.from('complaints').insert({
        name: newTicket.name,
        email: newTicket.email,
        subject: newTicket.subject,
        message: newTicket.message,
        status: 'open',
      })

      if (dbErr) {
        console.warn('Supabase complaints insert notice:', dbErr.message)
      }
    } catch (e) {
      // Ignore DB error and rely on state
    }

    // Always push to SYSTEM_COMPLAINTS so Admin dashboard picks it up immediately
    SYSTEM_COMPLAINTS.unshift(newTicket)

    return NextResponse.json({
      success: true,
      message: 'Your support message has been sent directly to the Support Desk!',
      ticket: newTicket,
    })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to submit support ticket.' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json()
    
    // Update in memory
    SYSTEM_COMPLAINTS = SYSTEM_COMPLAINTS.map((c) =>
      c.id === id ? { ...c, status: status || 'resolved' } : c
    )

    // Try updating DB
    try {
      const supabase = await createClient()
      await supabase.from('complaints').update({ status: status || 'resolved' }).eq('id', id)
    } catch (e) {}

    return NextResponse.json({ success: true, message: 'Ticket status updated.' })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
