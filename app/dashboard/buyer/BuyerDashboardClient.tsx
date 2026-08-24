'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  FileText,
  Package,
  ShieldCheck,
  Printer,
  Plus,
  Search,
  Clock,
  MapPin,
  Box,
  ArrowRight,
  ShoppingBag,
  Zap,
  CheckCircle2,
  ExternalLink,
  HelpCircle,
  TrendingUp,
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

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px', minHeight: '88vh', fontFamily: 'inherit' }}>
      
      {/* 🧭 COMPACT CLEAN TOP BAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.3px' }}>
              Buyer Workspace
            </h1>
            <span style={{ background: '#F1F5F9', color: '#475569', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6, border: '1px solid #E2E8F0' }}>
              Verified
            </span>
          </div>
          <div style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>
            Account of <strong style={{ color: '#0F172A' }}>{userName}</strong> &bull; Manage custom design briefs, orders, and 3D tooling.
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <Link
            href="/requests/new"
            style={{
              background: '#FF6B35',
              color: '#FFFFFF',
              padding: '8px 16px',
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 13,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 1px 3px rgba(255,107,53,0.25)',
              transition: 'background 0.15s',
            }}
          >
            <Plus size={15} /> New Custom Brief
          </Link>
          <Link
            href="/print-on-demand"
            style={{
              background: '#FFFFFF',
              color: '#0F172A',
              border: '1px solid #CBD5E1',
              padding: '8px 14px',
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 13,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Zap size={14} color="#FF6B35" /> Slicer
          </Link>
        </div>
      </div>

      {/* 📊 REFINED 4-STAT SUMMARY STRIP */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 20 }}>
        <button
          type="button"
          onClick={() => setActiveTab('briefs')}
          style={{
            background: activeTab === 'briefs' ? '#FFF7ED' : '#FFFFFF',
            border: activeTab === 'briefs' ? '1.5px solid #FF6B35' : '1px solid #E2E8F0',
            borderRadius: 10,
            padding: '14px 16px',
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>Custom Briefs</span>
            <FileText size={16} color={activeTab === 'briefs' ? '#EA580C' : '#94A3B8'} />
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A' }}>
            {myRequests.length} Active
          </div>
          <div style={{ fontSize: 11, color: '#EA580C', marginTop: 2, fontWeight: 600 }}>
            {myRequests.length > 0 ? 'Accepting Designer Bids' : 'Post your first brief'}
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          style={{
            background: activeTab === 'orders' ? '#EFF6FF' : '#FFFFFF',
            border: activeTab === 'orders' ? '1.5px solid #3B82F6' : '1px solid #E2E8F0',
            borderRadius: 10,
            padding: '14px 16px',
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>Physical Orders</span>
            <Package size={16} color={activeTab === 'orders' ? '#2563EB' : '#94A3B8'} />
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A' }}>
            {myOrders.length} Placed
          </div>
          <div style={{ fontSize: 11, color: '#2563EB', marginTop: 2, fontWeight: 600 }}>
            Manufacturing & Delivery
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tools')}
          style={{
            background: activeTab === 'tools' ? '#FAF5FF' : '#FFFFFF',
            border: activeTab === 'tools' ? '1.5px solid #8B5CF6' : '1px solid #E2E8F0',
            borderRadius: 10,
            padding: '14px 16px',
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>3D Tools Hub</span>
            <Printer size={16} color={activeTab === 'tools' ? '#7C3AED' : '#94A3B8'} />
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A' }}>
            Slicer & GPS
          </div>
          <div style={{ fontSize: 11, color: '#7C3AED', marginTop: 2, fontWeight: 600 }}>
            Nearby Print Farms
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('escrow')}
          style={{
            background: activeTab === 'escrow' ? '#ECFDF5' : '#FFFFFF',
            border: activeTab === 'escrow' ? '1.5px solid #10B981' : '1px solid #E2E8F0',
            borderRadius: 10,
            padding: '14px 16px',
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>Escrow Protection</span>
            <ShieldCheck size={16} color={activeTab === 'escrow' ? '#059669' : '#94A3B8'} />
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A' }}>
            100% Guarded
          </div>
          <div style={{ fontSize: 11, color: '#059669', marginTop: 2, fontWeight: 600 }}>
            Razorpay Vault
          </div>
        </button>
      </div>

      {/* 🧭 CRISP PROFESSIONAL TAB NAVIGATION BAR */}
      <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', marginBottom: 20, gap: 4 }}>
        <button
          type="button"
          onClick={() => setActiveTab('briefs')}
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'briefs' ? '2px solid #FF6B35' : '2px solid transparent',
            color: activeTab === 'briefs' ? '#0F172A' : '#64748B',
            fontWeight: activeTab === 'briefs' ? 700 : 500,
            fontSize: 13,
            padding: '10px 16px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <FileText size={15} color={activeTab === 'briefs' ? '#FF6B35' : '#94A3B8'} />
          Custom Briefs ({myRequests.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'orders' ? '2px solid #3B82F6' : '2px solid transparent',
            color: activeTab === 'orders' ? '#0F172A' : '#64748B',
            fontWeight: activeTab === 'orders' ? 700 : 500,
            fontSize: 13,
            padding: '10px 16px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Package size={15} color={activeTab === 'orders' ? '#3B82F6' : '#94A3B8'} />
          Orders & Pipeline ({myOrders.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tools')}
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'tools' ? '2px solid #8B5CF6' : '2px solid transparent',
            color: activeTab === 'tools' ? '#0F172A' : '#64748B',
            fontWeight: activeTab === 'tools' ? 700 : 500,
            fontSize: 13,
            padding: '10px 16px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Printer size={15} color={activeTab === 'tools' ? '#8B5CF6' : '#94A3B8'} />
          3D Slicer & Hubs
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('escrow')}
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'escrow' ? '2px solid #10B981' : '2px solid transparent',
            color: activeTab === 'escrow' ? '#0F172A' : '#64748B',
            fontWeight: activeTab === 'escrow' ? 700 : 500,
            fontSize: 13,
            padding: '10px 16px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <ShieldCheck size={15} color={activeTab === 'escrow' ? '#10B981' : '#94A3B8'} />
          Escrow Security
        </button>
      </div>

      {/* 📄 TAB 1: CUSTOM 3D BRIEFS */}
      {activeTab === 'briefs' && (
        <div style={{ background: '#FFFFFF', borderRadius: 12, border: '1px solid #E2E8F0', padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#0F172A' }}>
                Active Custom Briefs
              </div>
              <div style={{ fontSize: 12, color: '#64748B' }}>
                Specifications you posted for 3D modeling and custom printing proposals
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {myRequests.length > 0 && (
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 6, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Search size={13} color="#94A3B8" />
                  <input
                    type="text"
                    placeholder="Search briefs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ border: 'none', outline: 'none', fontSize: 12, color: '#0F172A', background: 'transparent', width: 130 }}
                  />
                </div>
              )}
              <Link
                href="/requests/new"
                style={{
                  background: '#0F172A',
                  color: '#FFFFFF',
                  padding: '6px 12px',
                  borderRadius: 6,
                  fontWeight: 700,
                  fontSize: 12,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Plus size={13} /> Post Brief
              </Link>
            </div>
          </div>

          {filteredBriefs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', background: '#F8FAFC', borderRadius: 8, border: '1px dashed #CBD5E1' }}>
              <FileText size={28} color="#94A3B8" style={{ margin: '0 auto 8px' }} />
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 2 }}>No Custom Briefs Found</div>
              <div style={{ fontSize: 12, color: '#64748B', maxWidth: 380, margin: '0 auto 12px' }}>
                Need a replacement part or custom CAD model? Post a brief to receive bids from verified designers.
              </div>
              <Link
                href="/requests/new"
                style={{
                  background: '#FF6B35',
                  color: '#FFFFFF',
                  padding: '8px 16px',
                  borderRadius: 6,
                  fontWeight: 700,
                  fontSize: 12,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Plus size={14} /> Create Your First Brief
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {filteredBriefs.map((b) => (
                <div
                  key={b.id}
                  style={{
                    background: '#F8FAFC',
                    borderRadius: 8,
                    border: '1px solid #E2E8F0',
                    padding: '14px 16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 12,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 260 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                      <span
                        style={{
                          background: b.status === 'open' ? '#ECFDF5' : b.status === 'awarded' || b.status === 'in_progress' ? '#EFF6FF' : b.status === 'completed' ? '#FAF5FF' : b.status === 'cancelled' || b.status === 'closed' ? '#FEF2F2' : '#F1F5F9',
                          color: b.status === 'open' ? '#059669' : b.status === 'awarded' || b.status === 'in_progress' ? '#2563EB' : b.status === 'completed' ? '#7C3AED' : b.status === 'cancelled' || b.status === 'closed' ? '#DC2626' : '#475569',
                          border: `1px solid ${b.status === 'open' ? '#A7F3D0' : b.status === 'awarded' || b.status === 'in_progress' ? '#BFDBFE' : b.status === 'completed' ? '#E9D5FF' : b.status === 'cancelled' || b.status === 'closed' ? '#FECACA' : '#CBD5E1'}`,
                          padding: '1px 6px',
                          borderRadius: 4,
                          fontSize: 10,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                        }}
                      >
                        {b.status === 'open' ? 'Open for Bids' : b.status}
                      </span>
                      <span style={{ fontSize: 11, color: '#64748B', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                        <Clock size={11} /> {b.created_at ? new Date(b.created_at).toLocaleDateString() : 'Recently'}
                      </span>
                      {b.budget > 0 && (
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#EA580C', background: '#FFF7ED', border: '1px solid #FFEDD5', padding: '1px 6px', borderRadius: 4 }}>
                          Budget: ₹{b.budget}
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', marginBottom: 2 }}>
                      {b.title || 'Custom 3D Request'}
                    </div>

                    <div style={{ fontSize: 12, color: '#64748B', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {b.description}
                    </div>
                  </div>

                  <Link
                    href={`/requests/${b.id}`}
                    style={{
                      background: '#0F172A',
                      color: '#FFFFFF',
                      padding: '8px 14px',
                      borderRadius: 6,
                      fontWeight: 700,
                      fontSize: 12,
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    View Proposals <ArrowRight size={13} />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 📦 TAB 2: PHYSICAL ORDERS */}
      {activeTab === 'orders' && (
        <div style={{ background: '#FFFFFF', borderRadius: 12, border: '1px solid #E2E8F0', padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#0F172A' }}>
                Orders & Manufacturing Pipeline
              </div>
              <div style={{ fontSize: 12, color: '#64748B' }}>
                Track live order stages from slicing and printing to courier dispatch
              </div>
            </div>
            <Link
              href="/shop"
              style={{
                color: '#FF6B35',
                fontWeight: 700,
                fontSize: 12,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <ShoppingBag size={13} /> Shop Catalog &rarr;
            </Link>
          </div>

          {myOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', background: '#F8FAFC', borderRadius: 8, border: '1px dashed #CBD5E1' }}>
              <Package size={28} color="#94A3B8" style={{ margin: '0 auto 8px' }} />
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 2 }}>No Orders Placed Yet</div>
              <div style={{ fontSize: 12, color: '#64748B', maxWidth: 360, margin: '0 auto 12px' }}>
                Explore ready-made 3D printed items in our store or upload your own file to print on demand.
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                <Link
                  href="/shop"
                  style={{
                    background: '#FF6B35',
                    color: '#FFFFFF',
                    padding: '8px 14px',
                    borderRadius: 6,
                    fontWeight: 700,
                    fontSize: 12,
                    textDecoration: 'none',
                  }}
                >
                  Explore Store
                </Link>
                <Link
                  href="/print-on-demand"
                  style={{
                    background: '#FFFFFF',
                    color: '#0F172A',
                    border: '1px solid #CBD5E1',
                    padding: '8px 14px',
                    borderRadius: 6,
                    fontWeight: 600,
                    fontSize: 12,
                    textDecoration: 'none',
                  }}
                >
                  Print STL File
                </Link>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {myOrders.map((order) => (
                <div
                  key={order.id}
                  style={{
                    background: '#F8FAFC',
                    borderRadius: 8,
                    border: '1px solid #E2E8F0',
                    padding: '12px 16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 10,
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>Order #{order.id.slice(0, 8)}</span>
                      <span
                        style={{
                          background: order.status === 'delivered' ? '#ECFDF5' : '#EFF6FF',
                          color: order.status === 'delivered' ? '#059669' : '#2563EB',
                          border: `1px solid ${order.status === 'delivered' ? '#A7F3D0' : '#BFDBFE'}`,
                          padding: '1px 6px',
                          borderRadius: 4,
                          fontSize: 10,
                          fontWeight: 700,
                          textTransform: 'capitalize',
                        }}
                      >
                        {order.status || 'Processing'}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: '#64748B' }}>
                      Placed on {new Date(order.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#FF6B35' }}>
                      ₹{order.total_amount}
                    </div>
                    <Link
                      href={`/orders/${order.id}`}
                      style={{
                        color: '#2563EB',
                        fontWeight: 700,
                        fontSize: 12,
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 3,
                      }}
                    >
                      Track Pipeline <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 🖨️ TAB 3: 3D TOOLS & NEARBY HUBS */}
      {activeTab === 'tools' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
          <div style={{ background: '#FFFFFF', borderRadius: 10, border: '1px solid #E2E8F0', padding: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: 6, background: '#FFF7ED', color: '#FF6B35', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={16} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>Instant 3D Slicer</div>
            </div>
            <p style={{ fontSize: 12, color: '#64748B', lineHeight: 1.5, margin: '0 0 14px' }}>
              Upload any STL/3MF mesh to calculate part volume, mass in grams, print duration, and instant cost quotations.
            </p>
            <Link
              href="/print-on-demand"
              style={{
                color: '#FF6B35',
                fontWeight: 700,
                fontSize: 12,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              Launch Slicer Engine &rarr;
            </Link>
          </div>

          <div style={{ background: '#FFFFFF', borderRadius: 10, border: '1px solid #E2E8F0', padding: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: 6, background: '#F1F5F9', color: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MapPin size={16} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>Nearby Hubs Map</div>
            </div>
            <p style={{ fontSize: 12, color: '#64748B', lineHeight: 1.5, margin: '0 0 14px' }}>
              Locate verified local 3D print farms and makerspaces within 5km–20km of your area for rapid pickup.
            </p>
            <Link
              href="/printers"
              style={{
                color: '#0F172A',
                fontWeight: 700,
                fontSize: 12,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              View Hubs Grid &rarr;
            </Link>
          </div>

          <div style={{ background: '#FFFFFF', borderRadius: 10, border: '1px solid #E2E8F0', padding: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: 6, background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box size={16} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>CAD Model Repository</div>
            </div>
            <p style={{ fontSize: 12, color: '#64748B', lineHeight: 1.5, margin: '0 0 14px' }}>
              Explore curated, verified 3D models with full in-browser WebGL orbit controls and wireframe inspection.
            </p>
            <Link
              href="/browse"
              style={{
                color: '#2563EB',
                fontWeight: 700,
                fontSize: 12,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              Browse 3D Models &rarr;
            </Link>
          </div>
        </div>
      )}

      {/* 🛡️ TAB 4: ESCROW PROTECTION */}
      {activeTab === 'escrow' && (
        <div style={{ background: '#FFFFFF', borderRadius: 12, border: '1px solid #E2E8F0', padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <ShieldCheck size={22} color="#059669" />
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#0F172A' }}>Razorpay Escrow Guarantee</div>
              <div style={{ fontSize: 12, color: '#64748B' }}>How your funds and orders are secured during production</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12, marginBottom: 18 }}>
            <div style={{ background: '#F8FAFC', padding: 14, borderRadius: 8, border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>1. Safe Vault Deposit</div>
              <div style={{ fontSize: 11, color: '#64748B', lineHeight: 1.4 }}>Funds are held in a secure Escrow account when you place your order or award a custom brief.</div>
            </div>
            <div style={{ background: '#F8FAFC', padding: 14, borderRadius: 8, border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>2. Verified Slicing & Print</div>
              <div style={{ fontSize: 11, color: '#64748B', lineHeight: 1.4 }}>The local hub prints your model according to exact material, infill, and dimensional tolerances.</div>
            </div>
            <div style={{ background: '#F8FAFC', padding: 14, borderRadius: 8, border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>3. Delivery Confirmation</div>
              <div style={{ fontSize: 11, color: '#64748B', lineHeight: 1.4 }}>Upon successful delivery and quality approval, the 70/15/15 revenue split is automatically executed.</div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, paddingTop: 12, borderTop: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: 12, color: '#64748B' }}>
              Encountered any print defect or dimension issue?
            </div>
            <Link
              href="/support-tickets"
              style={{
                background: '#0F172A',
                color: '#FFFFFF',
                padding: '6px 12px',
                borderRadius: 6,
                fontWeight: 700,
                fontSize: 12,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <HelpCircle size={13} /> Open Support Ticket
            </Link>
          </div>
        </div>
      )}

    </div>
  )
}
