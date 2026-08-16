'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AnalyticsChart from '@/components/AnalyticsChart'

import DashboardSidebar from '@/components/DashboardSidebar'

interface DesignItem {
  id: string
  title: string
  category: string
  price: number
  royalty: string
  prints: number
  preview: string
  status: string
}

interface Props {
  userEmail: string
  initialDesigns: DesignItem[]
  signOutAction: () => Promise<void>
}

export default function DesignerDashboardClient({ userEmail, initialDesigns, signOutAction }: Props) {
  const [designs, setDesigns] = useState<DesignItem[]>(initialDesigns)

  useEffect(() => {
    try {
      const localStr = localStorage.getItem('printhive_uploaded_designs')
      if (localStr) {
        const localItems = JSON.parse(localStr)
        if (Array.isArray(localItems) && localItems.length > 0) {
          const formatted = localItems.map((d: any, index: number) => ({
            id: d.id || `custom-${index}`,
            title: d.title || '3D Model Design',
            category: d.category || '3D Printing',
            price: d.pricing_type === 'free' ? 0 : Number(d.price) || 0,
            royalty: d.pricing_type === 'free' ? 'Open Source' : '15% per print',
            prints: 0,
            preview: d.preview_url || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
            status: d.status || 'Published',
          }))

          // Merge without duplicate IDs
          const existingIds = new Set(initialDesigns.map((x) => x.id))
          const uniqueLocal = formatted.filter((x: any) => !existingIds.has(x.id))

          setDesigns([...uniqueLocal, ...initialDesigns])
        }
      }
    } catch (err) {
      console.warn('Error parsing local designs:', err)
    }
  }, [initialDesigns])

  const s: Record<string, React.CSSProperties> = {
    page: { minHeight: '100vh', background: '#FAF8F5', color: '#0F172A', fontFamily: 'inherit', display: 'flex' },
    main: { flex: 1, padding: '24px 32px', minWidth: 0, overflowX: 'hidden' },
    headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' as const, gap: 16 },
    title: { fontSize: 22, fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.5px' },
    sub: { fontSize: 13, color: '#64748B', marginTop: 4 },
    primaryBtn: { background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)', color: '#fff', padding: '10px 18px', borderRadius: 10, fontWeight: 800, fontSize: 13, textDecoration: 'none', boxShadow: '0 4px 14px rgba(139,92,246,0.25)', display: 'inline-flex', alignItems: 'center', gap: 6 },
    metricGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16, marginBottom: 20 },
    card: { background: '#FFFFFF', borderRadius: 14, border: '1px solid #E2E8F0', padding: 18, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' },
    metricVal: { fontSize: 24, fontWeight: 900, color: '#0F172A', marginTop: 6, letterSpacing: '-0.5px' },
    metricLabel: { fontSize: 11, color: '#64748B', fontWeight: 800, textTransform: 'uppercase' as const, letterSpacing: 0.5 },
  }

  return (
    <div style={s.page}>
      {/* SAAS SIDEBAR NAVIGATION */}
      <DashboardSidebar role="designer" userEmail={userEmail} signOutAction={signOutAction} />

      {/* MAIN CONTENT CANVAS */}
      <main style={s.main}>
        {/* DASHBOARD HEADER */}
        <div style={s.headerRow}>
          <div>
            <h1 style={s.title}>3D Creator Studio & Royalty Portal</h1>
            <div style={s.sub}>Upload STL/3MF models, earn 15% automated royalties on every print order</div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link href="/browse" style={{ background: '#FFFFFF', color: '#0F172A', border: '1px solid #CBD5E1', padding: '10px 18px', borderRadius: 10, fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
              🧊 3D Models Directory
            </Link>
            <Link href="/dashboard/designer/upload" style={s.primaryBtn}>
              <span>+ Upload New 3D Model</span>
            </Link>
          </div>
        </div>

        {/* METRICS OVERVIEW */}
        <div style={s.metricGrid}>
          <div style={s.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={s.metricLabel}>Total Royalties Earned</span>
              <span style={{ fontSize: 16 }}>💰</span>
            </div>
            <div style={s.metricVal}>
              ₹{designs.reduce((acc, d) => acc + (d.price ? Math.round(d.price * 0.15 * (d.prints || 0)) : 0), 0)}
            </div>
            <div style={{ fontSize: 11, color: '#10B981', marginTop: 4, fontWeight: 700 }}>15% Royalty per order payout</div>
          </div>

          {/* CLICKABLE PUBLISHED MODELS CARD */}
          <div
            onClick={() => {
              const el = document.getElementById('my-published-models')
              if (el) el.scrollIntoView({ behavior: 'smooth' })
            }}
            style={{ ...s.card, cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={s.metricLabel}>Published Models</span>
              <span style={{ fontSize: 16 }}>📦</span>
            </div>
            <div style={s.metricVal}>{designs.length} Models</div>
            <div style={{ fontSize: 11, color: '#64748B', marginTop: 4, fontWeight: 600 }}>Live in STL Marketplace</div>
          </div>

          <Link href="/orders" style={{ ...s.card, textDecoration: 'none', color: 'inherit' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={s.metricLabel}>Total Prints Fulfilled</span>
              <span style={{ fontSize: 16 }}>🖨️</span>
            </div>
            <div style={s.metricVal}>
              {designs.reduce((acc, d) => acc + (d.prints || 0), 0)} Prints
            </div>
            <div style={{ fontSize: 11, color: '#0284C7', marginTop: 4, fontWeight: 600 }}>Across Verified Hubs</div>
          </Link>

          <Link href="/requests" style={{ ...s.card, textDecoration: 'none', color: 'inherit' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={s.metricLabel}>Open Brief Bids</span>
              <span style={{ fontSize: 16 }}>✏️</span>
            </div>
            <div style={s.metricVal}>0 Open Bids</div>
            <div style={{ fontSize: 11, color: '#D97706', marginTop: 4, fontWeight: 600 }}>Custom Buyer Requests</div>
          </Link>
        </div>

        {/* ANALYTICS METRIC CHART */}
        <AnalyticsChart
          title="Creator Royalty Velocity & Download Analytics"
          subtitle="Live 7-Day Performance & Royalty Accrual"
          accentColor="#8B5CF6"
          data={[
            { label: 'Mon', value: 0 },
            { label: 'Tue', value: 0 },
            { label: 'Wed', value: 0 },
            { label: 'Thu', value: 0 },
            { label: 'Fri', value: 0 },
            { label: 'Sat', value: 0 },
            { label: 'Sun', value: 0 },
          ]}
        />

        {/* PUBLISHED MODELS SHOWCASE */}
        <div id="my-published-models" style={{ ...s.card, marginBottom: 20, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A' }}>🎨 My Published 3D Models</div>
              <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>STL & 3MF models generating automated royalties for you</div>
            </div>
            <Link href="/dashboard/designer/upload" style={{ color: '#8B5CF6', fontWeight: 800, fontSize: 13, textDecoration: 'none' }}>
              + Upload Model
            </Link>
          </div>

          {designs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 20px', background: '#F8FAFC', borderRadius: 14, border: '2px dashed #CBD5E1' }}>
              <div style={{ fontSize: 32, marginBottom: 6 }}>📦</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>No 3D Models Published Yet</div>
              <div style={{ fontSize: 12, color: '#64748B', marginBottom: 14 }}>Upload your original STL / 3MF files to start earning 15% automated royalties.</div>
              <Link href="/dashboard/designer/upload" style={s.primaryBtn}>
                + Upload Your First 3D Model
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
              {designs.map((d) => (
                <Link
                  key={d.id}
                  href={`/designs/${d.id}`}
                  style={{ background: '#F8FAFC', borderRadius: 14, border: '1px solid #E2E8F0', overflow: 'hidden', textDecoration: 'none', color: 'inherit', display: 'block', transition: 'transform 0.2s, boxShadow 0.2s' }}
                >
                  <div style={{ position: 'relative', height: 130, width: '100%', background: '#E2E8F0' }}>
                    <img src={d.preview} alt={d.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <span style={{ position: 'absolute', bottom: 10, right: 10, background: 'rgba(15,23,42,0.85)', color: '#fff', fontSize: 11, fontWeight: 800, padding: '4px 10px', borderRadius: 99, backdropFilter: 'blur(4px)' }}>
                      Inspect 3D Model 🧊
                    </span>
                  </div>
                  <div style={{ padding: 18 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#8B5CF6', textTransform: 'uppercase', marginBottom: 4 }}>{d.category}</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', marginBottom: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.title}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: 18, fontWeight: 900, color: d.price === 0 ? '#10B981' : '#0F172A' }}>
                        {d.price === 0 ? 'Free (₹0)' : `₹${d.price}`}
                      </div>
                      <div style={{ fontSize: 12, color: '#10B981', fontWeight: 700 }}>
                        {d.prints} Prints ({d.royalty})
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* CUSTOMER SUPPORT TICKETS DESK FOR DESIGNERS */}
        <div style={s.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#0F172A' }}>🎧 Creator Support & Ticket Desk</div>
              <div style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>Need help with 3D model royalties, copyright claims, or custom briefs? Contact Support.</div>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href="/support-tickets" style={{ background: '#0F172A', color: '#fff', padding: '10px 18px', borderRadius: 12, fontWeight: 800, fontSize: 13, textDecoration: 'none' }}>
                📋 My Support Tickets
              </Link>
              <Link href="/contact" style={{ background: '#6d28d9', color: '#ffffff', padding: '10px 18px', borderRadius: 12, fontWeight: 800, fontSize: 13, textDecoration: 'none' }}>
                ✉️ Send Message to Support
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
