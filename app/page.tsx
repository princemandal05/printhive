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
  Layers,
  Star,
  Lock,
} from 'lucide-react'

const Hero3D = dynamic(() => import('@/components/Hero3D'), {
  ssr: false,
  loading: () => (
    <div style={{ height: 420, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: 13, fontWeight: 700 }}>
      ⚡ Initializing 3D Interactive Canvas...
    </div>
  ),
})

function IconBadge({ children, color = '#F97316' }: { children: React.ReactNode; color?: string }) {
  return (
    <div
      style={{
        width: 48,
        height: 48,
        borderRadius: 16,
        background: 'rgba(249, 115, 22, 0.1)',
        border: '1px solid rgba(249, 115, 22, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: '0 4px 12px rgba(249, 115, 22, 0.12)',
      }}
    >
      {children}
    </div>
  )
}

const PROBLEMS = [
  {
    type: 'buyer',
    title: 'For Buyers',
    text: "Can't access custom 3D printed products without owning a ₹15,000–₹80,000 printer or learning CAD. Existing commercial services are slow, expensive, and unverified.",
    tag: 'No Hardware Needed',
    color: '#F97316',
  },
  {
    type: 'designer',
    title: 'For CAD Designers',
    text: 'Publish high-quality models on open platforms for free, with no automatic monetization, copyright protection, or marketplace connecting designs directly to buyers.',
    tag: '15% Automated Royalty',
    color: '#7C3AED',
  },
  {
    type: 'printer',
    title: 'For Printer Hubs',
    text: 'Own 3D printers that sit idle 18–20 hours a day, with no organized local system to find print jobs, manage orders, or earn consistent high-margin income.',
    tag: '70% Per Order Share',
    color: '#16A34A',
  },
]

const STEPS = [
  {
    step: '01',
    title: 'Designers Upload CAD',
    text: 'Creators upload STL/3MF files with render photos and pricing, earning automated 15% royalties on every print order.',
  },
  {
    step: '02',
    title: 'Buyers Discover & Order',
    text: 'Customers browse visual feeds, inspect models in 360° Three.js WebGL, and place custom orders with escrow protection.',
  },
  {
    step: '03',
    title: 'Nearby Printers Deliver',
    text: 'Leaflet GPS matches orders to nearby verified printer owners for fast precision slicing and doorstep delivery.',
  },
  {
    step: '04',
    title: 'Automated Escrow Payouts',
    text: 'Upon delivery confirmation, Razorpay escrow releases payments: 70% Printer, 15% Designer, 15% Platform.',
  },
]

const FEATURES = [
  {
    type: 'ai',
    title: 'Gemini AI Intelligence',
    text: 'Natural language search, automated description generator, and instant material slicer cost calculator.',
  },
  {
    type: 'viewport',
    title: 'In-Browser 3D Viewport',
    text: 'Real-time Three.js WebGL viewer lets buyers inspect model geometry, wireframes, and slice readiness.',
  },
  {
    type: 'geo',
    title: 'Nearby Geolocation Matching',
    text: 'Leaflet.js + OpenStreetMap engine connects orders to closest active printer hubs without high shipping fees.',
  },
  {
    type: 'escrow',
    title: 'Razorpay Escrow Protection',
    text: 'Escrow holds buyer funds securely until physical delivery is verified and approved by the customer.',
  },
  {
    type: 'slicer',
    title: 'Automated 3D Slicing Engine',
    text: 'Instant bounding box calculation, infill density tuning, and layer time estimation for all CAD files.',
  },
  {
    type: 'creator',
    title: 'Designer Royalty Wallet',
    text: 'Transparent royalty ledger with direct bank payouts for digital model creators across the globe.',
  },
]

export default function Home() {
  const [activeRoleTab, setActiveRoleTab] = useState<'buyer' | 'designer' | 'printer'>('buyer')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user)
    })
  }, [])

  return (
    <main style={{ minHeight: '100vh', background: '#FAF6F1', color: '#1A1A2E', fontFamily: 'inherit' }}>
      <Navbar />

      {/* 1. HERO SECTION WITH 3D ORB (printhive.org styling + PrintHive structure) */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '40px 24px 60px' }}>
        {/* Soft Ambient Glows */}
        <div style={{ position: 'absolute', top: 20, left: '-8%', width: 480, height: 480, borderRadius: '50%', background: 'rgba(251, 146, 60, 0.15)', filter: 'blur(90px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 120, right: '-5%', width: 440, height: 440, borderRadius: '50%', background: 'rgba(254, 215, 170, 0.3)', filter: 'blur(90px)', pointerEvents: 'none' }} />

        <div
          style={{
            maxWidth: 1360,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '1.15fr 1fr',
            gap: 48,
            alignItems: 'center',
          }}
          className="hero-grid"
        >
          {/* HERO TEXT */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 800, color: '#EA580C', background: 'rgba(234, 88, 12, 0.1)', padding: '6px 16px', borderRadius: 9999, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 18 }}>
              <span>✦</span> Capability-Based 3D Commerce Platform
            </div>

            <h1
              style={{
                fontFamily: 'var(--font-fraunces), Fraunces, Georgia, serif',
                fontSize: 'clamp(38px, 5vw, 64px)',
                fontWeight: 900,
                color: '#1A1A2E',
                lineHeight: 1.04,
                margin: '0 0 20px',
                letterSpacing: '-1.2px',
              }}
            >
              Where ideas become <span style={{ color: '#F97316' }}>products.</span>
            </h1>

            <p style={{ fontSize: 'clamp(15px, 1.25vw, 18px)', lineHeight: 1.65, color: '#64748B', maxWidth: 520, margin: '0 0 32px' }}>
              PrintHive connects 3D model designers, printer owners, and buyers on a capability-based 3D printing marketplace with 70/15/15 Escrow protection.
            </p>

            {/* ACTION BUTTONS */}
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center', marginBottom: 32 }}>
              <Link
                href="/shop"
                style={{
                  background: '#F97316',
                  color: '#FFFFFF',
                  padding: '14px 30px',
                  borderRadius: 9999,
                  fontSize: 15,
                  fontWeight: 800,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 4px 16px rgba(249,115,22,0.4)',
                  transition: 'transform 0.15s ease',
                }}
              >
                <ShoppingBag size={18} /> Explore Marketplace
              </Link>

              <Link
                href="/print-on-demand"
                style={{
                  background: '#FFFFFF',
                  color: '#1A1A2E',
                  border: '1px solid #E2E8F0',
                  padding: '14px 26px',
                  borderRadius: 9999,
                  fontSize: 15,
                  fontWeight: 700,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                }}
              >
                <Zap size={18} color="#F97316" /> Instant 3D Slicer
              </Link>
            </div>

            {/* RATING BADGE */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ display: 'flex', gap: 2 }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="#F59E0B" color="#F59E0B" />
                ))}
              </div>
              <span style={{ fontSize: 14, fontWeight: 800, color: '#1A1A2E' }}>4.9</span>
              <span style={{ fontSize: 13, color: '#64748B' }}>· Verified print makers & CAD creators across India</span>
            </div>
          </div>

          {/* 3D ORB HERO CARD */}
          <div style={{ position: 'relative' }}>
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(254, 232, 214, 0.75) 0%, rgba(253, 246, 238, 0.95) 100%)',
                borderRadius: 36,
                border: '1px solid rgba(249, 115, 22, 0.25)',
                padding: 16,
                boxShadow: '0 20px 50px rgba(249, 115, 22, 0.14)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px 0' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 800, color: '#EA580C', background: '#FFFFFF', padding: '4px 14px', borderRadius: 9999, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                  <Sparkles size={13} color="#F97316" /> Three.js WebGL Viewport
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8' }}>Drag to rotate</span>
              </div>

              {/* THREE.JS ORB VIEWPORT */}
              <div style={{ height: 380, width: '100%' }}>
                <Hero3D />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE 3-SIDED CHALLENGE / PROBLEMS SECTION */}
      <section style={{ maxWidth: 1360, margin: '0 auto', padding: '40px 24px 60px' }}>
        <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 40px' }}>
          <span style={{ fontSize: 11.5, fontWeight: 800, color: '#EA580C', textTransform: 'uppercase', letterSpacing: 1.2 }}>
            The 3-Sided Problem
          </span>
          <h2 style={{ fontFamily: 'var(--font-fraunces), Fraunces, Georgia, serif', fontSize: 34, fontWeight: 800, color: '#1A1A2E', margin: '6px 0 10px', letterSpacing: '-0.5px' }}>
            Why 3D printing is broken for everyone
          </h2>
          <p style={{ fontSize: 15, color: '#64748B', margin: 0 }}>
            Buyers lack access, designers lack monetization, and printer owners lack orders.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
          {PROBLEMS.map((p) => (
            <div
              key={p.type}
              style={{
                background: '#FFFFFF',
                borderRadius: 28,
                border: '1px solid #F0ECE6',
                padding: 32,
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(249, 115, 22, 0.08)', color: p.color, fontSize: 11, fontWeight: 800, padding: '4px 12px', borderRadius: 9999, marginBottom: 14 }}>
                  {p.tag}
                </div>
                <h3 style={{ fontFamily: 'var(--font-fraunces), Fraunces, Georgia, serif', fontSize: 22, fontWeight: 800, color: '#1A1A2E', margin: '0 0 10px' }}>
                  {p.title}
                </h3>
                <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.6, margin: 0 }}>
                  {p.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. INTERACTIVE 3-WAY ROLE SWITCHER */}
      <section style={{ maxWidth: 1360, margin: '0 auto', padding: '40px 24px 60px' }}>
        <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 36px' }}>
          <span style={{ fontSize: 11.5, fontWeight: 800, color: '#EA580C', textTransform: 'uppercase', letterSpacing: 1.2 }}>
            One Platform, Three Roles
          </span>
          <h2 style={{ fontFamily: 'var(--font-fraunces), Fraunces, Georgia, serif', fontSize: 34, fontWeight: 800, color: '#1A1A2E', margin: '6px 0 10px', letterSpacing: '-0.5px' }}>
            Choose your PrintHive workspace
          </h2>
        </div>

        {/* ROLE TABS */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 32 }}>
          <button
            type="button"
            onClick={() => setActiveRoleTab('buyer')}
            style={{
              padding: '10px 24px',
              borderRadius: 9999,
              fontSize: 14,
              fontWeight: 700,
              border: activeRoleTab === 'buyer' ? '1px solid #F97316' : '1px solid #E2E8F0',
              background: activeRoleTab === 'buyer' ? '#F97316' : '#FFFFFF',
              color: activeRoleTab === 'buyer' ? '#FFFFFF' : '#1A1A2E',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: activeRoleTab === 'buyer' ? '0 4px 14px rgba(249, 115, 22, 0.3)' : '0 2px 6px rgba(0,0,0,0.03)',
            }}
          >
            <ShoppingBag size={16} /> I Want to Buy 3D Items
          </button>

          <button
            type="button"
            onClick={() => setActiveRoleTab('designer')}
            style={{
              padding: '10px 24px',
              borderRadius: 9999,
              fontSize: 14,
              fontWeight: 700,
              border: activeRoleTab === 'designer' ? '1px solid #7C3AED' : '1px solid #E2E8F0',
              background: activeRoleTab === 'designer' ? '#7C3AED' : '#FFFFFF',
              color: activeRoleTab === 'designer' ? '#FFFFFF' : '#1A1A2E',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: activeRoleTab === 'designer' ? '0 4px 14px rgba(124, 58, 237, 0.3)' : '0 2px 6px rgba(0,0,0,0.03)',
            }}
          >
            <PenTool size={16} /> I Design 3D Models (15% Royalty)
          </button>

          <button
            type="button"
            onClick={() => setActiveRoleTab('printer')}
            style={{
              padding: '10px 24px',
              borderRadius: 9999,
              fontSize: 14,
              fontWeight: 700,
              border: activeRoleTab === 'printer' ? '1px solid #16A34A' : '1px solid #E2E8F0',
              background: activeRoleTab === 'printer' ? '#16A34A' : '#FFFFFF',
              color: activeRoleTab === 'printer' ? '#FFFFFF' : '#1A1A2E',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: activeRoleTab === 'printer' ? '0 4px 14px rgba(22, 163, 74, 0.3)' : '0 2px 6px rgba(0,0,0,0.03)',
            }}
          >
            <Printer size={16} /> I Own 3D Printers (70% Share)
          </button>
        </div>

        {/* ROLE CONTENT BOX */}
        <div style={{ background: '#FFFFFF', borderRadius: 28, border: '1px solid #F0ECE6', padding: '36px 40px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          {activeRoleTab === 'buyer' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 36, alignItems: 'center' }} className="role-content-grid">
              <div>
                <h3 style={{ fontFamily: 'var(--font-fraunces), Fraunces, Georgia, serif', fontSize: 26, fontWeight: 800, color: '#1A1A2E', marginBottom: 12 }}>
                  Order Custom 3D Prints Delivered Right to Your Door
                </h3>
                <p style={{ color: '#64748B', fontSize: 14.5, lineHeight: 1.65, marginBottom: 24 }}>
                  Browse ready-made physical products, explore digital 3D libraries, or upload your own STL file to our automated slicer. Matched locally to nearby print hubs.
                </p>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <Link href="/shop" style={{ background: '#F97316', color: '#fff', padding: '12px 24px', borderRadius: 9999, fontWeight: 800, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, boxShadow: '0 4px 12px rgba(249,115,22,0.3)' }}>
                    <ShoppingBag size={16} /> Browse Products
                  </Link>
                  <Link href="/print-on-demand" style={{ background: '#FAF6F1', border: '1px solid #E2E8F0', color: '#1A1A2E', padding: '12px 24px', borderRadius: 9999, textDecoration: 'none', fontWeight: 700 }}>
                    Upload STL File
                  </Link>
                </div>
              </div>
              <div style={{ background: '#FAF6F1', padding: 28, borderRadius: 24, border: '1px solid #F0ECE6' }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#1A1A2E', marginBottom: 6 }}>🛡️ Escrow Guarantee:</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#F97316', marginBottom: 6 }}>100% Buyer Protection</div>
                <div style={{ fontSize: 13, color: '#64748B', lineHeight: 1.5 }}>Payments held safely in Razorpay escrow until physical delivery is verified.</div>
              </div>
            </div>
          )}

          {activeRoleTab === 'designer' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 36, alignItems: 'center' }} className="role-content-grid">
              <div>
                <h3 style={{ fontFamily: 'var(--font-fraunces), Fraunces, Georgia, serif', fontSize: 26, fontWeight: 800, color: '#1A1A2E', marginBottom: 12 }}>
                  Monetize Your 3D Models with Automatic Royalties
                </h3>
                <p style={{ color: '#64748B', fontSize: 14.5, lineHeight: 1.65, marginBottom: 24 }}>
                  Upload your STL/3MF files once. Every time a buyer orders a physical print of your design, you earn automated 15% royalties without managing printers or shipping.
                </p>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <Link href="/dashboard/designer/upload" style={{ background: '#7C3AED', color: '#fff', padding: '12px 24px', borderRadius: 9999, fontWeight: 800, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, boxShadow: '0 4px 12px rgba(124,58,237,0.3)' }}>
                    <PenTool size={16} /> Upload 3D Model
                  </Link>
                  <Link href="/dashboard/designer" style={{ background: '#FAF6F1', border: '1px solid #E2E8F0', color: '#1A1A2E', padding: '12px 24px', borderRadius: 9999, textDecoration: 'none', fontWeight: 700 }}>
                    Designer Studio
                  </Link>
                </div>
              </div>
              <div style={{ background: '#FAF6F1', padding: 28, borderRadius: 24, border: '1px solid #F0ECE6' }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#1A1A2E', marginBottom: 6 }}>💰 Creator Payout Share:</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#7C3AED', marginBottom: 6 }}>15% Royalty on Every Order</div>
                <div style={{ fontSize: 13, color: '#64748B', lineHeight: 1.5 }}>Automated wallet payouts directly into your bank account.</div>
              </div>
            </div>
          )}

          {activeRoleTab === 'printer' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 36, alignItems: 'center' }} className="role-content-grid">
              <div>
                <h3 style={{ fontFamily: 'var(--font-fraunces), Fraunces, Georgia, serif', fontSize: 26, fontWeight: 800, color: '#1A1A2E', marginBottom: 12 }}>
                  Turn Idle Printer Hours Into Consistent Local Income
                </h3>
                <p style={{ color: '#64748B', fontSize: 14.5, lineHeight: 1.65, marginBottom: 24 }}>
                  List your Bambu Lab, Prusa, Creality, or Resin machines. Accept nearby customer orders matched via Leaflet GPS, fabricate, deliver, and earn 70% per job.
                </p>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <Link href="/printers" style={{ background: '#16A34A', color: '#fff', padding: '12px 24px', borderRadius: 9999, fontWeight: 800, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, boxShadow: '0 4px 12px rgba(22,163,74,0.3)' }}>
                    <MapPin size={16} /> View Hubs Map
                  </Link>
                  <Link href="/dashboard/printer-owner" style={{ background: '#FAF6F1', border: '1px solid #E2E8F0', color: '#1A1A2E', padding: '12px 24px', borderRadius: 9999, textDecoration: 'none', fontWeight: 700 }}>
                    Printer Dashboard
                  </Link>
                </div>
              </div>
              <div style={{ background: '#FAF6F1', padding: 28, borderRadius: 24, border: '1px solid #F0ECE6' }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#1A1A2E', marginBottom: 6 }}>🖨️ Printer Hub Payout:</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#16A34A', marginBottom: 6 }}>70% Direct Order Payout</div>
                <div style={{ fontSize: 13, color: '#64748B', lineHeight: 1.5 }}>Continuous local job queue delivered right to your operator portal.</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4. HOW IT WORKS (4 STEPS) */}
      <section id="how-it-works" style={{ maxWidth: 1360, margin: '0 auto', padding: '40px 24px 60px' }}>
        <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 40px' }}>
          <span style={{ fontSize: 11.5, fontWeight: 800, color: '#EA580C', textTransform: 'uppercase', letterSpacing: 1.2 }}>
            Seamless Workflow
          </span>
          <h2 style={{ fontFamily: 'var(--font-fraunces), Fraunces, Georgia, serif', fontSize: 34, fontWeight: 800, color: '#1A1A2E', margin: '6px 0 10px', letterSpacing: '-0.5px' }}>
            From idea to doorstep in four steps
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
          {STEPS.map((s) => (
            <div
              key={s.step}
              style={{
                background: '#FFFFFF',
                borderRadius: 24,
                border: '1px solid #F0ECE6',
                padding: 28,
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  background: '#F97316',
                  color: '#FFFFFF',
                  fontSize: 18,
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 18,
                  boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)',
                }}
              >
                {s.step}
              </div>
              <h3 style={{ fontFamily: 'var(--font-fraunces), Fraunces, Georgia, serif', fontSize: 18, fontWeight: 800, color: '#1A1A2E', margin: '0 0 8px' }}>
                {s.title}
              </h3>
              <p style={{ fontSize: 13.5, color: '#64748B', lineHeight: 1.55, margin: 0 }}>
                {s.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. CORE FEATURES GRID */}
      <section style={{ maxWidth: 1360, margin: '0 auto', padding: '40px 24px 60px' }}>
        <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 40px' }}>
          <span style={{ fontSize: 11.5, fontWeight: 800, color: '#EA580C', textTransform: 'uppercase', letterSpacing: 1.2 }}>
            What&apos;s Inside
          </span>
          <h2 style={{ fontFamily: 'var(--font-fraunces), Fraunces, Georgia, serif', fontSize: 34, fontWeight: 800, color: '#1A1A2E', margin: '6px 0 10px', letterSpacing: '-0.5px' }}>
            Engineered for speed, security & fair pay
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
          {FEATURES.map((f) => (
            <div
              key={f.title}
              style={{
                background: '#FFFFFF',
                borderRadius: 24,
                border: '1px solid #F0ECE6',
                padding: 28,
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
              }}
            >
              <div style={{ marginBottom: 16 }}>
                <IconBadge>
                  {f.type === 'ai' && <Bot size={22} color="#F97316" />}
                  {f.type === 'viewport' && <Box size={22} color="#7C3AED" />}
                  {f.type === 'geo' && <MapPin size={22} color="#16A34A" />}
                  {f.type === 'escrow' && <ShieldCheck size={22} color="#F97316" />}
                  {f.type === 'slicer' && <Zap size={22} color="#D97706" />}
                  {f.type === 'creator' && <PenTool size={22} color="#2563EB" />}
                </IconBadge>
              </div>
              <h3 style={{ fontFamily: 'var(--font-fraunces), Fraunces, Georgia, serif', fontSize: 18, fontWeight: 800, color: '#1A1A2E', margin: '0 0 8px' }}>
                {f.title}
              </h3>
              <p style={{ fontSize: 13.5, color: '#64748B', lineHeight: 1.55, margin: 0 }}>
                {f.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. FINAL CALL TO ACTION */}
      <section style={{ maxWidth: 1360, margin: '0 auto', padding: '30px 24px 80px' }}>
        <div
          style={{
            background: 'linear-gradient(135deg, #FEE8D6 0%, #FAF6F0 50%, #FEE8D6 100%)',
            borderRadius: 32,
            border: '1px solid #FED7AA',
            padding: '56px 36px',
            textAlign: 'center',
            boxShadow: '0 10px 40px rgba(249, 115, 22, 0.08)',
          }}
        >
          <h2 style={{ fontFamily: 'var(--font-fraunces), Fraunces, Georgia, serif', fontSize: 36, fontWeight: 900, color: '#1A1A2E', margin: '0 0 12px' }}>
            {isLoggedIn ? 'Welcome Back to PrintHive' : 'Ready to Print Something Real?'}
          </h2>
          <p style={{ fontSize: 15.5, color: '#64748B', maxWidth: 540, margin: '0 auto 32px' }}>
            {isLoggedIn
              ? 'Explore active 3D designs, upload custom models, or manage your orders and earnings.'
              : 'Join PrintHive today — no printer, no CAD software, no hassle.'}
          </p>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            {isLoggedIn ? (
              <>
                <Link
                  href="/dashboard/buyer"
                  style={{
                    background: '#F97316',
                    color: '#fff',
                    padding: '14px 32px',
                    borderRadius: 9999,
                    fontWeight: 800,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    boxShadow: '0 4px 16px rgba(249,115,22,0.35)',
                  }}
                >
                  <ShoppingBag size={18} /> Go to My Dashboard
                </Link>
                <Link
                  href="/shop"
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    color: '#1A1A2E',
                    padding: '14px 28px',
                    borderRadius: 9999,
                    textDecoration: 'none',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  }}
                >
                  <Box size={18} /> Explore 3D Marketplace
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/signup"
                  style={{
                    background: '#F97316',
                    color: '#fff',
                    padding: '14px 36px',
                    borderRadius: 9999,
                    fontWeight: 800,
                    textDecoration: 'none',
                    boxShadow: '0 4px 16px rgba(249,115,22,0.35)',
                  }}
                >
                  Create Free Account
                </Link>
                <Link
                  href="/login"
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    color: '#1A1A2E',
                    padding: '14px 28px',
                    borderRadius: 9999,
                    textDecoration: 'none',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  }}
                >
                  Log In to Account &rarr;
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <Footer />

      <style jsx global>{`
        @media (max-width: 960px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
          }
          .role-content-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  )
}