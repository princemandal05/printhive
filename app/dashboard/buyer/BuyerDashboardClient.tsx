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
  const [activeTab, setActiveTab] = useState<'briefs' | 'orders' | 'tools' | 'escrow'>('briefs')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredBriefs = myRequests.filter((b) =>
    (b.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (b.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const userName = user.name || user.email?.split('@')[0] || 'Maker'
  const userInitial = userName.charAt(0).toUpperCase()

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '36px 20px', minHeight: '85vh' }}>
      {/* 🌟 HERO PROFILE & WELCOME BANNER */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          borderRadius: 24,
          padding: '32px 36px',
          color: '#FFFFFF',
          marginBottom: 32,
          boxShadow: '0 12px 36px rgba(15,23,42,0.18)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Ambient subtle glow background */}
        <div
          style={{
            position: 'absolute',
            top: -60,
            right: -60,
            width: 260,
            height: 260,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,107,53,0.3) 0%, rgba(255,107,53,0) 70%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24, position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #FF6B35 0%, #F97316 100%)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 26,
                fontWeight: 900,
                boxShadow: '0 6px 20px rgba(255,107,53,0.4)',
                border: '3px solid rgba(255,255,255,0.2)',
              }}
            >
              {userInitial}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <h1 style={{ fontSize: 26, fontWeight: 900, margin: 0, letterSpacing: '-0.5px' }}>
                  Welcome back, {userName}!
                </h1>
                <span
                  style={{
                    background: 'rgba(16,185,129,0.2)',
                    color: '#34D399',
                    border: '1px solid rgba(52,211,153,0.4)',
                    padding: '3px 10px',
                    borderRadius: 99,
                    fontSize: 11,
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <CheckCircle2 size={12} /> Verified Buyer
                </span>
              </div>
              <p style={{ color: '#94A3B8', fontSize: 14, margin: 0 }}>
                Manage custom 3D modeling briefs, track physical manufacturing orders, and explore CAD models.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link
              href="/requests/new"
              style={{
                background: 'linear-gradient(135deg, #FF6B35 0%, #F97316 100%)',
                color: '#fff',
                padding: '12px 22px',
                borderRadius: 14,
                fontWeight: 900,
                fontSize: 14,
                textDecoration: 'none',
                boxShadow: '0 6px 20px rgba(255,107,53,0.35)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Sparkles size={16} /> Request Custom 3D Part
            </Link>
            <Link
              href="/print-on-demand"
              style={{
                background: 'rgba(255,255,255,0.1)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                padding: '12px 20px',
                borderRadius: 14,
                fontWeight: 800,
                fontSize: 14,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Zap size={16} /> Instant 3D Slicer
            </Link>
          </div>
        </div>
      </div>

      {/* 📊 SUMMARY METRICS ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18, marginBottom: 32 }}>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'briefs'}
          aria-pressed={activeTab === 'briefs'}
          onClick={() => setActiveTab('briefs')}
          style={{
            background: activeTab === 'briefs' ? '#FFF7ED' : '#FFFFFF',
            border: activeTab === 'briefs' ? '2px solid #FF6B35' : '1px solid #E2E8F0',
            borderRadius: 20,
            padding: 22,
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            transition: 'all 0.2s',
            textAlign: 'left',
            width: '100%',
            display: 'block',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>Custom 3D Briefs</span>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#FFF7ED', color: '#EA580C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={18} />
            </div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#0F172A', marginTop: 6, letterSpacing: '-0.5px' }}>
            {myRequests.length} Active
          </div>
          <div style={{ fontSize: 12, color: '#FF6B35', marginTop: 6, fontWeight: 700 }}>
            {myRequests.length > 0 ? 'Accepting Designer Bids' : 'Post your first brief'}
          </div>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'orders'}
          aria-pressed={activeTab === 'orders'}
          onClick={() => setActiveTab('orders')}
          style={{
            background: activeTab === 'orders' ? '#EFF6FF' : '#FFFFFF',
            border: activeTab === 'orders' ? '2px solid #3B82F6' : '1px solid #E2E8F0',
            borderRadius: 20,
            padding: 22,
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            transition: 'all 0.2s',
            textAlign: 'left',
            width: '100%',
            display: 'block',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>Physical Orders</span>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Package size={18} />
            </div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#0F172A', marginTop: 6, letterSpacing: '-0.5px' }}>
            {myOrders.length} Orders
          </div>
          <div style={{ fontSize: 12, color: '#2563EB', marginTop: 6, fontWeight: 700 }}>
            Live Slicing & Delivery Tracking
          </div>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'escrow'}
          aria-pressed={activeTab === 'escrow'}
          onClick={() => setActiveTab('escrow')}
          style={{
            background: activeTab === 'escrow' ? '#ECFDF5' : '#FFFFFF',
            border: activeTab === 'escrow' ? '2px solid #10B981' : '1px solid #E2E8F0',
            borderRadius: 20,
            padding: 22,
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            transition: 'all 0.2s',
            textAlign: 'left',
            width: '100%',
            display: 'block',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>Escrow Protection</span>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={18} />
            </div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#0F172A', marginTop: 6, letterSpacing: '-0.5px' }}>
            100% Safe
          </div>
          <div style={{ fontSize: 12, color: '#059669', marginTop: 6, fontWeight: 700 }}>
            Funds Released Upon Approval
          </div>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'tools'}
          aria-pressed={activeTab === 'tools'}
          onClick={() => setActiveTab('tools')}
          style={{
            background: activeTab === 'tools' ? '#FAF5FF' : '#FFFFFF',
            border: activeTab === 'tools' ? '2px solid #8B5CF6' : '1px solid #E2E8F0',
            borderRadius: 20,
            padding: 22,
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            transition: 'all 0.2s',
            textAlign: 'left',
            width: '100%',
            display: 'block',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>3D Tools Hub</span>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#FAF5FF', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Printer size={18} />
            </div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#0F172A', marginTop: 6, letterSpacing: '-0.5px' }}>
            On-Demand
          </div>
          <div style={{ fontSize: 12, color: '#7C3AED', marginTop: 6, fontWeight: 700 }}>
            STL Slicer & GPS Hub Matching
          </div>
        </button>
      </div>

      {/* 🧭 NAVIGATION TABS */}
      <div style={{ display: 'flex', gap: 10, borderBottom: '2px solid #E2E8F0', paddingBottom: 12, marginBottom: 28, flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('briefs')}
          style={{
            background: activeTab === 'briefs' ? '#0F172A' : 'transparent',
            color: activeTab === 'briefs' ? '#FFFFFF' : '#64748B',
            border: 'none',
            padding: '10px 18px',
            borderRadius: 12,
            fontWeight: 800,
            fontSize: 14,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'all 0.2s',
          }}
        >
          <Sparkles size={16} /> My Custom Briefs ({myRequests.length})
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          style={{
            background: activeTab === 'orders' ? '#0F172A' : 'transparent',
            color: activeTab === 'orders' ? '#FFFFFF' : '#64748B',
            border: 'none',
            padding: '10px 18px',
            borderRadius: 12,
            fontWeight: 800,
            fontSize: 14,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'all 0.2s',
          }}
        >
          <Package size={16} /> Orders & Tracking ({myOrders.length})
        </button>

        <button
          onClick={() => setActiveTab('tools')}
          style={{
            background: activeTab === 'tools' ? '#0F172A' : 'transparent',
            color: activeTab === 'tools' ? '#FFFFFF' : '#64748B',
            border: 'none',
            padding: '10px 18px',
            borderRadius: 12,
            fontWeight: 800,
            fontSize: 14,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'all 0.2s',
          }}
        >
          <Printer size={16} /> 3D Slicing & Print Tools
        </button>

        <button
          onClick={() => setActiveTab('escrow')}
          style={{
            background: activeTab === 'escrow' ? '#0F172A' : 'transparent',
            color: activeTab === 'escrow' ? '#FFFFFF' : '#64748B',
            border: 'none',
            padding: '10px 18px',
            borderRadius: 12,
            fontWeight: 800,
            fontSize: 14,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'all 0.2s',
          }}
        >
          <ShieldCheck size={16} /> Escrow & Security Policy
        </button>
      </div>

      {/* 🌟 TAB CONTENT: CUSTOM 3D BRIEFS */}
      {activeTab === 'briefs' && (
        <div>
          {/* Header & Search */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 14 }}>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 900, color: '#0F172A', margin: 0 }}>
                Custom Design & Manufacturing Briefs
              </h2>
              <p style={{ color: '#64748B', fontSize: 13, margin: '4px 0 0' }}>
                Track proposals submitted by verified 3D creators and manage your open projects.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: 12, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Search size={16} color="#64748B" />
                <input
                  type="text"
                  placeholder="Search your briefs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ border: 'none', outline: 'none', fontSize: 13, color: '#0F172A', background: 'transparent', width: 180 }}
                />
              </div>

              <Link
                href="/requests/new"
                style={{
                  background: 'linear-gradient(135deg, #FF6B35 0%, #F97316 100%)',
                  color: '#fff',
                  padding: '10px 18px',
                  borderRadius: 12,
                  fontWeight: 800,
                  fontSize: 13,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: '0 4px 14px rgba(255,107,53,0.25)',
                }}
              >
                <PlusCircle size={15} /> New Brief
              </Link>
            </div>
          </div>

          {filteredBriefs.length === 0 ? (
            <div style={{ background: '#FFFFFF', borderRadius: 24, border: '2px dashed #CBD5E1', padding: '60px 24px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#FFF7ED', color: '#FF6B35', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Sparkles size={28} />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 900, color: '#0F172A', margin: '0 0 6px' }}>
                {myRequests.length === 0 ? 'No Custom 3D Briefs Posted Yet' : 'No Briefs Matching Your Search'}
              </h3>
              <p style={{ color: '#64748B', fontSize: 14, maxWidth: 480, margin: '0 auto 24px', lineHeight: 1.5 }}>
                Have a broken part, cosplay helmet, or engineering concept? Post a custom brief and verified 3D designers and print hubs across India will send competitive bids!
              </p>
              <Link
                href="/requests/new"
                style={{
                  background: 'linear-gradient(135deg, #FF6B35 0%, #F97316 100%)',
                  color: '#fff',
                  padding: '14px 28px',
                  borderRadius: 14,
                  fontWeight: 900,
                  fontSize: 14,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 6px 20px rgba(255,107,53,0.35)',
                }}
              >
                <Sparkles size={16} /> Post Your First Custom 3D Brief
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 18 }}>
              {filteredBriefs.map((b) => (
                <div
                  key={b.id}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: 20,
                    border: '1px solid #E2E8F0',
                    padding: 26,
                    boxShadow: '0 6px 24px rgba(0,0,0,0.03)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 20,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 280 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                      <span
                        style={{
                          background: '#ECFDF5',
                          color: '#059669',
                          border: '1px solid #A7F3D0',
                          padding: '4px 12px',
                          borderRadius: 99,
                          fontSize: 12,
                          fontWeight: 800,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <Zap size={12} /> {b.status === 'open' ? 'Open for Bids' : b.status}
                      </span>
                      <span style={{ fontSize: 13, color: '#64748B', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={13} /> {b.created_at ? new Date(b.created_at).toLocaleDateString() : 'Recently'}
                      </span>
                      {b.budget > 0 && (
                        <span style={{ fontSize: 13, fontWeight: 900, color: '#FF6B35', background: '#FFF7ED', border: '1px solid #FFEDD5', padding: '3px 10px', borderRadius: 8 }}>
                          Budget: ₹{b.budget}
                        </span>
                      )}
                    </div>

                    <h3 style={{ fontSize: 20, fontWeight: 900, color: '#0F172A', margin: '0 0 8px', letterSpacing: '-0.3px' }}>
                      {b.title || 'Custom 3D Model Brief'}
                    </h3>

                    <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.5, margin: 0, whiteSpace: 'pre-line', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {b.description}
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end' }}>
                    <Link
                      href={`/requests/${b.id}`}
                      style={{
                        background: '#0F172A',
                        color: '#FFFFFF',
                        padding: '12px 22px',
                        borderRadius: 12,
                        fontWeight: 800,
                        fontSize: 14,
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        boxShadow: '0 4px 14px rgba(15,23,42,0.2)',
                      }}
                    >
                      View Brief & Proposals <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 📦 TAB CONTENT: ORDERS & TRACKING */}
      {activeTab === 'orders' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 900, color: '#0F172A', margin: 0 }}>
                Orders & Real-Time Tracking
              </h2>
              <p style={{ color: '#64748B', fontSize: 13, margin: '4px 0 0' }}>
                Follow your prints through CAD slicing, 3D printing, QA inspection, and courier delivery.
              </p>
            </div>
            <Link href="/shop" style={{ color: '#FF6B35', fontWeight: 800, fontSize: 14, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              Browse Shop <ArrowRight size={14} />
            </Link>
          </div>

          {myOrders.length === 0 ? (
            <div style={{ background: '#FFFFFF', borderRadius: 24, border: '2px dashed #CBD5E1', padding: '60px 24px', textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Package size={28} />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 900, color: '#0F172A', margin: '0 0 6px' }}>
                No Active Orders
              </h3>
              <p style={{ color: '#64748B', fontSize: 14, maxWidth: 440, margin: '0 auto 24px' }}>
                You have not placed any orders yet. Discover functional 3D printed gadgets or print your own 3D file on demand!
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link
                  href="/shop"
                  style={{
                    background: '#FF6B35',
                    color: '#fff',
                    padding: '12px 24px',
                    borderRadius: 12,
                    fontWeight: 800,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <ShoppingBag size={16} /> Explore Ready-Made Shop
                </Link>
                <Link
                  href="/print-on-demand"
                  style={{
                    background: '#0F172A',
                    color: '#fff',
                    padding: '12px 24px',
                    borderRadius: 12,
                    fontWeight: 800,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Printer size={16} /> Print an STL File
                </Link>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 16 }}>
              {myOrders.map((order) => (
                <div key={order.id} style={{ background: '#FFFFFF', borderRadius: 20, border: '1px solid #E2E8F0', padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                        <div style={{ fontSize: 16, fontWeight: 900, color: '#0F172A' }}>Order #{order.id.slice(0, 8)}</div>
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
                    <div style={{ fontSize: 18, fontWeight: 900, color: '#FF6B35' }}>
                      ₹{order.total_amount}
                    </div>
                  </div>
                  <Link href={`/orders/${order.id}`} style={{ color: '#2563EB', fontWeight: 800, fontSize: 13, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    Track Manufacturing Pipeline <ArrowRight size={14} />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 🖨️ TAB CONTENT: 3D SLICING & PRINT TOOLS */}
      {activeTab === 'tools' && (
        <div>
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: '#0F172A', margin: 0 }}>
              On-Demand 3D Tools & Hub Matcher
            </h2>
            <p style={{ color: '#64748B', fontSize: 13, margin: '4px 0 0' }}>
              Instant automated slicing algorithms, material calculations, and nearby verified printer matching.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
            <div style={{ background: '#FFFFFF', borderRadius: 20, border: '1px solid #E2E8F0', padding: 28, boxShadow: '0 6px 24px rgba(0,0,0,0.03)' }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: '#FFF7ED', color: '#FF6B35', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Zap size={24} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 900, color: '#0F172A', margin: '0 0 8px' }}>
                Instant Slicer & Quotation
              </h3>
              <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.5, marginBottom: 20 }}>
                Upload any STL or 3MF model to calculate volume, print weight in grams, print duration, and instant manufacturing costs.
              </p>
              <Link
                href="/print-on-demand"
                style={{
                  background: 'linear-gradient(135deg, #FF6B35 0%, #F97316 100%)',
                  color: '#fff',
                  padding: '10px 20px',
                  borderRadius: 12,
                  fontWeight: 800,
                  fontSize: 13,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                Launch 3D Slicer <ArrowRight size={14} />
              </Link>
            </div>

            <div style={{ background: '#FFFFFF', borderRadius: 20, border: '1px solid #E2E8F0', padding: 28, boxShadow: '0 6px 24px rgba(0,0,0,0.03)' }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: '#F1F5F9', color: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <MapPin size={24} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 900, color: '#0F172A', margin: '0 0 8px' }}>
                Nearby Printer Hubs Map
              </h3>
              <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.5, marginBottom: 20 }}>
                Find verified 3D print farms and makerspaces located within 5km–20km of your city for fast same-day pickup.
              </p>
              <Link
                href="/printers"
                style={{
                  background: '#0F172A',
                  color: '#fff',
                  padding: '10px 20px',
                  borderRadius: 12,
                  fontWeight: 800,
                  fontSize: 13,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                View Nearby Hubs <ArrowRight size={14} />
              </Link>
            </div>

            <div style={{ background: '#FFFFFF', borderRadius: 20, border: '1px solid #E2E8F0', padding: 28, boxShadow: '0 6px 24px rgba(0,0,0,0.03)' }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Box size={24} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 900, color: '#0F172A', margin: '0 0 8px' }}>
                3D Model Marketplace
              </h3>
              <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.5, marginBottom: 20 }}>
                Browse curated, ready-to-slice digital CAD models with real-time 3D Three.js viewport previews.
              </p>
              <Link
                href="/browse"
                style={{
                  background: '#2563EB',
                  color: '#fff',
                  padding: '10px 20px',
                  borderRadius: 12,
                  fontWeight: 800,
                  fontSize: 13,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                Browse 3D Models <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 🛡️ TAB CONTENT: ESCROW PROTECTION */}
      {activeTab === 'escrow' && (
        <div style={{ background: '#FFFFFF', borderRadius: 24, border: '1px solid #E2E8F0', padding: 36, boxShadow: '0 6px 24px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Lock size={26} />
            </div>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 900, color: '#0F172A', margin: 0 }}>
                PrintHive Escrow Guarantee
              </h2>
              <div style={{ color: '#10B981', fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4 }}>
                <CheckCircle2 size={14} /> 100% Protected via Razorpay Escrow
              </div>
            </div>
          </div>

          <p style={{ color: '#475569', fontSize: 15, lineHeight: 1.7, marginBottom: 24 }}>
            When you accept a designer proposal or order physical 3D prints on PrintHive, your payment is held securely in an isolated Escrow lock. Funds are never released to the seller or designer until you have received the item and confirmed quality compliance.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 28 }}>
            <div style={{ background: '#F8FAFC', padding: 20, borderRadius: 14, border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>
                <Lock size={16} color="#FF6B35" /> 1. Deposit & Lock
              </div>
              <div style={{ fontSize: 13, color: '#64748B' }}>Payment is securely locked in Razorpay Escrow when order starts.</div>
            </div>
            <div style={{ background: '#F8FAFC', padding: 20, borderRadius: 14, border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>
                <Layers size={16} color="#2563EB" /> 2. Print & Verification
              </div>
              <div style={{ fontSize: 13, color: '#64748B' }}>Hub prints with high tolerance and uploads QA photos.</div>
            </div>
            <div style={{ background: '#F8FAFC', padding: 20, borderRadius: 14, border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>
                <CheckCircle2 size={16} color="#10B981" /> 3. Delivery & Release
              </div>
              <div style={{ fontSize: 13, color: '#64748B' }}>You inspect the product. If satisfied, funds are released.</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <Link
              href="/support-tickets"
              style={{
                background: '#0F172A',
                color: '#fff',
                padding: '12px 22px',
                borderRadius: 12,
                fontWeight: 800,
                fontSize: 13,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <HelpCircle size={15} /> Contact Dispute Resolution
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
