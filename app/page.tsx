'use client'

import { useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import {
  ArrowRight,
  Star,
  Sparkles,
  ShieldCheck,
  Printer,
  PenTool,
  ShoppingBag,
  MapPin,
  Lock,
  Layers,
  Zap,
  CheckCircle2,
  Plus,
  Box,
  Store,
  Users,
} from 'lucide-react'

const Hero3D = dynamic(() => import('@/components/Hero3D'), {
  ssr: false,
  loading: () => (
    <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: 13, fontWeight: 700 }}>
      ⚡ Initializing 3D Interactive Viewport...
    </div>
  ),
})

const VALUE_PILLARS = [
  { icon: '🛡️', title: '70/15/15 Escrow Guard', desc: 'Protected by Razorpay' },
  { icon: '⚡', title: 'Instant 3D Slicing', desc: 'Real-Time Volume & Infill Quoting' },
  { icon: '📍', title: 'Local Printer Hubs', desc: 'Nearby Pan-India Geo-Routing' },
  { icon: '🎨', title: 'Verified CAD Designers', desc: 'Royalty-Guaranteed 3D Library' },
]

const MARKETPLACE_PILLARS = [
  {
    num: '01',
    name: 'PrintHive',
    title: 'Ready-Made 3D Shop',
    subtitle: 'Browse physical 3D printed products crafted by verified makers and delivered to your doorstep.',
    tag: 'Physical Shop',
    color: '#F97316',
    bgTint: 'linear-gradient(135deg, #FEE8D6 0%, #FAF6F0 100%)',
    img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    href: '/shop',
    cta: 'Explore Shop',
  },
  {
    num: '02',
    name: 'PrintHive',
    title: 'Digital 3D CAD Repository',
    subtitle: 'Download or print trending STL & 3MF models from verified CAD designers with built-in 3D inspection.',
    tag: 'STL & 3MF Models',
    color: '#7C3AED',
    bgTint: 'linear-gradient(135deg, #F3ECFD 0%, #E9D5FF 100%)',
    img: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    href: '/browse',
    cta: 'Browse 3D Models',
  },
  {
    num: '03',
    name: 'PrintHive',
    title: 'AI Slicer & Print-on-Demand',
    subtitle: 'Upload your CAD model for instant volume analysis, layer cost estimation, and local hub dispatch.',
    tag: 'Custom Slicer',
    color: '#16A34A',
    bgTint: 'linear-gradient(135deg, #E7F7EC 0%, #BBF7D0 100%)',
    img: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80',
    href: '/print-on-demand',
    cta: 'Upload & Slice',
  },
]

const ROLE_PERSPECTIVES: Record<string, { step: string; title: string; text: string }[]> = {
  buyer: [
    { step: '1', title: 'Discover or Upload STL', text: 'Browse thousands of ready-made designs or upload your custom 3D file to our automated slicer.' },
    { step: '2', title: 'Inspect in 360° WebGL', text: 'Rotate, zoom, and verify layer geometry in real-time in-browser 3D before ordering.' },
    { step: '3', title: 'Local Printer Matching', text: 'Your order is routed to the closest verified printer hub for rapid precision fabrication.' },
    { step: '4', title: 'Escrow Protected Delivery', text: 'Funds are securely held in Razorpay Escrow until you confirm delivery and quality.' },
  ],
  designer: [
    { step: '1', title: 'Upload CAD Models', text: 'Publish your original STL/3MF files with render galleries, tags, and license terms.' },
    { step: '2', title: 'Set Royalty Pricing', text: 'Define your royalty per print or distribute free models to build a global following.' },
    { step: '3', title: 'Automated Royalties (15%)', text: 'Earn passive income every time a buyer orders a physical print of your creation.' },
    { step: '4', title: 'Instant Wallet Payouts', text: 'Withdraw earnings directly to your bank account with complete sales transparency.' },
  ],
  printer: [
    { step: '1', title: 'Register Your 3D Printer', text: 'Add your Bambu Lab, Creality, Prusa, or resin machine with build volumes and materials.' },
    { step: '2', title: 'Receive Local Print Jobs', text: 'Get matched with nearby customer print requests via GPS geo-routing in your area.' },
    { step: '3', title: 'Precision Fabrication', text: 'Print with premium PLA, PETG, ABS, or Resin following automated slicer specifications.' },
    { step: '4', title: 'Earn 70% Per Order', text: 'Receive the majority 70% payout automatically upon customer delivery confirmation.' },
  ],
  seller: [
    { step: '1', title: 'Launch Your Storefront', text: 'Create your branded catalog of physical 3D products, figurines, and home décor.' },
    { step: '2', title: 'Manage Inventory & Pricing', text: 'Set real-time pricing, stock availability, and customizable options with ease.' },
    { step: '3', title: 'Reach Pan-India Buyers', text: 'Tap into thousands of buyers searching for unique 3D creations every month.' },
    { step: '4', title: 'Secure Escrow Settlements', text: 'Enjoy automated order payouts guarded by Razorpay with zero chargeback risk.' },
  ],
}

export default function HomePage() {
  const [activeRole, setActiveRole] = useState<'buyer' | 'designer' | 'printer' | 'seller'>('buyer')

  return (
    <main style={{ minHeight: '100vh', background: '#FAF6F1', color: '#1A1A2E', fontFamily: 'inherit' }}>
      <Navbar />

      {/* 1. HERO SECTION WITH PRESERVED 3D ORB (printhive.org warm boutique styling) */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '40px 24px 52px' }}>
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
          {/* HERO TEXT COLUMN */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 800, color: '#EA580C', background: 'rgba(234, 88, 12, 0.1)', padding: '6px 16px', borderRadius: 9999, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 18 }}>
              <span>✦</span> Distributed 3D Manufacturing Network
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
              PrintHive connects CAD designers, verified local 3D printer hubs, and buyers on a capability-based manufacturing network with 70/15/15 Escrow protection.
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
                Explore Marketplace <ArrowRight size={16} />
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
                  boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                }}
              >
                Instant 3D Slicer
              </Link>
            </div>

            {/* 4.9 RATING BADGE */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ display: 'flex', gap: 2 }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="#F59E0B" color="#F59E0B" />
                ))}
              </div>
              <span style={{ fontSize: 14, fontWeight: 800, color: '#1A1A2E' }}>4.9</span>
              <span style={{ fontSize: 13, color: '#64748B' }}>· Verified makers & designers pan-India</span>
            </div>
          </div>

          {/* 3D ORB CARD (PRESERVED ORB) */}
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
                  <Sparkles size={13} color="#F97316" /> Interactive 3D WebGL
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

      {/* 2. 4-PILLAR VALUE PROPOSITION STRIP */}
      <section style={{ maxWidth: 1360, margin: '0 auto', padding: '0 24px 48px' }}>
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 24,
            border: '1px solid #F0ECE6',
            padding: '20px 28px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 20,
            boxShadow: '0 2px 14px rgba(0,0,0,0.03)',
          }}
        >
          {VALUE_PILLARS.map((v, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 24 }}>{v.icon}</div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 800, color: '#1A1A2E' }}>{v.title}</div>
                <div style={{ fontSize: 12, color: '#94A3B8' }}>{v.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. CORE MARKETPLACE PORTALS (printhive.org style cards) */}
      <section id="explore-section" style={{ maxWidth: 1360, margin: '0 auto', padding: '40px 24px 60px' }}>
        <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 40px' }}>
          <span style={{ fontSize: 11.5, fontWeight: 800, color: '#EA580C', textTransform: 'uppercase', letterSpacing: 1.2 }}>
            PrintHive Ecosystem
          </span>
          <h2 style={{ fontFamily: 'var(--font-fraunces), Fraunces, Georgia, serif', fontSize: 36, fontWeight: 800, color: '#1A1A2E', margin: '6px 0 10px', letterSpacing: '-0.6px' }}>
            Choose how you create & produce
          </h2>
          <p style={{ fontSize: 15, color: '#64748B', margin: 0 }}>
            Three interconnected layers powering distributed additive manufacturing across India.
          </p>
        </div>

        {/* 3 MARKETPLACE CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, marginBottom: 32 }}>
          {MARKETPLACE_PILLARS.map((w) => (
            <Link
              key={w.num}
              href={w.href}
              style={{
                background: '#FFFFFF',
                borderRadius: 28,
                border: '1px solid #F0ECE6',
                overflow: 'hidden',
                textDecoration: 'none',
                color: 'inherit',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
            >
              <div style={{ height: 210, width: '100%', position: 'relative', overflow: 'hidden' }}>
                <img src={w.img} alt={w.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: 14, left: 14, background: 'rgba(255,255,255,0.94)', color: w.color, padding: '4px 12px', borderRadius: 9999, fontSize: 11, fontWeight: 800, backdropFilter: 'blur(6px)', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                  {w.num} — {w.tag}
                </div>
              </div>

              <div style={{ padding: 24, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-fraunces), Fraunces, Georgia, serif', fontSize: 21, fontWeight: 800, color: '#1A1A2E', margin: '0 0 8px' }}>
                    {w.title}
                  </h3>
                  <p style={{ fontSize: 13.5, color: '#64748B', lineHeight: 1.5, margin: 0 }}>
                    {w.subtitle}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13.5, fontWeight: 800, color: w.color, marginTop: 20 }}>
                  {w.cta} <ArrowRight size={15} />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CUSTOM CAD BRIEF / B2B BANNER */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)',
            borderRadius: 28,
            padding: '36px 40px',
            color: '#FFFFFF',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 24,
            boxShadow: '0 10px 30px rgba(30, 58, 138, 0.25)',
          }}
        >
          <div style={{ maxWidth: 580 }}>
            <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.2, opacity: 0.85 }}>
              Custom Design & Engineering Briefs
            </span>
            <h3 style={{ fontFamily: 'var(--font-fraunces), Fraunces, Georgia, serif', fontSize: 28, fontWeight: 800, margin: '6px 0 10px', lineHeight: 1.2 }}>
              Have an idea or need custom CAD modeling?
            </h3>
            <p style={{ fontSize: 14, opacity: 0.9, margin: 0 }}>
              Post a custom brief to our network of verified 3D CAD designers and get competitive proposals with escrow milestone protection.
            </p>
          </div>

          <Link
            href="/requests/new"
            style={{
              background: '#FFFFFF',
              color: '#1E3A8A',
              padding: '13px 26px',
              borderRadius: 14,
              fontSize: 14,
              fontWeight: 800,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
            }}
          >
            Post Custom Brief <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* 4. HOW IT WORKS BY ROLE (INTERACTIVE ROLE SWITCHER TABS) */}
      <section id="how-it-works" style={{ maxWidth: 1360, margin: '0 auto', padding: '40px 24px 60px' }}>
        <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 32px' }}>
          <span style={{ fontSize: 11.5, fontWeight: 800, color: '#EA580C', textTransform: 'uppercase', letterSpacing: 1.2 }}>
            How It Works
          </span>
          <h2 style={{ fontFamily: 'var(--font-fraunces), Fraunces, Georgia, serif', fontSize: 34, fontWeight: 800, color: '#1A1A2E', margin: '6px 0 8px', letterSpacing: '-0.5px' }}>
            Built for the entire 3D ecosystem
          </h2>
          <p style={{ fontSize: 14.5, color: '#64748B', margin: 0 }}>
            Select your role to see how PrintHive streamlines creation, manufacturing, and earnings.
          </p>
        </div>

        {/* ROLE TABS */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 36 }}>
          <button
            type="button"
            onClick={() => setActiveRole('buyer')}
            style={{
              padding: '10px 22px',
              borderRadius: 9999,
              fontSize: 13.5,
              fontWeight: 700,
              border: activeRole === 'buyer' ? '1px solid #F97316' : '1px solid #E2E8F0',
              background: activeRole === 'buyer' ? '#F97316' : '#FFFFFF',
              color: activeRole === 'buyer' ? '#FFFFFF' : '#1A1A2E',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: activeRole === 'buyer' ? '0 4px 14px rgba(249, 115, 22, 0.3)' : '0 2px 6px rgba(0,0,0,0.03)',
            }}
          >
            <ShoppingBag size={16} /> For Buyers
          </button>

          <button
            type="button"
            onClick={() => setActiveRole('designer')}
            style={{
              padding: '10px 22px',
              borderRadius: 9999,
              fontSize: 13.5,
              fontWeight: 700,
              border: activeRole === 'designer' ? '1px solid #7C3AED' : '1px solid #E2E8F0',
              background: activeRole === 'designer' ? '#7C3AED' : '#FFFFFF',
              color: activeRole === 'designer' ? '#FFFFFF' : '#1A1A2E',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: activeRole === 'designer' ? '0 4px 14px rgba(124, 58, 237, 0.3)' : '0 2px 6px rgba(0,0,0,0.03)',
            }}
          >
            <PenTool size={16} /> For Designers (15% Royalty)
          </button>

          <button
            type="button"
            onClick={() => setActiveRole('printer')}
            style={{
              padding: '10px 22px',
              borderRadius: 9999,
              fontSize: 13.5,
              fontWeight: 700,
              border: activeRole === 'printer' ? '1px solid #16A34A' : '1px solid #E2E8F0',
              background: activeRole === 'printer' ? '#16A34A' : '#FFFFFF',
              color: activeRole === 'printer' ? '#FFFFFF' : '#1A1A2E',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: activeRole === 'printer' ? '0 4px 14px rgba(22, 163, 74, 0.3)' : '0 2px 6px rgba(0,0,0,0.03)',
            }}
          >
            <Printer size={16} /> For Printer Hubs (70% Share)
          </button>

          <button
            type="button"
            onClick={() => setActiveRole('seller')}
            style={{
              padding: '10px 22px',
              borderRadius: 9999,
              fontSize: 13.5,
              fontWeight: 700,
              border: activeRole === 'seller' ? '1px solid #2563EB' : '1px solid #E2E8F0',
              background: activeRole === 'seller' ? '#2563EB' : '#FFFFFF',
              color: activeRole === 'seller' ? '#FFFFFF' : '#1A1A2E',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: activeRole === 'seller' ? '0 4px 14px rgba(37, 99, 235, 0.3)' : '0 2px 6px rgba(0,0,0,0.03)',
            }}
          >
            <Store size={16} /> For Store Sellers
          </button>
        </div>

        {/* 4 NUMBERED CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
          {ROLE_PERSPECTIVES[activeRole].map((h) => (
            <div
              key={h.step}
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
                  background: activeRole === 'buyer' ? '#F97316' : activeRole === 'designer' ? '#7C3AED' : activeRole === 'printer' ? '#16A34A' : '#2563EB',
                  color: '#FFFFFF',
                  fontSize: 18,
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 18,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                }}
              >
                {h.step}
              </div>
              <h3 style={{ fontFamily: 'var(--font-fraunces), Fraunces, Georgia, serif', fontSize: 18, fontWeight: 800, color: '#1A1A2E', margin: '0 0 8px' }}>
                {h.title}
              </h3>
              <p style={{ fontSize: 13.5, color: '#64748B', lineHeight: 1.55, margin: 0 }}>
                {h.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. WHY PRINTHIVE (3 VALUE PILLARS) */}
      <section style={{ maxWidth: 1360, margin: '0 auto', padding: '30px 24px 60px' }}>
        <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 36px' }}>
          <span style={{ fontSize: 11.5, fontWeight: 800, color: '#EA580C', textTransform: 'uppercase', letterSpacing: 1.2 }}>
            <Sparkles size={12} style={{ display: 'inline', marginRight: 4 }} /> Why PrintHive
          </span>
          <h2 style={{ fontFamily: 'var(--font-fraunces), Fraunces, Georgia, serif', fontSize: 34, fontWeight: 800, color: '#1A1A2E', margin: '6px 0 8px', letterSpacing: '-0.5px' }}>
            Empowering decentralized manufacturing
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          <div style={{ background: '#FFFFFF', borderRadius: 28, border: '1px solid #F0ECE6', padding: 28, display: 'flex', gap: 16, alignItems: 'flex-start', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <div style={{ width: 48, height: 48, borderRadius: 16, background: '#F97316', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)' }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 style={{ fontFamily: 'var(--font-fraunces), Fraunces, Georgia, serif', fontSize: 18, fontWeight: 800, color: '#1A1A2E', margin: '0 0 6px' }}>
                70/15/15 Escrow Guard
              </h3>
              <p style={{ fontSize: 13.5, color: '#64748B', lineHeight: 1.5, margin: 0 }}>
                100% of payments held in Razorpay Escrow until successful delivery. Fair automated splits: 70% Printer, 15% Designer, 15% Platform.
              </p>
            </div>
          </div>

          <div style={{ background: '#FFFFFF', borderRadius: 28, border: '1px solid #F0ECE6', padding: 28, display: 'flex', gap: 16, alignItems: 'flex-start', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <div style={{ width: 48, height: 48, borderRadius: 16, background: '#7C3AED', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)' }}>
              <Zap size={22} />
            </div>
            <div>
              <h3 style={{ fontFamily: 'var(--font-fraunces), Fraunces, Georgia, serif', fontSize: 18, fontWeight: 800, color: '#1A1A2E', margin: '0 0 6px' }}>
                Instant Automated Slicing
              </h3>
              <p style={{ fontSize: 13.5, color: '#64748B', lineHeight: 1.5, margin: 0 }}>
                Upload any STL/3MF file to get instant bounding box volume calculation, infill density tuning, and transparent material pricing.
              </p>
            </div>
          </div>

          <div style={{ background: '#FFFFFF', borderRadius: 28, border: '1px solid #F0ECE6', padding: 28, display: 'flex', gap: 16, alignItems: 'flex-start', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <div style={{ width: 48, height: 48, borderRadius: 16, background: '#16A34A', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)' }}>
              <MapPin size={22} />
            </div>
            <div>
              <h3 style={{ fontFamily: 'var(--font-fraunces), Fraunces, Georgia, serif', fontSize: 18, fontWeight: 800, color: '#1A1A2E', margin: '0 0 6px' }}>
                Nearby GPS Geo-Routing
              </h3>
              <p style={{ fontSize: 13.5, color: '#64748B', lineHeight: 1.5, margin: 0 }}>
                Orders are routed to verified print hubs in your city for faster turnaround, lower shipping costs, and smaller carbon footprints.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <style jsx global>{`
        @media (max-width: 960px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  )
}