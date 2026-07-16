'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

// Mock request + bids — replace with Supabase queries on `design_requests`
// (by id) and `design_request_bids` (by request_id), realtime-subscribed
// so new bids appear live for the buyer.
const MOCK_REQUEST = {
  id: 'r1',
  purpose: 'Replacement knob for a washing machine',
  dimensions: '5cm x 5cm x 2cm',
  material: 'ABS',
  budgetMin: 200,
  budgetMax: 500,
  description:
    'The original knob cracked. Need something durable in ABS that matches the attached photo as closely as possible — a rounded top with a small grip texture.',
  postedAt: '2 days ago',
}

const MOCK_BIDS = [
  { id: 'b1', designer: 'Aarav Mehta', rating: 4.8, price: 380, days: 3, note: 'Can match the exact shape from your photo, printed in ABS with a matte finish.' },
  { id: 'b2', designer: 'Sneha Kulkarni', rating: 4.6, price: 420, days: 2, note: 'Reinforced design so it won\u2019t crack again — slightly thicker walls.' },
]

export default function RequestDetailPage() {
  const params = useParams()
  const request = { ...MOCK_REQUEST, id: (params?.id as string) || MOCK_REQUEST.id }

  const [showBidForm, setShowBidForm] = useState(false)
  const [bidPrice, setBidPrice] = useState('')
  const [bidDays, setBidDays] = useState('')
  const [bidNote, setBidNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmitBid = async () => {
    // Replace with: insert a row into `design_request_bids` via Supabase,
    // notifying the buyer in realtime.
    setSubmitting(true)
    await new Promise((res) => setTimeout(res, 800))
    setSubmitting(false)
    setSubmitted(true)
    setShowBidForm(false)
  }

  return (
    <main>
      <Navbar />

      <section className="container section-sm">
        <div className="grid grid-cols-2 gap-8" style={{ gridTemplateColumns: '1.2fr 0.8fr' }}>
          <div>
            <div className="section-eyebrow">Posted {request.postedAt}</div>
            <h1 className="section-heading" style={{ marginBottom: 'var(--space-4)' }}>
              {request.purpose}
            </h1>
            <div className="flex gap-2" style={{ marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
              <span className="badge badge-neutral">{request.dimensions}</span>
              <span className="badge badge-neutral">{request.material}</span>
              <span className="badge badge-primary">₹{request.budgetMin}–₹{request.budgetMax}</span>
            </div>
            <p className="text-sm" style={{ color: 'var(--color-slate-600)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-8)' }}>
              {request.description}
            </p>

            <div className="feature-title" style={{ marginBottom: 'var(--space-4)' }}>
              Bids ({MOCK_BIDS.length}{submitted ? ' + yours' : ''})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {submitted && (
                <div className="card" style={{ borderColor: 'var(--color-primary)', borderWidth: 2 }}>
                  <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-2)' }}>
                    <span className="text-sm" style={{ fontWeight: 600 }}>You</span>
                    <span className="badge badge-primary">Your bid</span>
                  </div>
                  <div className="flex justify-between text-sm" style={{ marginBottom: 'var(--space-2)' }}>
                    <span>₹{bidPrice} · {bidDays} day{Number(bidDays) !== 1 ? 's' : ''}</span>
                  </div>
                  <p className="text-sm text-muted">{bidNote}</p>
                </div>
              )}
              {MOCK_BIDS.map((b) => (
                <div key={b.id} className="card">
                  <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-2)' }}>
                    <div className="flex items-center gap-2">
                      <div className="avatar" style={{ width: 28, height: 28, fontSize: 12 }}>{b.designer.charAt(0)}</div>
                      <span className="text-sm" style={{ fontWeight: 600 }}>{b.designer}</span>
                      <span className="rating">★ {b.rating}</span>
                    </div>
                    <span style={{ fontWeight: 700 }}>₹{b.price}</span>
                  </div>
                  <div className="text-xs text-muted" style={{ marginBottom: 'var(--space-2)' }}>
                    {b.days} day{b.days !== 1 ? 's' : ''} turnaround
                  </div>
                  <p className="text-sm text-muted">{b.note}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bid panel */}
          <div>
            <div className="card" style={{ position: 'sticky', top: 'calc(var(--navbar-height) + 24px)' }}>
              {!showBidForm && !submitted && (
                <>
                  <div className="card-title" style={{ marginBottom: 'var(--space-3)' }}>Interested in this job?</div>
                  <p className="text-sm text-muted" style={{ marginBottom: 'var(--space-5)' }}>
                    Submit a price and turnaround time. The buyer picks a winning bid.
                  </p>
                  <button className="btn btn-primary btn-block btn-lg" onClick={() => setShowBidForm(true)}>
                    Place a bid
                  </button>
                </>
              )}

              {showBidForm && (
                <>
                  <div className="card-title" style={{ marginBottom: 'var(--space-4)' }}>Your bid</div>
                  <div className="form-group">
                    <label className="label label-required">Price (₹)</label>
                    <input className="input" type="number" min={0} placeholder="e.g. 400" value={bidPrice} onChange={(e) => setBidPrice(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="label label-required">Turnaround (days)</label>
                    <input className="input" type="number" min={1} placeholder="e.g. 3" value={bidDays} onChange={(e) => setBidDays(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="label">Note to buyer</label>
                    <textarea className="textarea" placeholder="How you'll approach the design" value={bidNote} onChange={(e) => setBidNote(e.target.value)} />
                  </div>
                  <button
                    className="btn btn-primary btn-block btn-lg"
                    disabled={submitting || !bidPrice || !bidDays}
                    onClick={handleSubmitBid}
                  >
                    {submitting ? 'Submitting…' : 'Submit bid'}
                  </button>
                </>
              )}

              {submitted && (
                <>
                  <div style={{ fontSize: 28, marginBottom: 'var(--space-3)' }}>✅</div>
                  <div className="card-title" style={{ marginBottom: 'var(--space-2)' }}>Bid submitted</div>
                  <p className="text-sm text-muted">
                    You&apos;ll be notified if the buyer accepts your bid.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}