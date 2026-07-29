'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
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

export default function OrderTrackingPage() {
  const params = useParams()
  const orderId = (params?.id as string) || 'demo-order-id'
  const [currentStepIndex, setCurrentStepIndex] = useState(2) // Default to Manufacturing

  const isDelivered = currentStepIndex === STEPS.length - 1

  return (
    <main style={{ minHeight: '100vh', transition: 'background 0.3s ease' }}>
      <Navbar />

      <section className="container section-sm" style={{ maxWidth: 840, margin: '0 auto', padding: '40px 20px' }}>
        <div className="ateion-pill" style={{ marginBottom: 12 }}>
          ⚡ Supabase Realtime Order Stream
        </div>

        <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8, color: 'var(--text-main)' }}>
          Order #{orderId.slice(0, 10)}
        </h1>

        <p style={{ color: 'var(--text-sub)', marginBottom: 32, fontSize: 15 }}>
          Live status pushed via Supabase websockets from nearby printer hub to your doorstep.
        </p>

        {/* Step Simulator Controls */}
        <div style={{ background: 'var(--bg-card)', borderRadius: 24, border: '1px solid var(--border-color)', padding: 28, marginBottom: 32, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: '#ea580c', marginBottom: 16 }}>
            Simulate Websocket Progress Event:
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 8, marginBottom: 24 }}>
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
            <div style={{ fontSize: 32 }}>{STEPS[currentStepIndex].icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-main)' }}>{STEPS[currentStepIndex].label}</div>
              <div style={{ fontSize: 13, color: 'var(--text-sub)' }}>{STEPS[currentStepIndex].desc}</div>
            </div>
            <span style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10B981', padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 700 }}>
              🟢 Live Stream
            </span>
          </div>
        </div>

        {/* Escrow Status Banner */}
        <div style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 20, border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-main)' }}>🔒 Razorpay Escrow Status</div>
            <div style={{ fontSize: 13, color: 'var(--text-sub)' }}>
              {isDelivered ? '✅ Escrow released: 70% Printer / 15% Designer / 15% Platform' : 'Holding ₹495 safely until you confirm delivery.'}
            </div>
          </div>
          {isDelivered ? (
            <Link href={`/orders/${orderId}/review`} className="btn btn-primary" style={{ background: '#10B981', color: '#fff', padding: '10px 20px', borderRadius: 99, textDecoration: 'none', fontWeight: 700, fontSize: 13 }}>
              Leave Review & Rating →
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setCurrentStepIndex(STEPS.length - 1)}
              style={{ background: '#ea580c', color: '#fff', border: 'none', borderRadius: 99, padding: '10px 20px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
            >
              Confirm Delivery & Release Escrow
            </button>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}