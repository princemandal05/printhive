'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <main style={{ minHeight: '100vh', background: '#0b0f19', color: '#f8fafc' }}>
      <Navbar />

      <section className="container section-sm" style={{ maxWidth: 640, margin: '0 auto', padding: '60px 20px' }}>
        <div style={{ color: '#ff6b35', textTransform: 'uppercase', letterSpacing: 1.5, fontSize: 12, fontWeight: 700, textAlign: 'center' }}>
          Customer Support & Help Desk
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 800, textAlign: 'center', marginBottom: 8, background: 'linear-gradient(135deg, #fff 0%, #cbd5e1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Contact PrintHive
        </h1>
        <p style={{ fontSize: 15, color: '#94a3b8', textAlign: 'center', marginBottom: 36 }}>
          Have a question about an order, print quality, designer royalties, or printer owner onboarding? Drop us a message below.
        </p>

        <div style={{ background: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 16, padding: 32 }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 42, marginBottom: 12 }}>✅</div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Message Sent</h2>
              <p style={{ color: '#94a3b8', fontSize: 14 }}>Our support team will get back to you within 24 hours at {email}.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
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
                style={{ width: '100%', padding: '14px 0', background: 'linear-gradient(135deg, #ff6b35 0%, #f97316 100%)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}
              >
                Send Message →
              </button>
            </form>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
