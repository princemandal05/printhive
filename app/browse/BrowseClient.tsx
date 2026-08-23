'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ThreeViewer from '@/components/ThreeViewer'
import type { DesignRow } from './page'

const FALLBACK_CATEGORIES = ['Toys & Games', 'Home & Office', 'Home & Decor', 'Personalized', 'Repair Parts']

function Quick3DModal({ design, onClose }: { design: DesignRow; onClose: () => void }) {
  const modelUrl = design.file_url || (design as any).preview_url

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(11, 15, 25, 0.85)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#0F172A',
          border: '1px solid rgba(255, 107, 53, 0.3)',
          borderRadius: 24,
          padding: 28,
          maxWidth: 620,
          width: '100%',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#FF6B35', textTransform: 'uppercase', letterSpacing: 1 }}>
              WebGL 3D Orbit Inspection
            </span>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: '#fff', margin: '2px 0 0' }}>{design.title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.1)',
              color: '#fff',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              fontSize: 16,
              cursor: 'pointer',
              fontWeight: 800,
            }}
          >
            ✕
          </button>
        </div>

        {/* Standard canonical 3D WebGL Viewport */}
        <div style={{ width: '100%', borderRadius: 16, overflow: 'hidden' }}>
          <ThreeViewer title={design.title} modelUrl={modelUrl} height={380} />
        </div>

        {/* Action Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
          <Link
            href={`/designs/${design.id}`}
            style={{
              background: 'linear-gradient(135deg, #FF6B35 0%, #EA580C 100%)',
              color: '#fff',
              padding: '10px 22px',
              borderRadius: 99,
              fontSize: 13,
              fontWeight: 800,
              textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(255,107,53,0.3)',
            }}
          >
            Order Print (₹{design.price}) →
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function BrowseClient({ designs }: { designs: DesignRow[] }) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [sort, setSort] = useState('popular')
  const [previewDesign, setPreviewDesign] = useState<DesignRow | null>(null)

  const categories = useMemo(() => {
    const set = new Set<string>()
    designs.forEach((d) => {
      if (d.category) set.add(d.category)
    })
    const fromData = Array.from(set)
    const combined = Array.from(new Set(['All', ...FALLBACK_CATEGORIES, ...fromData]))
    return combined
  }, [designs])

  const filteredDesigns = useMemo(() => {
    return designs
      .filter((d) => {
        const matchesCategory = category === 'All' || d.category === category
        const q = search.toLowerCase().trim()
        const matchesSearch =
          !q ||
          d.title.toLowerCase().includes(q) ||
          (d.category && d.category.toLowerCase().includes(q)) ||
          (d.designer?.full_name && d.designer.full_name.toLowerCase().includes(q))
        return matchesCategory && matchesSearch
      })
      .sort((a, b) => {
        if (sort === 'rating') return b.rating - a.rating
        if (sort === 'price-low') return a.price - b.price
        if (sort === 'price-high') return b.price - a.price
        return 0
      })
  }, [designs, search, category, sort])

  return (
    <main style={{ minHeight: '100vh' }}>
      <Navbar />

      <section className="container section" style={{ maxWidth: 1240, margin: '0 auto', padding: '40px 20px' }}>
        {/* HERO HEADER */}
        <div style={{ marginBottom: 36 }}>
          <div className="ateion-pill" style={{ marginBottom: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
            <span>3D STL & 3MF Digital Model Repository</span>
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 900, color: 'var(--text-main)', marginBottom: 8, letterSpacing: '-0.5px' }}>
            Explore Interactive 3D Models & CAD Files
          </h1>
          <p style={{ color: 'var(--text-sub)', fontSize: 16, maxWidth: 740, lineHeight: 1.6 }}>
            Browse verified digital 3D models. Inspect wireframe geometry in real-time 3D WebGL, estimate print slicing costs, or order physical prints from local printer hubs.
          </p>
        </div>

        {/* SEARCH & FILTER CONTROLS */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 24, padding: 24, marginBottom: 40, boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 20 }}>
            <div style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', borderRadius: 99, padding: '6px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-sub)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search 3D models, creators, or file types..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text-main)', fontSize: 14, outline: 'none' }}
              />
            </div>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', borderRadius: 99, padding: '0 20px', color: 'var(--text-main)', fontSize: 14, outline: 'none', fontWeight: 700, cursor: 'pointer' }}
            >
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="price-low">Royalty: Low to High</option>
              <option value="price-high">Royalty: High to Low</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {categories.map((cat) => {
              const active = category === cat
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  style={{
                    background: active ? '#FF6B35' : 'var(--bg-card-hover)',
                    color: active ? '#fff' : 'var(--text-main)',
                    border: '1px solid ' + (active ? '#FF6B35' : 'var(--border-color)'),
                    borderRadius: 99,
                    padding: '8px 20px',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {cat}
                </button>
              )
            })}
          </div>
        </div>

        {/* 3D MODEL GRID CATALOG */}
        {filteredDesigns.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-card)', borderRadius: 24, border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-main)', marginBottom: 6 }}>No 3D Models Found</h3>
            <p style={{ color: 'var(--text-sub)', fontSize: 14 }}>Try adjusting your search query or selected category filter.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 24 }}>
            {filteredDesigns.map((design) => (
              <div
                key={design.id}
                style={{
                  background: 'var(--bg-card)',
                  borderRadius: 20,
                  border: '1px solid var(--border-color)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                  transition: 'transform 0.2s, boxShadow 0.2s',
                }}
              >
                {/* 3D PREVIEW THUMBNAIL */}
                <div style={{ height: 160, width: '100%', position: 'relative', background: '#0F172A', overflow: 'hidden' }}>
                  <img
                    src={design.thumbnail_url || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80'}
                    alt={design.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />

                  {/* Category Pill */}
                  <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(255,107,53,0.9)', color: '#fff', fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 99, backdropFilter: 'blur(4px)' }}>
                    {design.category || '3D STL Model'}
                  </div>

                  {/* Quick 3D View Button */}
                  <button
                    type="button"
                    onClick={() => setPreviewDesign(design)}
                    style={{
                      position: 'absolute',
                      bottom: 10,
                      right: 10,
                      background: 'rgba(15, 23, 42, 0.85)',
                      backdropFilter: 'blur(8px)',
                      color: '#fff',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: 99,
                      padding: '5px 12px',
                      fontSize: 11,
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <span>Inspect 3D</span>
                  </button>
                </div>

                {/* CARD CONTENT BODY */}
                <div style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: 11, color: 'var(--text-sub)', fontWeight: 600 }}>By {design.designer?.full_name || 'PrintHive Designer'}</span>
                      <span style={{ fontSize: 11, fontWeight: 800, color: '#D97706' }}>★ {design.rating}</span>
                    </div>

                    <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-main)', marginBottom: 8, lineHeight: 1.3, height: 38, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {design.title}
                    </h3>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border-color)' }}>
                      <div>
                        <div style={{ fontSize: 10, color: 'var(--text-sub)', fontWeight: 700, textTransform: 'uppercase' }}>Royalty / Price</div>
                        <div style={{ fontSize: 16, fontWeight: 900, color: design.price === 0 ? '#10B981' : 'var(--text-main)' }}>
                          {design.price === 0 ? 'Free (₹0)' : `₹${design.price}`}
                        </div>
                      </div>

                      <Link
                        href={`/designs/${design.id}`}
                        style={{
                          background: 'var(--bg-card-hover)',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-main)',
                          padding: '6px 14px',
                          borderRadius: 12,
                          fontSize: 12,
                          fontWeight: 800,
                          textDecoration: 'none',
                        }}
                      >
                        Details →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* QUICK 3D INSPECTION MODAL */}
      {previewDesign && <Quick3DModal design={previewDesign} onClose={() => setPreviewDesign(null)} />}

      <Footer />
    </main>
  )
}