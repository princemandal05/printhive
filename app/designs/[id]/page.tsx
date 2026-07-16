'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

// Mock data — replace with a Supabase query against `designs` by id, e.g.:
// const { data } = await supabase.from('designs').select('*').eq('id', id).single()
const MOCK_DESIGN = {
  id: '1',
  title: 'Articulated Dragon',
  category: 'Toys & Games',
  price: 450,
  rating: 4.8,
  ratingCount: 210,
  designer: { name: 'Aarav Mehta', followers: 1240 },
  materials: ['PLA', 'PETG'],
  colors: ['Red', 'Black', 'White', 'Blue'],
  description:
    'A fully articulated dragon with 30+ moving joints, printed in one piece with no supports needed. Popular as a desk toy and a great first print for beginners.',
  reviews: [
    { name: 'Priya S.', rating: 5, text: 'Printed perfectly, joints move smoothly. Kids loved it!' },
    { name: 'Rohan K.', rating: 4, text: 'Great detail, took about 6 hours to print on my end.' },
  ],
}

export default function DesignDetailPage() {
  const params = useParams()
  const design = { ...MOCK_DESIGN, id: (params?.id as string) || MOCK_DESIGN.id }
  const [material, setMaterial] = useState(design.materials[0])
  const [color, setColor] = useState(design.colors[0])

  return (
    <main>
      <Navbar />

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
            <p className="text-sm text-muted">{design.description}</p>

            <div style={{ marginTop: 'var(--space-8)' }}>
              <div className="feature-title" style={{ marginBottom: 'var(--space-4)' }}>
                Reviews ({design.reviews.length})
              </div>
              {design.reviews.map((r) => (
                <div key={r.name} className="card" style={{ marginBottom: 'var(--space-3)' }}>
                  <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-2)' }}>
                    <span className="text-sm" style={{ fontWeight: 600 }}>{r.name}</span>
                    <span className="rating">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                  </div>
                  <p className="text-sm text-muted">{r.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Order panel */}
          <div>
            <span className="badge badge-neutral" style={{ marginBottom: 'var(--space-3)' }}>{design.category}</span>
            <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
              {design.title}
            </h1>
            <div className="flex items-center gap-2" style={{ marginBottom: 'var(--space-6)' }}>
              <span className="rating">★ {design.rating}</span>
              <span className="rating-count">({design.ratingCount} orders)</span>
            </div>

            <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
              <div className="flex items-center gap-3">
                <div className="avatar">{design.designer.name.charAt(0)}</div>
                <div>
                  <div className="text-sm" style={{ fontWeight: 600 }}>{design.designer.name}</div>
                  <div className="text-xs text-muted">{design.designer.followers.toLocaleString()} followers</div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="design-card-price" style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-5)' }}>
                ₹{design.price}
              </div>

              <div className="form-group">
                <label className="label">Material</label>
                <select className="select" value={material} onChange={(e) => setMaterial(e.target.value)}>
                  {design.materials.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="label">Colour</label>
                <select className="select" value={color} onChange={(e) => setColor(e.target.value)}>
                  {design.colors.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <Link
                href={`/designs/${design.id}/order?material=${material}&color=${color}`}
                className="btn btn-primary btn-block btn-lg"
                style={{ marginTop: 'var(--space-4)' }}
              >
                Order this print
              </Link>
              <p className="help-text" style={{ textAlign: 'center', marginTop: 'var(--space-3)' }}>
                Payment held in escrow until you confirm delivery
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}