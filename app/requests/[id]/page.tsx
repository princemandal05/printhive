'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { createClient } from '@/utils/supabase/client'
import {
  FileText,
  Clock,
  User,
  Star,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Plus,
  Send,
  HelpCircle,
  Zap,
} from 'lucide-react'

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
  const [fetchError, setFetchError] = useState<string | null>(null)
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
  const [acceptedBidId, setAcceptedBidId] = useState<string | null>(null)

  const handleAcceptBid = (bid: BidType) => {
    setAcceptedBidId(bid.id)
    router.push(`/checkout?bidId=${bid.id}&requestId=${reqId}&price=${bid.price}&seller=${encodeURIComponent(bid.designer)}`)
  }

  const loadData = async () => {
    if (!reqId) return
    setLoading(true)
    setFetchError(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      let loggedInUserId: string | null = null

      if (user) {
        loggedInUserId = user.id
        setCurrentUserId(user.id)
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
        if (profile?.role) setCurrentUserRole(profile.role)
      }

      const { data: reqData, error: reqErr } = await supabase
        .from('design_requests')
        .select('*')
        .eq('id', reqId)
        .maybeSingle()

      if (reqErr) {
        setFetchError(reqErr.message || 'Unable to load brief details. Please check your connection and retry.')
        setRequest(null)
        setNotFound(false)
        return
      }

      if (!reqData) {
        setRequest(null)
        setNotFound(true)
        setBids([])
        return
      }

      setRequest({
        id: reqData.id,
        title: reqData.title || 'Custom 3D Request',
        budget: typeof reqData.budget === 'number' ? reqData.budget : Number(reqData.budget || 0),
        description: reqData.description || 'No detailed specifications provided.',
        postedAt: reqData.created_at ? new Date(reqData.created_at).toLocaleDateString() : 'Recently',
        buyerId: reqData.buyer_id || '',
        status: reqData.status || 'open',
      })
      setNotFound(false)

      const { data: bidRows, error: bidsErr } = await supabase
        .from('design_request_bids')
        .select('*')
        .eq('request_id', reqId)
        .order('created_at', { ascending: false })

      if (bidsErr) {
        console.warn('Error fetching bids:', bidsErr)
      }

      if (bidRows) {
        setBids(bidRows.map((b: any) => ({
          id: b.id,
          designer: b.designer_name || 'Verified Designer',
          rating: 5.0,
          price: Number(b.price || 500),
          days: Number(b.days || 2),
          note: b.note || 'Ready to model and deliver with high precision.',
          designerId: b.designer_id,
        })))

        if (loggedInUserId && bidRows.some((b: any) => b.designer_id === loggedInUserId)) {
          setSubmitted(true)
        }
      }
    } catch (err: unknown) {
      console.error('Error fetching design request:', err)
      const msg = err instanceof Error ? err.message : 'Transient network failure loading brief. Please retry.'
      setFetchError(msg)
      setRequest(null)
      setNotFound(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [reqId])

  const handleBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBidError(null)

    const priceNum = Number(bidPrice)
    const daysNum = Number(bidDays)

    if (!priceNum || priceNum <= 0) {
      setBidError('Please enter a valid bid amount.')
      return
    }

    if (!daysNum || daysNum <= 0) {
      setBidError('Please enter turnaround time in days.')
      return
    }

    setSubmitting(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setBidError('Authentication required. Please log in as a designer to submit a bid.')
        setSubmitting(false)
        return
      }

      const designerName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Verified Designer'
      const noteContent = bidNote.trim() || 'Ready to model and deliver with high precision.'

      // Try inserting with standard columns, then fallback across known schema variations
      const candidatePayloads = [
        { request_id: reqId, designer_id: user.id, designer_name: designerName, price: priceNum, days: daysNum, note: noteContent },
        { request_id: reqId, designer_id: user.id, designer_name: designerName, price: priceNum, turnaround_days: daysNum, note: noteContent },
        { request_id: reqId, designer_id: user.id, designer_name: designerName, price: priceNum, delivery_days: daysNum, note: noteContent },
        { request_id: reqId, designer_id: user.id, designer_name: designerName, price: priceNum, note: noteContent },
        { request_id: reqId, designer_id: user.id, price: priceNum, note: noteContent },
        { request_id: reqId, designer_id: user.id, price: priceNum },
      ]

      let lastInsertErr: any = null
      let insertSuccess = false

      for (const payload of candidatePayloads) {
        const { error: insertErr } = await (supabase.from('design_request_bids') as any).insert(payload)
        if (!insertErr) {
          insertSuccess = true
          break
        }
        lastInsertErr = insertErr
        // If error is not a missing column error (e.g. RLS / Auth / network), don't loop endlessly
        if (!insertErr.message?.includes('Could not find the') && !insertErr.message?.includes('column')) {
          break
        }
      }

      if (!insertSuccess) {
        setBidError(lastInsertErr?.message || 'Failed to submit bid. Please try again.')
        setSubmitting(false)
        return
      }

      setSubmitted(true)
      setShowBidForm(false)
      setBids((prev) => [
        {
          id: `bid-${Date.now()}`,
          designer: designerName,
          rating: 5.0,
          price: priceNum,
          days: daysNum,
          note: noteContent,
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
    background: 'var(--bg-card-hover)',
    border: '1px solid var(--border-color)',
    borderRadius: 8,
    padding: '8px 12px',
    fontSize: 13,
    color: 'var(--text-main)',
    outline: 'none',
    boxSizing: 'border-box',
    fontWeight: 500,
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-canvas)', color: 'var(--text-main)', fontFamily: 'inherit' }}>
      <Navbar />

      <div style={{ maxWidth: 1140, margin: '0 auto', padding: '32px 20px 60px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-sub)', fontSize: 14 }}>
            Loading brief details...
          </div>
        ) : fetchError ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', background: 'var(--bg-card)', borderRadius: 12, border: '1px solid #FECACA' }}>
            <AlertCircle size={36} color="#DC2626" style={{ margin: '0 auto 12px' }} />
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-main)', marginBottom: 4 }}>Error Loading Brief</div>
            <div style={{ fontSize: 13, color: 'var(--text-sub)', marginBottom: 20 }}>{fetchError}</div>
            <button
              type="button"
              onClick={loadData}
              style={{ background: '#ea580c', color: '#fff', padding: '8px 16px', borderRadius: 9999, fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer' }}
            >
              Retry Loading Brief
            </button>
          </div>
        ) : notFound || !request ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-color)' }}>
            <AlertCircle size={36} color="#94A3B8" style={{ margin: '0 auto 12px' }} />
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-main)', marginBottom: 4 }}>Custom Brief Not Found</div>
            <div style={{ fontSize: 13, color: 'var(--text-sub)', marginBottom: 20 }}>The requested brief does not exist or may have been removed.</div>
            <Link href="/requests" style={{ background: '#ea580c', color: '#fff', padding: '8px 16px', borderRadius: 9999, fontWeight: 700, fontSize: 13, textDecoration: 'none', display: 'inline-block' }}>
              &larr; Return to Briefs Board
            </Link>
          </div>
        ) : (
          <div>
            {/* BREADCRUMB */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-sub)', fontWeight: 600, marginBottom: 16 }}>
              <Link href="/requests" style={{ color: 'var(--text-sub)', textDecoration: 'none' }}>Client Briefs</Link>
              <span>/</span>
              <span style={{ color: 'var(--text-main)' }}>Brief #{request.id.slice(0, 8)}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>
              {/* LEFT COLUMN: BRIEF DETAILS & PROPOSALS */}
              <div style={{ display: 'grid', gap: 20 }}>
                {/* 1. BRIEF DETAILS CARD */}
                <div style={{ background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border-color)', padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                    <span
                      style={{
                        background: 'rgba(16, 185, 129, 0.15)',
                        color: '#10B981',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        padding: '2px 8px',
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                      }}
                    >
                      {request.status === 'open' ? 'Open for Bids' : request.status}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--text-sub)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={12} /> Posted on {request.postedAt}
                    </span>
                  </div>

                  <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-main)', margin: '0 0 12px', letterSpacing: '-0.3px' }}>
                    {request.title}
                  </h1>

                  {request.budget > 0 && (
                    <div style={{ display: 'inline-block', background: 'rgba(234, 88, 12, 0.12)', border: '1px solid rgba(234, 88, 12, 0.3)', padding: '4px 10px', borderRadius: 6, color: '#ea580c', fontWeight: 800, fontSize: 13, marginBottom: 18 }}>
                      Target Budget: ₹{request.budget}
                    </div>
                  )}

                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', marginBottom: 6 }}>
                    Technical Requirements & Notes
                  </div>

                  <div style={{ fontSize: 13, color: 'var(--text-main)', lineHeight: 1.6, whiteSpace: 'pre-line', background: 'var(--bg-card-hover)', padding: 16, borderRadius: 8, border: '1px solid var(--border-color)' }}>
                    {request.description}
                  </div>
                </div>

                {/* 2. PROPOSALS SECTION */}
                <div style={{ background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border-color)', padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-main)' }}>
                      Proposals & Creator Bids ({bids.length})
                    </div>
                    {isOwner && (
                      <span style={{ fontSize: 11, color: '#10B981', fontWeight: 700, background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '2px 8px', borderRadius: 4 }}>
                        Buyer Review Desk
                      </span>
                    )}
                  </div>

                  {bids.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-sub)', background: 'var(--bg-card-hover)', borderRadius: 8, border: '1px dashed var(--border-color)' }}>
                      <FileText size={28} color="#94A3B8" style={{ margin: '0 auto 8px' }} />
                      <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: 13, marginBottom: 2 }}>No Bids Submitted Yet</div>
                      <div style={{ fontSize: 12 }}>
                        {isOwner
                          ? 'Your brief is live on the network. Verified designers will submit quotes shortly.'
                          : 'Be the first designer to submit a proposal for this job!'}
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gap: 10 }}>
                      {bids.map((b) => (
                        <div
                          key={b.id}
                          style={{
                            background: 'var(--bg-card-hover)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 8,
                            padding: '12px 16px',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#ea580c', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12 }}>
                                {b.designer.charAt(0)}
                              </div>
                              <div>
                                <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: 13 }}>{b.designer}</div>
                                <div style={{ fontSize: 11, color: '#F59E0B', fontWeight: 600 }}>★ {b.rating}</div>
                              </div>
                            </div>

                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: 15, fontWeight: 800, color: '#ea580c' }}>₹{b.price}</div>
                              <div style={{ fontSize: 11, color: 'var(--text-sub)' }}>{b.days} day turnaround</div>
                            </div>
                          </div>

                          {b.note && (
                            <div style={{ fontSize: 12, color: 'var(--text-sub)', marginTop: 6, padding: '6px 10px', background: 'var(--bg-card)', borderRadius: 6, border: '1px solid var(--border-color)', lineHeight: 1.4 }}>
                              &ldquo;{b.note}&rdquo;
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* TWO-STAGE MILESTONE ESCROW BADGE */}
                  <div style={{ background: 'rgba(234, 88, 12, 0.08)', border: '1px solid rgba(234, 88, 12, 0.25)', borderRadius: 14, padding: '14px 18px', marginTop: 24, marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ea580c', fontSize: 13, fontWeight: 900, marginBottom: 4 }}>
                      <ShieldCheck size={16} /> Two-Stage Escrow Milestone Protection
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-sub)', lineHeight: 1.4 }}>
                      • <strong>Milestone 1:</strong> Digital 3D CAD approval (50% escrow release upon 3D proof verification).<br />
                      • <strong>Milestone 2:</strong> Physical 3D printing &amp; doorstep delivery (50% escrow release upon unboxing QA).
                    </div>
                  </div>

                  {/* BIDS COMPARISON MATRIX */}
                  {bids.length > 1 && (
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 16, padding: 18, marginBottom: 24, overflowX: 'auto' }}>
                      <div style={{ fontSize: 13, fontWeight: 900, color: 'var(--text-main)', marginBottom: 12, textTransform: 'uppercase' }}>
                        📊 Side-by-Side Proposal Comparison Matrix
                      </div>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-sub)' }}>
                            <th style={{ padding: '8px 10px', fontWeight: 800 }}>Designer / Hub</th>
                            <th style={{ padding: '8px 10px', fontWeight: 800 }}>Bid Price</th>
                            <th style={{ padding: '8px 10px', fontWeight: 800 }}>Turnaround</th>
                            <th style={{ padding: '8px 10px', fontWeight: 800 }}>Escrow Milestone</th>
                            <th style={{ padding: '8px 10px', fontWeight: 800 }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bids.map((b) => (
                            <tr key={`matrix-${b.id}`} style={{ borderBottom: '1px solid var(--border-color)' }}>
                              <td style={{ padding: '10px', fontWeight: 800, color: 'var(--text-main)' }}>
                                {b.designer} ⭐ {b.rating}
                              </td>
                              <td style={{ padding: '10px', fontWeight: 900, color: '#ea580c' }}>
                                ₹{b.price}
                              </td>
                              <td style={{ padding: '10px', color: 'var(--text-sub)' }}>
                                {b.days} {b.days === 1 ? 'day' : 'days'}
                              </td>
                              <td style={{ padding: '10px', color: '#10B981', fontWeight: 700 }}>
                                50% CAD / 50% Print
                              </td>
                              <td style={{ padding: '10px' }}>
                                {isOwner ? (
                                  <button
                                    type="button"
                                    onClick={() => handleAcceptBid(b)}
                                    style={{ background: acceptedBidId === b.id ? '#10B981' : '#ea580c', color: '#fff', border: 'none', padding: '5px 12px', borderRadius: 9999, fontSize: 11, fontWeight: 800, cursor: 'pointer' }}
                                  >
                                    {acceptedBidId === b.id ? 'Selected' : 'Accept'}
                                  </button>
                                ) : (
                                  <span style={{ fontSize: 11, color: 'var(--text-sub)' }}>Submitted</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT SIDEBAR: ACTIONS */}
              <div style={{ position: 'sticky', top: 90 }}>
                <div style={{ background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border-color)', padding: 22, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                  {isOwner ? (
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#ea580c', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                        Your Brief Overview
                      </div>
                      <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-main)', margin: '0 0 6px' }}>
                        Active on Network
                      </h3>
                      <p style={{ fontSize: 12, color: 'var(--text-sub)', lineHeight: 1.4, marginBottom: 16 }}>
                        You posted this brief. Review proposals from designers below and award the project.
                      </p>

                      <div style={{ background: 'var(--bg-card-hover)', padding: 12, borderRadius: 8, border: '1px solid var(--border-color)', marginBottom: 16, fontSize: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-sub)', marginBottom: 4 }}>
                          <span>Proposals Received:</span>
                          <strong style={{ color: 'var(--text-main)' }}>{bids.length}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-sub)', marginBottom: 4 }}>
                          <span>Target Budget:</span>
                          <strong style={{ color: 'var(--text-main)' }}>
                            {typeof request.budget === 'number' && !isNaN(request.budget) && request.budget > 0
                              ? `₹${request.budget}`
                              : request.budget === 0
                              ? '₹0'
                              : 'Flexible'}
                          </strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-sub)' }}>
                          <span>Escrow Protection:</span>
                          <strong style={{ color: '#10B981' }}>Active</strong>
                        </div>
                      </div>

                      <Link
                        href="/requests/new"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          background: '#ea580c',
                          color: '#fff',
                          padding: '10px 16px',
                          borderRadius: 9999,
                          fontWeight: 700,
                          fontSize: 13,
                          textDecoration: 'none',
                          marginBottom: 8,
                        }}
                      >
                        <Plus size={15} /> Post Another Brief
                      </Link>

                      <Link
                        href="/dashboard/buyer"
                        style={{
                          display: 'block',
                          textAlign: 'center',
                          color: 'var(--text-sub)',
                          fontSize: 12,
                          fontWeight: 600,
                          textDecoration: 'none',
                          padding: '6px',
                        }}
                      >
                        &larr; Back to Buyer Dashboard
                      </Link>
                    </div>
                  ) : isFreelancer ? (
                    <div>
                      {!showBidForm && !submitted && (
                        <>
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#ea580c', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                            Freelance Opportunity
                          </div>
                          <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-main)', margin: '0 0 6px' }}>
                            Submit a Proposal
                          </h3>
                          <p style={{ fontSize: 12, color: 'var(--text-sub)', lineHeight: 1.4, marginBottom: 16 }}>
                            Submit your turnaround time and pricing. Funds are secured via Razorpay Escrow upon acceptance.
                          </p>
                          <button
                            type="button"
                            onClick={() => setShowBidForm(true)}
                            style={{
                              width: '100%',
                              background: '#ea580c',
                              color: '#fff',
                              border: 'none',
                              padding: '10px 16px',
                              borderRadius: 9999,
                              fontSize: 13,
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 6,
                            }}
                          >
                            <Send size={14} /> Submit a Proposal
                          </button>
                        </>
                      )}

                      {showBidForm && !submitted && (
                        <form onSubmit={handleBidSubmit}>
                          <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-main)', marginBottom: 12 }}>
                            Proposal Details
                          </div>

                          {bidError && (
                            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', padding: '8px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, marginBottom: 12 }}>
                              {bidError}
                            </div>
                          )}

                          <div style={{ marginBottom: 12 }}>
                            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-main)', marginBottom: 4, textTransform: 'uppercase' }}>
                              Your Bid Price (₹ INR) *
                            </label>
                            <input
                              type="number"
                              min="1"
                              style={inputStyle}
                              placeholder="e.g. 600"
                              value={bidPrice}
                              onChange={(e) => setBidPrice(e.target.value)}
                            />
                          </div>

                          <div style={{ marginBottom: 12 }}>
                            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-main)', marginBottom: 4, textTransform: 'uppercase' }}>
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

                          <div style={{ marginBottom: 14 }}>
                            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-main)', marginBottom: 4, textTransform: 'uppercase' }}>
                              Proposal Note
                            </label>
                            <textarea
                              style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }}
                              placeholder="Describe your design tools, print resolution, or approach..."
                              value={bidNote}
                              onChange={(e) => setBidNote(e.target.value)}
                            />
                          </div>

                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              type="submit"
                              disabled={submitting}
                              style={{
                                flex: 1,
                                background: '#ea580c',
                                color: '#fff',
                                border: 'none',
                                padding: '10px',
                                borderRadius: 9999,
                                fontSize: 13,
                                fontWeight: 700,
                                cursor: submitting ? 'not-allowed' : 'pointer',
                              }}
                            >
                              {submitting ? 'Submitting…' : 'Submit Bid'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowBidForm(false)}
                              style={{
                                background: 'var(--bg-card-hover)',
                                color: 'var(--text-main)',
                                border: '1px solid var(--border-color)',
                                padding: '10px 14px',
                                borderRadius: 9999,
                                fontSize: 13,
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      )}

                      {submitted && (
                        <div style={{ textAlign: 'center', padding: '16px 8px' }}>
                          <CheckCircle2 size={32} color="#10B981" style={{ margin: '0 auto 8px' }} />
                          <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-main)', marginBottom: 2 }}>Proposal Submitted!</div>
                          <div style={{ fontSize: 12, color: 'var(--text-sub)' }}>The buyer will be notified of your quotation.</div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                        Designer & Hub Access
                      </div>
                      <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-main)', margin: '0 0 6px' }}>
                        Want to bid on this brief?
                      </h3>
                      <p style={{ fontSize: 12, color: 'var(--text-sub)', lineHeight: 1.4, marginBottom: 14 }}>
                        Log in as a registered Designer or 3D Printer Hub to submit custom modeling and manufacturing proposals.
                      </p>
                      <Link
                        href="/login"
                        style={{
                          display: 'block',
                          textAlign: 'center',
                          background: '#ea580c',
                          color: '#fff',
                          padding: '10px 16px',
                          borderRadius: 9999,
                          fontWeight: 700,
                          fontSize: 13,
                          textDecoration: 'none',
                        }}
                      >
                        Log In to Bid
                      </Link>
                    </div>
                  )}

                  <div style={{ marginTop: 16, background: 'var(--bg-card-hover)', padding: 10, borderRadius: 6, border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ShieldCheck size={16} color="#10B981" />
                    <span style={{ fontSize: 11, color: 'var(--text-sub)', lineHeight: 1.3 }}>
                      Escrow protected. Payouts released upon verified delivery.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </main>
  )
}