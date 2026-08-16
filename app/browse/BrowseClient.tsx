'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import type { DesignRow } from './page'

const FALLBACK_CATEGORIES = ['Toys & Games', 'Home & Office', 'Home & Decor', 'Personalized', 'Repair Parts']

export default function BrowseClient({ designs }: { designs: DesignRow[] }) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [sort, setSort] = useState('popular')

  const categories = useMemo(() => {
    const fromData = Array.from(new Set(designs.map((d) => d.category).filter(Boolean))) as string[]
    return ['All', ...(fromData.length ? fromData : FALLBACK_CATEGORIES)]
  }, [designs])

  const filtered = useMemo(() => {
    return designs
      .filter((d) => {
        const matchesCategory = category === 'All' || d.category === category
        const matchesSearch =
          d.title.toLowerCase().includes(search.toLowerCase()) ||
          (d.designer?.full_name || '').toLowerCase().includes(search.toLowerCase())
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
          <div className="ateion-pill" style={{ marginBottom: 12 }}>
            🧊 3D STL & 3MF Digital Model Repository
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 900, color: 'var(--text-main)', marginBottom: 8, letterSpacing: '-0.5px' }}>
            Explore Interactive 3D Models & STL Files
          </h1>
          <p style={{ color: 'var(--text-sub)', fontSize: 16, maxWidth: 740, lineHeight: 1.6 }}>
            Browse verified digital 3D models. Inspect wireframe geometry in 3D WebGL, estimate print slicing costs with Gemini AI, or order prints from local 3D hubs.
          </p>
        </div>

        {/* SEARCH & FILTER CONTROLS */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 24, padding: 24, marginBottom: 40, boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 20 }}>
            <div style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', borderRadius: 99, padding: '6px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 16 }}>🔍</span>
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
                  onClick={() => setCategory(cat)}
                  style={{
                    padding: '8px 20px',
                    borderRadius: 99,
                    fontSize: 13,
                    fontWeight: active ? 800 : 600,
                    border: active ? '1px solid #8B5CF6' : '1px solid var(--border-color)',
                    background: active ? '#8B5CF6' : 'var(--bg-card-hover)',
                    color: active ? '#fff' : 'var(--text-main)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {cat}
                </button>
              )
            })}
          </div>
        </div>

        {/* 3D MODEL CARDS GRID */}
        {filtered.length === 0 ? (
          <div style={{ background: 'var(--bg-card)', border: '1px dashed var(--border-color)', borderRadius: 24, padding: 60, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🧊</div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-main)', marginBottom: 8 }}>No 3D Models Found</h3>
            <p style={{ color: 'var(--text-sub)', fontSize: 14 }}>Try searching for &quot;Dragon&quot;, &quot;Organizer&quot;, or selecting &quot;All&quot; categories.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {filtered.map((design) => (
              <Link
                key={design.id}
                href={`/designs/${design.id}`}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 16,
                  overflow: 'hidden',
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                  transition: 'transform 0.2s, boxShadow 0.2s',
                }}
              >
                {/* 3D PREVIEW THUMBNAIL */}
                <div style={{ height: 150, width: '100%', position: 'relative', background: '#0F172A', overflow: 'hidden' }}>
                  <img
                    src={design.thumbnail_url || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80'}
                    alt={design.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />

                  {/* Category Pill */}
                  <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(139,92,246,0.9)', color: '#fff', fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 99, backdropFilter: 'blur(4px)' }}>
                    {design.category || '3D STL Model'}
                  </div>
                </div>

                {/* CARD CONTENT BODY */}
                <div style={{ padding: 14, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: 11, color: 'var(--text-sub)', fontWeight: 600 }}>By {design.designer?.full_name || 'PrintHive Designer'}</span>
                      <span style={{ fontSize: 11, fontWeight: 800, color: '#D97706' }}>⭐ {design.rating}</span>
                    </div>

                    <h3 style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-main)', marginBottom: 8, lineHeight: 1.3, height: 36, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {design.title}
                    </h3>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                      <div>
                        <div style={{ fontSize: 10, color: 'var(--text-sub)', fontWeight: 700, textTransform: 'uppercase' }}>Royalty</div>
                        <div style={{ fontSize: 17, fontWeight: 900, color: '#8B5CF6' }}>₹{design.price}</div>
                      </div>

                      <div style={{ background: 'var(--bg-card-hover)', color: 'var(--text-main)', padding: '6px 12px', borderRadius: 10, fontSize: 11, fontWeight: 800 }}>
                        3D View →
                      </div>
                    </div>
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