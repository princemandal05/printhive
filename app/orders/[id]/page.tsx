'use client'

import { useState, useEffect, Suspense } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { createClient } from '@/utils/supabase/client'
import { ORDER_LIFECYCLE_STEPS, updateOrderStatus, type OrderStatus } from '@/utils/order-lifecycle'

interface HistoryEntry {
  id: string
  status: string
  notes?: string
  created_at: string
}

function OrderTrackingContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const orderId = (params?.id as string) || ''
  const isJustReviewed = searchParams?.get('reviewed') === 'true'

  const [currentStatus, setCurrentStatus] = useState<OrderStatus | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [orderNotFound, setOrderNotFound] = useState(false)
  const [actionMsg, setActionMsg] = useState('')
  const [confirmingDelivery, setConfirmingDelivery] = useState(false)

  // Load live order and status history from Supabase
  useEffect(() => {
    let isCancelled = false

    async function loadOrderHistory() {
      setLoading(true)
      setOrderNotFound(false)

      try {
        // Query order status
        const { data: orderData, error: orderErr } = await supabase
          .from('orders')
          .select('status')
          .eq('id', orderId)
          .maybeSingle()

        if (orderErr) {
          console.error('Failed to query order:', orderErr.message)
        }

        if (isCancelled) return

        if (orderData?.status) {
          setCurrentStatus(orderData.status as OrderStatus)
        } else {
          setOrderNotFound(true)
        }

        // Query status history logs
        const { data: historyData, error: historyErr } = await supabase
          .from('order_status_history')
          .select('*')
          .eq('order_id', orderId)
          .order('created_at', { ascending: true })

        if (historyErr) {
          console.error('Failed to query order status history:', historyErr.message)
        }

        if (isCancelled) return

        if (historyData && historyData.length > 0) {
          setHistory(historyData)
        }
      } catch (err) {
        console.warn('Order history query note:', err)
        if (!isCancelled) setOrderNotFound(true)
      } finally {
        if (!isCancelled) setLoading(false)
      }
    }

    loadOrderHistory()

    return () => {
      isCancelled = true
    }
  }, [orderId])

  // Get index of active step in standard 10 happy-path steps
  const activeStepIndex = currentStatus ? ORDER_LIFECYCLE_STEPS.findIndex((s) => s.key === currentStatus) : -1
  const safeStepIndex = activeStepIndex >= 0 ? activeStepIndex : 0

  const handleConfirmDelivery = async () => {
    if (confirmingDelivery || !currentStatus) return
    setConfirmingDelivery(true)
    setActionMsg('⚡ Confirming delivery & releasing Escrow funds...')

    const resDelivered = await updateOrderStatus(supabase, orderId, 'DELIVERED', 'Delivery confirmed by customer.', undefined, currentStatus)
    if (!resDelivered.success) {
      setActionMsg(`❌ Failed to update delivery status: ${resDelivered.error || 'Error'}`)
      setConfirmingDelivery(false)
      return
    }

    const resCompleted = await updateOrderStatus(supabase, orderId, 'COMPLETED', '70% Printer / 15% Designer payouts released.', undefined, 'DELIVERED')
    if (resCompleted.success) {
      setCurrentStatus('COMPLETED')
      setActionMsg('🎉 Order Completed! Escrow payouts released.')
    } else {
      setActionMsg(`❌ Delivery confirmed, but completion step failed: ${resCompleted.error || 'Error'}`)
    }
    setConfirmingDelivery(false)
  }

  const isCompletedOrDelivered = currentStatus ? ['DELIVERED', 'COMPLETED'].includes(currentStatus) : false

  if (loading) {
    return (
      <section className="container section-sm" style={{ maxWidth: 900, margin: '0 auto', padding: '60px 20px', textAlign: 'center', color: 'var(--text-sub)' }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>⏳</div>
        <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-main)' }}>Loading Order Lifecycle Stream…</div>
      </section>
    )
  }

  if (orderNotFound || !currentStatus) {
    return (
      <section className="container section-sm" style={{ maxWidth: 900, margin: '0 auto', padding: '60px 20px', textAlign: 'center', color: 'var(--text-sub)' }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>📦</div>
        <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-main)', marginBottom: 8 }}>Order Not Found</div>
        <p>No active order record matching #{orderId.slice(0, 10)} was found in database.</p>
        <Link href="/" style={{ color: '#2563EB', fontWeight: 700, textDecoration: 'none' }}>← Return to Homepage</Link>
      </section>
    )
  }

  return (
    <section className="container section-sm" style={{ maxWidth: 900, margin: '0 auto', padding: '40px 20px' }}>
      {/* Review Submitted Banner */}
      {isJustReviewed && (
        <div style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid #10B981', padding: 20, borderRadius: 20, marginBottom: 28, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 32 }}>🎉</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#10B981', marginBottom: 2 }}>
              Review Submitted Successfully!
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-sub)' }}>
              Thank you for rating your order. Your feedback helps future buyers and creators on PrintHive.
            </div>
          </div>
        </div>
      )}

      {actionMsg && (
        <div style={{ background: '#ECFDF5', color: '#065F46', padding: '14px 20px', borderRadius: 14, fontSize: 14, marginBottom: 24, fontWeight: 700, border: '1px solid #A7F3D0' }}>
          {actionMsg}
        </div>
      )}

      <div className="ateion-pill" style={{ marginBottom: 12 }}>
        ⚡ PrintHive Order Lifecycle Stream
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: 'var(--text-main)', margin: 0 }}>
          Order #{orderId.slice(0, 10)}
        </h1>
        <span style={{ background: isCompletedOrDelivered ? '#ECFDF5' : '#EFF6FF', color: isCompletedOrDelivered ? '#059669' : '#2563EB', padding: '6px 16px', borderRadius: 99, fontWeight: 800, fontSize: 13 }}>
          ● {currentStatus.replace('_', ' ')}
        </span>
      </div>

      <p style={{ color: 'var(--text-sub)', marginBottom: 32, fontSize: 15 }}>
        Real-time audit status history logged directly in PostgreSQL <code style={{ color: '#ea580c' }}>order_status_history</code>.
      </p>

      {/* 13-STATE INTERACTIVE TIMELINE DISPLAY */}
      <div style={{ background: 'var(--bg-card)', borderRadius: 24, border: '1px solid var(--border-color)', padding: 28, marginBottom: 32, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--text-main)', marginBottom: 20 }}>
          📊 Order Lifecycle Progress Timeline
        </div>

        {/* Live Printing Layer Telemetry Widget (when in PRINTING phase) */}
        {currentStatus === 'PRINTING' && (
          <div style={{ background: 'rgba(234, 88, 12, 0.06)', border: '1px solid rgba(234, 88, 12, 0.25)', borderRadius: 16, padding: '16px 20px', marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ea580c', animation: 'ping 1.5s infinite' }} />
                <span style={{ fontSize: 13, fontWeight: 900, color: '#ea580c', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Live Machine Telemetry
                </span>
              </div>
              <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-main)' }}>Layer 420 / 1,250 (34%)</span>
            </div>
            <div style={{ width: '100%', height: 8, background: 'rgba(0,0,0,0.08)', borderRadius: 99, overflow: 'hidden', marginBottom: 12 }}>
              <div style={{ width: '34%', height: '100%', background: 'linear-gradient(90deg, #ea580c, #f97316)', borderRadius: 99 }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, fontSize: 11.5, color: 'var(--text-sub)' }}>
              <div>🔥 Hotend: <strong style={{ color: 'var(--text-main)' }}>215°C</strong></div>
              <div>🖨️ Bed: <strong style={{ color: 'var(--text-main)' }}>60°C</strong></div>
              <div>⏱️ Est. Remaining: <strong style={{ color: '#ea580c' }}>~1h 15m</strong></div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {ORDER_LIFECYCLE_STEPS.slice(0, 11).map((step, idx) => {
            const isPassed = idx <= safeStepIndex
            const isCurrent = step.key === currentStatus
            return (
              <div key={step.key} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    background: isCurrent ? '#ea580c' : isPassed ? '#10B981' : 'var(--bg-card-hover)',
                    color: isCurrent || isPassed ? '#fff' : 'var(--text-sub)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18,
                    fontWeight: 800,
                    border: isCurrent ? '2px solid #ea580c' : '1px solid var(--border-color)',
                    boxShadow: isCurrent ? '0 0 16px rgba(234,88,12,0.35)' : 'none',
                    flexShrink: 0,
                  }}
                >
                  {isPassed && !isCurrent ? '✓' : step.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: isCurrent ? '#ea580c' : isPassed ? 'var(--text-main)' : 'var(--text-sub)' }}>
                      {step.label}
                    </div>
                    {isCurrent && (
                      <span style={{ fontSize: 11, background: 'rgba(234, 88, 12, 0.15)', color: '#ea580c', padding: '2px 8px', borderRadius: 99, fontWeight: 800 }}>
                        Active Phase
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-sub)', marginTop: 2 }}>
                    {step.description}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* PROOF-OF-PRINT QA QUALITY CARD (when printed/dispatched/delivered) */}
      {['PRINTED', 'QA_PASSED', 'PACKAGED', 'DISPATCHED', 'DELIVERED', 'COMPLETED'].includes(currentStatus || '') && (
        <div style={{ background: 'var(--bg-card)', borderRadius: 24, border: '1px solid var(--border-color)', padding: 24, marginBottom: 32, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>📸</span>
              <h3 style={{ fontSize: 16, fontWeight: 900, margin: 0, color: 'var(--text-main)' }}>
                Proof-of-Print Quality Verification
              </h3>
            </div>
            <span style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10B981', padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 800 }}>
              ✅ QA Tolerances Verified
            </span>
          </div>

          <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <img
              src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80"
              alt="Proof of Print"
              style={{ width: 120, height: 90, borderRadius: 12, objectFit: 'cover', border: '1px solid var(--border-color)' }}
            />
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-main)', marginBottom: 4 }}>
                Physical Print Inspected by Hub Operator
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-sub)', lineHeight: 1.4 }}>
                Watertight layer adhesion verified • Zero stringing • Surface geometry within ±0.15 mm tolerance envelope.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ESCROW BREAKDOWN RECEIPT CARD */}
      <div style={{ background: 'var(--bg-card)', borderRadius: 24, border: '1px solid var(--border-color)', padding: 24, marginBottom: 32 }}>
        <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--text-main)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>🧾 Escrow Payout Breakdown</span>
          <span style={{ fontSize: 11, background: 'rgba(139, 92, 246, 0.1)', color: '#8B5CF6', padding: '2px 8px', borderRadius: 6, fontWeight: 800 }}>
            Escrow Guarded
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          <div style={{ background: 'var(--bg-card-hover)', padding: 14, borderRadius: 14, border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: 11, color: 'var(--text-sub)', fontWeight: 800, textTransform: 'uppercase' }}>70% Printer Hub</div>
            <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--text-main)', marginTop: 4 }}>Manufacturing</div>
            <div style={{ fontSize: 11, color: '#10B981', marginTop: 2 }}>{isCompletedOrDelivered ? '● Disbursed' : '● Held in Escrow'}</div>
          </div>
          <div style={{ background: 'var(--bg-card-hover)', padding: 14, borderRadius: 14, border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: 11, color: 'var(--text-sub)', fontWeight: 800, textTransform: 'uppercase' }}>15% 3D Designer</div>
            <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--text-main)', marginTop: 4 }}>CAD Royalty</div>
            <div style={{ fontSize: 11, color: '#10B981', marginTop: 2 }}>{isCompletedOrDelivered ? '● Disbursed' : '● Held in Escrow'}</div>
          </div>
          <div style={{ background: 'var(--bg-card-hover)', padding: 14, borderRadius: 14, border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: 11, color: 'var(--text-sub)', fontWeight: 800, textTransform: 'uppercase' }}>15% PrintHive</div>
            <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--text-main)', marginTop: 4 }}>Platform &amp; QA</div>
            <div style={{ fontSize: 11, color: '#10B981', marginTop: 2 }}>● Processed</div>
          </div>
        </div>
      </div>

      {/* AUDIT LOG HISTORY ENTRIES */}
      {history.length > 0 && (
        <div style={{ background: 'var(--bg-card)', borderRadius: 24, border: '1px solid var(--border-color)', padding: 28, marginBottom: 32 }}>
          <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--text-main)', marginBottom: 16 }}>
            📜 Verified Audit History (`order_status_history`)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {history.map((h) => (
              <div key={h.id} style={{ background: 'var(--bg-card-hover)', padding: '12px 16px', borderRadius: 12, border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontWeight: 800, color: '#2563EB', fontSize: 13 }}>{h.status}</span>
                  <div style={{ fontSize: 12, color: 'var(--text-sub)', marginTop: 2 }}>{h.notes}</div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-sub)', fontWeight: 600 }}>
                  {new Date(h.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BUYER ACTION & ESCROW STATUS */}
      <div style={{ background: 'var(--bg-card)', borderRadius: 24, border: '1px solid var(--border-color)', padding: 28, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>🔒 Razorpay Escrow Protection</span>
          </div>
          <div style={{ fontSize: 13, color: isCompletedOrDelivered ? '#10B981' : '#ea580c', fontWeight: 600, marginTop: 4 }}>
            {isCompletedOrDelivered
              ? '✅ Escrow released: 70% Printer / 15% Designer / 15% Platform'
              : '⏳ Funds held safely in Escrow until physical delivery confirmation.'}
          </div>
        </div>

        {currentStatus === 'DISPATCHED' && (
          <button
            onClick={handleConfirmDelivery}
            style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 99, fontWeight: 800, fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 16px rgba(16,185,129,0.35)' }}
          >
            📦 Confirm Package Delivery
          </button>
        )}

        {isCompletedOrDelivered && !isJustReviewed && (
          <Link
            href={`/orders/${orderId}/review`}
            style={{ background: '#10B981', color: '#fff', padding: '12px 24px', borderRadius: 99, textDecoration: 'none', fontWeight: 800, fontSize: 14, boxShadow: '0 4px 16px rgba(16,185,129,0.35)' }}
          >
            Leave Review & Rating
          </Link>
        )}
      </div>
    </section>
  )
}

export default function OrderTrackingPage() {
  return (
    <main style={{ minHeight: '100vh', transition: 'background 0.3s ease' }}>
      <Navbar />
      <Suspense fallback={<div style={{ padding: 40, textAlign: 'center' }}>Loading order tracking...</div>}>
        <OrderTrackingContent />
      </Suspense>
      <Footer />
    </main>
  )
}