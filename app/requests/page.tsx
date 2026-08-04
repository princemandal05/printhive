'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const MOCK_REQUESTS: any[] = []

export default function RequestsListPage() {
  const [search, setSearch] = useState('')

  const filtered = MOCK_REQUESTS.filter((r) =>
    r.purpose.toLowerCase().includes(search.toLowerCase()) ||
    r.material.toLowerCase().includes(search.toLowerCase()) ||
    r.buyer.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <main style={{ minHeight: '100vh' }}>
      <Navbar />

      <section className="container section" style={{ maxWidth: 1240, margin: '0 auto', padding: '40px 20px' }}>
        {/* HERO HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20, marginBottom: 36 }}>
          <div>
            <div className="ateion-pill" style={{ marginBottom: 12 }}>
              ✏️ Bidding Engine & Freelance Briefs
            </div>
            <h1 style={{ fontSize: 36, fontWeight: 900, color: 'var(--text-main)', marginBottom: 8, letterSpacing: '-0.5px' }}>
              Custom Design & Manufacturing Briefs
            </h1>
            <p style={{ color: 'var(--text-sub)', fontSize: 16, maxWidth: 720, lineHeight: 1.6 }}>
              Browse custom requests posted by buyers looking for 3D CAD modeling or on-demand batch manufacturing. Submit competitive bids to win print jobs.
            </p>
          </div>

          <Link
            href="/requests/new"
            style={{
              background: '#FF6B35',
              color: '#fff',
              padding: '14px 28px',
              borderRadius: 99,
              fontSize: 14,
              fontWeight: 800,
              textDecoration: 'none',
              boxShadow: '0 6px 20px rgba(255,107,53,0.3)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            + Post New Custom Brief
          </Link>
        </div>

        {/* SEARCH BAR */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 24, padding: 24, marginBottom: 40, boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
          <div style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', borderRadius: 99, padding: '6px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 16 }}>🔍</span>
            <input
              type="text"
              placeholder="Search by brief title, material requirement, or buyer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text-main)', fontSize: 14, outline: 'none' }}
            />
          </div>
        </div>

        {/* REQUESTS LIST GRID */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', background: 'var(--bg-card)', borderRadius: 24, border: '2px dashed var(--border-color)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✏️</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-main)', marginBottom: 6 }}>No Custom Design Briefs Posted Yet</div>
            <div style={{ fontSize: 14, color: 'var(--text-sub)', marginBottom: 20 }}>Post a custom 3D printing brief to get competitive bids from verified designers across India!</div>
            <Link href="/requests/new" style={{ background: '#FF6B35', color: '#fff', padding: '12px 24px', borderRadius: 12, fontWeight: 800, textDecoration: 'none', display: 'inline-block' }}>
              + Post Custom Brief
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 20 }}>
            {filtered.map((r) => (
              <Link
                key={r.id}
                href={`/requests/${r.id}`}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 20,
                  padding: 24,
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                  transition: 'all 0.2s',
                  boxShadow: '0 6px 24px rgba(0,0,0,0.03)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ background: r.urgency === 'High Urgency' ? '#FEF2F2' : '#ECFDF5', color: r.urgency === 'High Urgency' ? '#EF4444' : '#10B981', border: `1px solid ${r.urgency === 'High Urgency' ? '#FCA5A5' : '#A7F3D0'}`, borderRadius: 99, padding: '4px 12px', fontSize: 11, fontWeight: 800 }}>
                      ⚡ {r.urgency}
                    </span>
                    <span style={{ fontSize: 13, color: 'var(--text-sub)', fontWeight: 600 }}>Posted by {r.buyer} • {r.postedAt}</span>
                  </div>

                  <div style={{ fontSize: 22, fontWeight: 900, color: '#FF6B35' }}>
                    ₹{r.budgetMin} – ₹{r.budgetMax}
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-main)', marginBottom: 8, letterSpacing: '-0.3px' }}>
                    {r.purpose}
                  </h3>

                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
                    <span style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 700, color: 'var(--text-sub)' }}>
                      📏 {r.dimensions}
                    </span>
                    <span style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 700, color: 'var(--text-sub)' }}>
                      🧪 {r.material}
                    </span>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#8B5CF6' }}>
                    💬 {r.bidCount === 0 ? 'No bids submitted — Be first to bid!' : `${r.bidCount} Designer Bids Received`}
                  </div>
                  <div style={{ background: '#0F172A', color: '#fff', padding: '8px 20px', borderRadius: 99, fontSize: 13, fontWeight: 800 }}>
                    View Brief & Bid
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  )
}