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

  // Payment Selection State (Amazon Style Automatic Dropdown)
  const [paymentCategory, setPaymentCategory] = useState<'upi' | 'card' | 'netbanking' | 'cod'>('upi')
  const [upiOption, setUpiOption] = useState<'gpay' | 'phonepe' | 'paytm' | 'vpa'>('gpay')
  const [vpaId, setVpaId] = useState('')
  const [isVpaVerified, setIsVpaVerified] = useState(false)

  // Card Form State
  const [cardNumber, setCardNumber] = useState('')
  const [cardName, setCardName] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [saveCard, setSaveCard] = useState(true)

  // Net Banking State
  const [selectedBank, setSelectedBank] = useState('HDFC Bank')

  // COD Captcha State
  const [codCaptchaInput, setCodCaptchaInput] = useState('')

  const [placing, setPlacing] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const subtotal = cartSubtotal || 450
  const shipping = subtotal > 1500 ? 0 : 99
  const tax = Math.round(subtotal * 0.18)
  const total = subtotal + shipping + tax

  // 70/15/15 Escrow breakdown calculation
  const printerShare = Math.round(subtotal * 0.70)
  const designerShare = Math.round(subtotal * 0.15)
  const platformShare = Math.round(subtotal * 0.15)

  const handleVerifyVpa = () => {
    if (!vpaId || !vpaId.includes('@')) {
      alert('Please enter a valid UPI VPA ID (e.g. mobile@paytm or name@okaxis)')
      return
    }
    setIsVpaVerified(true)
  }

  const handleOpenPaymentModal = () => {
    if (paymentCategory === 'upi' && upiOption === 'vpa' && !vpaId) {
      alert('Please enter your UPI ID')
      return
    }
    if (paymentCategory === 'cod' && codCaptchaInput !== '7391') {
      alert('Please enter the correct 4-digit security code (7391) for Pay on Delivery.')
      return
    }
    setShowModal(true)
  }

  const handleConfirmPayment = async () => {
    setPlacing(true)
    await new Promise((res) => setTimeout(res, 1200))
    clearCart()
    setShowModal(false)
    router.push('/orders/demo-order-id')
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--bg-card-hover)',
    border: '1px solid var(--border-color)',
    borderRadius: 10,
    padding: '11px 14px',
    fontSize: 14,
    color: 'var(--text-main)',
    outline: 'none',
    boxSizing: 'border-box',
  }

  return (
    <main style={{ minHeight: '100vh', transition: 'background 0.3s ease' }}>
      <Navbar />

      <section className="container section-sm" style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px' }}>
        <div className="ateion-pill" style={{ marginBottom: 12 }}>
          🛒 Amazon-Style Automatic Dropdown Checkout
        </div>

        <h1 style={{ fontSize: 34, fontWeight: 900, marginBottom: 8, color: 'var(--text-main)' }}>
          Select a Payment Method
        </h1>

        <p style={{ color: 'var(--text-sub)', marginBottom: 36, fontSize: 15 }}>
          All transactions are protected by Razorpay Escrow. Selecting any payment method automatically opens its dropdown drawer.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 32, alignItems: 'start' }}>
          {/* Main Checkout Section */}
          <div>
            {/* 1. Shipping Address Box */}
            <div style={{ background: 'var(--bg-card)', padding: 28, borderRadius: 20, border: '1px solid var(--border-color)', marginBottom: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  1. Delivery Address
                </h2>
                <span style={{ fontSize: 12, color: '#ea580c', fontWeight: 700 }}>Prince Mandal, New Delhi 110001</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <input style={inputStyle} placeholder="First Name" defaultValue="Prince" />
                <input style={inputStyle} placeholder="Last Name" defaultValue="Mandal" />
                <input style={{ ...inputStyle, gridColumn: 'span 2' }} placeholder="Full Address" defaultValue="123 Innovation Park, Connaught Place" />
                <input style={inputStyle} placeholder="City" defaultValue="New Delhi" />
                <input style={inputStyle} placeholder="Pincode" defaultValue="110001" />
              </div>
            </div>

            {/* 2. Amazon-Style Automatic Dropdown Accordion */}
            <div style={{ background: 'var(--bg-card)', borderRadius: 20, border: '1px solid var(--border-color)', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
              <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-card-hover)' }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  2. Choose Payment Method
                </h2>
              </div>

              {/* AUTOMATIC DROPDOWN OPTION 1: UPI */}
              <div style={{ borderBottom: '1px solid var(--border-color)' }}>
                <div
                  onClick={() => setPaymentCategory('upi')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '18px 28px',
                    cursor: 'pointer',
                    background: paymentCategory === 'upi' ? 'rgba(234,88,12,0.06)' : 'transparent',
                    userSelect: 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <input
                      type="radio"
                      name="main_payment"
                      checked={paymentCategory === 'upi'}
                      onChange={() => setPaymentCategory('upi')}
                      style={{ accentColor: '#ea580c', width: 18, height: 18, cursor: 'pointer' }}
                    />
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-main)' }}>
                        📱 UPI (Google Pay / PhonePe / Paytm / Any UPI ID)
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-sub)', marginTop: 2 }}>
                        Pay instantly from your bank account using any UPI App
                      </div>
                    </div>
                  </div>
                </div>

                {/* Automatically Dropdown Drawer when Selected */}
                {paymentCategory === 'upi' && (
                  <div style={{ padding: '0 28px 24px 60px', background: 'rgba(234,88,12,0.03)', borderTop: '1px dashed rgba(234,88,12,0.2)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 14 }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--text-main)', cursor: 'pointer', fontWeight: 600 }}>
                        <input type="radio" name="upi_app" checked={upiOption === 'gpay'} onChange={() => setUpiOption('gpay')} style={{ accentColor: '#ea580c' }} />
                        <span>Google Pay (GPay)</span>
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--text-main)', cursor: 'pointer', fontWeight: 600 }}>
                        <input type="radio" name="upi_app" checked={upiOption === 'phonepe'} onChange={() => setUpiOption('phonepe')} style={{ accentColor: '#ea580c' }} />
                        <span>PhonePe</span>
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--text-main)', cursor: 'pointer', fontWeight: 600 }}>
                        <input type="radio" name="upi_app" checked={upiOption === 'paytm'} onChange={() => setUpiOption('paytm')} style={{ accentColor: '#ea580c' }} />
                        <span>Paytm UPI</span>
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--text-main)', cursor: 'pointer', fontWeight: 600 }}>
                        <input type="radio" name="upi_app" checked={upiOption === 'vpa'} onChange={() => setUpiOption('vpa')} style={{ accentColor: '#ea580c' }} />
                        <span>Enter VPA / UPI ID</span>
                      </label>
                    </div>

                    {upiOption === 'vpa' && (
                      <div style={{ marginTop: 14, display: 'flex', gap: 10, maxWidth: 400 }}>
                        <input
                          style={inputStyle}
                          placeholder="e.g. 9876543210@paytm or name@okaxis"
                          value={vpaId}
                          onChange={(e) => { setVpaId(e.target.value); setIsVpaVerified(false) }}
                        />
                        <button
                          type="button"
                          onClick={handleVerifyVpa}
                          style={{ background: '#ea580c', color: '#fff', border: 'none', borderRadius: 10, padding: '0 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
                        >
                          {isVpaVerified ? 'Verified ✓' : 'Verify'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* AUTOMATIC DROPDOWN OPTION 2: CREDIT OR DEBIT CARD */}
              <div style={{ borderBottom: '1px solid var(--border-color)' }}>
                <div
                  onClick={() => setPaymentCategory('card')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '18px 28px',
                    cursor: 'pointer',
                    background: paymentCategory === 'card' ? 'rgba(234,88,12,0.06)' : 'transparent',
                    userSelect: 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <input
                      type="radio"
                      name="main_payment"
                      checked={paymentCategory === 'card'}
                      onChange={() => setPaymentCategory('card')}
                      style={{ accentColor: '#ea580c', width: 18, height: 18, cursor: 'pointer' }}
                    />
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-main)' }}>
                        💳 Credit or Debit Card
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-sub)', marginTop: 2 }}>
                        Visa, Mastercard, RuPay, Maestro & Diners Club
                      </div>
                    </div>
                  </div>
                </div>

                {/* Automatically Dropdown Drawer when Selected */}
                {paymentCategory === 'card' && (
                  <div style={{ padding: '0 28px 24px 60px', background: 'rgba(234,88,12,0.03)', borderTop: '1px dashed rgba(234,88,12,0.2)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 14, maxWidth: 460, marginTop: 14 }}>
                      <div style={{ gridColumn: 'span 3' }}>
                        <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sub)', marginBottom: 4, display: 'block' }}>Card Number</label>
                        <input
                          style={inputStyle}
                          placeholder="4532 •••• •••• 8912"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                        />
                      </div>
                      <div style={{ gridColumn: 'span 3' }}>
                        <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sub)', marginBottom: 4, display: 'block' }}>Name on Card</label>
                        <input
                          style={inputStyle}
                          placeholder="Prince Mandal"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                        />
                      </div>
                      <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sub)', marginBottom: 4, display: 'block' }}>Expiry Date</label>
                        <input
                          style={inputStyle}
                          placeholder="MM / YY"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sub)', marginBottom: 4, display: 'block' }}>CVV</label>
                        <input
                          style={inputStyle}
                          type="password"
                          placeholder="•••"
                          maxLength={4}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                        />
                      </div>
                    </div>

                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-sub)', marginTop: 14, cursor: 'pointer', fontWeight: 600 }}>
                      <input type="checkbox" checked={saveCard} onChange={(e) => setSaveCard(e.target.checked)} style={{ accentColor: '#ea580c' }} />
                      <span>Save card for faster future checkouts</span>
                    </label>
                  </div>
                )}
              </div>

              {/* AUTOMATIC DROPDOWN OPTION 3: NET BANKING */}
              <div style={{ borderBottom: '1px solid var(--border-color)' }}>
                <div
                  onClick={() => setPaymentCategory('netbanking')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '18px 28px',
                    cursor: 'pointer',
                    background: paymentCategory === 'netbanking' ? 'rgba(234,88,12,0.06)' : 'transparent',
                    userSelect: 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <input
                      type="radio"
                      name="main_payment"
                      checked={paymentCategory === 'netbanking'}
                      onChange={() => setPaymentCategory('netbanking')}
                      style={{ accentColor: '#ea580c', width: 18, height: 18, cursor: 'pointer' }}
                    />
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-main)' }}>
                        🏦 Net Banking
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-sub)', marginTop: 2 }}>
                        All major Indian retail & corporate banks
                      </div>
                    </div>
                  </div>
                </div>

                {/* Automatically Dropdown Drawer when Selected */}
                {paymentCategory === 'netbanking' && (
                  <div style={{ padding: '0 28px 24px 60px', background: 'rgba(234,88,12,0.03)', borderTop: '1px dashed rgba(234,88,12,0.2)' }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sub)', marginBottom: 6, display: 'block', marginTop: 14 }}>Choose your bank:</label>
                    <select
                      style={{ ...inputStyle, maxWidth: 360 }}
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                    >
                      <option value="HDFC Bank">HDFC Bank</option>
                      <option value="State Bank of India (SBI)">State Bank of India (SBI)</option>
                      <option value="ICICI Bank">ICICI Bank</option>
                      <option value="Axis Bank">Axis Bank</option>
                      <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                      <option value="Punjab National Bank">Punjab National Bank</option>
                    </select>
                  </div>
                )}
              </div>

              {/* AUTOMATIC DROPDOWN OPTION 4: PAY ON DELIVERY (COD) */}
              <div>
                <div
                  onClick={() => setPaymentCategory('cod')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '18px 28px',
                    cursor: 'pointer',
                    background: paymentCategory === 'cod' ? 'rgba(234,88,12,0.06)' : 'transparent',
                    userSelect: 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <input
                      type="radio"
                      name="main_payment"
                      checked={paymentCategory === 'cod'}
                      onChange={() => setPaymentCategory('cod')}
                      style={{ accentColor: '#ea580c', width: 18, height: 18, cursor: 'pointer' }}
                    />
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-main)' }}>
                        🚚 Pay on Delivery (Cash / UPI at Doorstep)
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-sub)', marginTop: 2 }}>
                        Pay cash or scan QR upon inspecting physical 3D print quality
                      </div>
                    </div>
                  </div>
                </div>

                {/* Automatically Dropdown Drawer when Selected */}
                {paymentCategory === 'cod' && (
                  <div style={{ padding: '0 28px 24px 60px', background: 'rgba(234,88,12,0.03)', borderTop: '1px dashed rgba(234,88,12,0.2)' }}>
                    <div style={{ background: 'var(--bg-card)', padding: 16, borderRadius: 14, border: '1px solid var(--border-color)', maxWidth: 400, marginTop: 14 }}>
                      <div style={{ fontSize: 12, fontWeight: 800, color: '#ea580c', marginBottom: 4 }}>Security Code Verification:</div>
                      <div style={{ fontSize: 13, color: 'var(--text-sub)', marginBottom: 10 }}>
                        Type the 4-digit code shown below to confirm Pay on Delivery:
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ background: '#0F172A', color: '#10B981', padding: '8px 16px', borderRadius: 10, fontWeight: 900, letterSpacing: 4, fontSize: 18, userSelect: 'none' }}>
                          7 3 9 1
                        </div>
                        <input
                          style={{ ...inputStyle, width: 120, textAlign: 'center', fontWeight: 800, fontSize: 16 }}
                          placeholder="7391"
                          maxLength={4}
                          value={codCaptchaInput}
                          onChange={(e) => setCodCaptchaInput(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div style={{ background: 'var(--bg-card)', padding: 28, borderRadius: 20, border: '1px solid var(--border-color)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', position: 'sticky', top: 90 }}>
            <button
              type="button"
              onClick={handleOpenPaymentModal}
              style={{ width: '100%', background: '#ea580c', color: '#fff', border: 'none', borderRadius: 99, padding: '15px', fontWeight: 900, fontSize: 16, cursor: 'pointer', boxShadow: '0 4px 16px rgba(234, 88, 12, 0.35)', marginBottom: 20 }}
            >
              Use this Payment Method →
            </button>

            <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 16, color: 'var(--text-main)' }}>Order Summary</h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--text-sub)', marginBottom: 8 }}>
              <span>Items Subtotal:</span>
              <span>₹{subtotal}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--text-sub)', marginBottom: 8 }}>
              <span>Delivery & Shipping:</span>
              <span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--text-sub)', marginBottom: 16 }}>
              <span>Total GST (18%):</span>
              <span>₹{tax}</span>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 16, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-main)' }}>Order Total:</span>
              <span style={{ fontSize: 24, fontWeight: 900, color: '#ea580c' }}>₹{total}</span>
            </div>

            <div style={{ background: 'var(--bg-card-hover)', padding: 12, borderRadius: 10, border: '1px solid var(--border-color)', fontSize: 12, color: 'var(--text-sub)', lineHeight: 1.5 }}>
              🔒 Guaranteed Razorpay Escrow Protection. Funds released to printer & designer upon delivery.
            </div>
          </div>
        </div>
      </section>

      {/* RAZORPAY / AMAZON ESCROW CONFIRMATION MODAL */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#0F172A', color: '#fff', borderRadius: 24, padding: 36, maxWidth: 480, width: '100%', border: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 25px 60px rgba(0,0,0,0.8)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#38BDF8' }}>🔒 Authorize Payment</div>
              <button type="button" onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', color: '#94A3B8', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 16, marginBottom: 20 }}>
              <div style={{ fontSize: 12, textTransform: 'uppercase', color: '#94A3B8', fontWeight: 700, marginBottom: 4 }}>Total Payable Amount</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: '#34D399' }}>₹{total}</div>
              <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>
                Payment Method: <strong style={{ color: '#fff' }}>{paymentCategory.toUpperCase()}</strong>
              </div>
            </div>

            {/* 70/15/15 Allocation Breakdown */}
            <div style={{ fontSize: 13, fontWeight: 700, color: '#CBD5E1', marginBottom: 10 }}>Automated Escrow Allocation:</div>
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
              {placing ? 'Authorizing Payment...' : 'Confirm Order & Deposit Escrow →'}
            </button>
          </div>
        </div>
      )}

      <Footer />
    </main>
  )
}