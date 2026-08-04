'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'

export default function ContactPage() {
  const supabase = createClient()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Auto-detect logged in user email
  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        setEmail(user.email)
        setName(user.user_metadata?.full_name || user.email.split('@')[0])
      }
    }
    loadUser()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setErrorMsg('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      })

      const data = await res.json()
      if (data.success) {
        setSubmitted(true)
      } else {
        setErrorMsg(data.error || 'Failed to submit message to Support.')
      }
    } catch (err: any) {
      setErrorMsg('Network error. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: '#0b0f19', color: '#f8fafc' }}>
      <Navbar />

      <section className="container section-sm" style={{ maxWidth: 640, margin: '0 auto', padding: '60px 20px' }}>
        <div style={{ color: '#ff6b35', textTransform: 'uppercase', letterSpacing: 1.5, fontSize: 12, fontWeight: 700, textAlign: 'center' }}>
          Customer Support & Help Desk
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 800, textAlign: 'center', marginBottom: 8, background: 'linear-gradient(135deg, #fff 0%, #cbd5e1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Contact PrintHive Support
        </h1>
        <p style={{ fontSize: 15, color: '#94a3b8', textAlign: 'center', marginBottom: 36 }}>
          Have a question about an order, print quality, designer royalties, or printer owner onboarding? Drop us a message below.
        </p>

        {/* CLEAN CONTACT FORM CARD */}
        <div style={{ background: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 20, padding: 36 }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 8 }}>Message Sent to Support</h2>
              <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 24 }}>
                Your support inquiry has been submitted directly to the PrintHive Support Desk. We will notify you at <strong style={{ color: '#fff' }}>{email}</strong>.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false)
                    setSubject('')
                    setMessage('')
                  }}
                  style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
                >
                  + Submit Another Message
                </button>
                <Link
                  href="/support-tickets"
                  style={{ background: '#ff6b35', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 10, fontWeight: 800, fontSize: 13, textDecoration: 'none' }}
                >
                  Track Live Ticket Status →
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {errorMsg && (
                <div style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid #EF4444', color: '#FCA5A5', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
                  {errorMsg}
                </div>
              )}

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#cbd5e1', marginBottom: 6 }}>Your Name</label>
                <input
                  required
                  className="input"
                  placeholder="e.g. Priyanshu Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: '100%', padding: '12px 16px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#fff' }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#cbd5e1', marginBottom: 6 }}>Email Address</label>
                <input
                  required
                  type="email"
                  className="input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '12px 16px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#fff' }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#cbd5e1', marginBottom: 6 }}>Subject</label>
                <input
                  required
                  className="input"
                  placeholder="e.g. Order Tracking Inquiry or Partner Onboarding"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  style={{ width: '100%', padding: '12px 16px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#fff' }}
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#cbd5e1', marginBottom: 6 }}>Message</label>
                <textarea
                  required
                  rows={4}
                  className="textarea"
                  placeholder="How can we help?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  style={{ width: '100%', padding: '12px 16px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#fff', resize: 'vertical' }}
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                style={{ width: '100%', padding: '14px 0', background: 'linear-gradient(135deg, #ff6b35 0%, #f97316 100%)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 800, cursor: 'pointer', opacity: sending ? 0.7 : 1 }}
              >
                {sending ? 'Sending to Support…' : 'Send Message to Support'}
              </button>
            </form>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
