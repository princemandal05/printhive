'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { createClient } from '@/utils/supabase/client'
import {
  ShoppingBag,
  PenTool,
  Printer,
  Sparkles,
  Box,
  MapPin,
  ShieldCheck,
  Zap,
  Users,
  CheckCircle2,
  ArrowRight,
  Search,
  Bot,
  Store,
} from 'lucide-react'

const Hero3D = dynamic(() => import('@/components/Hero3D'), {
  ssr: false,
  loading: () => (
    <div style={{ height: 420, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-sub)', fontSize: 13, fontWeight: 700 }}>
      ⚡ Initializing 3D Canvas Engine...
    </div>
  ),
})

function IconBadge({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        width: 48,
        height: 48,
        borderRadius: 14,
        background: 'rgba(255, 107, 53, 0.12)',
        border: '1px solid rgba(255, 107, 53, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: '0 4px 14px rgba(255, 107, 53, 0.15)',
      }}
    >
      {children}
    </div>
  )
}

const PROBLEMS = [
  {
    type: 'buyer',
    title: 'Buyers',
    text: "Can't access custom 3D printed products without owning a ₹15,000–₹80,000 printer or learning CAD. Commercial services are expensive with slow lead times.",
  },
  {
    type: 'designer',
    title: '3D Designers',
    text: 'Publish high-quality models on open platforms for free, with no automatic monetization, licensing protection, or marketplace connecting designs to buyers.',
  },
  {
    type: 'printer',
    title: 'Printer Owners',
    text: 'Own 3D printers that sit idle 18–20 hours a day, with no organized local system to find print jobs, manage orders, or earn consistent income.',
  },
  {
    type: 'seller',
    title: 'Stores & Vendors',
    text: 'Lack direct access to active makers and printer hubs in need of bulk filaments, resins, replacement nozzles, and finished physical 3D products.',
  },
]

const STEPS = [
  {
    step: '01',
    title: 'Designers Upload',
    text: 'Creators upload STL/3MF files with render photos and pricing, earning automated royalties on every print.',
  },
  {
    step: '02',
    title: 'Buyers Discover & Order',
    text: 'Customers browse visual feeds, inspect models in 3D WebGL, and place custom orders with escrow protection.',
  },
  {
    step: '03',
    title: 'Nearby Printers Deliver',
    text: 'Leaflet GPS matches orders to nearby verified printer owners for fast precision slicing and doorstep delivery.',
  },
  {
    step: '04',
    title: 'Automated Payouts',
    text: 'Upon delivery confirmation, Razorpay escrow releases payments: 70% Printer, 15% Designer, 15% Platform.',
  },
]

const FEATURES = [
  { type: 'ai', title: 'Gemini AI Intelligence', text: 'Natural language search, automated description generator, and instant material slicer cost calculator.' },
  { type: 'viewport', title: 'In-Browser 3D Viewport', text: 'Real-time Three.js WebGL viewer lets buyers inspect model geometry, wireframes, and slice readiness.' },
  { type: 'geo', title: 'Nearby Geolocation Matching', text: 'Leaflet.js + OpenStreetMap engine connects orders to closest active printer hubs without high shipping fees.' },
  { type: 'escrow', title: 'Razorpay Escrow Protection', text: 'Escrow holds buyer funds securely until physical delivery is verified by the customer.' },
  { type: 'realtime', title: 'Supabase Realtime Tracking', text: 'Live websocket status pushing from slicing, printing, quality check, to courier dispatch.' },
  { type: 'community', title: 'Verified Print Community', text: 'Authentic buyer photos and star ratings build verified seller reputations.' },
]

export default function Home() {
  const supabase = createClient()
  const [aiSearchQuery, setAiSearchQuery] = useState('')
  const [activeRoleTab, setActiveRoleTab] = useState<'buyer' | 'designer' | 'printer' | 'seller'>('buyer')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [liveStats, setLiveStats] = useState({
    hubs: 0,
    designs: 0,
    products: 0,
  })

  useEffect(() => {
    async function checkAuthAndStats() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setIsLoggedIn(true)
        }

        // Fetch dynamic counts from real Supabase tables
        const [
          { count: printersCount },
          { count: designsCount },
          { count: productsCount },
        ] = await Promise.all([
          supabase.from('printers').select('*', { count: 'exact', head: true }),
          supabase.from('designs').select('*', { count: 'exact', head: true }),
          supabase.from('products').select('*', { count: 'exact', head: true }),
        ])

        setLiveStats({
          hubs: printersCount || 0,
          designs: designsCount || 0,
          products: productsCount || 0,
        })
      } catch (e) {
        // guest mode
      }
    }
    checkAuthAndStats()
  }, [])

  const renderIcon = (type: string) => {
    switch (type) {
      case 'buyer':
        return <ShoppingBag size={22} color="#FF6B35" />
      case 'designer':
        return <PenTool size={22} color="#FF6B35" />
      case 'printer':
        return <Printer size={22} color="#FF6B35" />
      case 'seller':
        return <Store size={22} color="#FF6B35" />
      case 'ai':
        return <Bot size={22} color="#FF6B35" />
      case 'viewport':
        return <Box size={22} color="#FF6B35" />
      case 'geo':
        return <MapPin size={22} color="#FF6B35" />
      case 'escrow':
        return <ShieldCheck size={22} color="#FF6B35" />
      case 'realtime':
        return <Zap size={22} color="#FF6B35" />
      case 'community':
        return <Users size={22} color="#FF6B35" />
      default:
        return <Sparkles size={22} color="#FF6B35" />
    }
  }

  return (
    <main style={{ minHeight: '100vh', transition: 'background 0.3s ease' }}>
      <Navbar />

      {/* HERO SECTION */}
      <section className="grid-pattern-bg" style={{ padding: '70px 0 60px', position: 'relative', overflow: 'hidden' }}>
        <div className="container">
          <div className="hero-grid" style={{ alignItems: 'center' }}>
            <div>
              <div className="ateion-pill" style={{ marginBottom: 24 }}>
                ⚡ AI-Powered 4-Sided 3D Commerce Platform
              </div>
              
              <h1 style={{ fontSize: '3.25rem', fontWeight: 900, lineHeight: 1.12, marginBottom: 20, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                Where Ideas Become{' '}
                <span style={{ color: '#FF6B35', background: 'linear-gradient(135deg, #FF6B35, #EA580C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Physical Products
                </span>
              </h1>

              <p style={{ fontSize: 17, color: 'var(--text-sub)', lineHeight: 1.7, marginBottom: 36, maxWidth: 540 }}>
                PrintHive connects buyers, 3D designers, local printer hub operators, and material vendors under one unified, escrow-secured additive commerce ecosystem.
              </p>

              {/* Gemini AI Natural Language Search Bar */}
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 99, padding: '8px 8px 8px 20px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40, boxShadow: '0 8px 30px rgba(0,0,0,0.06)' }}>
                <Search size={18} color="#FF6B35" />
                <input
                  type="text"
                  placeholder="Ask Gemini AI: 'Print a durable phone holder in PLA'..."
                  value={aiSearchQuery}
                  onChange={(e) => setAiSearchQuery(e.target.value)}
                  style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--text-main)', fontSize: 14, outline: 'none' }}
                />
                <Link
                  href={aiSearchQuery ? `/browse?q=${encodeURIComponent(aiSearchQuery)}` : '/browse'}
                  className="btn btn-primary"
                  style={{ background: '#FF6B35', color: '#fff', border: 'none', borderRadius: 99, padding: '12px 24px', fontWeight: 700, fontSize: 13, textDecoration: 'none', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <Bot size={15} /> AI Search
                </Link>
              </div>

              {/* Dynamic Live Network Stats */}
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ background: 'var(--bg-card)', padding: '14px 20px', borderRadius: 16, border: '1px solid var(--border-color)', flex: 1, minWidth: 120 }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#FF6B35' }}>
                    {liveStats.hubs > 0 ? `${liveStats.hubs}+` : 'Active'}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-sub)', fontWeight: 600 }}>Printer Hubs</div>
                </div>
                <div style={{ background: 'var(--bg-card)', padding: '14px 20px', borderRadius: 16, border: '1px solid var(--border-color)', flex: 1, minWidth: 120 }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#10B981' }}>70/15/15</div>
                  <div style={{ fontSize: 12, color: 'var(--text-sub)', fontWeight: 600 }}>Fair Payout Split</div>
                </div>
                <div style={{ background: 'var(--bg-card)', padding: '14px 20px', borderRadius: 16, border: '1px solid var(--border-color)', flex: 1, minWidth: 120 }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#2563eb' }}>Escrow</div>
                  <div style={{ fontSize: 12, color: 'var(--text-sub)', fontWeight: 600 }}>Razorpay Guarded</div>
                </div>
              </div>
            </div>

            {/* 3D WebGL Orbit Viewport */}
            <div style={{ background: 'var(--bg-card)', borderRadius: 28, padding: 16, border: '1px solid var(--border-color)', boxShadow: '0 20px 50px rgba(0,0,0,0.08)', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 24, left: 24, zIndex: 10 }}>
                <span className="ateion-pill" style={{ background: 'rgba(255, 107, 53, 0.12)', color: '#FF6B35', fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Box size={13} /> Live WebGL Model Viewport
                </span>
              </div>
              <Hero3D />
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM STATEMENT */}
      <section className="container section" style={{ padding: '80px 0' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div className="ateion-pill" style={{ color: '#FF6B35', background: 'rgba(255,107,53,0.1)', borderColor: 'rgba(255,107,53,0.3)', marginBottom: 12 }}>The Problem</div>
          <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12, color: 'var(--text-main)' }}>
            Four Gaps. One Ecosystem.
          </h2>
          <p style={{ color: 'var(--text-sub)', maxWidth: 680, margin: '0 auto', fontSize: 15 }}>
            No existing service solves all four sides of 3D printing together — PrintHive bridges buyers, designers, printer hub owners, and material sellers in one unified network.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24 }}>
          {PROBLEMS.map((p) => (
            <div key={p.title} style={{ background: 'var(--bg-card)', padding: 30, borderRadius: 24, border: '1px solid var(--border-color)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ marginBottom: 20 }}>
                <IconBadge>{renderIcon(p.type)}</IconBadge>
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-main)', marginBottom: 8 }}>{p.title}</div>
              <div style={{ fontSize: 14, color: 'var(--text-sub)', lineHeight: 1.7, flex: 1 }}>{p.text}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 4-SIDED ROLE WORKSPACE SWITCHER */}
      <section style={{ padding: '40px 0 80px' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div className="ateion-pill" style={{ marginBottom: 12 }}>🤝 Built For Everyone</div>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-main)', marginBottom: 8 }}>
              Choose Your Role in the PrintHive Network
            </h2>
            <p style={{ color: 'var(--text-sub)', fontSize: 15 }}>
              PrintHive powers buyers, designers, printer owners, and material vendors under one fair 4-sided ecosystem.
            </p>

            {/* Role Tab Buttons */}
            <div style={{ display: 'inline-flex', gap: 8, background: 'var(--bg-card)', padding: 6, borderRadius: 99, border: '1px solid var(--border-color)', marginTop: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => setActiveRoleTab('buyer')}
                style={{
                  padding: '10px 22px',
                  borderRadius: 99,
                  border: 'none',
                  background: activeRoleTab === 'buyer' ? '#FF6B35' : 'transparent',
                  color: activeRoleTab === 'buyer' ? '#fff' : 'var(--text-main)',
                  fontWeight: 700,
                  fontSize: 13.5,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <ShoppingBag size={16} />
                <span>Buyer Portal</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveRoleTab('designer')}
                style={{
                  padding: '10px 22px',
                  borderRadius: 99,
                  border: 'none',
                  background: activeRoleTab === 'designer' ? '#FF6B35' : 'transparent',
                  color: activeRoleTab === 'designer' ? '#fff' : 'var(--text-main)',
                  fontWeight: 700,
                  fontSize: 13.5,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <PenTool size={16} />
                <span>Creator Studio</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveRoleTab('printer')}
                style={{
                  padding: '10px 22px',
                  borderRadius: 99,
                  border: 'none',
                  background: activeRoleTab === 'printer' ? '#FF6B35' : 'transparent',
                  color: activeRoleTab === 'printer' ? '#fff' : 'var(--text-main)',
                  fontWeight: 700,
                  fontSize: 13.5,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Printer size={16} />
                <span>Printer Hub</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveRoleTab('seller')}
                style={{
                  padding: '10px 22px',
                  borderRadius: 99,
                  border: 'none',
                  background: activeRoleTab === 'seller' ? '#FF6B35' : 'transparent',
                  color: activeRoleTab === 'seller' ? '#fff' : 'var(--text-main)',
                  fontWeight: 700,
                  fontSize: 13.5,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Store size={16} />
                <span>Seller &amp; Store</span>
              </button>
            </div>
          </div>

          {/* Active Role Details Box */}
          <div style={{ background: 'var(--bg-card)', borderRadius: 28, border: '1px solid var(--border-color)', padding: 40, boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
            {activeRoleTab === 'buyer' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 32, alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-main)', marginBottom: 12 }}>
                    Get Anything 3D Printed Without Owning a Printer
                  </h3>
                  <p style={{ color: 'var(--text-sub)', fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
                    Browse ready-made products, order custom CAD briefs, or upload your own 3D file on our Slicer page. Payments are held safely in Razorpay escrow until delivery.
                  </p>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <Link href="/browse" className="btn btn-primary" style={{ background: '#FF6B35', color: '#fff', padding: '12px 24px', borderRadius: 99, fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <Box size={16} /> Browse Designs
                    </Link>
                    <Link href="/print-on-demand" className="btn btn-outline" style={{ borderColor: 'var(--border-color)', color: 'var(--text-main)', padding: '12px 24px', borderRadius: 99, textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <Zap size={16} /> Slicer &amp; Upload
                    </Link>
                  </div>
                </div>
                <div style={{ background: 'var(--bg-card-hover)', padding: 28, borderRadius: 20, border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckCircle2 size={16} color="#10B981" /> Buyer Guarantees:
                  </div>
                  <ul style={{ fontSize: 14, color: 'var(--text-sub)', lineHeight: 1.9, paddingLeft: 16, margin: 0 }}>
                    <li>100% Escrow Protected Payments</li>
                    <li>Leaflet GPS Nearby Printer Matching</li>
                    <li>3D WebGL Inspection Before Purchase</li>
                  </ul>
                </div>
              </div>
            )}

            {activeRoleTab === 'designer' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 32, alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-main)', marginBottom: 12 }}>
                    Monetize Your 3D Models &amp; Earn Automatic Royalties
                  </h3>
                  <p style={{ color: 'var(--text-sub)', fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
                    Upload STL/3MF files once. Every time a buyer orders a physical print, you earn a 15% royalty automatically paid out to your wallet upon delivery.
                  </p>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <Link href="/dashboard/designer/upload" className="btn btn-primary" style={{ background: '#FF6B35', color: '#fff', padding: '12px 24px', borderRadius: 99, fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <PenTool size={16} /> Upload 3D Model
                    </Link>
                    <Link href="/dashboard/designer" className="btn btn-outline" style={{ borderColor: 'var(--border-color)', color: 'var(--text-main)', padding: '12px 24px', borderRadius: 99, textDecoration: 'none', fontWeight: 600 }}>
                      Designer Dashboard
                    </Link>
                  </div>
                </div>
                <div style={{ background: 'var(--bg-card-hover)', padding: 28, borderRadius: 20, border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', marginBottom: 8 }}>💰 Creator Payout Share:</div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: '#FF6B35', marginBottom: 6 }}>15% Royalty on Every Order</div>
                  <div style={{ fontSize: 13, color: 'var(--text-sub)' }}>Earn passive income from your designs without handling shipping or hardware.</div>
                </div>
              </div>
            )}

            {activeRoleTab === 'printer' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 32, alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-main)', marginBottom: 12 }}>
                    Turn Idle Printer Hours Into High-Margin Income
                  </h3>
                  <p style={{ color: 'var(--text-sub)', fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
                    List your Bambu Lab, Prusa, or Resin machines. Accept nearby orders matched via Leaflet GPS, print, deliver, and earn 70% per job.
                  </p>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <Link href="/printers" className="btn btn-primary" style={{ background: '#FF6B35', color: '#fff', padding: '12px 24px', borderRadius: 99, fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <MapPin size={16} /> View Printer Hubs Map
                    </Link>
                    <Link href="/dashboard/printer-owner" className="btn btn-outline" style={{ borderColor: 'var(--border-color)', color: 'var(--text-main)', padding: '12px 24px', borderRadius: 99, textDecoration: 'none', fontWeight: 600 }}>
                      Printer Dashboard
                    </Link>
                  </div>
                </div>
                <div style={{ background: 'var(--bg-card-hover)', padding: 28, borderRadius: 20, border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', marginBottom: 8 }}>🖨️ Printer Payout Share:</div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: '#FF6B35', marginBottom: 6 }}>70% Direct Payout</div>
                  <div style={{ fontSize: 13, color: 'var(--text-sub)' }}>Consistent local print job queue sent right to your printer dashboard.</div>
                </div>
              </div>
            )}

            {activeRoleTab === 'seller' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 32, alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-main)', marginBottom: 12 }}>
                    Sell Finished 3D Goods, Filaments &amp; Hardware
                  </h3>
                  <p style={{ color: 'var(--text-sub)', fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
                    Open your digital storefront to sell ready-made 3D printed products, PLA/PETG/ABS spools, UV resins, and printer accessories directly to India&apos;s maker community.
                  </p>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <Link href="/shop" className="btn btn-primary" style={{ background: '#FF6B35', color: '#fff', padding: '12px 24px', borderRadius: 99, fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <Store size={16} /> Explore Marketplace Store
                    </Link>
                    <Link href="/dashboard/seller" className="btn btn-outline" style={{ borderColor: 'var(--border-color)', color: 'var(--text-main)', padding: '12px 24px', borderRadius: 99, textDecoration: 'none', fontWeight: 600 }}>
                      Seller Dashboard
                    </Link>
                  </div>
                </div>
                <div style={{ background: 'var(--bg-card-hover)', padding: 28, borderRadius: 20, border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', marginBottom: 8 }}>🏪 Seller Advantages:</div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: '#FF6B35', marginBottom: 6 }}>Instant Escrow Settlement</div>
                  <div style={{ fontSize: 13, color: 'var(--text-sub)' }}>Direct sales, automatic inventory management, and zero hidden platform listing fees.</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="container section" style={{ padding: '60px 0' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div className="ateion-pill" style={{ marginBottom: 12 }}>Seamless Workflow</div>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-main)' }}>
            From Idea to Doorstep, in Four Steps
          </h2>
        </div>

        <div className="grid grid-cols-4 gap-6">
          {STEPS.map((s) => (
            <div key={s.step} style={{ background: 'var(--bg-card)', padding: 28, borderRadius: 24, border: '1px solid var(--border-color)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
              <div className="step-card-num">
                {s.step}
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-main)', marginBottom: 8 }}>{s.title}</div>
              <div style={{ fontSize: 13, color: 'var(--text-sub)', lineHeight: 1.6 }}>{s.text}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CORE FEATURES GRID */}
      <section className="container section" style={{ padding: '60px 0' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div className="ateion-pill" style={{ marginBottom: 12 }}>What&apos;s Inside</div>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-main)' }}>
            Engineered For Speed, Security & Fair Pay
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} style={{ background: 'var(--bg-card)', padding: 30, borderRadius: 24, border: '1px solid var(--border-color)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
              <div style={{ marginBottom: 16 }}>
                <IconBadge>{renderIcon(f.type)}</IconBadge>
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-main)', marginBottom: 8 }}>{f.title}</div>
              <div style={{ fontSize: 14, color: 'var(--text-sub)', lineHeight: 1.6 }}>{f.text}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA BAND */}
      <section className="container section-sm" style={{ paddingBottom: 80 }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '54px 36px', textAlign: 'center', borderRadius: 28, boxShadow: '0 10px 40px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: 34, fontWeight: 900, marginBottom: 12, color: 'var(--text-main)' }}>
            {isLoggedIn ? 'Welcome Back to PrintHive' : 'Ready to Print Something Real?'}
          </h2>
          <p style={{ color: 'var(--text-sub)', marginBottom: 32, fontSize: 16 }}>
            {isLoggedIn
              ? 'Explore active 3D designs, upload custom models, or manage your orders and earnings.'
              : 'Join PrintHive today — no printer, no CAD software, no hassle.'}
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            {isLoggedIn ? (
              <>
                <Link href="/dashboard/buyer" className="btn btn-primary btn-lg" style={{ background: '#FF6B35', color: '#fff', padding: '14px 36px', borderRadius: 99, fontWeight: 800, textDecoration: 'none', boxShadow: '0 4px 16px rgba(255,107,53,0.35)', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <ShoppingBag size={18} /> Go to My Dashboard
                </Link>
                <Link href="/shop" className="btn btn-outline btn-lg" style={{ borderColor: 'var(--border-color)', color: 'var(--text-main)', padding: '14px 32px', borderRadius: 99, background: 'var(--bg-card-hover)', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <Box size={18} /> Explore 3D Marketplace
                </Link>
              </>
            ) : (
              <>
                <Link href="/signup" className="btn btn-primary btn-lg" style={{ background: '#FF6B35', color: '#fff', padding: '14px 36px', borderRadius: 99, fontWeight: 800, textDecoration: 'none', boxShadow: '0 4px 16px rgba(255,107,53,0.35)' }}>
                  Create Free Account
                </Link>
                <Link
                  href="/login"
                  className="btn btn-outline btn-lg"
                  style={{ borderColor: 'var(--border-color)', color: 'var(--text-main)', padding: '14px 32px', borderRadius: 99, background: 'var(--bg-card-hover)', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8 }}
                >
                  Log In to Account &rarr;
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}