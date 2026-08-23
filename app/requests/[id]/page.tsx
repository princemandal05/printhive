'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { createClient } from '@/utils/supabase/client'

export type RequestType = {
  id: string
  title: string
  budget: number
  description: string
  postedAt: string
  buyerId: string
  status: string
}

export type BidType = {
  id: string
  designer: string
  rating: number
  price: number
  days: number
  note: string
  designerId?: string
}

export default function RequestDetailPage() {
  const params = useParams()
  const router = useRouter()
  const reqId = params?.id as string

  const [request, setRequest] = useState<RequestType | null>(null)
  const [bids, setBids] = useState<BidType[]>([])
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [currentUserRole, setCurrentUserRole] = useState<string>('buyer')

  // Bid form state
  const [showBidForm, setShowBidForm] = useState(false)
  const [bidPrice, setBidPrice] = useState('')
  const [bidDays, setBidDays] = useState('')
  const [bidNote, setBidNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [bidError, setBidError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    let isMounted = true

    async function loadData() {
      if (!reqId) return
      setLoading(true)

      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user && isMounted) {
          setCurrentUserId(user.id)
          const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
          if (profile?.role) setCurrentUserRole(profile.role)
        }

        const { data: reqData, error: reqErr } = await supabase
          .from('design_requests')
          .select('*')
          .eq('id', reqId)
          .maybeSingle()

        if (reqErr || !reqData) {
          if (isMounted) {
            setRequest(null)
            setNotFound(true)
            setBids([])
          }
          return
        }

        if (isMounted) {
          setRequest({
            id: reqData.id,
            title: reqData.title || reqData.purpose || 'Custom 3D Request',
            budget: Number(reqData.budget || 0),
            description: reqData.description || 'No detailed specifications provided.',
            postedAt: reqData.created_at ? new Date(reqData.created_at).toLocaleDateString() : 'Recently',
            buyerId: reqData.buyer_id,
            status: reqData.status || 'open',
          })
        }

        const { data: bidsData } = await supabase
          .from('design_request_bids')
          .select('*')
          .eq('request_id', reqId)

        if (bidsData && isMounted) {
          const mappedBids: BidType[] = bidsData.map((b: any) => ({
            id: b.id,
            designer: b.designer_name || 'Verified Designer',
            rating: b.rating ?? 4.9,
            price: Number(b.price || b.amount || 400),
            days: Number(b.days || b.turnaround_days || 2),
            note: b.note || b.proposal || '',
            designerId: b.designer_id,
          }))
          setBids(mappedBids)

          if (user && mappedBids.some(b => b.designerId === user.id)) {
            setSubmitted(true)
          }
        }
      } catch (err) {
        console.error('Error fetching request detail from Supabase:', err)
        if (isMounted) setBids([])
      } finally {
        if (isMounted) setLoading(false)
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

    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      setBidError('Please enter a valid bid price greater than ₹0.')
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
        setBidError('Authentication required. Please log in as a designer to submit a bid.')
        setSubmitting(false)
        return
      }

      const { error: insertErr } = await supabase.from('design_request_bids').insert({
        request_id: reqId,
        designer_id: user.id,
        designer_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Verified Designer',
        price: priceNum,
        days: daysNum,
        note: bidNote.trim() || 'Ready to model and deliver with high precision.',
      })

      if (insertErr) {
        setBidError(insertErr.message || 'Failed to submit bid. Please try again.')
        setSubmitting(false)
        return
      }

      setSubmitted(true)
      setShowBidForm(false)
      setBids((prev) => [
        {
          id: `bid-${Date.now()}`,
          designer: user.user_metadata?.full_name || user.email?.split('@')[0] || 'You',
          rating: 5.0,
          price: priceNum,
          days: daysNum,
          note: bidNote.trim() || 'Ready to model and deliver with high precision.',
          designerId: user.id,
        },
        ...prev,
      ])
    } catch (err: unknown) {
      console.error('Bid insert error:', err)
      const msg = err instanceof Error ? err.message : 'An error occurred while submitting your bid.'
      setBidError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const isOwner = Boolean(currentUserId && request?.buyerId && currentUserId === request.buyerId)
  const isFreelancer = currentUserRole === 'designer' || currentUserRole === 'printer_owner' || currentUserRole === 'admin'

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: '#F8FAFC',
    border: '1px solid #CBD5E1',
    borderRadius: 10,
    padding: '10px 14px',
    fontSize: 14,
    color: '#0F172A',
    outline: 'none',
    boxSizing: 'border-box',
    fontWeight: 600,
  }

  return (
    <main style={{ minHeight: '100vh', background: '#FAF8F5', color: '#0F172A' }}>
      <Navbar />

      <section style={{ maxWidth: 1180, margin: '0 auto', padding: '40px 20px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: '#64748B', fontSize: 16 }}>
            Loading brief specifications...
          </div>
        ) : notFound || !request ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', background: '#FFFFFF', borderRadius: 24, border: '1px solid #E2E8F0', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>❓</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#0F172A', marginBottom: 8 }}>Custom Brief Not Found</div>
            <div style={{ fontSize: 14, color: '#64748B', marginBottom: 24 }}>The requested brief does not exist or may have been removed.</div>
            <Link href="/" style={{ background: '#FF6B35', color: '#fff', padding: '12px 24px', borderRadius: 12, fontWeight: 800, textDecoration: 'none', display: 'inline-block' }}>
              ← Return Home
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 32, alignItems: 'start' }}>
            {/* LEFT COLUMN: BRIEF SPECIFICATIONS & PROPOSALS */}
            <div>
              <div style={{ background: '#FFFFFF', borderRadius: 20, border: '1px solid #E2E8F0', padding: 32, boxShadow: '0 8px 30px rgba(0,0,0,0.04)', marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,107,53,0.12)', color: '#FF6B35', padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    ⚡ {request.status === 'open' ? 'Open for Bids' : request.status}
                  </div>
                  <span style={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>Posted on {request.postedAt}</span>
                </div>

                <h1 style={{ fontSize: 30, fontWeight: 900, color: '#0F172A', margin: '0 0 16px', letterSpacing: '-0.5px' }}>
                  {request.title}
                </h1>

                {request.budget > 0 && (
                  <div style={{ display: 'inline-block', background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '6px 14px', borderRadius: 10, color: '#065F46', fontWeight: 900, fontSize: 16, marginBottom: 20 }}>
                    💰 Budget: ₹{request.budget}
                  </div>
                )}

                <div style={{ fontSize: 13, fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                  Brief Requirements & Sizing
                </div>

                <div style={{ fontSize: 15, color: '#334155', lineHeight: 1.7, whiteSpace: 'pre-line', background: '#F8FAFC', padding: 20, borderRadius: 14, border: '1px solid #E2E8F0' }}>
                  {request.description}
                </div>
              </div>

              {/* RECEIVED BIDS SECTION */}
              <div style={{ background: '#FFFFFF', borderRadius: 20, border: '1px solid #E2E8F0', padding: 32, boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 900, color: '#0F172A', margin: 0 }}>
                    Proposals & Bids ({bids.length})
                  </h3>
                  {isOwner && (
                    <span style={{ fontSize: 12, color: '#10B981', fontWeight: 800, background: '#ECFDF5', padding: '4px 10px', borderRadius: 99 }}>
                      Buyer Review Mode
                    </span>
                  )}
                </div>

                {bids.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '36px 16px', color: '#64748B', background: '#F8FAFC', borderRadius: 14, border: '1px dashed #CBD5E1' }}>
                    <div style={{ fontSize: 28, marginBottom: 6 }}>⏳</div>
                    <div style={{ fontWeight: 800, color: '#0F172A', fontSize: 14, marginBottom: 4 }}>No Bids Submitted Yet</div>
                    <div style={{ fontSize: 13 }}>
                      {isOwner
                        ? 'Your brief is active! Top 3D creators will submit proposals with turnaround estimates shortly.'
                        : 'Be the first creator to submit a proposal for this job!'}
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {bids.map((b) => (
                      <div
                        key={b.id}
                        style={{
                          background: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          borderRadius: 14,
                          padding: 18,
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#FF6B35', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 14 }}>
                              {b.designer.charAt(0)}
                            </div>
                            <div>
                              <div style={{ fontWeight: 800, color: '#0F172A', fontSize: 14 }}>{b.designer}</div>
                              <span style={{ fontSize: 12, color: '#F59E0B', fontWeight: 700 }}>★ {b.rating}</span>
                            </div>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 18, fontWeight: 900, color: '#FF6B35' }}>₹{b.price}</div>
                            <div style={{ fontSize: 11, color: '#64748B', fontWeight: 700 }}>⏱️ {b.days} day turnaround</div>
                          </div>
                        </div>

                        {b.note && (
                          <div style={{ fontSize: 13, color: '#475569', marginTop: 8, padding: '8px 12px', background: '#FFFFFF', borderRadius: 8, border: '1px solid #E2E8F0' }}>
                            &ldquo;{b.note}&rdquo;
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT SIDEBAR: ROLE-AWARE ACTIONS */}
            <div style={{ position: 'sticky', top: 90 }}>
              <div style={{ background: '#FFFFFF', borderRadius: 20, border: '1px solid #E2E8F0', padding: 28, boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
                {/* 1. CREATOR / BUYER VIEW: STATUS DASHBOARD (NO BID FORM) */}
                {isOwner ? (
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 900, color: '#FF6B35', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                      ✨ Your Custom Brief
                    </div>
                    <h3 style={{ fontSize: 20, fontWeight: 900, color: '#0F172A', margin: '0 0 10px' }}>
                      Status: Open & Accepting Bids
                    </h3>
                    <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.5, marginBottom: 20 }}>
                      You posted this brief. Verified 3D designers and print hubs across India are reviewing your specifications.
                    </p>

                    <div style={{ background: '#F8FAFC', padding: 16, borderRadius: 14, border: '1px solid #E2E8F0', marginBottom: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#64748B', marginBottom: 6 }}>
                        <span>Proposals Received:</span>
                        <strong style={{ color: '#0F172A' }}>{bids.length}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#64748B', marginBottom: 6 }}>
                        <span>Target Budget:</span>
                        <strong style={{ color: '#0F172A' }}>₹{request.budget || 'Flexible'}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#64748B' }}>
                        <span>Status:</span>
                        <strong style={{ color: '#10B981' }}>Active</strong>
                      </div>
                    </div>

                    <Link
                      href="/requests/new"
                      style={{
                        display: 'block',
                        textAlign: 'center',
                        background: 'linear-gradient(135deg, #FF6B35 0%, #F97316 100%)',
                        color: '#fff',
                        padding: '12px 20px',
                        borderRadius: 12,
                        fontWeight: 800,
                        fontSize: 14,
                        textDecoration: 'none',
                        boxShadow: '0 6px 20px rgba(255,107,53,0.3)',
                        marginBottom: 10,
                      }}
                    >
                      + Post Another Brief
                    </Link>

                    <Link
                      href="/dashboard/buyer"
                      style={{
                        display: 'block',
                        textAlign: 'center',
                        color: '#64748B',
                        fontSize: 13,
                        fontWeight: 700,
                        textDecoration: 'none',
                        padding: '8px',
                      }}
                    >
                      ← Back to Buyer Dashboard
                    </Link>
                  </div>
                ) : isFreelancer ? (
                  /* 2. FREELANCER (DESIGNER / HUB) VIEW: BIDDING FORM */
                  <div>
                    {!showBidForm && !submitted && (
                      <>
                        <div style={{ fontSize: 13, fontWeight: 900, color: '#8B5CF6', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                          💼 Freelance Opportunity
                        </div>
                        <h3 style={{ fontSize: 20, fontWeight: 900, color: '#0F172A', margin: '0 0 10px' }}>
                          Submit a Proposal
                        </h3>
                        <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.5, marginBottom: 20 }}>
                          Submit your price and turnaround time. When the buyer accepts your proposal, funds are held securely in Escrow.
                        </p>
                        <button
                          type="button"
                          onClick={() => setShowBidForm(true)}
                          style={{
                            width: '100%',
                            background: 'linear-gradient(135deg, #FF6B35 0%, #F97316 100%)',
                            color: '#fff',
                            border: 'none',
                            padding: '14px 24px',
                            borderRadius: 14,
                            fontSize: 15,
                            fontWeight: 900,
                            cursor: 'pointer',
                            boxShadow: '0 6px 20px rgba(255,107,53,0.3)',
                          }}
                        >
                          Submit a Bid →
                        </button>
                      </>
                    )}

                    {showBidForm && !submitted && (
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 900, color: '#0F172A', marginBottom: 14 }}>
                          Your Proposal Details
                        </div>

                        {bidError && (
                          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 700, marginBottom: 14 }}>
                            ⚠️ {bidError}
                          </div>
                        )}

                        <div style={{ marginBottom: 14 }}>
                          <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#334155', marginBottom: 4, textTransform: 'uppercase' }}>
                            Your Price (₹) *
                          </label>
                          <input
                            type="number"
                            min="1"
                            style={inputStyle}
                            placeholder="e.g. 500"
                            value={bidPrice}
                            onChange={(e) => setBidPrice(e.target.value)}
                          />
                        </div>

                        <div style={{ marginBottom: 14 }}>
                          <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#334155', marginBottom: 4, textTransform: 'uppercase' }}>
                            Turnaround (Days) *
                          </label>
                          <input
                            type="number"
                            min="1"
                            style={inputStyle}
                            placeholder="e.g. 2"
                            value={bidDays}
                            onChange={(e) => setBidDays(e.target.value)}
                          />
                        </div>

                        <div style={{ marginBottom: 18 }}>
                          <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#334155', marginBottom: 4, textTransform: 'uppercase' }}>
                            Proposal Note
                          </label>
                          <textarea
                            style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
                            placeholder="Describe how you will model the file, materials, tolerances..."
                            value={bidNote}
                            onChange={(e) => setBidNote(e.target.value)}
                          />
                        </div>

                        <div style={{ display: 'flex', gap: 10 }}>
                          <button
                            type="button"
                            onClick={() => setShowBidForm(false)}
                            style={{ flex: 1, background: '#F1F5F9', color: '#475569', border: 'none', padding: '12px', borderRadius: 10, fontWeight: 800, fontSize: 13, cursor: 'pointer' }}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleSubmitBid}
                            disabled={submitting || !bidPrice || !bidDays}
                            style={{
                              flex: 2,
                              background: submitting || !bidPrice || !bidDays ? '#94A3B8' : '#FF6B35',
                              color: '#fff',
                              border: 'none',
                              padding: '12px',
                              borderRadius: 10,
                              fontWeight: 900,
                              fontSize: 13,
                              cursor: submitting || !bidPrice || !bidDays ? 'not-allowed' : 'pointer',
                            }}
                          >
                            {submitting ? 'Submitting…' : 'Submit Proposal'}
                          </button>
                        </div>
                      </div>
                    )}

                    {submitted && (
                      <div style={{ textAlign: 'center', padding: '16px 0' }}>
                        <div style={{ fontSize: 36, marginBottom: 8 }}>✅</div>
                        <div style={{ fontSize: 16, fontWeight: 900, color: '#0F172A', marginBottom: 4 }}>Proposal Submitted!</div>
                        <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.4, margin: 0 }}>
                          The buyer has been notified of your bid. You will receive an alert once the brief is awarded.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  /* 3. NON-CREATOR BUYER OR GUEST VIEW */
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 900, color: '#FF6B35', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                      ✨ Custom Brief
                    </div>
                    <h3 style={{ fontSize: 18, fontWeight: 900, color: '#0F172A', margin: '0 0 10px' }}>
                      Looking for custom 3D design?
                    </h3>
                    <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.5, marginBottom: 18 }}>
                      Post your own custom requirements to get direct quotes from top designers and 3D print hubs across India.
                    </p>
                    <Link
                      href="/requests/new"
                      style={{
                        display: 'block',
                        textAlign: 'center',
                        background: '#FF6B35',
                        color: '#fff',
                        padding: '12px 20px',
                        borderRadius: 12,
                        fontWeight: 800,
                        fontSize: 14,
                        textDecoration: 'none',
                      }}
                    >
                      Post Your Own Brief →
                    </Link>
                  </div>
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