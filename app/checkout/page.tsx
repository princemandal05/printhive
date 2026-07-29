'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useStore } from '@/lib/cart-context'

export default function CheckoutPage() {
  const router = useRouter()
  const { cart, cartSubtotal, clearCart } = useStore()
  const [paymentMethod, setPaymentMethod] = useState('razorpay_escrow')
  const [placing, setPlacing] = useState(false)
  const [showRazorpayModal, setShowRazorpayModal] = useState(false)

  const subtotal = cartSubtotal || 450
  const shipping = subtotal > 1500 ? 0 : 99
  const tax = Math.round(subtotal * 0.18)
  const total = subtotal + shipping + tax

  // 70/15/15 Escrow breakdown calculation
  const printerShare = Math.round(subtotal * 0.70)
  const designerShare = Math.round(subtotal * 0.15)
  const platformShare = Math.round(subtotal * 0.15)

  const handleOpenPayment = () => {
    setShowRazorpayModal(true)
  }

  const handleConfirmPayment = async () => {
    setPlacing(true)
    await new Promise((res) => setTimeout(res, 1200))
    clearCart()
    setShowRazorpayModal(false)
    router.push('/orders/demo-order-id')
  }

  return (
    <main style={{ minHeight: '100vh', transition: 'background 0.3s ease' }}>
      <Navbar />

      <section className="container section-sm" style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px' }}>
        <div className="ateion-pill" style={{ marginBottom: 12 }}>
          🔒 Razorpay Protected
        </div>

        <h1 style={{ fontSize: 36, fontWeight: 900, marginBottom: 8, color: 'var(--text-main)' }}>
          Escrow Guarded Checkout
        </h1>

        <p style={{ color: 'var(--text-sub)', marginBottom: 36, fontSize: 16 }}>
          Your payment is held safely in Razorpay Escrow. Funds are released automatically only after you confirm delivery.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 32, alignItems: 'start' }}>
          {/* Form */}
          <div>
            <div style={{ background: 'var(--bg-card)', padding: 32, borderRadius: 24, border: '1px solid var(--border-color)', marginBottom: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 20, color: 'var(--text-main)' }}>
                1. Shipping Address
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <input style={inputStyle} placeholder="First Name" defaultValue="Prince" />
                <input style={inputStyle} placeholder="Last Name" defaultValue="Mandal" />
                <input style={{ ...inputStyle, gridColumn: 'span 2' }} placeholder="Full Street Address" defaultValue="123 Innovation Park, Connaught Place" />
                <input style={inputStyle} placeholder="City" defaultValue="New Delhi" />
                <input style={inputStyle} placeholder="Pincode / Zip" defaultValue="110001" />
              </div>
            </div>

            <div style={{ background: 'var(--bg-card)', padding: 32, borderRadius: 24, border: '1px solid var(--border-color)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 20, color: 'var(--text-main)' }}>
                2. Select Escrow Payment Option
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <label style={{ ...radioOptionStyle, borderColor: paymentMethod === 'razorpay_escrow' ? '#ea580c' : 'var(--border-color)', background: paymentMethod === 'razorpay_escrow' ? 'rgba(234, 88, 12, 0.08)' : 'var(--bg-card-hover)' }}>
                  <input type="radio" name="pay" checked={paymentMethod === 'razorpay_escrow'} onChange={() => setPaymentMethod('razorpay_escrow')} />
                  <div>
                    <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>🔒 Razorpay Escrow (UPI / Cards / NetBanking)</div>
                    <div style={{ fontSize: 13, color: 'var(--text-sub)' }}>Funds held securely in escrow until physical delivery confirmation.</div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Summary Box */}
          <div style={{ background: 'var(--bg-card)', padding: 28, borderRadius: 24, border: '1px solid var(--border-color)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16, color: 'var(--text-main)' }}>Order Summary</h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--text-sub)', marginBottom: 8 }}>
              <span>Item Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--text-sub)', marginBottom: 8 }}>
              <span>Local Courier Shipping</span>
              <span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--text-sub)', marginBottom: 16 }}>
              <span>GST (18%)</span>
              <span>₹{tax}</span>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 16, marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-main)' }}>Total Escrow Deposit</span>
              <span style={{ fontSize: 24, fontWeight: 900, color: '#ea580c' }}>₹{total}</span>
            </div>

            <button
              type="button"
              onClick={handleOpenPayment}
              style={{ width: '100%', background: '#ea580c', color: '#fff', border: 'none', borderRadius: 99, padding: '14px', fontWeight: 800, fontSize: 15, cursor: 'pointer', boxShadow: '0 4px 16px rgba(234, 88, 12, 0.35)' }}
            >
              Proceed to Razorpay Escrow →
            </button>
          </div>
        </div>
      </section>

      {/* RAZORPAY ESCROW GATEWAY MOCKUP MODAL */}
      {showRazorpayModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#0F172A', color: '#fff', borderRadius: 24, padding: 36, maxWidth: 460, width: '100%', border: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 25px 60px rgba(0,0,0,0.8)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#38BDF8' }}>🔒 Razorpay Escrow</div>
              <button type="button" onClick={() => setShowRazorpayModal(false)} style={{ background: 'transparent', border: 'none', color: '#94A3B8', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 16, marginBottom: 20 }}>
              <div style={{ fontSize: 12, textTransform: 'uppercase', color: '#94A3B8', fontWeight: 700, marginBottom: 4 }}>Escrow Deposit Amount</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: '#34D399' }}>₹{total}</div>
            </div>

            {/* 70/15/15 Allocation Breakdown */}
            <div style={{ fontSize: 13, fontWeight: 700, color: '#CBD5E1', marginBottom: 10 }}>Automated 70/15/15 Escrow Release Rule:</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(16,185,129,0.1)', padding: '8px 12px', borderRadius: 10, color: '#34D399' }}>
                <span>🖨️ Printer Owner (70%)</span>
                <span>₹{printerShare}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(234,88,12,0.1)', padding: '8px 12px', borderRadius: 10, color: '#FB923C' }}>
                <span>🎨 3D Designer Royalty (15%)</span>
                <span>₹{designerShare}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(56,189,248,0.1)', padding: '8px 12px', borderRadius: 10, color: '#38BDF8' }}>
                <span>🌐 Platform Escrow Fee (15%)</span>
                <span>₹{platformShare}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleConfirmPayment}
              disabled={placing}
              style={{ width: '100%', background: '#10B981', color: '#0F172A', border: 'none', borderRadius: 99, padding: '14px', fontWeight: 800, fontSize: 15, cursor: 'pointer', boxShadow: '0 0 20px rgba(16,185,129,0.4)' }}
            >
              {placing ? 'Authorizing Razorpay Escrow...' : 'Authorize Test Escrow Deposit →'}
            </button>
          </div>
        </div>
      )}

      <Footer />
    </main>
  )
}

const inputStyle: React.CSSProperties = {
  background: 'var(--bg-card-hover)',
  border: '1px solid var(--border-color)',
  borderRadius: 12,
  padding: '12px 16px',
  color: 'var(--text-main)',
  fontSize: 14,
  outline: 'none',
}

const radioOptionStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 16,
  padding: 16,
  borderRadius: 16,
  border: '1px solid var(--border-color)',
  cursor: 'pointer',
}