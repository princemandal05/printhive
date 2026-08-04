'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AnalyticsChart from '@/components/AnalyticsChart'

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
    page: { minHeight: '100vh', background: '#FAF8F5', color: '#0F172A', fontFamily: 'inherit' },
    nav: { background: '#0F172A', padding: '0 32px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)' },
    logo: { fontSize: 20, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' },
    logoAccent: { color: '#FF6B35' },
    badge: { background: 'rgba(139, 92, 246, 0.15)', color: '#8B5CF6', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 99, padding: '4px 14px', fontSize: 12, fontWeight: 800, textTransform: 'uppercase' as const, letterSpacing: 0.5 },
    body: { maxWidth: 1240, margin: '0 auto', padding: '36px 24px' },
    headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap' as const, gap: 16 },
    title: { fontSize: 28, fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.5px' },
    sub: { fontSize: 14, color: '#64748B', marginTop: 4 },
    primaryBtn: { background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)', color: '#fff', padding: '12px 24px', borderRadius: 12, fontWeight: 800, fontSize: 14, textDecoration: 'none', boxShadow: '0 6px 20px rgba(139,92,246,0.3)', display: 'inline-flex', alignItems: 'center', gap: 8 },
    metricGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 36 },
    card: { background: '#FFFFFF', borderRadius: 20, border: '1px solid #E2E8F0', padding: 24, boxShadow: '0 8px 30px rgba(0,0,0,0.04)' },
    metricVal: { fontSize: 32, fontWeight: 900, color: '#0F172A', marginTop: 6, letterSpacing: '-0.5px' },
    metricLabel: { fontSize: 13, color: '#64748B', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: 0.5 },
  }

  return (
    <div style={s.page}>
      {/* CREATOR STUDIO NAVIGATION */}
      <nav style={s.nav}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={s.logo}>
            <Link href="/" style={{ textDecoration: 'none', color: '#fff' }}>
              Print<span style={s.logoAccent}>Hive</span>
            </Link>{' '}
            <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600 }}>Creator Studio</span>
          </div>
          <span style={s.badge}>🎨 3D Designer</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <span style={{ color: '#94A3B8', fontSize: 13, fontWeight: 600 }}>{userEmail}</span>
          <form action={signOutAction}>
            <button type="submit" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
              Sign Out
            </button>
          </form>
        </div>
      </nav>

      <div style={s.body}>
        {/* DASHBOARD HEADER */}
        <div style={s.headerRow}>
          <div>
            <h1 style={s.title}>3D Creator Studio & Royalty Portal</h1>
            <div style={s.sub}>Upload STL/3MF models, earn 15% automated royalties on every print order</div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Link href="/browse" style={{ background: '#F8FAFC', color: '#0F172A', border: '1px solid #CBD5E1', padding: '12px 20px', borderRadius: 12, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
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
              <span style={{ fontSize: 20 }}>💰</span>
            </div>
            <div style={s.metricVal}>
              ₹{designs.reduce((acc, d) => acc + (d.price ? Math.round(d.price * 0.15 * (d.prints || 0)) : 0), 0)}
            </div>
            <div style={{ fontSize: 12, color: '#10B981', marginTop: 6, fontWeight: 700 }}>15% Royalty per order payout</div>
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
              <span style={{ fontSize: 20 }}>📦</span>
            </div>
            <div style={s.metricVal}>{designs.length} Models</div>
            <div style={{ fontSize: 12, color: '#64748B', marginTop: 6, fontWeight: 600 }}>Live in STL Marketplace</div>
          </div>

          <Link href="/orders" style={{ ...s.card, textDecoration: 'none', color: 'inherit' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={s.metricLabel}>Total Prints Fulfilled</span>
              <span style={{ fontSize: 20 }}>🖨️</span>
            </div>
            <div style={s.metricVal}>
              {designs.reduce((acc, d) => acc + (d.prints || 0), 0)} Prints
            </div>
            <div style={{ fontSize: 12, color: '#0284C7', marginTop: 6, fontWeight: 600 }}>Across Verified Hubs</div>
          </Link>

          <Link href="/requests" style={{ ...s.card, textDecoration: 'none', color: 'inherit' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={s.metricLabel}>Open Brief Bids</span>
              <span style={{ fontSize: 20 }}>✏️</span>
            </div>
            <div style={s.metricVal}>0 Open Bids</div>
            <div style={{ fontSize: 12, color: '#D97706', marginTop: 6, fontWeight: 600 }}>Custom Buyer Requests</div>
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
        <div id="my-published-models" style={{ ...s.card, marginBottom: 36 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#0F172A' }}>🎨 My Published 3D Models</div>
              <div style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>STL & 3MF models generating automated royalties for you</div>
            </div>
            <Link href="/dashboard/designer/upload" style={{ color: '#8B5CF6', fontWeight: 800, fontSize: 14, textDecoration: 'none' }}>
              + Upload Model
            </Link>
          </div>

          {designs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 24px', background: '#F8FAFC', borderRadius: 16, border: '2px dashed #CBD5E1' }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>📦</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#0F172A', marginBottom: 4 }}>No 3D Models Published Yet</div>
              <div style={{ fontSize: 13, color: '#64748B', marginBottom: 16 }}>Upload your original STL / 3MF files to start earning 15% automated royalties.</div>
              <Link href="/dashboard/designer/upload" style={s.primaryBtn}>
                + Upload Your First 3D Model
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
              {designs.map((d) => (
                <Link
                  key={d.id}
                  href={`/designs/${d.id}`}
                  style={{ background: '#F8FAFC', borderRadius: 16, border: '1px solid #E2E8F0', overflow: 'hidden', textDecoration: 'none', color: 'inherit', display: 'block', transition: 'transform 0.2s, boxShadow 0.2s' }}
                >
                  <div style={{ position: 'relative', height: 160, width: '100%', background: '#E2E8F0' }}>
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
      </div>
    </div>
  )
}
