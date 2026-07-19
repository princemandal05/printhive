'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

// Mock data — replace with a Supabase query against a `products` table
// (ready-made items listed by sellers), e.g.:
// const { data } = await supabase.from('products').select('*')
const MOCK_PRODUCTS = [
  { id: 'p1', name: 'Geometric Planter Set (3)', price: 649, category: 'Home Décor', rating: 4.7, seller: 'UrbanPrint Co.', stock: 18 },
  { id: 'p2', name: 'Low-Poly Desk Organizer', price: 399, category: 'Office Accessories', rating: 4.6, seller: 'DeskWorks', stock: 32 },
  { id: 'p3', name: 'Articulated Dragon (Painted)', price: 899, category: 'Toys & Miniatures', rating: 4.9, seller: 'MiniMakers', stock: 6 },
  { id: 'p4', name: 'Personalized Nameplate Set', price: 549, category: 'Personalized Gifts', rating: 4.8, seller: 'CustomCraft', stock: 24 },
  { id: 'p5', name: 'Cosplay Helmet Shell', price: 2499, category: 'Cosplay Items', rating: 4.9, seller: 'PropForge', stock: 3 },
  { id: 'p6', name: 'Educational Solar System Kit', price: 799, category: 'Educational Kits', rating: 4.7, seller: 'LearnLab', stock: 15 },
]

const CATEGORIES = ['All', 'Home Décor', 'Office Accessories', 'Toys & Miniatures', 'Personalized Gifts', 'Cosplay Items', 'Educational Kits']

export default function ShopPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')

  const filtered = MOCK_PRODUCTS.filter((p) => {
    const matchesCategory = category === 'All' || p.category === category
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <main>
      <Navbar />

      <section className="container section-sm">
        <div className="section-eyebrow">Ready-made products</div>
        <h1 className="section-heading" style={{ marginBottom: 'var(--space-2)' }}>
          Shop finished 3D printed products
        </h1>
        <p className="section-subheading" style={{ marginBottom: 'var(--space-8)' }}>
          Already printed, quality-checked, and ready to ship — no waiting for
          a custom print run.
        </p>

        <div className="flex gap-4" style={{ marginBottom: 'var(--space-8)', flexWrap: 'wrap' }}>
          <input
            type="text"
            className="input"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: '320px' }}
          />
          <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
            {CATEGORIES.map((cat) => (
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

        <p className="text-sm text-muted" style={{ marginBottom: 'var(--space-4)' }}>
          {filtered.length} {filtered.length === 1 ? 'product' : 'products'} found
        </p>

        {filtered.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 'var(--space-6)' }}>
            {filtered.map((product) => (
              <Link key={product.id} href={`/shop/${product.id}`} className="design-card" style={{ display: 'block' }}>
                <div className="design-card-image" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'linear-gradient(135deg, var(--color-slate-100), var(--color-border-light))',
                }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-slate-400)" strokeWidth="1.5">
                    <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div className="design-card-body">
                  <div className="design-card-title">{product.name}</div>
                  <div className="design-card-price">₹{product.price}</div>
                  <div className="design-card-meta">
                    <span className="rating">★ {product.rating}</span>
                    <span>·</span>
                    <span>{product.seller}</span>
                  </div>
                  {product.stock <= 5 && (
                    <span className="badge badge-warning" style={{ marginTop: 'var(--space-2)' }}>Only {product.stock} left</span>
                  )}
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
            <div className="empty-state-title">No products found</div>
            <p className="empty-state-text">Try a different search term or category.</p>
          </div>
        )}
      </section>

      <Footer />
    </main>
  )
}