'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { createClient } from '@/utils/supabase/client'

export default function SupportPage() {
  const supabase = createClient()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [orderId, setOrderId] = useState('')
  const [issueType, setIssueType] = useState('Order & Delivery')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [ticketId, setTicketId] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    async function loadUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user?.email) {
          setEmail(user.email)
          setName(user.user_metadata?.full_name || user.email.split('@')[0])
        }
      } catch {
        // guest mode
      }
    }
    loadUser()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !message) {
      setErrorMsg('Please complete all required fields.')
      return
    }

    setSubmitting(true)
    setErrorMsg('')

    try {
      const subject = `[${issueType}] ${orderId ? `Order #${orderId} - ` : ''}Support Request`
      const fullMessage = orderId ? `Order ID: ${orderId}\nCategory: ${issueType}\n\n${message}` : `Category: ${issueType}\n\n${message}`

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          subject,
          message: fullMessage,
        }),
      })

      const data = await res.json()
      if (data.success && data.complaint?.id) {
        const assignedId = String(data.complaint.id).startsWith('TK-')
          ? String(data.complaint.id)
          : `TK-${String(data.complaint.id).replace(/^ticket-/, '').slice(0, 8).toUpperCase()}`
        setTicketId(assignedId)
        setSubmitted(true)
      } else {
        setErrorMsg(data.error || 'Failed to submit support ticket: persisted complaint ID missing.')
      }
    } catch (err: any) {
      setErrorMsg('Network error connecting to support desk. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-canvas)', color: 'var(--text-main)' }}>
      <Navbar />

      <section className="container section-sm" style={{ maxWidth: 840, margin: '0 auto', padding: '60px 20px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(234, 88, 12, 0.1)', color: '#ea580c', border: '1px solid rgba(234, 88, 12, 0.3)', padding: '4px 14px', borderRadius: 99, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', marginBottom: 16 }}>
            💬 24/7 Maker Desk &amp; Escrow Arbitration
          </div>
          <h1 style={{ fontSize: 34, fontWeight: 900, letterSpacing: '-0.5px', margin: '0 0 12px 0' }}>
            Help, Support &amp; Dispute Arbitration
          </h1>
          <p style={{ color: 'var(--text-sub)', fontSize: 15, maxWidth: 580, margin: '0 auto 16px auto', lineHeight: 1.6 }}>
            Need assistance with your CAD slice, delivery tracking, or an escrow dispute? Submit a ticket below for priority mediation.
          </p>
          <div>
            <Link
              href="/support-tickets"
              style={{
                fontSize: 13,
                fontWeight: 800,
                color: '#ea580c',
                textDecoration: 'none',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                padding: '6px 16px',
                borderRadius: 99,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              📋 Already have a ticket? Track Ticket Status →
            </Link>
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 24, padding: 36, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 20px auto' }}>
                ✓
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 8px 0' }}>Support Ticket Received</h3>
              <p style={{ color: 'var(--text-sub)', fontSize: 14.5, maxWidth: 480, margin: '0 auto 24px auto', lineHeight: 1.6 }}>
                Your inquiry has been assigned ticket ID <strong>#{ticketId}</strong>. Our engineering arbitration team will respond to <strong>{email}</strong> within 2 hours.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false)
                    setMessage('')
                    setOrderId('')
                  }}
                  style={{ background: 'var(--bg-card-hover)', color: 'var(--text-main)', border: '1px solid var(--border-color)', padding: '12px 24px', borderRadius: 99, fontWeight: 800, cursor: 'pointer' }}
                >
                  Submit Another Request
                </button>
                <Link
                  href="/support-tickets"
                  style={{ background: '#ea580c', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 99, fontWeight: 800, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  Track Live Ticket Status →
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {errorMsg && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #EF4444', color: '#EF4444', padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 700 }}>
                  ⚠️ {errorMsg}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Full Name *</label>
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Name"
                    style={{ width: '100%', background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: 'var(--text-main)', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Email Address *</label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    style={{ width: '100%', background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: 'var(--text-main)', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Order ID (Optional)</label>
                  <input
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="e.g. b3eed3f7-..."
                    style={{ width: '100%', background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: 'var(--text-main)', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Category</label>
                  <select
                    value={issueType}
                    onChange={(e) => setIssueType(e.target.value)}
                    style={{ width: '100%', background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: 'var(--text-main)', outline: 'none' }}
                  >
                    <option value="Order & Delivery">Order &amp; Delivery</option>
                    <option value="Print Quality & Defect">Print Quality &amp; Defect</option>
                    <option value="Escrow & Payment">Escrow &amp; Payment</option>
                    <option value="Creator Studio Inquiry">Creator Studio Inquiry</option>
                    <option value="Hub Operator Registration">Hub Operator Registration</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Describe your Issue or Inquiry *</label>
                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Please provide details regarding your inquiry or defect report..."
                  style={{ width: '100%', background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: 'var(--text-main)', outline: 'none', resize: 'vertical' }}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 99,
                  padding: '14px',
                  fontWeight: 900,
                  fontSize: 15,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.7 : 1,
                  boxShadow: '0 4px 16px rgba(234, 88, 12, 0.35)',
                }}
              >
                {submitting ? 'Submitting to Arbitration Desk...' : 'Submit Priority Support Ticket →'}
              </button>
            </form>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
