import { createClient } from '@/utils/supabase/server'
import { requireRole } from '@/utils/supabase/require-role'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default async function BuyerDashboard() {
  const { user } = await requireRole('buyer')

  const handleSignOut = async () => {
    'use server'
    const s = await createClient()
    await s.auth.signOut()
    redirect('/')
  }

  const s: Record<string, React.CSSProperties> = {
    page: { minHeight: '100vh', background: 'var(--bg-canvas)', color: 'var(--text-main)', fontFamily: 'inherit' },
    body: { maxWidth: 1280, margin: '0 auto', padding: '28px 24px' },
    headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap' as const, gap: 16 },
    title: { fontSize: 24, fontWeight: 900, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.5px' },
    sub: { fontSize: 13, color: 'var(--text-sub)', marginTop: 4 },
    primaryBtn: { background: 'linear-gradient(135deg, #FF6B35 0%, #F97316 100%)', color: '#fff', padding: '10px 20px', borderRadius: 12, fontWeight: 800, fontSize: 13, textDecoration: 'none', boxShadow: '0 4px 14px rgba(255,107,53,0.25)', display: 'inline-flex', alignItems: 'center', gap: 6 },
    metricGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 },
    card: { background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border-color)', padding: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.04)' },
    metricVal: { fontSize: 26, fontWeight: 900, color: 'var(--text-main)', marginTop: 6, letterSpacing: '-0.5px' },
    metricLabel: { fontSize: 11, color: 'var(--text-sub)', fontWeight: 800, textTransform: 'uppercase' as const, letterSpacing: 0.5 },
    actionCard: { background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border-color)', padding: 20, textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: 14, transition: 'all 0.2s' },
  }

  return (
    <div style={s.page}>
      {/* SITE TOP NAVBAR */}
      <Navbar />

      {/* MAIN CONTENT CONTAINER */}
      <div style={s.body}>
        {/* DASHBOARD HEADER */}
        <div style={s.headerRow}>
          <div>
            <h1 style={s.title}>My Buyer Portal</h1>
            <div style={s.sub}>Track live print orders, manage escrow payments, and explore 3D marketplaces</div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Link href="/shop" style={s.primaryBtn}>
              🛒 Browse Shop Marketplace
            </Link>
            <Link href="/print-on-demand" style={{ background: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border-color)', padding: '10px 18px', borderRadius: 12, fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
              🖨️ Instant Print Estimator
            </Link>
          </div>
        </div>

        {/* METRICS CARDS GRID */}
        <div style={s.metricGrid}>
          <div style={s.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={s.metricLabel}>Total Orders Placed</div>
              <span style={{ fontSize: 22 }}>📦</span>
            </div>
            <div style={s.metricVal}>0 Orders</div>
            <div style={{ fontSize: 12, color: '#64748B', marginTop: 8, fontWeight: 600 }}>100% Order Tracking</div>
          </div>

          <div style={s.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={s.metricLabel}>Escrow Protection</div>
              <span style={{ fontSize: 22 }}>🔒</span>
            </div>
            <div style={s.metricVal}>₹0</div>
            <div style={{ fontSize: 12, color: '#2563EB', marginTop: 8, fontWeight: 700 }}>100% Razorpay Escrow Safe</div>
          </div>

          <div style={s.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={s.metricLabel}>Nearby Printer Hubs</div>
              <span style={{ fontSize: 22 }}>📍</span>
            </div>
            <div style={s.metricVal}>0 Hubs</div>
            <div style={{ fontSize: 12, color: '#64748B', marginTop: 8, fontWeight: 600 }}>GPS Matched Across India</div>
          </div>

          <div style={s.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={s.metricLabel}>Wishlist & Saved</div>
              <span style={{ fontSize: 22 }}>❤️</span>
            </div>
            <div style={s.metricVal}>0 Models</div>
            <div style={{ fontSize: 12, color: '#FF6B35', marginTop: 8, fontWeight: 700 }}>Saved Favorite Products</div>
          </div>
        </div>

        {/* QUICK ACTIONS BANNER */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 36 }}>
          <Link href="/shop" style={s.actionCard}>
            <div style={{ fontSize: 32 }}>🛍️</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color: '#0F172A' }}>Ready-Made Shop</div>
              <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>Browse physical 3D printed items</div>
            </div>
          </Link>

          <Link href="/print-on-demand" style={s.actionCard}>
            <div style={{ fontSize: 32 }}>⚡</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color: '#0F172A' }}>Print Custom File</div>
              <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>Upload STL for instant slicing cost</div>
            </div>
          </Link>

          <Link href="/requests/new" style={s.actionCard}>
            <div style={{ fontSize: 32 }}>✏️</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color: '#0F172A' }}>Post Custom Request</div>
              <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>Get bids from top 3D designers</div>
            </div>
          </Link>
        </div>

        {/* LIVE ORDERS PIPELINE (AMAZON STYLE) */}
        <div style={{ ...s.card, marginBottom: 36 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#0F172A' }}>🚚 Active Orders & Tracking</div>
              <div style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>Live status pushing from printer hub slicing to doorstep delivery</div>
            </div>
            <Link href="/orders" style={{ color: '#FF6B35', fontWeight: 800, fontSize: 14, textDecoration: 'none' }}>
              View All Orders
            </Link>
          </div>

          <div style={{ textAlign: 'center', padding: '40px 24px', background: '#F8FAFC', borderRadius: 16, border: '2px dashed #CBD5E1' }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🚚</div>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#0F172A', marginBottom: 4 }}>No Active Orders Found</div>
            <div style={{ fontSize: 13, color: '#64748B', marginBottom: 16 }}>Your active purchases and print-on-demand jobs will track here in real time.</div>
            <Link href="/shop" style={s.primaryBtn}>
              🛒 Explore Shop Marketplace
            </Link>
          </div>
        </div>

        {/* CUSTOMER SUPPORT TICKETS DESK */}
        <div style={s.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#0F172A' }}>🎧 Support Desk & Live Complaint Tracker</div>
              <div style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>Submit tickets, report order issues, or check live complaint resolution status</div>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href="/support-tickets" style={{ background: '#0F172A', color: '#fff', padding: '10px 18px', borderRadius: 12, fontWeight: 800, fontSize: 13, textDecoration: 'none' }}>
                📋 My Support Tickets
              </Link>
              <Link href="/contact" style={{ background: '#c2410c', color: '#ffffff', padding: '10px 18px', borderRadius: 12, fontWeight: 800, fontSize: 13, textDecoration: 'none' }}>
                ✉️ Send Message to Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}