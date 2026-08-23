'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

import { createClient } from '@/utils/supabase/client'

const Hero3D = dynamic(() => import('@/components/Hero3D'), {
  ssr: false,
  loading: () => (
    <div style={{ height: 420, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-sub)', fontSize: 13, fontWeight: 700 }}>
      ⚡ Initializing 3D Canvas Engine...
    </div>
  ),
})

const PROBLEMS = [
  {
    icon: '🛒',
    iconClass: 'feature-icon-success',
    title: 'Buyers',
    text: "Can't access custom 3D printed products without owning a ₹15,000–₹80,000 printer or learning CAD. Existing commercial services are expensive and unverified.",
  },
  {
    icon: '🎨',
    iconClass: 'feature-icon-primary',
    title: 'Designers',
    text: 'Publish high-quality models on open platforms for free, with no automatic monetization, copyright protection, or marketplace connecting designs to buyers.',
  },
  {
    icon: '🖨️',
    iconClass: 'feature-icon-info',
    title: 'Printer Owners',
    text: 'Own 3D printers that sit idle 18–20 hours a day, with no organized local system to find print jobs, manage orders, or earn consistent income.',
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
  { icon: '🧠', title: 'Gemini AI Intelligence', text: 'Natural language search, automated description generator, and instant material slicer cost calculator.' },
  { icon: '🧊', title: 'In-Browser 3D Viewport', text: 'Real-time Three.js WebGL viewer lets buyers inspect model geometry, wireframes, and slice readiness.' },
  { icon: '📍', title: 'Nearby Geolocation Matching', text: 'Leaflet.js + OpenStreetMap engine connects orders to closest active printer hubs without high shipping fees.' },
  { icon: '🔒', title: 'Razorpay Escrow Protection', text: 'Escrow holds buyer funds securely until physical delivery is verified by the customer.' },
  { icon: '⚡', title: 'Supabase Realtime Tracking', text: 'Live websocket status pushing from slicing, printing, quality check, to courier dispatch.' },
  { icon: '⭐', title: 'Verified Print Community', text: 'Authentic buyer photos and star ratings build verified seller reputations.' },
]

export default function Home() {
  const supabase = createClient()
  const [aiSearchQuery, setAiSearchQuery] = useState('')
  const [activeRoleTab, setActiveRoleTab] = useState<'buyer' | 'designer' | 'printer'>('buyer')
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // Detect logged in state
  useEffect(() => {
    async function checkAuth() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setIsLoggedIn(true)
        }
      } catch (e) {
        // guest mode
      }
    }
    checkAuth()
  }, [])

  return (
    <main style={{ minHeight: '100vh', transition: 'background 0.3s ease' }}>
      <Navbar />

      {/* HERO SECTION — SLEEK & CLEAN ATEION STYLE */}
      <section className="grid-pattern-bg" style={{ padding: '70px 0 60px', position: 'relative', overflow: 'hidden' }}>
        <div className="container">
          <div className="hero-grid" style={{ alignItems: 'center' }}>
            <div>
              <div className="ateion-pill" style={{ marginBottom: 24 }}>
                ⚡ AI-Powered Hybrid 3D Commerce Platform
              </div>
              
              <h1 style={{ fontSize: '3.25rem', fontWeight: 900, lineHeight: 1.12, marginBottom: 20, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                Where Ideas Become{' '}
                <span style={{ color: '#ea580c', background: 'linear-gradient(135deg, #ea580c, #f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Physical Products
                </span>
              </h1>

              <p style={{ fontSize: 17, color: 'var(--text-sub)', lineHeight: 1.7, marginBottom: 36, maxWidth: 540 }}>
                PrintHive bridges designers, local 3D printer owners, and buyers — order custom 3D prints, sell STL files, or monetize your idle 3D printers with escrow security.
              </p>

              {/* Gemini AI Natural Language Search Bar */}
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 99, padding: '8px 8px 8px 20px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40, boxShadow: '0 8px 30px rgba(0,0,0,0.06)' }}>
                <span style={{ fontSize: 18 }}>✨</span>
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
                  style={{ background: '#ea580c', color: '#fff', border: 'none', borderRadius: 99, padding: '12px 24px', fontWeight: 700, fontSize: 13, textDecoration: 'none', whiteSpace: 'nowrap' }}
                >
                  AI Search
                </Link>
              </div>

              {/* Quick Feature Stats */}
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ background: 'var(--bg-card)', padding: '14px 20px', borderRadius: 16, border: '1px solid var(--border-color)', flex: 1, minWidth: 120 }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#ea580c' }}>3-Sided</div>
                  <div style={{ fontSize: 12, color: 'var(--text-sub)', fontWeight: 600 }}>Marketplace</div>
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
                <span className="ateion-pill" style={{ background: 'rgba(234, 88, 12, 0.12)', color: '#ea580c', fontSize: 11 }}>
                  🧊 Live WebGL Model Viewport
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
          <div className="ateion-pill" style={{ color: '#d97706', background: 'rgba(217,119,6,0.1)', borderColor: 'rgba(217,119,6,0.3)', marginBottom: 12 }}>The Problem</div>
          <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12, color: 'var(--text-main)' }}>
            Three Gaps. One Ecosystem.
          </h2>
          <p style={{ color: 'var(--text-sub)', maxWidth: 640, margin: '0 auto', fontSize: 15 }}>
            No existing service solves all three sides of 3D printing together — PrintHive bridges buyers, designers, and printer owners in one place.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {PROBLEMS.map((p) => (
            <div key={p.title} style={{ background: 'var(--bg-card)', padding: 32, borderRadius: 24, border: '1px solid var(--border-color)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
              <div className={`feature-icon ${p.iconClass}`} style={{ fontSize: 24, marginBottom: 16 }}>{p.icon}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-main)', marginBottom: 8 }}>{p.title}</div>
              <div style={{ fontSize: 14, color: 'var(--text-sub)', lineHeight: 1.7 }}>{p.text}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 3-SIDED ROLE WORKSPACE SWITCHER */}
      <section style={{ padding: '40px 0 80px' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div className="ateion-pill" style={{ marginBottom: 12 }}>🤝 Built For Everyone</div>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-main)', marginBottom: 8 }}>
              Choose Your Role in the PrintHive Network
            </h2>
            <p style={{ color: 'var(--text-sub)', fontSize: 15 }}>
              PrintHive powers buyers, designers, and printer owners under one fair 70/15/15 ecosystem.
            </p>

            {/* Role Tab Buttons */}
            <div style={{ display: 'inline-flex', gap: 8, background: 'var(--bg-card)', padding: 6, borderRadius: 99, border: '1px solid var(--border-color)', marginTop: 20 }}>
              <button
                type="button"
                onClick={() => setActiveRoleTab('buyer')}
                style={{
                  padding: '10px 24px',
                  borderRadius: 99,
                  border: 'none',
                  background: activeRoleTab === 'buyer' ? '#10B981' : 'transparent',
                  color: activeRoleTab === 'buyer' ? '#fff' : 'var(--text-main)',
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                🛒 Buyer
              </button>
              <button
                type="button"
                onClick={() => setActiveRoleTab('designer')}
                style={{
                  padding: '10px 24px',
                  borderRadius: 99,
                  border: 'none',
                  background: activeRoleTab === 'designer' ? '#ea580c' : 'transparent',
                  color: activeRoleTab === 'designer' ? '#fff' : 'var(--text-main)',
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                🎨 3D Designer
              </button>
              <button
                type="button"
                onClick={() => setActiveRoleTab('printer')}
                style={{
                  padding: '10px 24px',
                  borderRadius: 99,
                  border: 'none',
                  background: activeRoleTab === 'printer' ? '#2563eb' : 'transparent',
                  color: activeRoleTab === 'printer' ? '#fff' : 'var(--text-main)',
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                🖨️ Printer Owner
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
                    <Link href="/browse" className="btn btn-primary" style={{ background: '#10B981', color: '#fff', padding: '12px 24px', borderRadius: 99, fontWeight: 700, textDecoration: 'none' }}>
                      Browse Designs
                    </Link>
                    <Link href="/print-on-demand" className="btn btn-outline" style={{ borderColor: 'var(--border-color)', color: 'var(--text-main)', padding: '12px 24px', borderRadius: 99, textDecoration: 'none', fontWeight: 600 }}>
                      Slicer & Upload
                    </Link>
                  </div>
                </div>
                <div style={{ background: 'var(--bg-card-hover)', padding: 28, borderRadius: 20, border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', marginBottom: 12 }}>✅ Buyer Guarantees:</div>
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
                    Monetize Your 3D Models & Earn Automatic Royalties
                  </h3>
                  <p style={{ color: 'var(--text-sub)', fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
                    Upload STL/3MF files once. Every time a buyer orders a physical print, you earn a 15% royalty automatically paid out to your wallet upon delivery.
                  </p>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <Link href="/dashboard/designer/upload" className="btn btn-primary" style={{ background: '#ea580c', color: '#fff', padding: '12px 24px', borderRadius: 99, fontWeight: 700, textDecoration: 'none' }}>
                      Upload 3D Model
                    </Link>
                    <Link href="/dashboard/designer/earnings" className="btn btn-outline" style={{ borderColor: 'var(--border-color)', color: 'var(--text-main)', padding: '12px 24px', borderRadius: 99, textDecoration: 'none', fontWeight: 600 }}>
                      Royalty Calculator
                    </Link>
                  </div>
                </div>
                <div style={{ background: 'var(--bg-card-hover)', padding: 28, borderRadius: 20, border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', marginBottom: 8 }}>💰 Creator Payout Share:</div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: '#ea580c', marginBottom: 6 }}>15% Royalty on Every Order</div>
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
                    <Link href="/printers" className="btn btn-primary" style={{ background: '#2563eb', color: '#fff', padding: '12px 24px', borderRadius: 99, fontWeight: 700, textDecoration: 'none' }}>
                      View Printer Hubs Map
                    </Link>
                    <Link href="/dashboard/printer-owner/register" className="btn btn-outline" style={{ borderColor: 'var(--border-color)', color: 'var(--text-main)', padding: '12px 24px', borderRadius: 99, textDecoration: 'none', fontWeight: 600 }}>
                      Register Machine
                    </Link>
                  </div>
                </div>
                <div style={{ background: 'var(--bg-card-hover)', padding: 28, borderRadius: 20, border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', marginBottom: 8 }}>🖨️ Printer Payout Share:</div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: '#2563eb', marginBottom: 6 }}>70% Direct Payout</div>
                  <div style={{ fontSize: 13, color: 'var(--text-sub)' }}>Consistent local print job queue sent right to your printer dashboard.</div>
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
              <div style={{ fontSize: 28, marginBottom: 16 }}>{f.icon}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-main)', marginBottom: 8 }}>{f.title}</div>
              <div style={{ fontSize: 14, color: 'var(--text-sub)', lineHeight: 1.6 }}>{f.text}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA BAND — AUTH AWARE */}
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
                <Link href="/dashboard/buyer" className="btn btn-primary btn-lg" style={{ background: '#ea580c', color: '#fff', padding: '14px 36px', borderRadius: 99, fontWeight: 800, textDecoration: 'none', boxShadow: '0 4px 16px rgba(234,88,12,0.35)' }}>
                  🚀 Go to My Dashboard
                </Link>
                <Link href="/shop" className="btn btn-outline btn-lg" style={{ borderColor: 'var(--border-color)', color: 'var(--text-main)', padding: '14px 32px', borderRadius: 99, background: 'var(--bg-card-hover)', textDecoration: 'none', fontWeight: 600 }}>
                  🛒 Explore 3D Marketplace
                </Link>
              </>
            ) : (
              <>
                <Link href="/signup" className="btn btn-primary btn-lg" style={{ background: '#ea580c', color: '#fff', padding: '14px 36px', borderRadius: 99, fontWeight: 800, textDecoration: 'none', boxShadow: '0 4px 16px rgba(234,88,12,0.35)' }}>
                  Create Free Account
                </Link>
                <button
                  onClick={() => {
                    document.cookie = 'printhive_guest_role=buyer; path=/; max-age=604800'
                    document.cookie = 'printhive_auth_role=buyer; path=/; max-age=604800'
                    window.location.href = '/dashboard/buyer'
                  }}
                  className="btn btn-outline btn-lg"
                  style={{ borderColor: 'var(--border-color)', color: 'var(--text-main)', padding: '14px 32px', borderRadius: 99, background: 'var(--bg-card-hover)', textDecoration: 'none', fontWeight: 600, cursor: 'pointer' }}
                >
                  Try Demo / Guest Login
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}