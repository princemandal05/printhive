'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Sparkles,
  Package,
  ShieldCheck,
  Printer,
  PlusCircle,
  Search,
  Clock,
  MapPin,
  Box,
  CheckCircle2,
  ArrowRight,
  ShoppingBag,
  Zap,
  Lock,
  Layers,
  HelpCircle,
  FileText,
} from 'lucide-react'

interface CustomBrief {
  id: string
  title: string
  description: string
  budget: number
  status: string
  created_at: string
  bids_count?: number
}

interface OrderItem {
  id: string
  total_amount: number
  status: string
  created_at: string
  items?: any[]
  shipping_address?: any
  tracking_number?: string
}

interface BuyerDashboardClientProps {
  user: {
    id: string
    email?: string
    name?: string
    avatar_url?: string
  }
  myRequests: CustomBrief[]
  myOrders: OrderItem[]
}

export default function BuyerDashboardClient({ user, myRequests, myOrders }: BuyerDashboardClientProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredBriefs = myRequests.filter((b) =>
    (b.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (b.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const userName = user.name || user.email?.split('@')[0] || 'Maker'

  const s: Record<string, React.CSSProperties> = {
    container: { maxWidth: 1240, margin: '0 auto', padding: '32px 20px', minHeight: '85vh' },
    headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 },
    title: { fontSize: 28, fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.5px' },
    sub: { fontSize: 14, color: '#64748B', marginTop: 4 },
    primaryBtn: {
      background: 'linear-gradient(135deg, #FF6B35 0%, #F97316 100%)',
      color: '#FFFFFF',
      padding: '12px 22px',
      borderRadius: 14,
      fontWeight: 800,
      fontSize: 14,
      textDecoration: 'none',
      boxShadow: '0 4px 16px rgba(255,107,53,0.3)',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
    outlineBtn: {
      background: '#FFFFFF',
      color: '#0F172A',
      border: '1px solid #CBD5E1',
      padding: '12px 20px',
      borderRadius: 14,
      fontWeight: 700,
      fontSize: 14,
      textDecoration: 'none',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      transition: 'all 0.2s ease',
    },
    metricGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 32 },
    card: { background: '#FFFFFF', borderRadius: 20, border: '1px solid #E2E8F0', padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' },
    metricVal: { fontSize: 26, fontWeight: 900, color: '#0F172A', marginTop: 6, letterSpacing: '-0.5px' },
    metricLabel: { fontSize: 11, color: '#64748B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 },
  }

  return (
    <div style={s.container}>
      {/* 🌟 CLEAN LUXURY HEADER */}
      <div style={s.headerRow}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,107,53,0.1)', color: '#EA580C', border: '1px solid rgba(255,107,53,0.25)', padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
            <Sparkles size={13} /> Buyer Dashboard
          </div>
          <h1 style={s.title}>Welcome back, {userName}!</h1>
          <div style={s.sub}>Manage your custom 3D design briefs, track manufacturing orders, and explore 3D models.</div>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link href="/requests/new" style={s.primaryBtn}>
            <PlusCircle size={16} /> Request Custom 3D Part
          </Link>
          <Link href="/print-on-demand" style={s.outlineBtn}>
            <Zap size={16} color="#FF6B35" /> Instant 3D Slicer
          </Link>
        </div>
      </div>

      {/* 📊 METRICS ROW */}
      <div style={s.metricGrid}>
        <div style={s.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={s.metricLabel}>Custom 3D Briefs</div>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: '#FFF7ED', color: '#EA580C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={18} />
            </div>
          </div>
          <div style={s.metricVal}>{myRequests.length} Active</div>
          <div style={{ fontSize: 12, color: '#EA580C', marginTop: 8, fontWeight: 700 }}>
            {myRequests.length > 0 ? 'Accepting Designer Bids' : 'No active briefs'}
          </div>
        </div>

        <div style={s.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={s.metricLabel}>Physical Orders</div>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Package size={18} />
            </div>
          </div>
          <div style={s.metricVal}>{myOrders.length} Orders</div>
          <div style={{ fontSize: 12, color: '#2563EB', marginTop: 8, fontWeight: 700 }}>
            Live Slicing & Delivery Tracking
          </div>
        </div>

        <div style={s.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={s.metricLabel}>Escrow Protection</div>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={18} />
            </div>
          </div>
          <div style={s.metricVal}>100% Safe</div>
          <div style={{ fontSize: 12, color: '#059669', marginTop: 8, fontWeight: 700 }}>
            Razorpay Escrow Vault
          </div>
        </div>

        <div style={s.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={s.metricLabel}>Nearby Printer Hubs</div>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: '#FAF5FF', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Printer size={18} />
            </div>
          </div>
          <div style={s.metricVal}>On-Demand</div>
          <div style={{ fontSize: 12, color: '#7C3AED', marginTop: 8, fontWeight: 700 }}>
            GPS Matched Micro-Farms
          </div>
        </div>
      </div>

      {/* 🌟 SECTION 1: CUSTOM 3D BRIEFS & REQUESTS */}
      <div style={{ ...s.card, marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 14 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={18} color="#FF6B35" /> My Custom 3D Briefs & Requests ({myRequests.length})
            </div>
            <div style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>
              Custom design briefs and manufacturing requests you have posted for verified creators to bid on
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            {myRequests.length > 0 && (
              <div style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: 12, padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Search size={15} color="#64748B" />
                <input
                  type="text"
                  placeholder="Filter briefs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ border: 'none', outline: 'none', fontSize: 13, color: '#0F172A', background: 'transparent', width: 140 }}
                />
              </div>
            )}

            <Link
              href="/requests/new"
              style={{
                background: '#FF6B35',
                color: '#fff',
                padding: '8px 16px',
                borderRadius: 10,
                fontWeight: 800,
                fontSize: 13,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <PlusCircle size={14} /> Post Brief
            </Link>
          </div>
        </div>

        {filteredBriefs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', background: '#F8FAFC', borderRadius: 16, border: '2px dashed #CBD5E1' }}>
            <div style={{ width: 50, height: 50, borderRadius: '50%', background: '#FFF7ED', color: '#FF6B35', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <Sparkles size={24} />
            </div>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#0F172A', marginBottom: 4 }}>
              {myRequests.length === 0 ? 'No Custom 3D Briefs Posted Yet' : 'No Briefs Matching Filter'}
            </div>
            <div style={{ fontSize: 13, color: '#64748B', maxWidth: 440, margin: '0 auto 18px', lineHeight: 1.5 }}>
              Need a custom CAD replacement part, cosplay model, or prototype? Post a brief to get proposals from 3D designers and print hubs across India.
            </div>
            <Link href="/requests/new" style={s.primaryBtn}>
              <PlusCircle size={16} /> Post Your First Custom 3D Brief
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 14 }}>
            {filteredBriefs.map((b) => (
              <div
                key={b.id}
                style={{
                  background: '#F8FAFC',
                  borderRadius: 16,
                  border: '1px solid #E2E8F0',
                  padding: 20,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 16,
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ flex: 1, minWidth: 260 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                    <span
                      style={{
                        background: '#ECFDF5',
                        color: '#059669',
                        border: '1px solid #A7F3D0',
                        padding: '3px 10px',
                        borderRadius: 99,
                        fontSize: 11,
                        fontWeight: 800,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <Zap size={11} /> {b.status === 'open' ? 'Open for Bids' : b.status}
                    </span>
                    <span style={{ fontSize: 12, color: '#64748B', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={12} /> {b.created_at ? new Date(b.created_at).toLocaleDateString() : 'Recently'}
                    </span>
                    {b.budget > 0 && (
                      <span style={{ fontSize: 12, fontWeight: 900, color: '#EA580C', background: '#FFF7ED', border: '1px solid #FFEDD5', padding: '2px 8px', borderRadius: 6 }}>
                        Target Budget: ₹{b.budget}
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontSize: 18, fontWeight: 900, color: '#0F172A', margin: '0 0 6px' }}>
                    {b.title || 'Custom 3D Request'}
                  </h3>

                  <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.4, margin: 0, whiteSpace: 'pre-line', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {b.description}
                  </p>
                </div>

                <Link
                  href={`/requests/${b.id}`}
                  style={{
                    background: '#0F172A',
                    color: '#FFFFFF',
                    padding: '10px 18px',
                    borderRadius: 12,
                    fontWeight: 800,
                    fontSize: 13,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    whiteSpace: 'nowrap',
                    boxShadow: '0 2px 10px rgba(15,23,42,0.15)',
                  }}
                >
                  View Brief & Proposals <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🌟 SECTION 2: ACTIVE ORDERS & TRACKING */}
      <div style={{ ...s.card, marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Package size={18} color="#2563EB" /> Orders & Real-Time Tracking ({myOrders.length})
            </div>
            <div style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>
              Track physical 3D print orders from slicing to doorstep delivery
            </div>
          </div>
          <Link href="/shop" style={{ color: '#FF6B35', fontWeight: 800, fontSize: 13, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <ShoppingBag size={14} /> Browse Shop →
          </Link>
        </div>

        {myOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 24px', background: '#F8FAFC', borderRadius: 16, border: '2px dashed #CBD5E1' }}>
            <div style={{ width: 50, height: 50, borderRadius: '50%', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <Package size={24} />
            </div>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#0F172A', marginBottom: 4 }}>No Orders Found</div>
            <div style={{ fontSize: 13, color: '#64748B', marginBottom: 16 }}>
              Your physical purchases and on-demand print orders will track here in real time.
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/shop" style={{ ...s.primaryBtn, padding: '10px 18px', fontSize: 13 }}>
                <ShoppingBag size={15} /> Explore Shop Marketplace
              </Link>
              <Link href="/print-on-demand" style={{ ...s.outlineBtn, padding: '10px 18px', fontSize: 13 }}>
                <Printer size={15} /> Print a 3D File
              </Link>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {myOrders.map((order) => (
              <div
                key={order.id}
                style={{
                  background: '#F8FAFC',
                  borderRadius: 14,
                  border: '1px solid #E2E8F0',
                  padding: 18,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <div style={{ fontSize: 15, fontWeight: 900, color: '#0F172A' }}>Order #{order.id.slice(0, 8)}</div>
                    <span
                      style={{
                        background: order.status === 'delivered' ? '#ECFDF5' : order.status === 'cancelled' ? '#FEF2F2' : '#EFF6FF',
                        color: order.status === 'delivered' ? '#059669' : order.status === 'cancelled' ? '#DC2626' : '#2563EB',
                        border: `1px solid ${order.status === 'delivered' ? '#A7F3D0' : order.status === 'cancelled' ? '#FECACA' : '#BFDBFE'}`,
                        padding: '2px 8px',
                        borderRadius: 99,
                        fontSize: 11,
                        fontWeight: 800,
                        textTransform: 'capitalize',
                      }}
                    >
                      {order.status || 'Processing'}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: '#64748B' }}>Placed on {new Date(order.created_at).toLocaleDateString()}</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ fontSize: 17, fontWeight: 900, color: '#FF6B35' }}>
                    ₹{order.total_amount}
                  </div>
                  <Link href={`/orders/${order.id}`} style={{ color: '#2563EB', fontWeight: 800, fontSize: 13, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    Track Order <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🌟 SECTION 3: 3D TOOLS & QUICK ACTIONS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18, marginBottom: 32 }}>
        <div style={s.card}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#FFF7ED', color: '#FF6B35', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
            <Zap size={22} />
          </div>
          <h3 style={{ fontSize: 17, fontWeight: 900, color: '#0F172A', margin: '0 0 6px' }}>
            Instant 3D Slicer
          </h3>
          <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.5, marginBottom: 18 }}>
            Upload any STL or 3MF model to calculate volume, weight in grams, print duration, and instant manufacturing cost.
          </p>
          <Link href="/print-on-demand" style={{ color: '#FF6B35', fontWeight: 800, fontSize: 13, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            Launch Slicer Engine <ArrowRight size={14} />
          </Link>
        </div>

        <div style={s.card}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#F1F5F9', color: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
            <MapPin size={22} />
          </div>
          <h3 style={{ fontSize: 17, fontWeight: 900, color: '#0F172A', margin: '0 0 6px' }}>
            Nearby Printer Hubs Map
          </h3>
          <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.5, marginBottom: 18 }}>
            Find verified 3D print farms and makerspaces located within 5km–20km of your location for rapid local pickup.
          </p>
          <Link href="/printers" style={{ color: '#0F172A', fontWeight: 800, fontSize: 13, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            Explore Nearby Hubs <ArrowRight size={14} />
          </Link>
        </div>

        <div style={s.card}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
            <Box size={22} />
          </div>
          <h3 style={{ fontSize: 17, fontWeight: 900, color: '#0F172A', margin: '0 0 6px' }}>
            3D Model Marketplace
          </h3>
          <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.5, marginBottom: 18 }}>
            Browse curated, ready-to-print digital CAD designs with real-time 3D Three.js WebGL viewport inspection.
          </p>
          <Link href="/browse" style={{ color: '#2563EB', fontWeight: 800, fontSize: 13, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            Browse 3D Models <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* 🌟 SECTION 4: ESCROW PROTECTION & SUPPORT */}
      <div style={{ ...s.card, background: '#FFFFFF' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#0F172A' }}>Razorpay Escrow Protected</div>
              <div style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>Funds are locked in Escrow and released only after you verify print quality upon delivery.</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link
              href="/support-tickets"
              style={{
                background: '#0F172A',
                color: '#fff',
                padding: '10px 18px',
                borderRadius: 12,
                fontWeight: 800,
                fontSize: 13,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <HelpCircle size={15} /> Support Desk
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
