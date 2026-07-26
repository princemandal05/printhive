'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useStore } from '@/lib/cart-context'

const DEFAULT_COLORS = ['Red', 'Black', 'White', 'Blue', 'Green', 'Grey']

type Design = {
  id: string
  title: string
  category: string | null
  price: number
  rating: number
  rating_count: number
  materials: string[] | null
  description: string | null
  designer: { id: string; full_name: string | null } | null
}

type Review = {
  rating: number
  review_text: string | null
  buyer: { full_name: string | null } | null
}

export default function DesignDetailClient({ design, reviews }: { design: Design; reviews: Review[] }) {
  const { addToWishlist, isInWishlist } = useStore()
  const materials = design.materials?.length ? design.materials : ['PLA']
  const [material, setMaterial] = useState(materials[0])
  const [color, setColor] = useState(DEFAULT_COLORS[0])
  const wished = isInWishlist(design.id)

  return (
    <section className="container section">
      <div className="grid grid-cols-2 gap-8" style={{ gridTemplateColumns: '1.1fr 0.9fr' }}>
        {/* 3D viewer placeholder */}
        <div>
          <div
            className="card"
            style={{
              height: 420,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, var(--color-slate-100), var(--color-border-light))',
              marginBottom: 'var(--space-4)',
            }}
          >
            {/* Replace this block with the Three.js / React-Three-Fiber STL viewer */}
            <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="var(--color-slate-400)" strokeWidth="1.5">
              <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
              <path d="M3.27 6.96L12 12.01l8.73-5.05" />
              <path d="M12 22.08V12" />
            </svg>
          </div>
          <p className="text-sm text-muted">{design.description || 'No description provided yet.'}</p>

          <div style={{ marginTop: 'var(--space-8)' }}>
            <div className="feature-title" style={{ marginBottom: 'var(--space-4)' }}>
              Reviews ({reviews.length})
            </div>
            {reviews.length === 0 ? (
              <p className="text-sm text-muted">No reviews yet — be the first to order and review this design.</p>
            ) : (
              reviews.map((r, i) => (
                <div key={i} className="card" style={{ marginBottom: 'var(--space-3)' }}>
                  <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-2)' }}>
                    <span className="text-sm" style={{ fontWeight: 600 }}>{r.buyer?.full_name ?? 'PrintHive buyer'}</span>
                    <span className="rating">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                  </div>
                  {r.review_text && <p className="text-sm text-muted">{r.review_text}</p>}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Order panel */}
        <div>
          {design.category && (
            <span className="badge badge-neutral" style={{ marginBottom: 'var(--space-3)' }}>{design.category}</span>
          )}
          <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
            {design.title}
          </h1>
          <div className="flex items-center gap-2" style={{ marginBottom: 'var(--space-6)' }}>
            <span className="rating">★ {design.rating || 'New'}</span>
            <span className="rating-count">({design.rating_count} orders)</span>
          </div>

          {design.designer && (
            <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
              <div className="flex items-center gap-3">
                <div className="avatar">{(design.designer.full_name ?? 'D').charAt(0)}</div>
                <div>
                  <div className="text-sm" style={{ fontWeight: 600 }}>{design.designer.full_name ?? 'PrintHive designer'}</div>
                </div>
              </div>
            </div>
          )}

          <div className="card">
            <div className="design-card-price" style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-5)' }}>
              ₹{design.price}
            </div>

            <div className="form-group">
              <label className="label">Material</label>
              <select className="select" value={material} onChange={(e) => setMaterial(e.target.value)}>
                {materials.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="label">Colour</label>
              <select className="select" value={color} onChange={(e) => setColor(e.target.value)}>
                {DEFAULT_COLORS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <Link
              href={`/designs/${design.id}/order?material=${material}&color=${color}`}
              className="btn btn-primary btn-block btn-lg"
              style={{ marginTop: 'var(--space-4)' }}
            >
              Order this print
            </Link>
            <button
              className="btn btn-outline btn-block"
              style={{ marginTop: 'var(--space-3)' }}
              onClick={() => addToWishlist({ id: design.id, name: design.title, price: design.price, type: 'design' })}
              disabled={wished}
            >
              {wished ? '♥ In wishlist' : '♡ Add to wishlist'}
            </button>
            <p className="help-text" style={{ textAlign: 'center', marginTop: 'var(--space-3)' }}>
              Payment held in escrow until you confirm delivery
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}