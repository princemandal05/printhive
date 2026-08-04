'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'

type SupportTicket = {
  id: string
  name: string
  email: string
  subject: string
  message: string
  status: 'open' | 'resolved'
  created_at: string
}

export default function SupportTicketsPage() {
  const supabase = createClient()

  const [lookupEmail, setLookupEmail] = useState('')
  const [myTickets, setMyTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadUserAndTickets() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user?.email) {
          setLookupEmail(user.email)
          await fetchTickets(user.email)
        } else {
          setLoading(false)
        }
      } catch (e) {
        setLoading(false)
      }
    }
    loadUserAndTickets()
  }, [])

  const fetchTickets = async (emailToFetch: string) => {
    if (!emailToFetch) return
    setLoading(true)
    try {
      const res = await fetch(`/api/contact?email=${encodeURIComponent(emailToFetch)}`)
      const data = await res.json()
      if (data.success && data.complaints) {
        setMyTickets(data.complaints)
      }
    } catch (err) {
      console.error('Failed to load tickets:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: '#0b0f19', color: '#f8fafc' }}>
      <Navbar />

      <section className="container section-sm" style={{ maxWidth: 840, margin: '0 auto', padding: '60px 20px' }}>
        <div style={{ color: '#ff6b35', textTransform: 'uppercase', letterSpacing: 1.5, fontSize: 12, fontWeight: 700, textAlign: 'center' }}>
          Account Support Desk
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 800, textAlign: 'center', marginBottom: 8, background: 'linear-gradient(135deg, #fff 0%, #cbd5e1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          My Support Tickets & Live Status
        </h1>
        <p style={{ fontSize: 15, color: '#94a3b8', textAlign: 'center', marginBottom: 36 }}>
          Track the real-time status of your support inquiries and order reports.
        </p>

        <div style={{ background: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 20, padding: 32 }}>
          {/* LOOKUP HEADER */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
            <input
              type="email"
              placeholder="Enter your registered email..."
              value={lookupEmail}
              onChange={(e) => setLookupEmail(e.target.value)}
              style={{ flex: 1, minWidth: 260, padding: '12px 18px', background: '#0f172a', border: '1px solid #334155', borderRadius: 10, color: '#fff', fontSize: 14 }}
            />
            <button
              type="button"
              onClick={() => fetchTickets(lookupEmail)}
              style={{ background: '#ff6b35', color: '#fff', border: 'none', padding: '12px 22px', borderRadius: 10, fontWeight: 800, fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 14px rgba(255,107,53,0.3)' }}
            >
              🔄 Refresh Live Status
            </button>
            <Link
              href="/contact"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '12px 22px', borderRadius: 10, fontWeight: 800, fontSize: 14, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
            >
              + Submit New Inquiry
            </Link>
          </div>

          {/* TICKET LIST */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px', color: '#94a3b8' }}>Fetching live ticket status from Support Desk…</div>
          ) : myTickets.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '56px 24px', background: 'rgba(15, 23, 42, 0.5)', borderRadius: 16, border: '1px dashed #334155' }}>
              <div style={{ fontSize: 42, marginBottom: 12 }}>📩</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 6 }}>No Active Support Tickets</div>
              <div style={{ fontSize: 14, color: '#94a3b8', marginBottom: 20 }}>
                {lookupEmail ? `No support tickets found for ${lookupEmail}.` : 'Enter your registered email above to view your ticket status.'}
              </div>
              <Link
                href="/contact"
                style={{ background: '#ff6b35', color: '#fff', padding: '10px 24px', borderRadius: 99, fontWeight: 800, textDecoration: 'none', fontSize: 13 }}
              >
                Send Message to Support →
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {myTickets.map((t) => (
                <div key={t.id} style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 16, padding: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
                    <div>
                      <div style={{ fontSize: 17, fontWeight: 800, color: '#fff' }}>{t.subject}</div>
                      <div style={{ fontSize: 12, color: '#64748B', marginTop: 3 }}>Ticket ID: {t.id}</div>
                    </div>
                    <span
                      style={{
                        padding: '5px 14px',
                        borderRadius: 99,
                        fontSize: 12,
                        fontWeight: 800,
                        background: t.status === 'resolved' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: t.status === 'resolved' ? '#10B981' : '#EF4444',
                        border: `1px solid ${t.status === 'resolved' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                      }}
                    >
                      {t.status === 'resolved' ? '🟢 Resolved (Closed)' : '🔴 Open (Under Support Review)'}
                    </span>
                  </div>

                  <div style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.6, background: 'rgba(30, 41, 59, 0.6)', padding: 16, borderRadius: 10, marginBottom: 12 }}>
                    "{t.message}"
                  </div>

                  <div style={{ fontSize: 12, color: '#64748B', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                    <span>Submitted by: {t.name} ({t.email})</span>
                    <span>{t.created_at ? new Date(t.created_at).toLocaleString() : 'Recently'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
