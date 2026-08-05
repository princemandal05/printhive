'use client'

import { useState, Suspense } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const STEPS = [
  { key: 'confirmed', label: 'Order Confirmed', icon: '📝', desc: 'Buyer payment placed securely in Razorpay Escrow.' },
  { key: 'printer_assigned', label: 'Printer Matched', icon: '📍', desc: 'Leaflet GPS assigned nearby Bambu Lab X1-C (1.2 km away).' },
  { key: 'manufacturing', label: 'Printing (Layer 142/500)', icon: '🖨️', desc: 'Active extrusion with 0.12mm layer height precision.' },
  { key: 'quality_check', label: 'Quality Verified', icon: '🔍', desc: 'Dimensional accuracy tolerance checked under ±0.1mm.' },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: '🚚', desc: 'Courier dispatched with live GPS tracking.' },
  { key: 'delivered', label: 'Delivered & Funds Released', icon: '🎉', desc: 'Buyer confirms package -> 70% Printer / 15% Designer released.' },
]

function OrderTrackingContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const orderId = (params?.id as string) || 'demo-order-id'
  const isJustReviewed = searchParams?.get('reviewed') === 'true'

  const [currentStepIndex, setCurrentStepIndex] = useState(isJustReviewed ? 5 : 2)

  const isDelivered = currentStepIndex === STEPS.length - 1

  return (
    <section className="container section-sm" style={{ maxWidth: 840, margin: '0 auto', padding: '40px 20px' }}>
      {/* Amazon / Flipkart Style Review Confirmation Success Banner */}
      {isJustReviewed && (
        <div style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid #10B981', padding: 20, borderRadius: 20, marginBottom: 28, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 32 }}>🎉</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#10B981', marginBottom: 2 }}>
              Review Submitted Successfully!
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-sub)' }}>
              Thank you for rating your order. Your feedback has been published to help future buyers and creators on PrintHive.
            </div>
          </div>
        </div>
      )}

      <div className="ateion-pill" style={{ marginBottom: 12 }}>
        ⚡ Supabase Realtime Order Stream
      </div>

      <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8, color: 'var(--text-main)' }}>
        Order #{orderId.slice(0, 10)}
      </h1>

      <p style={{ color: 'var(--text-sub)', marginBottom: 32, fontSize: 15 }}>
        Live status pushed via Supabase websockets from nearby printer hub to your doorstep.
      </p>

      {/* Step Simulator Controls (Developer Demo Bar) */}
      <div style={{ background: 'var(--bg-card)', borderRadius: 24, border: '1px solid var(--border-color)', padding: 28, marginBottom: 32, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: '#ea580c' }}>
            🛠️ Demo Simulator Controls:
          </div>
          <span style={{ fontSize: 11, background: 'rgba(234, 88, 12, 0.12)', color: '#ea580c', padding: '3px 10px', borderRadius: 99, fontWeight: 700 }}>
            Testing Tool Only
          </span>
        </div>

        <p style={{ fontSize: 12, color: 'var(--text-sub)', marginTop: 0, marginBottom: 16 }}>
          (In production, buyers do not click status buttons. Status updates stream automatically in real-time as the Printer Hub manufactures your 3D print.)
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 8, marginBottom: 24 }}>
          {STEPS.map((step, idx) => (
            <button
              key={step.key}
              type="button"
              onClick={() => setCurrentStepIndex(idx)}
              style={{
                padding: '10px 8px',
                borderRadius: 12,
                border: currentStepIndex === idx ? '2px solid #ea580c' : '1px solid var(--border-color)',
                background: currentStepIndex === idx ? 'rgba(234,88,12,0.1)' : 'var(--bg-card-hover)',
                color: 'var(--text-main)',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <span>{step.icon}</span>
              <span>{step.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {/* Active Status Display Box */}
        <div style={{ background: 'var(--bg-card-hover)', padding: 20, borderRadius: 16, border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 36 }}>{STEPS[currentStepIndex].icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-main)', marginBottom: 4 }}>
              {STEPS[currentStepIndex].label}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-sub)' }}>
              {STEPS[currentStepIndex].desc}
            </div>
          </div>
          <div style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981', padding: '6px 12px', borderRadius: 99, fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', display: 'inline-block' }}></span>
            Live Stream
          </div>
        </div>
      </div>

      {/* Razorpay Escrow Status & Buyer Actions */}
      <div style={{ background: 'var(--bg-card)', borderRadius: 24, border: '1px solid var(--border-color)', padding: 28, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>🔒 Razorpay Escrow Status</span>
          </div>
          <div style={{ fontSize: 13, color: isDelivered ? '#10B981' : '#ea580c', fontWeight: 600, marginTop: 4 }}>
            {isDelivered
              ? '✅ Escrow released: 70% Printer / 15% Designer / 15% Platform'
              : '⏳ Funds held safely in Escrow until physical delivery confirmation.'}
          </div>
        </div>

        {isDelivered && !isJustReviewed && (
          <Link
            href={`/orders/${orderId}/review`}
            style={{ background: '#10B981', color: '#fff', padding: '12px 24px', borderRadius: 99, textDecoration: 'none', fontWeight: 800, fontSize: 14, boxShadow: '0 4px 16px rgba(16,185,129,0.35)' }}
          >
            Leave Review & Rating
          </Link>
        )}

        {isJustReviewed && (
          <span style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981', padding: '10px 20px', borderRadius: 99, fontWeight: 800, fontSize: 13 }}>
            ✓ Review Submitted
          </span>
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