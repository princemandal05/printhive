'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { ArrowRight, Heart, Mail, Shield, Sparkles, Leaf, Gift, Lock } from 'lucide-react'

export default function Footer() {
  const [role, setRole] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    let isMounted = true
    async function loadRole() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user && isMounted) {
          const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
          if (profile?.role) setRole(profile.role)
        }
      } catch {}
    }
    loadRole()
    return () => { isMounted = false }
  }, [])

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setSubscribed(true)
  }

  return (
    <footer style={{ background: '#FAF6F1', borderTop: '1px solid #F0ECE6', color: '#64748B', paddingTop: 48, paddingBottom: 72, marginTop: 48 }}>
      <div style={{ maxWidth: 1360, margin: '0 auto', padding: '0 24px' }}>
        {/* TOP VALUE PILLARS (printhive.org style) */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 24,
            border: '1px solid #F0ECE6',
            padding: '24px 32px',
            marginBottom: 48,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 24,
            boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={20} color="#7C3AED" />
            </div>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 800, color: '#1A1A2E' }}>Premium Quality</div>
              <div style={{ fontSize: 12, color: '#94A3B8' }}>Precision 3D manufacturing</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Leaf size={20} color="#16A34A" />
            </div>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 800, color: '#1A1A2E' }}>Eco-Friendly PLA</div>
              <div style={{ fontSize: 12, color: '#94A3B8' }}>Biodegradable materials</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: '#FFEDD5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Gift size={20} color="#EA580C" />
            </div>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 800, color: '#1A1A2E' }}>Made to Delight</div>
              <div style={{ fontSize: 12, color: '#94A3B8' }}>Paint-your-own hampers</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Lock size={20} color="#2563EB" />
            </div>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 800, color: '#1A1A2E' }}>Escrow Protected</div>
              <div style={{ fontSize: 12, color: '#94A3B8' }}>Guarded by Razorpay</div>
            </div>
          </div>
        </div>

        {/* 10% OFF NEWSLETTER BANNER (printhive.org style) */}
        <div
          style={{
            background: 'linear-gradient(135deg, #FEE8D6 0%, #FAF6F0 50%, #FEE8D6 100%)',
            border: '1px solid #FED7AA',
            borderRadius: 28,
            padding: '32px 36px',
            marginBottom: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 24,
            boxShadow: '0 4px 20px rgba(249, 115, 22, 0.08)',
          }}
        >
          <div style={{ maxWidth: 480 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#EA580C', textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Join the Maker Community
            </span>
            <h3
              style={{
                fontFamily: 'var(--font-fraunces), Fraunces, Georgia, serif',
                fontSize: 26,
                fontWeight: 800,
                color: '#1A1A2E',
                margin: '4px 0',
                lineHeight: 1.2,
              }}
            >
              Get 10% off your first creation
            </h3>
            <p style={{ fontSize: 13.5, color: '#64748B', margin: 0 }}>
              No spam. Just weekly curated 3D STL designs and printer workshop updates.
            </p>
          </div>

          <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', flex: 1, maxWidth: 420 }}>
            {subscribed ? (
              <div style={{ background: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0', padding: '10px 20px', borderRadius: 9999, fontWeight: 700, fontSize: 14 }}>
                🎉 You&apos;re in! Check your inbox for your 10% welcome coupon.
              </div>
            ) : (
              <div style={{ display: 'flex', width: '100%', background: '#FFFFFF', borderRadius: 9999, padding: 6, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #E2E8F0' }}>
                <input
                  type="email"
                  placeholder="Enter your email address..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ flex: 1, border: 'none', outline: 'none', padding: '8px 16px', fontSize: 13.5, background: 'transparent', color: '#1A1A2E' }}
                />
                <button
                  type="submit"
                  style={{
                    background: '#F97316',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 9999,
                    padding: '10px 22px',
                    fontSize: 13.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    boxShadow: '0 2px 10px rgba(249, 115, 22, 0.3)',
                  }}
                >
                  Subscribe <ArrowRight size={14} />
                </button>
              </div>
            )}
          </form>
        </div>

        {/* 4-COLUMN BRAND & NAVIGATION GRID */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.6fr 1fr 1fr 1fr',
            gap: 48,
            marginBottom: 56,
          }}
          className="footer-grid"
        >
          {/* BRAND COLUMN */}
          <div>
            <Link href="/" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: 12 }}>
              <span style={{ fontFamily: 'var(--font-fraunces), Fraunces, Georgia, serif', fontSize: 24, fontWeight: 900, color: '#1A1A2E', letterSpacing: '-0.5px' }}>
                Print<span style={{ color: '#F97316' }}>Hive</span>
              </span>
            </Link>
            <p style={{ fontSize: 13.5, lineHeight: 1.65, color: '#64748B', maxWidth: 320, marginBottom: 20 }}>
              India&apos;s most loved creative 3D printing & distributed manufacturing network. Every piece is crafted with care, completed with love.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, background: '#EFF6FF', color: '#1E40AF', border: '1px solid #BFDBFE', padding: '4px 12px', borderRadius: 9999, fontWeight: 700 }}>
              <Lock size={12} /> 70/15/15 Escrow Guard Active
            </div>
          </div>

          {/* COLUMN 1: MARKETPLACE */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#1A1A2E', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 16 }}>
              Marketplace
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13.5 }}>
              <li>
                <Link href="/shop" style={{ color: '#64748B', textDecoration: 'none', transition: 'color 0.15s' }}>
                  Creator&apos;s Studio (Hampers)
                </Link>
              </li>
              <li>
                <Link href="/browse" style={{ color: '#64748B', textDecoration: 'none', transition: 'color 0.15s' }}>
                  Creator&apos;s Shelf (3D Models)
                </Link>
              </li>
              <li>
                <Link href="/print-on-demand" style={{ color: '#64748B', textDecoration: 'none', transition: 'color 0.15s' }}>
                  Create Your Own (Print-on-Demand)
                </Link>
              </li>
              <li>
                <Link href="/requests" style={{ color: '#64748B', textDecoration: 'none', transition: 'color 0.15s' }}>
                  Custom Design Briefs
                </Link>
              </li>
              <li>
                <Link href="/cart" style={{ color: '#64748B', textDecoration: 'none', transition: 'color 0.15s' }}>
                  Shopping Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUMN 2: STRICTLY ROLE-AWARE PORTAL */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#F97316', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 16 }}>
              {role === 'seller' ? 'Seller Portal' : role === 'printer_owner' ? 'Printer Hub' : role === 'designer' ? 'Designer Studio' : role === 'admin' ? 'Admin Center' : 'Buyer Hub'}
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13.5 }}>
              {role === 'seller' && (
                <>
                  <li><Link href="/dashboard/seller" style={{ color: '#64748B', textDecoration: 'none' }}>Seller Dashboard</Link></li>
                  <li><Link href="/dashboard/seller/products/new" style={{ color: '#64748B', textDecoration: 'none' }}>+ Add New Product</Link></li>
                  <li><Link href="/shop" style={{ color: '#64748B', textDecoration: 'none' }}>My Store Items</Link></li>
                </>
              )}

              {role === 'printer_owner' && (
                <>
                  <li><Link href="/dashboard/printer-owner" style={{ color: '#64748B', textDecoration: 'none' }}>Printer Hub Dashboard</Link></li>
                  <li><Link href="/dashboard/printer-owner/register" style={{ color: '#64748B', textDecoration: 'none' }}>Register 3D Machine</Link></li>
                  <li><Link href="/printers" style={{ color: '#64748B', textDecoration: 'none' }}>Nearby Hubs Map</Link></li>
                </>
              )}

              {role === 'designer' && (
                <>
                  <li><Link href="/dashboard/designer" style={{ color: '#64748B', textDecoration: 'none' }}>Designer Dashboard</Link></li>
                  <li><Link href="/dashboard/designer/upload" style={{ color: '#64748B', textDecoration: 'none' }}>+ Upload 3D Model</Link></li>
                  <li><Link href="/dashboard/designer/earnings" style={{ color: '#64748B', textDecoration: 'none' }}>Royalty Wallet (15%)</Link></li>
                </>
              )}

              {(role === 'buyer' || !role) && (
                <>
                  <li><Link href="/dashboard/buyer" style={{ color: '#64748B', textDecoration: 'none' }}>Buyer Dashboard</Link></li>
                  <li><Link href="/orders" style={{ color: '#64748B', textDecoration: 'none' }}>Track Orders</Link></li>
                  <li><Link href="/requests/new" style={{ color: '#64748B', textDecoration: 'none' }}>Request Custom Model</Link></li>
                </>
              )}
            </ul>
          </div>

          {/* COLUMN 3: TRUST & COMPANY */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#1A1A2E', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 16 }}>
              Company & Help
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13.5 }}>
              <li>
                <Link href="/support-tickets" style={{ color: '#64748B', textDecoration: 'none' }}>
                  Help & Support Desk
                </Link>
              </li>
              <li>
                <Link href="/faq" style={{ color: '#64748B', textDecoration: 'none' }}>
                  FAQ & Escrow Help
                </Link>
              </li>
              <li>
                <Link href="/faq" style={{ color: '#64748B', textDecoration: 'none' }}>
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/faq" style={{ color: '#64748B', textDecoration: 'none' }}>
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* BOTTOM COPYRIGHT */}
        <div
          style={{
            borderTop: '1px solid #F0ECE6',
            paddingTop: 24,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
            fontSize: 12.5,
            color: '#94A3B8',
          }}
        >
          <div>
            © {new Date().getFullYear()} PrintHive · All rights reserved.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            Made with <Heart size={14} color="#EF4444" fill="#EF4444" /> in India
          </div>
        </div>
      </div>
    </footer>
  )
}