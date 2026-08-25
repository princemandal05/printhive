'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer style={{ background: '#050811', borderTop: '1px solid rgba(255, 107, 53, 0.15)', color: '#94a3b8', padding: '64px 20px 36px', position: 'relative', overflow: 'hidden' }}>
      {/* Ambient Top Glow Line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '15%',
          right: '15%',
          height: 1,
          background: 'linear-gradient(90deg, transparent 0%, #FF6B35 50%, transparent 100%)',
          opacity: 0.8,
        }}
      />

      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* TOP TRUST & ECOSYSTEM BANNER */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.6) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 20,
            padding: '24px 28px',
            marginBottom: 48,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 20,
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'rgba(255,107,53,0.15)',
                border: '1px solid rgba(255,107,53,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
              }}
            >
              🛡️
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 900, color: '#fff', letterSpacing: '-0.2px' }}>
                PrintHive Escrow Protected Network
              </div>
              <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 2 }}>
                100% of payments held in Razorpay Escrow until successful delivery & inspection.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, background: 'rgba(16,185,129,0.12)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)', padding: '6px 14px', borderRadius: 99, fontWeight: 800 }}>
              <span style={{ fontSize: 8 }}>🟢</span> 70% Printer Hub Share
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, background: 'rgba(139,92,246,0.12)', color: '#A78BFA', border: '1px solid rgba(139,92,246,0.3)', padding: '6px 14px', borderRadius: 99, fontWeight: 800 }}>
              <span style={{ fontSize: 8 }}>🎨</span> 15% Designer Royalty
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, background: 'rgba(255,107,53,0.12)', color: '#FF8A50', border: '1px solid rgba(255,107,53,0.3)', padding: '6px 14px', borderRadius: 99, fontWeight: 800 }}>
              <span style={{ fontSize: 8 }}>⚡</span> 15% Platform Maintenance
            </div>
          </div>
        </div>

        {/* MAIN FOOTER 4-COLUMN GRID */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 40,
            marginBottom: 48,
          }}
        >
          {/* BRAND COLUMN */}
          <div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#fff', marginBottom: 12, letterSpacing: '-0.5px' }}>
              Print<span style={{ color: '#FF6B35' }}>Hive</span>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.6, color: '#94a3b8', marginBottom: 20 }}>
              Where Ideas Become Physical Reality. AI-Powered Hybrid 3D Commerce & Distributed Additive Manufacturing Network.
            </p>

            {/* SOCIAL / COMMUNITY CHANNELS */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <a
                href="https://discord.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Discord Community"
                style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', textDecoration: 'none', transition: 'all 0.2s' }}
              >
                💬
              </a>
              <a
                href="https://github.com/princemandal05/printhive"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub Repository"
                style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', textDecoration: 'none', transition: 'all 0.2s' }}
              >
                🐙
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube Tutorials"
                style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', textDecoration: 'none', transition: 'all 0.2s' }}
              >
                📺
              </a>
            </div>
          </div>

          {/* MARKETPLACE & 3D CATALOG */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 900, color: '#fff', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Marketplace & Catalog
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
              <Link href="/shop" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }}>
                🏪 Ready-Made 3D Shop
              </Link>
              <Link href="/browse" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }}>
                🎨 Digital 3D Models (STL/3MF)
              </Link>
              <Link href="/print-on-demand" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }}>
                ⚡ Custom Print-on-Demand
              </Link>
              <Link href="/requests" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }}>
                📋 Custom CAD Design Briefs
              </Link>
              <Link href="/cart" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }}>
                🛒 Shopping Cart & Checkout
              </Link>
            </div>
          </div>

          {/* CREATOR & MANUFACTURER PORTALS */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 900, color: '#FF6B35', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Creator & Maker Portals
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
              <Link href="/dashboard/seller" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }}>
                🏬 Seller Central Dashboard
              </Link>
              <Link href="/dashboard/designer" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }}>
                ✨ 3D Designer Studio
              </Link>
              <Link href="/dashboard/printer-owner" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }}>
                🖨️ Printer Hub Operations
              </Link>
              <Link href="/printers" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }}>
                📍 Local Printer Hubs Map
              </Link>
              <Link href="/dashboard/buyer" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }}>
                📦 Buyer Orders & Tracking
              </Link>
            </div>
          </div>

          {/* SUPPORT & TRUST */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 900, color: '#fff', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Support & Security
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
              <Link href="/support-tickets" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }}>
                🎫 Customer Support Desk
              </Link>
              <Link href="/faq" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }}>
                ❓ FAQ & Escrow Guide
              </Link>
              <Link href="/profile" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }}>
                👤 Account Profile & Settings
              </Link>
              <Link href="/login" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }}>
                🔐 Sign In / Create Account
              </Link>
            </div>
          </div>
        </div>

        {/* BOTTOM COPYRIGHT & TRUST BADGES BAR */}
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            paddingTop: 24,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
            fontSize: 12,
            color: '#64748b',
          }}
        >
          <div>
            © 2026 PrintHive Inc. All rights reserved. Secured by Razorpay Escrow Protection.
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <span style={{ color: '#475569', fontSize: 11 }}>⚡ Three.js WebGL</span>
            <span style={{ color: '#475569', fontSize: 11 }}>📍 OpenStreetMap</span>
            <span style={{ color: '#475569', fontSize: 11 }}>☁️ Cloudinary CDN</span>
            <Link href="/faq" style={{ color: '#94a3b8', textDecoration: 'none' }}>Privacy Policy</Link>
            <Link href="/faq" style={{ color: '#94a3b8', textDecoration: 'none' }}>Terms & Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}