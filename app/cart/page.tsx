'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useStore } from '@/lib/cart-context'
import { createClient } from '@/utils/supabase/client'
import { Trash2, Heart, ArrowRight, ShieldCheck, ShoppingBag, Truck, Lock } from 'lucide-react'

export default function CartPage() {
  const router = useRouter()
  const { cart, updateCartQuantity, removeFromCart, addToWishlist, cartSubtotal } = useStore()
  const [coupon, setCoupon] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null)
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [liveImages, setLiveImages] = useState<Record<string, string>>({})
  const supabase = createClient()

  useEffect(() => {
    if (!cart || cart.length === 0) return
    async function syncRealImages() {
      try {
        const ids = cart.map(i => i.id).filter(Boolean)
        if (ids.length === 0) return

        const { data: dbProducts } = await supabase.from('products').select('id, image_url, title, name').in('id', ids)
        const { data: dbDesigns } = await supabase.from('designs').select('id, thumbnail_url, preview_url, title').in('id', ids)

        const map: Record<string, string> = {}
        dbProducts?.forEach((p) => {
          if (p.image_url) {
            map[p.id] = p.image_url
          }
        })
        dbDesigns?.forEach((d) => {
          const img = d.thumbnail_url || d.preview_url
          if (img) {
            map[d.id] = img
          }
        })
        setLiveImages(map)
      } catch (err) {
        console.warn('Cart image sync:', err)
      }
    }
    syncRealImages()
  }, [cart])

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault()
    if (coupon.trim().toUpperCase() === 'HIVE10' || coupon.trim().toUpperCase() === 'CREATOR10') {
      setAppliedCoupon(coupon.trim().toUpperCase())
      setCouponDiscount(Math.round(cartSubtotal * 0.10))
    } else {
      alert('Invalid coupon code. Try code "HIVE10" for 10% off your creation!')
    }
  }

  const subtotal = cartSubtotal
  const isAllDigital = cart.length > 0 && cart.every(i => i.name.toLowerCase().includes('digital') || i.name.toLowerCase().includes('stl') || i.name.toLowerCase().includes('3d model') || i.name.toLowerCase().includes('model'))
  const shipping = isAllDigital || subtotal === 0 || subtotal > 1500 ? 0 : 99
  const tax = Math.round((subtotal - couponDiscount) * 0.18)
  const total = Math.max(0, subtotal - couponDiscount + shipping + tax)

  return (
    <main style={{ minHeight: '100vh', background: '#FAF6F1', color: '#1A1A2E', fontFamily: 'inherit' }}>
      <Navbar />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '36px 24px 80px' }}>
        {/* HEADER */}
        <div style={{ marginBottom: 32 }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: '#F97316', textTransform: 'uppercase', letterSpacing: 0.8 }}>
            Review Your Bag
          </span>
          <h1 style={{ fontFamily: 'var(--font-fraunces), Fraunces, Georgia, serif', fontSize: 32, fontWeight: 800, color: '#1A1A2E', margin: '4px 0 6px', letterSpacing: '-0.5px' }}>
            Shopping Cart ({cart.length} items)
          </h1>
          <p style={{ color: '#64748B', fontSize: 14.5, margin: 0 }}>
            Every creation is inspected by our print engineers before dispatch. Secured with Razorpay Escrow.
          </p>
        </div>

        {cart.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: '#FFFFFF', borderRadius: 28, border: '1px solid #F0ECE6', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🛍️</div>
            <h2 style={{ fontFamily: 'var(--font-fraunces), Fraunces, Georgia, serif', fontSize: 24, fontWeight: 800, color: '#1A1A2E', margin: '0 0 8px' }}>
              Your Bag is Empty
            </h2>
            <p style={{ color: '#64748B', fontSize: 14.5, maxWidth: 380, margin: '0 auto 24px' }}>
              Explore our paint-your-own hampers, 3D printed gifts, and digital STL collections to find your next creation.
            </p>
            <Link
              href="/shop"
              style={{
                background: '#F97316',
                color: '#FFFFFF',
                padding: '12px 28px',
                borderRadius: 9999,
                fontSize: 14,
                fontWeight: 800,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 4px 14px rgba(249,115,22,0.35)',
              }}
            >
              Explore Creations <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 36, alignItems: 'start' }} className="cart-grid">
            {/* ITEMS LIST */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {cart.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: 24,
                    border: '1px solid #F0ECE6',
                    padding: 20,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                    display: 'flex',
                    gap: 20,
                    alignItems: 'center',
                    flexWrap: 'wrap',
                  }}
                >
                  <div
                    style={{
                      width: 110,
                      height: 110,
                      borderRadius: 18,
                      overflow: 'hidden',
                      background: '#F8FAFC',
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={liveImages[item.id] || item.image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80'}
                      alt={item.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>

                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#F97316', textTransform: 'uppercase' }}>
                      By {item.seller || 'Verified Maker'}
                    </div>
                    <h3 style={{ fontFamily: 'var(--font-fraunces), Fraunces, Georgia, serif', fontSize: 17, fontWeight: 700, color: '#1A1A2E', margin: '2px 0 8px' }}>
                      {item.name}
                    </h3>
                    <div style={{ fontSize: 18, fontWeight: 900, color: '#1A1A2E' }}>
                      ₹{item.price * item.quantity}
                      <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 500, marginLeft: 6 }}>
                        (₹{item.price} each)
                      </span>
                    </div>
                  </div>

                  {/* QUANTITY CONTROLS */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', background: '#FAF6F1', borderRadius: 9999, border: '1px solid #E2E8F0', padding: 3 }}>
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                        style={{ width: 28, height: 28, borderRadius: '50%', background: '#FFFFFF', border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: 14, color: '#1A1A2E' }}
                      >
                        -
                      </button>
                      <span style={{ padding: '0 12px', fontSize: 13, fontWeight: 800, color: '#1A1A2E' }}>
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                        style={{ width: 28, height: 28, borderRadius: '50%', background: '#FFFFFF', border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: 14, color: '#1A1A2E' }}
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      style={{ background: '#FEE2E2', color: '#EF4444', border: 'none', borderRadius: '50%', width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                      title="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* ORDER SUMMARY */}
            <div style={{ background: '#FFFFFF', borderRadius: 28, border: '1px solid #F0ECE6', padding: 28, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', position: 'sticky', top: 90 }}>
              <h2 style={{ fontFamily: 'var(--font-fraunces), Fraunces, Georgia, serif', fontSize: 20, fontWeight: 800, color: '#1A1A2E', margin: '0 0 20px' }}>
                Order Summary
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14, borderBottom: '1px solid #F0ECE6', paddingBottom: 20, marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                  <span>Bag Subtotal</span>
                  <span style={{ fontWeight: 700, color: '#1A1A2E' }}>₹{subtotal}</span>
                </div>

                {appliedCoupon && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16A34A' }}>
                    <span>Coupon ({appliedCoupon})</span>
                    <span style={{ fontWeight: 700 }}>-₹{couponDiscount}</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                  <span>Doorstep Delivery</span>
                  <span style={{ fontWeight: 700, color: shipping === 0 ? '#16A34A' : '#1A1A2E' }}>
                    {shipping === 0 ? 'FREE' : `₹${shipping}`}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                  <span>GST (18%)</span>
                  <span style={{ fontWeight: 700, color: '#1A1A2E' }}>₹{tax}</span>
                </div>
              </div>

              {/* TOTAL */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 24 }}>
                <span style={{ fontSize: 16, fontWeight: 800, color: '#1A1A2E' }}>Estimated Total</span>
                <span style={{ fontSize: 28, fontWeight: 900, color: '#F97316' }}>₹{total}</span>
              </div>

              {/* COUPON INPUT */}
              <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                <input
                  type="text"
                  placeholder="Coupon code (e.g. HIVE10)"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  style={{ flex: 1, border: '1px solid #E2E8F0', borderRadius: 9999, padding: '8px 16px', fontSize: 13, outline: 'none', background: '#FAF6F1', color: '#1A1A2E' }}
                />
                <button
                  type="submit"
                  style={{ background: '#1A1A2E', color: '#fff', border: 'none', borderRadius: 9999, padding: '8px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                >
                  Apply
                </button>
              </form>

              {/* CHECKOUT BUTTON */}
              <Link
                href="/checkout"
                style={{
                  width: '100%',
                  background: '#F97316',
                  color: '#FFFFFF',
                  padding: '14px',
                  borderRadius: 9999,
                  fontSize: 15,
                  fontWeight: 800,
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 4px 16px rgba(249,115,22,0.4)',
                }}
              >
                Proceed to Checkout <ArrowRight size={18} />
              </Link>

              {/* TRUST BADGE */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginTop: 18, fontSize: 12, color: '#64748B' }}>
                <Lock size={14} color="#16A34A" />
                <span>100% Escrow Protected by Razorpay</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />

      <style jsx global>{`
        @media (max-width: 860px) {
          .cart-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  )
}