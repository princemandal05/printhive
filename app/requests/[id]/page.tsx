'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { createClient } from '@/utils/supabase/client'

export type RequestType = {
  id: string
  purpose: string
  dimensions: string
  material: string
  budgetMin: number
  budgetMax: number
  description: string
  postedAt: string
}

export type BidType = {
  id: string
  designer: string
  rating: number
  price: number
  days: number
  note: string
}

export type BidRow = {
  id: string
  request_id?: string
  designer_id?: string
  designer_name?: string
  rating?: number
  price?: number
  amount?: number
  days?: number
  turnaround_days?: number
  note?: string
  proposal?: string
}

export default function RequestDetailPage() {
  const params = useParams()
  const reqId = params?.id as string

  const [request, setRequest] = useState<RequestType | null>(null)
  const [bids, setBids] = useState<BidType[]>([])
  const [notFound, setNotFound] = useState(false)
  const [showBidForm, setShowBidForm] = useState(false)
  const [bidPrice, setBidPrice] = useState('')
  const [bidDays, setBidDays] = useState('')
  const [bidNote, setBidNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [bidError, setBidError] = useState<string | null>(null)

  useEffect(() => {
    setNotFound(false)
    setSubmitted(false)
    setShowBidForm(false)
    setBidError(null)
    setBidPrice('')
    setBidDays('')
    setBidNote('')
    setRequest(null)
    setBids([])

    const supabase = createClient()
    let isMounted = true

    async function loadData() {
      if (!reqId) return
      try {
        const { data: reqData, error: reqErr } = await supabase.from('design_requests').select('*').eq('id', reqId).maybeSingle()
        if (reqErr || !reqData) {
          if (isMounted) {
            setRequest(null)
            setNotFound(true)
            setBids([])
            return
          }
        } else if (isMounted) {
          setRequest({
            id: reqData.id,
            purpose: reqData.purpose || reqData.title || 'Custom 3D Request',
            dimensions: reqData.dimensions || 'Custom Dimensions',
            material: reqData.material || 'PLA',
            budgetMin: reqData.budget_min ?? reqData.budget_min_inr ?? 0,
            budgetMax: reqData.budget_max ?? reqData.budget_max_inr ?? 0,
            description: reqData.description || 'No description provided.',
            postedAt: reqData.created_at ? new Date(reqData.created_at).toLocaleDateString() : 'Recently',
          })
        }

        const { data: bidsData, error: bidsErr } = await supabase.from('design_request_bids').select('*').eq('request_id', reqId)

        if (bidsErr) {
          console.error('Failed to load bids:', bidsErr.message)
          if (isMounted) setBids([])
        } else if (bidsData && isMounted) {
          const mappedBids: BidType[] = bidsData.map((b: BidRow) => ({
            id: b.id,
            designer: b.designer_name || 'Verified Designer',
            rating: b.rating ?? 4.9,
            price: b.price ?? b.amount ?? 400,
            days: b.days ?? b.turnaround_days ?? 2,
            note: b.note || b.proposal || '',
          }))
          setBids(mappedBids)
        }
      } catch (err) {
        console.error('Error fetching request detail from Supabase:', err)
        if (isMounted) setBids([])
      }
    }

    loadData()
    return () => { isMounted = false }
  }, [reqId])

  const handleSubmitBid = async () => {
    setSubmitting(true)
    setBidError(null)

    const priceNum = Number(bidPrice)
    const daysNum = Number(bidDays)

    if (!Number.isFinite(priceNum) || priceNum < 0) {
      setBidError('Please enter a valid non-negative price (₹0 or more).')
      setSubmitting(false)
      return
    }

    if (!Number.isFinite(daysNum) || daysNum < 1) {
      setBidError('Turnaround time must be at least 1 day.')
      setSubmitting(false)
      return
    }

    const supabase = createClient()
    try {
      const { data: { user }, error: authErr } = await supabase.auth.getUser()
      if (authErr || !user) {
        setBidError('Authentication required. Please log in to submit a bid.')
        return
      }

      const { error: insertErr } = await supabase.from('design_request_bids').insert({
        request_id: reqId,
        designer_id: user.id,
        designer_name: user.user_metadata?.full_name || user.email || 'Verified Designer',
        price: priceNum,
        days: daysNum,
        note: bidNote,
      })

      if (insertErr) {
        setBidError(insertErr.message || 'Failed to submit bid. Please try again.')
        return
      }

      setSubmitted(true)
      setShowBidForm(false)
    } catch (err: unknown) {
      console.error('Bid insert error:', err)
      const msg = err instanceof Error ? err.message : 'An error occurred while submitting your bid.'
      setBidError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main>
      <Navbar />

      <section className="container section-sm">
        {notFound || !request ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', background: 'var(--bg-card)', borderRadius: 24, border: '2px dashed var(--border-color)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>❓</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-main)', marginBottom: 6 }}>Custom Brief Not Found</div>
            <div style={{ fontSize: 14, color: 'var(--text-sub)' }}>The requested brief does not exist or may have been removed.</div>
          </div>
        ) : (
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
                Bids ({bids.length}{submitted ? ' + yours' : ''})
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
                {bids.map((b) => (
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
                    {bidError && (
                      <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#EF4444', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 14 }}>
                        ⚠️ {bidError}
                      </div>
                    )}
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
        )}
      </section>

      <Footer />
    </main>
  )
}