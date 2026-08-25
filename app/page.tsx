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
  Shield,
  Leaf,
  Gift,
  Lock,
  Palette,
  Briefcase,
  Layers,
  CheckCircle2,
  Box,
  Plus,
  Send,
} from 'lucide-react'

const Hero3D = dynamic(() => import('@/components/Hero3D'), {
  ssr: false,
  loading: () => (
    <div style={{ height: 420, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: 13, fontWeight: 700 }}>
      ⚡ Initializing 3D Interactive Viewport...
    </div>
  ),
})

const WORLDS = [
  {
    num: '01',
    title: "Creator's Studio",
    subtitle: 'Paint-your-own hampers · Easy, Medium, Hard',
    tag: 'Paint Kits',
    color: '#7C3AED',
    bgTint: 'linear-gradient(135deg, #F3ECFD 0%, #E9D5FF 100%)',
    img: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=600&q=80',
    href: '/shop',
  },
  {
    num: '02',
    title: 'Safe Paws',
    subtitle: 'Custom dog & cat tags with QR contact debossing',
    tag: 'Pet Collection',
    color: '#D97706',
    bgTint: 'linear-gradient(135deg, #FDF1E1 0%, #FED7AA 100%)',
    img: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80',
    href: '/shop?category=Toys%20%26%20Games',
  },
  {
    num: '03',
    title: "Creator's Shelf",
    subtitle: 'Best sellers, functional designs & digital STL models',
    tag: '3D Library',
    color: '#16A34A',
    bgTint: 'linear-gradient(135deg, #E7F7EC 0%, #BBF7D0 100%)',
    img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    href: '/browse',
  },
]

const CUSTOM_CREATIONS = [
  {
    id: 'mini-me',
    title: 'Mini Me',
    subtitle: 'Your own custom 3D action figure',
    tag: 'Coloured / Raw PLA',
    tagColor: '#7C3AED',
    bgGradient: 'linear-gradient(135deg, #F3ECFF, #E5D5FF)',
    href: '/requests/new',
  },
  {
    id: 'moments-in-3d',
    title: 'Moments in 3D',
    subtitle: 'Your photo memory in a 3D relief frame',
    tag: 'Lithophane Frame',
    tagColor: '#EA580C',
    bgGradient: 'linear-gradient(135deg, #FEE8D6, #FDD6B0)',
    href: '/requests/new',
  },
  {
    id: 'pocket-portrait',
    title: 'Pocket Portrait',
    subtitle: 'Your face or pet as a durable keychain',
    tag: 'Photo Keepsake',
    tagColor: '#16A34A',
    bgGradient: 'linear-gradient(135deg, #E9F9EE, #C9F0D6)',
    href: '/requests/new',
  },
  {
    id: 'your-ride',
    title: 'Your Ride, Keyring-Sized',
    subtitle: 'Your car or bike as a precision 3D model',
    tag: 'Automotive Mini',
    tagColor: '#0D9488',
    bgGradient: 'linear-gradient(135deg, #E5F6F4, #C4ECE8)',
    href: '/requests/new',
  },
]

const HOW_IT_WORKS = [
  {
    step: '1',
    title: 'Pick your model',
    text: 'Choose a figure, gift or functional design and select difficulty — Easy, Medium or Hard.',
  },
  {
    step: '2',
    title: 'Get your hamper',
    text: 'Your precision 3D model, acrylic paints, detail brushes, and gift box arrive at your doorstep.',
  },
  {
    step: '3',
    title: 'Paint it your way',
    text: 'Bring your piece to life with your favorite color palette and personal creative style.',
  },
  {
    step: '4',
    title: 'Show it off',
    text: 'Display your one-of-a-kind hand-painted creation or gift it to someone special.',
  },
]

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'studio' | 'pets' | 'b2b' | 'library'>('studio')

  return (
    <main style={{ minHeight: '100vh', background: '#FAF6F1', color: '#1A1A2E', fontFamily: 'inherit' }}>
      <Navbar />

      {/* 1. HERO SECTION WITH PRESERVED 3D ORB (printhive.org style) */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '40px 24px 60px' }}>
        {/* Soft Ambient Glow Elements */}
        <div style={{ position: 'absolute', top: 20, left: '-10%', width: 450, height: 450, borderRadius: '50%', background: 'rgba(251, 146, 60, 0.12)', filter: 'blur(90px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 100, right: '-5%', width: 400, height: 400, borderRadius: '50%', background: 'rgba(254, 215, 170, 0.25)', filter: 'blur(80px)', pointerEvents: 'none' }} />

        <div
          style={{
            maxWidth: 1360,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '1.1fr 1fr',
            gap: 48,
            alignItems: 'center',
          }}
          className="hero-grid"
        >
          {/* HERO TEXT COLUMN */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 800, color: '#EA580C', background: 'rgba(234, 88, 12, 0.1)', padding: '6px 14px', borderRadius: 9999, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 18 }}>
              <span>✦</span> Made to Order · Delivered Pan-India
            </div>

            <h1
              style={{
                fontFamily: 'var(--font-fraunces), Fraunces, Georgia, serif',
                fontSize: 'clamp(36px, 4.8vw, 62px)',
                fontWeight: 900,
                color: '#1A1A2E',
                lineHeight: 1.05,
                margin: '0 0 20px',
                letterSpacing: '-1px',
              }}
            >
              Bring your<br />ideas to <span style={{ color: '#F97316' }}>life.</span>
            </h1>

            <p style={{ fontSize: 'clamp(15px, 1.2vw, 18px)', lineHeight: 1.6, color: '#64748B', maxWidth: 520, margin: '0 0 32px' }}>
              We 3D-print and you paint. Pick a hamper, choose your colors, and create something that&apos;s truly yours — or upload your own 3D CAD files for on-demand local printing.
            </p>

            {/* ACTION BUTTONS */}
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center', marginBottom: 32 }}>
              <a
                href="#explore-section"
                style={{
                  background: '#F97316',
                  color: '#FFFFFF',
                  padding: '14px 28px',
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
                How It Works
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
              <span style={{ fontSize: 13, color: '#64748B' }}>· Loved by 10,000+ creators across India</span>
            </div>
          </div>

          {/* 3D ORB CARD (PRESERVED ORB) */}
          <div style={{ position: 'relative' }}>
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(254, 232, 214, 0.7) 0%, rgba(253, 246, 238, 0.9) 100%)',
                borderRadius: 36,
                border: '1px solid rgba(249, 115, 22, 0.2)',
                padding: 16,
                boxShadow: '0 20px 50px rgba(249, 115, 22, 0.12)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Top Card Badge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px 0' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 800, color: '#EA580C', background: '#FFFFFF', padding: '4px 12px', borderRadius: 9999, boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }}>
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

      {/* 2. CHOOSE YOUR WORLD SECTION (printhive.org style) */}
      <section id="explore-section" style={{ maxWidth: 1360, margin: '0 auto', padding: '60px 24px' }}>
        <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 40px' }}>
          <span style={{ fontSize: 11.5, fontWeight: 800, color: '#EA580C', textTransform: 'uppercase', letterSpacing: 1 }}>
            What would you like to create
          </span>
          <h2 style={{ fontFamily: 'var(--font-fraunces), Fraunces, Georgia, serif', fontSize: 36, fontWeight: 800, color: '#1A1A2E', margin: '6px 0 10px', letterSpacing: '-0.5px' }}>
            Choose your world
          </h2>
          <p style={{ fontSize: 15, color: '#64748B', margin: 0 }}>
            Four ways to bring your ideas to life — paint kits, custom keepsakes, 3D libraries, and corporate gifts.
          </p>
        </div>

        {/* 3 WORLD BANDS */}
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
              <div style={{ height: 200, width: '100%', position: 'relative', overflow: 'hidden' }}>
                <img src={w.img} alt={w.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: 14, left: 14, background: 'rgba(255,255,255,0.92)', color: w.color, padding: '4px 12px', borderRadius: 9999, fontSize: 11, fontWeight: 800, backdropFilter: 'blur(6px)' }}>
                  {w.num} — {w.tag}
                </div>
              </div>

              <div style={{ padding: 24, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-fraunces), Fraunces, Georgia, serif', fontSize: 20, fontWeight: 800, color: '#1A1A2E', margin: '0 0 6px' }}>
                    {w.title}
                  </h3>
                  <p style={{ fontSize: 13.5, color: '#64748B', lineHeight: 1.5, margin: 0 }}>
                    {w.subtitle}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13.5, fontWeight: 800, color: w.color, marginTop: 18 }}>
                  Enter this world <ArrowRight size={15} />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CORPORATE / HIVE FOR BUSINESS BANNER */}
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

      {/* 3. MADE JUST FOR YOU (CUSTOM ON-DEMAND GRID) */}
      <section style={{ maxWidth: 1360, margin: '0 auto', padding: '40px 24px 60px' }}>
        <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 36px' }}>
          <span style={{ fontSize: 11.5, fontWeight: 800, color: '#EA580C', textTransform: 'uppercase', letterSpacing: 1 }}>
            Made on Demand
          </span>
          <h2 style={{ fontFamily: 'var(--font-fraunces), Fraunces, Georgia, serif', fontSize: 34, fontWeight: 800, color: '#1A1A2E', margin: '6px 0 8px', letterSpacing: '-0.5px' }}>
            Made just for you
          </h2>
          <p style={{ fontSize: 14.5, color: '#64748B', margin: 0 }}>
            Personalised pieces — send us your photo or idea and our verified print network crafts it.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
          {CUSTOM_CREATIONS.map((c) => (
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
                  background: c.bgGradient,
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 42,
                  opacity: 0.85,
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

      {/* 4. HOW IT WORKS SECTION */}
      <section id="how-it-works" style={{ maxWidth: 1360, margin: '0 auto', padding: '40px 24px 60px' }}>
        <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 40px' }}>
          <span style={{ fontSize: 11.5, fontWeight: 800, color: '#EA580C', textTransform: 'uppercase', letterSpacing: 1 }}>
            Simple & Fun
          </span>
          <h2 style={{ fontFamily: 'var(--font-fraunces), Fraunces, Georgia, serif', fontSize: 34, fontWeight: 800, color: '#1A1A2E', margin: '6px 0 8px', letterSpacing: '-0.5px' }}>
            How it works
          </h2>
          <p style={{ fontSize: 14.5, color: '#64748B', margin: 0 }}>
            From your chosen model to your completed hand-painted masterpiece.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
          {HOW_IT_WORKS.map((h) => (
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
                  background: '#7C3AED',
                  color: '#FFFFFF',
                  fontSize: 18,
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 18,
                  boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
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