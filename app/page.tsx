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
  Heart,
  Palette,
  Briefcase,
  PackageOpen,
  Send,
  Plus,
  PawPrint,
  Truck,
  Layers,
  Smile,
} from 'lucide-react'

const Hero3D = dynamic(() => import('@/components/Hero3D'), {
  ssr: false,
  loading: () => (
    <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: 13, fontWeight: 700 }}>
      ⚡ Initializing 3D Interactive Viewport...
    </div>
  ),
})

const VALUE_STRIP = [
  { icon: '🎨', title: 'Paint-Your-Own', desc: 'Models + Paints + Brushes' },
  { icon: '🌱', title: 'Eco-Friendly PLA', desc: '100% Biodegradable & Safe' },
  { icon: '🛡️', title: 'Escrow Protected', desc: 'Razorpay Escrow Guarded' },
  { icon: '🚀', title: 'Pan-India Express', desc: 'Doorstep Delivery' },
]

const WORLDS = [
  {
    num: '01',
    name: 'Printhive',
    title: "Creator's Studio",
    subtitle: 'Paint-your-own · Easy, Medium, Hard',
    color: '#7C3AED',
    bgGradient: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
    img: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80',
    href: '/shop',
  },
  {
    num: '02',
    name: 'Printhive',
    title: 'Safe Paws',
    subtitle: 'Custom dog & cat collar tags with QR debossing',
    color: '#D97706',
    bgGradient: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
    img: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80',
    href: '/shop',
  },
  {
    num: '03',
    name: 'Printhive',
    title: "Creator's Shelf",
    subtitle: 'Best sellers, functional designs & 3D STL library',
    color: '#16A34A',
    bgGradient: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
    img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    href: '/browse',
  },
]

const CUSTOM_PIECES = [
  {
    id: 'mini-me',
    title: 'Mini Me',
    subtitle: 'Your own custom 3D action figure',
    tag: 'Coloured / White',
    tagColor: '#7C3AED',
    bg: 'linear-gradient(135deg, #f3ecff, #e5d5ff)',
    href: '/requests/new',
  },
  {
    id: 'moments-in-3d',
    title: 'Moments in 3D',
    subtitle: 'Your memory, in a 3D relief frame',
    tag: '3D Frame',
    tagColor: '#EA580C',
    bg: 'linear-gradient(135deg, #fee8d6, #fdd6b0)',
    href: '/requests/new',
  },
  {
    id: 'pocket-portrait',
    title: 'Pocket Portrait',
    subtitle: 'Your face as a durable keychain',
    tag: 'Photo Keepsake',
    tagColor: '#16A34A',
    bg: 'linear-gradient(135deg, #e9f9ee, #c9f0d6)',
    href: '/requests/new',
  },
  {
    id: 'your-ride',
    title: 'Your Ride, Keyring-Sized',
    subtitle: 'Your car or bike as a 3D keychain',
    tag: 'Automotive Mini',
    tagColor: '#0D9488',
    bg: 'linear-gradient(135deg, #e5f6f4, #c4ece8)',
    href: '/requests/new',
  },
]

const HOW_IT_WORKS_DATA: Record<string, { step: string; title: string; text: string }[]> = {
  studio: [
    { step: '1', title: 'Pick your model', text: 'Choose a figure and difficulty — Easy, Medium or Hard.' },
    { step: '2', title: 'Get your hamper', text: 'Model, 3 acrylic colors, brushes and premium packaging arrive.' },
    { step: '3', title: 'Paint it your way', text: 'Bring it to life with your own unique colors and style.' },
    { step: '4', title: 'Show it off', text: 'Display your one-of-a-kind hand-painted creation at home or work.' },
  ],
  pets: [
    { step: '1', title: 'Select tag shape', text: 'Pick a bone, round, paw, or shield design.' },
    { step: '2', title: 'Add your details', text: 'Enter your pet’s name, contact number, or medical info.' },
    { step: '3', title: '3D Precision Print', text: 'Crafted in waterproof, ultra-durable eco PLA.' },
    { step: '4', title: 'Safe & Stylish', text: 'Attach to your pet’s collar for lifelong peace of mind.' },
  ],
  b2b: [
    { step: '1', title: 'Share your brief', text: 'Send us your company logo, team event theme, or mascot.' },
    { step: '2', title: 'Digital CAD 3D Proof', text: 'We render 3D proofs with custom PMS brand colors.' },
    { step: '3', title: 'Batch Manufacturing', text: 'Rapid local hub printing with strict QA inspection.' },
    { step: '4', title: 'Corporate Delivery', text: 'Individually boxed executive hampers delivered to your office.' },
  ],
  library: [
    { step: '1', title: 'Browse STL Library', text: 'Explore thousands of verified models from top creators.' },
    { step: '2', title: 'Inspect 3D Geometry', text: 'Rotate, zoom, and check slice readiness in real-time WebGL.' },
    { step: '3', title: 'Choose Slicing / Hub', text: 'Order local physical printing or download the raw STL.' },
    { step: '4', title: 'Escrow Guarantee', text: 'Payment released only after doorstep delivery & inspection.' },
  ],
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'studio' | 'pets' | 'b2b' | 'library'>('studio')

  return (
    <main style={{ minHeight: '100vh', background: '#FAF6F1', color: '#1A1A2E', fontFamily: 'inherit' }}>
      <Navbar />

      {/* 1. HERO SECTION WITH PRESERVED 3D ORB (printhive.org 1000% style) */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '36px 24px 48px' }}>
        {/* Soft Background Radial Blurs */}
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
              <span>✦</span> Made to Order · Delivered Pan-India
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
              Bring your<br />ideas to <span style={{ color: '#F97316' }}>life.</span>
            </h1>

            <p style={{ fontSize: 'clamp(15px, 1.25vw, 18px)', lineHeight: 1.65, color: '#64748B', maxWidth: 500, margin: '0 0 32px' }}>
              We 3D-print and you paint. Pick a hamper, choose your colors, and create something that&apos;s truly yours — or upload your own 3D CAD files for on-demand local printing.
            </p>

            {/* ACTION BUTTONS */}
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center', marginBottom: 32 }}>
              <a
                href="#explore-section"
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
                Explore Printhive <ArrowRight size={16} />
              </a>

              <a
                href="#how-it-works"
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
                How it Works
              </a>
            </div>

            {/* 4.9 RATING BADGE */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ display: 'flex', gap: 2 }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="#F59E0B" color="#F59E0B" />
                ))}
              </div>
              <span style={{ fontSize: 14, fontWeight: 800, color: '#1A1A2E' }}>4.9</span>
              <span style={{ fontSize: 13, color: '#64748B' }}>· Loved by 10,000+ creators</span>
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
              {/* Top Card Badge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px 0' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 800, color: '#EA580C', background: '#FFFFFF', padding: '4px 14px', borderRadius: 9999, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                  <Sparkles size={13} color="#F97316" /> Interactive 3D Orbit
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

      {/* 2. VALUE PROPOSITION STRIP (printhive.org style) */}
      <section style={{ maxWidth: 1360, margin: '0 auto', padding: '0 24px 48px' }}>
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 24,
            border: '1px solid #F0ECE6',
            padding: '18px 28px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 20,
            boxShadow: '0 2px 14px rgba(0,0,0,0.03)',
          }}
        >
          {VALUE_STRIP.map((v, i) => (
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

      {/* 3. CHOOSE YOUR WORLD SECTION (printhive.org style) */}
      <section id="explore-section" style={{ maxWidth: 1360, margin: '0 auto', padding: '40px 24px 60px' }}>
        <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 40px' }}>
          <span style={{ fontSize: 11.5, fontWeight: 800, color: '#EA580C', textTransform: 'uppercase', letterSpacing: 1.2 }}>
            What would you like to create
          </span>
          <h2 style={{ fontFamily: 'var(--font-fraunces), Fraunces, Georgia, serif', fontSize: 36, fontWeight: 800, color: '#1A1A2E', margin: '6px 0 10px', letterSpacing: '-0.6px' }}>
            Choose your world
          </h2>
          <p style={{ fontSize: 15, color: '#64748B', margin: 0 }}>
            Four ways to bring your ideas to life.
          </p>
        </div>

        {/* 3 EXPEDITION WORLD CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, marginBottom: 32 }}>
          {WORLDS.map((w) => (
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
                  {w.num} — {w.name}
                </div>
              </div>

              <div style={{ padding: 24, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-fraunces), Fraunces, Georgia, serif', fontSize: 21, fontWeight: 800, color: '#1A1A2E', margin: '0 0 6px' }}>
                    {w.title}
                  </h3>
                  <p style={{ fontSize: 13.5, color: '#64748B', lineHeight: 1.5, margin: 0 }}>
                    {w.subtitle}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13.5, fontWeight: 800, color: w.color, marginTop: 20 }}>
                  Enter this world <ArrowRight size={15} />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CORPORATE HIVE FOR BUSINESS BANNER */}
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
          <div style={{ maxWidth: 560 }}>
            <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.2, opacity: 0.85 }}>
              Hive for Business
            </span>
            <h3 style={{ fontFamily: 'var(--font-fraunces), Fraunces, Georgia, serif', fontSize: 28, fontWeight: 800, margin: '6px 0 10px', lineHeight: 1.2 }}>
              Custom corporate gifts that leave a lasting impression.
            </h3>
            <p style={{ fontSize: 14, opacity: 0.9, margin: 0 }}>
              Bespoke trophies, company milestones, personalized desk nameplates, and executive hampers tailored for your team.
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
            Explore Corporate <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* 4. MADE JUST FOR YOU (CUSTOM ON-DEMAND TILES) */}
      <section style={{ maxWidth: 1360, margin: '0 auto', padding: '30px 24px 60px' }}>
        <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 36px' }}>
          <span style={{ fontSize: 11.5, fontWeight: 800, color: '#EA580C', textTransform: 'uppercase', letterSpacing: 1.2 }}>
            Made on demand
          </span>
          <h2 style={{ fontFamily: 'var(--font-fraunces), Fraunces, Georgia, serif', fontSize: 34, fontWeight: 800, color: '#1A1A2E', margin: '6px 0 8px', letterSpacing: '-0.5px' }}>
            Made just for you
          </h2>
          <p style={{ fontSize: 14.5, color: '#64748B', margin: 0 }}>
            Personalised pieces — send us your idea and we craft it.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
          {CUSTOM_PIECES.map((c) => (
            <Link
              key={c.id}
              href={c.href}
              style={{
                background: '#FFFFFF',
                borderRadius: 24,
                border: '1px solid #F0ECE6',
                overflow: 'hidden',
                textDecoration: 'none',
                color: 'inherit',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                transition: 'transform 0.2s ease',
              }}
            >
              <div
                style={{
                  height: 180,
                  width: '100%',
                  background: c.bg,
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 44,
                  opacity: 0.8,
                }}
              >
                ✦
                <span
                  style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    background: '#FFFFFF',
                    color: c.tagColor,
                    fontSize: 10,
                    fontWeight: 800,
                    padding: '3px 10px',
                    borderRadius: 9999,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                  }}
                >
                  {c.tag}
                </span>
              </div>

              <div style={{ padding: 20 }}>
                <h3 style={{ fontFamily: 'var(--font-fraunces), Fraunces, Georgia, serif', fontSize: 17, fontWeight: 700, color: '#1A1A2E', margin: '0 0 4px' }}>
                  {c.title}
                </h3>
                <p style={{ fontSize: 12.5, color: '#64748B', margin: '0 0 14px' }}>
                  {c.subtitle}
                </p>
                <span style={{ fontSize: 12, fontWeight: 800, color: c.tagColor, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  Enquire to order <ArrowRight size={13} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. INTERACTIVE HOW IT WORKS TABS (printhive.org exact tabs) */}
      <section id="how-it-works" style={{ maxWidth: 1360, margin: '0 auto', padding: '40px 24px 60px' }}>
        <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 32px' }}>
          <span style={{ fontSize: 11.5, fontWeight: 800, color: '#EA580C', textTransform: 'uppercase', letterSpacing: 1.2 }}>
            Simple & Fun
          </span>
          <h2 style={{ fontFamily: 'var(--font-fraunces), Fraunces, Georgia, serif', fontSize: 34, fontWeight: 800, color: '#1A1A2E', margin: '6px 0 8px', letterSpacing: '-0.5px' }}>
            How it works
          </h2>
          <p style={{ fontSize: 14.5, color: '#64748B', margin: 0 }}>
            Pick an offering to see exactly how it works.
          </p>
        </div>

        {/* OFFERING SELECTOR TABS */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 36 }}>
          <button
            type="button"
            onClick={() => setActiveTab('studio')}
            style={{
              padding: '10px 20px',
              borderRadius: 9999,
              fontSize: 13.5,
              fontWeight: 700,
              border: activeTab === 'studio' ? '1px solid #7C3AED' : '1px solid #E2E8F0',
              background: activeTab === 'studio' ? '#7C3AED' : '#FFFFFF',
              color: activeTab === 'studio' ? '#FFFFFF' : '#1A1A2E',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: activeTab === 'studio' ? '0 4px 14px rgba(124, 58, 237, 0.3)' : '0 2px 6px rgba(0,0,0,0.03)',
            }}
          >
            <Palette size={16} /> Creator&apos;s Studio
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pets')}
            style={{
              padding: '10px 20px',
              borderRadius: 9999,
              fontSize: 13.5,
              fontWeight: 700,
              border: activeTab === 'pets' ? '1px solid #D97706' : '1px solid #E2E8F0',
              background: activeTab === 'pets' ? '#D97706' : '#FFFFFF',
              color: activeTab === 'pets' ? '#FFFFFF' : '#1A1A2E',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: activeTab === 'pets' ? '0 4px 14px rgba(217, 119, 6, 0.3)' : '0 2px 6px rgba(0,0,0,0.03)',
            }}
          >
            <PawPrint size={16} /> Smart Pet Collars
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('b2b')}
            style={{
              padding: '10px 20px',
              borderRadius: 9999,
              fontSize: 13.5,
              fontWeight: 700,
              border: activeTab === 'b2b' ? '1px solid #2563EB' : '1px solid #E2E8F0',
              background: activeTab === 'b2b' ? '#2563EB' : '#FFFFFF',
              color: activeTab === 'b2b' ? '#FFFFFF' : '#1A1A2E',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: activeTab === 'b2b' ? '0 4px 14px rgba(37, 99, 235, 0.3)' : '0 2px 6px rgba(0,0,0,0.03)',
            }}
          >
            <Briefcase size={16} /> Corporate Creations
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('library')}
            style={{
              padding: '10px 20px',
              borderRadius: 9999,
              fontSize: 13.5,
              fontWeight: 700,
              border: activeTab === 'library' ? '1px solid #16A34A' : '1px solid #E2E8F0',
              background: activeTab === 'library' ? '#16A34A' : '#FFFFFF',
              color: activeTab === 'library' ? '#FFFFFF' : '#1A1A2E',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: activeTab === 'library' ? '0 4px 14px rgba(22, 163, 74, 0.3)' : '0 2px 6px rgba(0,0,0,0.03)',
            }}
          >
            <PackageOpen size={16} /> Product Library
          </button>
        </div>

        {/* 4 NUMBERED CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
          {HOW_IT_WORKS_DATA[activeTab].map((h) => (
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
                  background: activeTab === 'studio' ? '#7C3AED' : activeTab === 'pets' ? '#D97706' : activeTab === 'b2b' ? '#2563EB' : '#16A34A',
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

      {/* 6. WHY FAMILIES CHOOSE PRINTHIVE (3 LARGE FEATURE CARDS) */}
      <section style={{ maxWidth: 1360, margin: '0 auto', padding: '30px 24px 60px' }}>
        <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 36px' }}>
          <span style={{ fontSize: 11.5, fontWeight: 800, color: '#EA580C', textTransform: 'uppercase', letterSpacing: 1.2 }}>
            <Sparkles size={12} style={{ display: 'inline', marginRight: 4 }} /> Why Printhive
          </span>
          <h2 style={{ fontFamily: 'var(--font-fraunces), Fraunces, Georgia, serif', fontSize: 34, fontWeight: 800, color: '#1A1A2E', margin: '6px 0 8px', letterSpacing: '-0.5px' }}>
            Why families choose Printhive
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          <div style={{ background: '#FFFFFF', borderRadius: 28, border: '1px solid #F0ECE6', padding: 28, display: 'flex', gap: 16, alignItems: 'flex-start', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <div style={{ width: 48, height: 48, borderRadius: 16, background: '#7C3AED', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)' }}>
              <Sparkles size={22} />
            </div>
            <div>
              <h3 style={{ fontFamily: 'var(--font-fraunces), Fraunces, Georgia, serif', fontSize: 18, fontWeight: 800, color: '#1A1A2E', margin: '0 0 6px' }}>
                Unbox the Joy of Painting
              </h3>
              <p style={{ fontSize: 13.5, color: '#64748B', lineHeight: 1.5, margin: 0 }}>
                Every hamper arrives with precision 3D models, rich acrylic paints, fine brushes, and simple step-by-step guides.
              </p>
            </div>
          </div>

          <div style={{ background: '#FFFFFF', borderRadius: 28, border: '1px solid #F0ECE6', padding: 28, display: 'flex', gap: 16, alignItems: 'flex-start', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <div style={{ width: 48, height: 48, borderRadius: 16, background: '#16A34A', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)' }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 style={{ fontFamily: 'var(--font-fraunces), Fraunces, Georgia, serif', fontSize: 18, fontWeight: 800, color: '#1A1A2E', margin: '0 0 6px' }}>
                Eco-Friendly & Non-Toxic
              </h3>
              <p style={{ fontSize: 13.5, color: '#64748B', lineHeight: 1.5, margin: 0 }}>
                Crafted from 100% biodegradable organic cornstarch PLA filament and odorless water-based artist paints.
              </p>
            </div>
          </div>

          <div style={{ background: '#FFFFFF', borderRadius: 28, border: '1px solid #F0ECE6', padding: 28, display: 'flex', gap: 16, alignItems: 'flex-start', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <div style={{ width: 48, height: 48, borderRadius: 16, background: '#EC4899', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)' }}>
              <Heart size={22} />
            </div>
            <div>
              <h3 style={{ fontFamily: 'var(--font-fraunces), Fraunces, Georgia, serif', fontSize: 18, fontWeight: 800, color: '#1A1A2E', margin: '0 0 6px' }}>
                Gifts That Mean More
              </h3>
              <p style={{ fontSize: 13.5, color: '#64748B', lineHeight: 1.5, margin: 0 }}>
                A hand-painted keepsake is worth ten store-bought items. Perfect for birthdays, anniversaries, and desk décor.
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