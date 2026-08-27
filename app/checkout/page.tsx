'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useStore } from '@/lib/cart-context'
import { createClient } from '@/utils/supabase/client'

export default function CheckoutPage() {
  const router = useRouter()
  const { cart, cartSubtotal, clearCart } = useStore()

  // Payment Selection State (Can be unselected / null)
  const [paymentCategory, setPaymentCategory] = useState<'upi' | 'card' | 'netbanking' | 'cod' | null>('upi')
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

  // COD Captcha State (Unique 4-digit code generated every time)
  const [codCaptchaCode, setCodCaptchaCode] = useState(() => Math.floor(1000 + Math.random() * 9000).toString())
  const [codCaptchaInput, setCodCaptchaInput] = useState('')

  const [placing, setPlacing] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const subtotal = cartSubtotal
  const shipping = subtotal === 0 || subtotal > 1500 ? 0 : 99
  const tax = Math.round(subtotal * 0.18)
  const total = subtotal + shipping + tax

  // 70/15/15 Escrow breakdown calculation
  const printerShare = Math.round(subtotal * 0.70)
  const designerShare = Math.round(subtotal * 0.15)
  const platformShare = Math.round(subtotal * 0.15)

  // Toggle selection & generate unique code each time COD is selected
  const togglePaymentCategory = (cat: 'upi' | 'card' | 'netbanking' | 'cod') => {
    setPaymentCategory((prev) => {
      if (prev === cat) return null
      if (cat === 'cod') {
        setCodCaptchaCode(Math.floor(1000 + Math.random() * 9000).toString())
        setCodCaptchaInput('')
      }
      return cat
    })
  }

  const refreshCodCaptcha = () => {
    setCodCaptchaCode(Math.floor(1000 + Math.random() * 9000).toString())
    setCodCaptchaInput('')
  }

  const isCodVerified = paymentCategory === 'cod' && codCaptchaInput.trim() === codCaptchaCode
  const isPaymentValid = Boolean(paymentCategory && (paymentCategory !== 'cod' || isCodVerified))

  const handleVerifyVpa = () => {
    if (!vpaId || !vpaId.includes('@')) {
      alert('Please enter a valid UPI VPA ID (e.g. mobile@paytm or name@okaxis)')
      return
    }
    setIsVpaVerified(true)
  }

  const handleOpenPaymentModal = () => {
    if (!cart || cart.length === 0) {
      alert('Your cart is empty. Please add items before checking out.')
      return
    }
    if (!paymentCategory) {
      alert('Please select a payment method first.')
      return
    }
    if (paymentCategory === 'upi' && upiOption === 'vpa' && !vpaId) {
      alert('Please enter your UPI ID')
      return
    }
    if (paymentCategory === 'cod' && !isCodVerified) {
      alert(`Please enter the correct 4-digit security code (${codCaptchaCode}) for Pay on Delivery.`)
      return
    }
    setShowModal(true)
  }

  function loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') return resolve(false)
      if ((window as any).Razorpay) return resolve(true)
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const [mockOrderData, setMockOrderData] = useState<any>(null)
  const [addressData, setAddressData] = useState({
    firstName: 'Prince',
    lastName: 'Mandal',
    fullAddress: '123 Innovation Park, Connaught Place',
    city: 'New Delhi',
    pincode: '110001',
  })

  const handleConfirmPayment = async () => {
    if (!cart || cart.length === 0) {
      alert('Your cart is empty. Please add items before checking out.')
      setPlacing(false)
      return
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      alert('Please log in to complete your checkout.')
      router.push('/login?next=/checkout')
      return
    }

    setPlacing(true)

    try {
      // 1. Establish order and payment payload server-side
      const createOrderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          paymentMethod: paymentCategory || 'upi',
          isCod: paymentCategory === 'cod',
          shippingAddress: `${addressData.firstName} ${addressData.lastName}, ${addressData.fullAddress}, ${addressData.city} ${addressData.pincode}`,
        }),
      })

      if (!createOrderRes.ok) {
        const errorData = await createOrderRes.json().catch(() => ({}))
        console.error('Failed to initialize server-side payment order:', errorData)
        alert(`Payment initialization failed: ${errorData.error || 'Server error'}`)
        setPlacing(false)
        return
      }

      const orderData = await createOrderRes.json()
      const currentOrderId = orderData.orderId

      // If Cash on Delivery, finalize directly
      if (orderData.isCod) {
        clearCart()
        setShowModal(false)
        router.push(`/orders/${currentOrderId}`)
        return
      }

      // If in Mock / Sandbox simulator mode (no live Razorpay keys configured)
      if (orderData.isMock) {
        setMockOrderData(orderData)
        setShowModal(true)
        setPlacing(false)
        return
      }

      // 2. Load official Razorpay SDK if live keys exist
      const isLoaded = await loadRazorpayScript()
      if (!isLoaded) {
        setMockOrderData(orderData)
        setShowModal(true)
        setPlacing(false)
        return
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'PrintHive Marketplace',
        description: `Order #${currentOrderId.slice(0, 8)} Payment`,
        order_id: orderData.razorpayOrderId,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                order_id: currentOrderId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            })

            if (!verifyRes.ok) {
              const errData = await verifyRes.json().catch(() => ({}))
              console.error('Payment verification failed:', errData)
              alert(`Payment verification failed: ${errData.error || 'Please contact support.'}`)
              setPlacing(false)
              return
            }

            clearCart()
            setShowModal(false)
            router.push(`/orders/${currentOrderId}`)
          } catch (verifyErr) {
            console.error('Verification error:', verifyErr)
            alert('A network error occurred while verifying your payment.')
            setPlacing(false)
          }
        },
        prefill: {
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Buyer',
          email: user.email,
          contact: '',
        },
        theme: {
          color: '#ea580c',
        },
        modal: {
          ondismiss: async function () {
            setPlacing(false)
            try {
              await fetch('/api/payments/cancel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId: currentOrderId, reason: 'Modal dismissed by user' }),
              })
            } catch (err) {
              console.warn('Failed to report cancelled order:', err)
            }
          },
        },
      }

      const rzp = new (window as any).Razorpay(options)
      rzp.on('payment.failed', async function (response: any) {
        console.error('Razorpay payment failed:', response.error)
        alert(`Payment failed: ${response.error?.description || response.error?.reason || 'Transaction declined'}`)
        setPlacing(false)
        try {
          await fetch('/api/payments/cancel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: currentOrderId, reason: response.error?.description || 'Transaction declined' }),
          })
        } catch (err) {
          console.warn('Failed to report failed order:', err)
        }
      })
      rzp.open()
    } catch (orderErr: unknown) {
      const error = orderErr as Error
      console.error('Checkout error:', error)
      alert(`Checkout failed: ${error.message || 'Unknown error'}`)
      setPlacing(false)
    }
  }

  // Simulator confirmation handler for Sandbox / Dev
  const handleSimulatePaymentSuccess = async () => {
    if (!mockOrderData) return
    setPlacing(true)

    try {
      const mockPayId = `pay_mock_${Math.random().toString(36).substring(2, 12)}`
      const verifyRes = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: mockOrderData.orderId,
          razorpay_order_id: mockOrderData.razorpayOrderId,
          razorpay_payment_id: mockPayId,
          razorpay_signature: `mock_sig_${Math.random().toString(36).substring(2, 14)}`,
        }),
      })

      if (!verifyRes.ok) {
        const errData = await verifyRes.json().catch(() => ({}))
        alert(`Verification failed: ${errData.error || 'Server error'}`)
        setPlacing(false)
        return
      }

      clearCart()
      setShowModal(false)
      router.push(`/orders/${mockOrderData.orderId}`)
    } catch (err) {
      console.error('Simulation verification error:', err)
      alert('Verification error occurred during simulation.')
    } finally {
      setPlacing(false)
    }
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
          🛒 Amazon-Style Toggle & Gate Checkout
        </div>

        <h1 style={{ fontSize: 34, fontWeight: 900, marginBottom: 8, color: 'var(--text-main)' }}>
          Select a Payment Method
        </h1>

        <p style={{ color: 'var(--text-sub)', marginBottom: 36, fontSize: 15 }}>
          All transactions are protected by Razorpay Escrow. Click to select or unselect a payment option.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 32, alignItems: 'start' }}>
          {/* Main Checkout Section */}
          <div>
            {/* 1. Shipping Address Box with Quick Address Book */}
            <div style={{ background: 'var(--bg-card)', padding: 28, borderRadius: 20, border: '1px solid var(--border-color)', marginBottom: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  1. Delivery Address
                </h2>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    type="button"
                    style={{ background: '#ea580c', color: '#fff', border: 'none', borderRadius: 99, padding: '4px 10px', fontSize: 11, fontWeight: 800, cursor: 'pointer' }}
                  >
                    🏠 Home (Default)
                  </button>
                  <button
                    type="button"
                    style={{ background: 'var(--bg-card-hover)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: 99, padding: '4px 10px', fontSize: 11, fontWeight: 800, cursor: 'pointer' }}
                  >
                    🏢 Studio Lab
                  </button>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <input style={inputStyle} placeholder="First Name" defaultValue="Prince" />
                <input style={inputStyle} placeholder="Last Name" defaultValue="Mandal" />
                <input style={{ ...inputStyle, gridColumn: 'span 2' }} placeholder="Full Address" defaultValue="123 Innovation Park, Connaught Place" />
                <input style={inputStyle} placeholder="City" defaultValue="New Delhi" />
                <input style={inputStyle} placeholder="Pincode" defaultValue="110001" />
              </div>
            </div>

            {/* 2. Amazon-Style Toggle & Unselect Payment Accordion */}
            <div style={{ background: 'var(--bg-card)', borderRadius: 20, border: '1px solid var(--border-color)', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
              <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-card-hover)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  2. Choose Payment Method
                </h2>
                {!paymentCategory && (
                  <span style={{ fontSize: 12, color: '#F87171', fontWeight: 700 }}>
                    ⚠️ Select a payment option to proceed
                  </span>
                )}
              </div>

              {/* AUTOMATIC DROPDOWN OPTION 1: UPI */}
              <div style={{ borderBottom: '1px solid var(--border-color)' }}>
                <div
                  onClick={() => togglePaymentCategory('upi')}
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
                      onChange={() => togglePaymentCategory('upi')}
                      onClick={(e) => e.stopPropagation()}
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
                  onClick={() => togglePaymentCategory('card')}
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
                      onChange={() => togglePaymentCategory('card')}
                      onClick={(e) => e.stopPropagation()}
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
                  onClick={() => togglePaymentCategory('netbanking')}
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
                      onChange={() => togglePaymentCategory('netbanking')}
                      onClick={(e) => e.stopPropagation()}
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
                  onClick={() => togglePaymentCategory('cod')}
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
                      onChange={() => togglePaymentCategory('cod')}
                      onClick={(e) => e.stopPropagation()}
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

                {paymentCategory === 'cod' && (
                  <div style={{ padding: '0 28px 24px 60px', background: 'rgba(234,88,12,0.03)', borderTop: '1px dashed rgba(234,88,12,0.2)' }}>
                    <div style={{ background: 'var(--bg-card)', padding: 18, borderRadius: 16, border: isCodVerified ? '1px solid #10B981' : '1px solid var(--border-color)', maxWidth: 440, marginTop: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <div style={{ fontSize: 12, fontWeight: 800, color: isCodVerified ? '#10B981' : '#ea580c' }}>
                          {isCodVerified ? '✅ Security Code Verified' : '🔒 Security Code Verification'}
                        </div>
                        <button
                          type="button"
                          onClick={refreshCodCaptcha}
                          title="Generate New Code"
                          style={{ background: 'transparent', border: 'none', color: 'var(--text-sub)', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                          🔄 Refresh Code
                        </button>
                      </div>

                      <div style={{ fontSize: 13, color: 'var(--text-sub)', marginBottom: 12 }}>
                        Type the 4-digit code shown below to enable Pay on Delivery:
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 }}>
                        <div style={{ background: '#0F172A', color: '#10B981', padding: '10px 18px', borderRadius: 12, fontWeight: 900, letterSpacing: 6, fontSize: 20, userSelect: 'none', border: '1px solid rgba(16,185,129,0.3)', boxShadow: '0 0 15px rgba(16,185,129,0.15)' }}>
                          {codCaptchaCode.split('').join(' ')}
                        </div>
                        <input
                          style={{
                            ...inputStyle,
                            width: 140,
                            textAlign: 'center',
                            fontWeight: 900,
                            fontSize: 18,
                            letterSpacing: 3,
                            borderColor: isCodVerified ? '#10B981' : codCaptchaInput ? '#EF4444' : 'var(--border-color)',
                            background: isCodVerified ? 'rgba(16,185,129,0.06)' : 'var(--bg-card-hover)',
                          }}
                          placeholder="Type code"
                          maxLength={4}
                          value={codCaptchaInput}
                          onChange={(e) => setCodCaptchaInput(e.target.value.replace(/\D/g, ''))}
                        />
                      </div>

                      <div style={{ fontSize: 12, fontWeight: 700, color: isCodVerified ? '#10B981' : codCaptchaInput ? '#EF4444' : 'var(--text-sub)' }}>
                        {isCodVerified
                          ? '🎉 Correct code! Payment button is now enabled.'
                          : codCaptchaInput
                          ? '❌ Incorrect code. Please type the exact digits shown above.'
                          : '⚡ Enter the 4-digit security code above to proceed.'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar with Gated Payment Button */}
          <div style={{ background: 'var(--bg-card)', padding: 28, borderRadius: 20, border: '1px solid var(--border-color)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', position: 'sticky', top: 90 }}>
            <button
              type="button"
              onClick={handleOpenPaymentModal}
              disabled={!isPaymentValid}
              style={{
                width: '100%',
                background: isPaymentValid ? '#ea580c' : 'var(--border-color)',
                color: isPaymentValid ? '#fff' : 'var(--text-sub)',
                opacity: isPaymentValid ? 1 : 0.6,
                cursor: isPaymentValid ? 'pointer' : 'not-allowed',
                border: 'none',
                borderRadius: 99,
                padding: '15px',
                fontWeight: 900,
                fontSize: 15,
                boxShadow: isPaymentValid ? '0 4px 16px rgba(234, 88, 12, 0.35)' : 'none',
                marginBottom: 20,
                transition: 'all 0.2s ease',
              }}
            >
              {!paymentCategory
                ? 'Select a Payment Method Above'
                : paymentCategory === 'cod' && !isCodVerified
                ? '🔒 Enter Security Code to Enable'
                : 'Use this Payment Method →'}
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
      {showModal && paymentCategory && (
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
              onClick={mockOrderData ? handleSimulatePaymentSuccess : handleConfirmPayment}
              disabled={placing}
              style={{ width: '100%', background: '#10B981', color: '#0F172A', border: 'none', borderRadius: 99, padding: '14px', fontWeight: 800, fontSize: 15, cursor: 'pointer', boxShadow: '0 0 20px rgba(16,185,129,0.4)' }}
            >
              {placing ? 'Authorizing Payment...' : mockOrderData ? '⚡ Complete Razorpay Escrow Authorization (Demo)' : 'Confirm Order & Deposit Escrow →'}
            </button>
          </div>
        </div>
      )}

      <Footer />
    </main>
  )
}