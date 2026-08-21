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
      Initializing Studio 3D Canvas Engine...
    </div>
  ),
})

const PROBLEMS = [
  {
    type: 'buyer',
    title: 'Buyers & Consumers',
    text: "Can't access custom 3D printed products without owning a ₹15,000–₹80,000 printer or learning CAD. Commercial print services are slow and unverified.",
  },
  {
    type: 'designer',
    title: '3D Creators & Designers',
    text: 'Publish high-quality CAD models on open platforms with no automated royalty payouts, copyright protection, or direct manufacturing connection.',
  },
  {
    type: 'printer',
    title: 'Printer Owners & Makers',
    text: 'Own precision 3D printers that sit idle 18–20 hours a day, with no local order dispatch engine to find print jobs or earn passive revenue.',
  },
]

const STEPS = [
  {
    step: '01',
    title: 'Creators Upload CAD',
    text: 'Designers publish STL/3MF models with render previews, setting automated royalty rates for every print order.',
  },
  {
    step: '02',
    title: 'Buyers Order in 3D',
    text: 'Customers inspect models in real-time WebGL, configure materials, and place orders secured by Razorpay Escrow.',
  },
  {
    step: '03',
    title: 'Local Hubs Fulfill',
    text: 'Geolocation routes print jobs to closest verified printer owners for precision slicing and fast doorstep delivery.',
  },
  {
    step: '04',
    title: 'Automated Escrow Payouts',
    text: 'Upon delivery verification, Escrow automatically splits payouts: 70% Printer Hub, 15% Creator Royalty, 15% Platform.',
  },
]

const FEATURES = [
  { type: 'ai', title: 'Gemini AI Intelligence', text: 'Natural language search, automated description generator, and instant material slicer cost calculator.' },
  { type: '3d', title: 'In-Browser 3D Viewport', text: 'Real-time Three.js WebGL viewer lets buyers inspect model geometry, wireframes, and slice readiness.' },
  { type: 'gps', title: 'Nearby Geolocation Matching', text: 'Leaflet.js + OpenStreetMap engine connects orders to closest active printer hubs without high shipping fees.' },
  { type: 'escrow', title: 'Razorpay Escrow Protection', text: 'Escrow holds buyer funds securely until physical delivery is verified by the customer.' },
  { type: 'realtime', title: 'Supabase Realtime Tracking', text: 'Live websocket status pushing from slicing, printing, quality check, to courier dispatch.' },
  { type: 'community', title: 'Verified Print Community', text: 'Authentic buyer photos and star ratings build verified seller reputations.' },
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

      {/* HERO SECTION */}
      <section className="grid-pattern-bg" style={{ padding: '75px 0 65px', position: 'relative', overflow: 'hidden' }}>
        <div className="container">
          <div className="hero-grid" style={{ alignItems: 'center' }}>
            <div>
              <div className="ateion-pill" style={{ marginBottom: 24, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                <span>AI-Powered Capability 3D Commerce Platform</span>
              </div>
              
              <h1 style={{ fontSize: '3.35rem', fontWeight: 900, lineHeight: 1.12, marginBottom: 20, color: 'var(--text-main)', letterSpacing: '-0.025em' }}>
                Where CAD Models Become{' '}
                <span style={{ color: '#FF6B35', background: 'linear-gradient(135deg, #FF6B35 0%, #F97316 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Precision Products
                </span>
              </h1>

              <p style={{ fontSize: 17, color: 'var(--text-sub)', lineHeight: 1.7, marginBottom: 36, maxWidth: 540 }}>
                PrintHive connects 3D creators, local printer owners, and buyers. Order custom 3D prints, license CAD models, or monetize idle 3D printers with escrow security.
              </p>

              {/* Gemini AI Natural Language Search Bar */}
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 99, padding: '8px 8px 8px 20px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40, boxShadow: '0 8px 30px rgba(0,0,0,0.06)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Ask Gemini AI: 'Find a heavy-duty phone mount in PLA'..."
                  value={aiSearchQuery}
                  onChange={(e) => setAiSearchQuery(e.target.value)}
                  style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--text-main)', fontSize: 14, outline: 'none' }}
                />
                <Link
                  href={aiSearchQuery ? `/browse?q=${encodeURIComponent(aiSearchQuery)}` : '/browse'}
                  className="btn btn-primary"
                  style={{ background: '#FF6B35', color: '#fff', border: 'none', borderRadius: 99, padding: '12px 24px', fontWeight: 800, fontSize: 13, textDecoration: 'none', whiteSpace: 'nowrap' }}
                >
                  AI Search
                </Link>
              </div>

              {/* Quick Feature Stats */}
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ background: 'var(--bg-card)', padding: '16px 22px', borderRadius: 16, border: '1px solid var(--border-color)', flex: 1, minWidth: 130 }}>
                  <div style={{ fontSize: 24, fontWeight: 900, color: '#FF6B35', letterSpacing: '-0.5px' }}>3-Sided</div>
                  <div style={{ fontSize: 12, color: 'var(--text-sub)', fontWeight: 700 }}>Network Mesh</div>
                </div>
                <div style={{ background: 'var(--bg-card)', padding: '16px 22px', borderRadius: 16, border: '1px solid var(--border-color)', flex: 1, minWidth: 130 }}>
                  <div style={{ fontSize: 24, fontWeight: 900, color: '#10B981', letterSpacing: '-0.5px' }}>70/15/15</div>
                  <div style={{ fontSize: 12, color: 'var(--text-sub)', fontWeight: 700 }}>Fair Escrow Split</div>
                </div>
                <div style={{ background: 'var(--bg-card)', padding: '16px 22px', borderRadius: 16, border: '1px solid var(--border-color)', flex: 1, minWidth: 130 }}>
                  <div style={{ fontSize: 24, fontWeight: 900, color: '#2563EB', letterSpacing: '-0.5px' }}>Escrow</div>
                  <div style={{ fontSize: 12, color: 'var(--text-sub)', fontWeight: 700 }}>Razorpay Protected</div>
                </div>
              </div>
            </div>

            {/* 3D WebGL Orbit Viewport */}
            <div style={{ background: 'var(--bg-card)', borderRadius: 28, padding: 16, border: '1px solid var(--border-color)', boxShadow: '0 20px 50px rgba(0,0,0,0.08)', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 24, left: 24, zIndex: 10 }}>
                <span className="ateion-pill" style={{ background: 'rgba(255, 107, 53, 0.12)', color: '#FF6B35', fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                  Studio 3D WebGL Viewport
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
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,107,53,0.1)', color: '#FF6B35', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                {p.type === 'buyer' ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                  </svg>
                ) : p.type === 'designer' ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 19l7-7 3 3-7 7-3-3z" />
                    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                  </svg>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 6 2 18 2 18 9" />
                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                    <rect x="6" y="14" width="12" height="8" />
                  </svg>
                )}
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-main)', marginBottom: 8 }}>{p.title}</div>
              <div style={{ fontSize: 14, color: 'var(--text-sub)', lineHeight: 1.7 }}>{p.text}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 3-SIDED ROLE WORKSPACE SWITCHER */}
      <section style={{ padding: '40px 0 80px' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div className="ateion-pill" style={{ marginBottom: 12 }}>Network Architecture</div>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-main)', marginBottom: 8 }}>
              Choose Your Role in the PrintHive Mesh
            </h2>
            <p style={{ color: 'var(--text-sub)', fontSize: 15 }}>
              PrintHive connects buyers, creators, and local printer hubs under one fair 70/15/15 ecosystem.
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
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                Buyer Portal
              </button>
              <button
                type="button"
                onClick={() => setActiveRoleTab('designer')}
                style={{
                  padding: '10px 24px',
                  borderRadius: 99,
                  border: 'none',
                  background: activeRoleTab === 'designer' ? '#FF6B35' : 'transparent',
                  color: activeRoleTab === 'designer' ? '#fff' : 'var(--text-main)',
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                Creator Studio
              </button>
              <button
                type="button"
                onClick={() => setActiveRoleTab('printer')}
                style={{
                  padding: '10px 24px',
                  borderRadius: 99,
                  border: 'none',
                  background: activeRoleTab === 'printer' ? '#2563EB' : 'transparent',
                  color: activeRoleTab === 'printer' ? '#fff' : 'var(--text-main)',
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                Printer Hub
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
              <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(255,107,53,0.1)', color: '#FF6B35', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                {f.type === 'ai' ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                ) : f.type === '3d' ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                ) : f.type === 'gps' ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                ) : f.type === 'escrow' ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                ) : f.type === 'realtime' ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                )}
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-main)', marginBottom: 8 }}>{f.title}</div>
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