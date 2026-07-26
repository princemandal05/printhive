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

  const categories = useMemo(() => {
    const fromData = Array.from(new Set(designs.map((d) => d.category).filter(Boolean))) as string[]
    return ['All', ...(fromData.length ? fromData : FALLBACK_CATEGORIES)]
  }, [designs])

  const filtered = designs.filter((d) => {
    const matchesCategory = category === 'All' || d.category === category
    const matchesSearch = d.title.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <main>
      <Navbar />

      <section className="container section-sm">
        <div className="section-eyebrow">Discover</div>
        <h1 className="section-heading" style={{ marginBottom: 'var(--space-2)' }}>
          Find your next print
        </h1>
        <p className="section-subheading" style={{ marginBottom: 'var(--space-8)' }}>
          Every design here is ready to be printed near you. Pick one, customize
          it, and we&apos;ll match you with a nearby printer owner.
        </p>

        <div className="flex gap-4" style={{ marginBottom: 'var(--space-8)', flexWrap: 'wrap' }}>
          <input
            type="text"
            className="input"
            placeholder="Search designs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: '320px' }}
          />
          <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`badge ${category === cat ? 'badge-primary' : 'badge-neutral'}`}
                style={{ cursor: 'pointer', border: 'none', padding: '8px 16px', fontSize: 'var(--text-sm)' }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {designs.length === 0 ? (
          <div className="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-slate-400)" strokeWidth="1.5">
              <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
            </svg>
            <div className="empty-state-title">No designs published yet</div>
            <p className="empty-state-text">Check back soon — designers are just getting started here.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted" style={{ marginBottom: 'var(--space-4)' }}>
              {filtered.length} {filtered.length === 1 ? 'design' : 'designs'} found
            </p>

            {filtered.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 'var(--space-6)' }}>
                {filtered.map((design) => (
                  <Link key={design.id} href={`/designs/${design.id}`} className="design-card" style={{ display: 'block' }}>
                    <div
                      className="design-card-image"
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: design.thumbnail_url
                          ? `url(${design.thumbnail_url}) center/cover`
                          : 'linear-gradient(135deg, var(--color-slate-100), var(--color-border-light))',
                      }}
                    >
                      {!design.thumbnail_url && (
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-slate-400)" strokeWidth="1.5">
                          <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                          <path d="M3.27 6.96L12 12.01l8.73-5.05" />
                          <path d="M12 22.08V12" />
                        </svg>
                      )}
                    </div>
                    <div className="design-card-body">
                      <div className="design-card-title">{design.title}</div>
                      <div className="design-card-price">₹{design.price}</div>
                      <div className="design-card-meta">
                        <span className="rating">★ {design.rating || 'New'}</span>
                        <span>·</span>
                        <span>{design.designer?.full_name ?? 'PrintHive designer'}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-slate-400)" strokeWidth="1.5">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                <div className="empty-state-title">No designs found</div>
                <p className="empty-state-text">Try a different search term or category.</p>
              </div>
            )}
          </>
        )}
      </section>

      <Footer />
    </main>
  )
}