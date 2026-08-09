'use client'

import { useState } from 'react'
import Link from 'next/link'
import ThreeViewer from '@/components/ThreeViewer'
import { useStore } from '@/lib/cart-context'

const DEFAULT_COLORS = ['Red', 'Black', 'White', 'Blue', 'Green', 'Grey']

type Design = {
  id: string
  title: string
  category: string | null
  price: number
  rating: number
  rating_count: number
  file_url?: string
  materials: string[] | null
  description: string | null
  designer: { id: string; full_name: string | null; avatar_url?: string } | null
  estimated_print_time?: string
  estimated_material_grams?: number
}

type Review = {
  rating: number
  review_text: string | null
  buyer: { full_name: string | null } | null
}

export default function DesignDetailClient({ design, reviews }: { design: Design; reviews: Review[] }) {
  const { addToWishlist, isInWishlist, addToCart } = useStore()
  const materials = design.materials?.length ? design.materials : ['PLA', 'PETG', 'ABS', 'TPU', 'Resin']
  const [material, setMaterial] = useState(materials[0])
  const [color, setColor] = useState(DEFAULT_COLORS[0])
  const wished = isInWishlist(design.id)

  const printTime = design.estimated_print_time || '3h 45m'
  const materialUsage = design.estimated_material_grams ? `${design.estimated_material_grams}g` : '68g'

  const getColorHex = (cName: string) => {
    switch (cName.toLowerCase()) {
      case 'red': return '#ef4444'
      case 'black': return '#334155'
      case 'white': return '#f8fafc'
      case 'blue': return '#3b82f6'
      case 'green': return '#10b981'
      case 'grey': return '#94a3b8'
      default: return '#ff6b35'
    }
  }

  const handleBuyModel = () => {
    if (!design.file_url) {
      alert('This 3D model file is currently unavailable for download.')
      return
    }
    addToCart({
      id: design.id,
      name: `${design.title} (Digital 3D STL)`,
      seller: design.designer?.full_name || 'PrintHive Designer',
      price: design.price,
      stock: 99,
      image: design.file_url,
    })
    alert(`Added "${design.title}" 3D model file to cart!`)
  }

  return (
    <section className="container section" style={{ padding: '40px 20px', maxWidth: 1200, margin: '0 auto' }}>
      <div className="grid grid-cols-2 gap-8" style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 32 }}>
        {/* Interactive 3D WebGL Viewport */}
        <div>
          <div style={{ marginBottom: 20 }}>
            <ThreeViewer
              title={design.title}
              color={getColorHex(color)}
              height={440}
              modelUrl={design.file_url || '/models/demo.stl'}
            />
          </div>

          {/* Slicing Estimates Summary Card */}
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 16, padding: 18, marginBottom: 24, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, textAlign: 'center' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800, marginBottom: 2 }}>⏱️ Est. Print Time</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#f8fafc' }}>{printTime}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800, marginBottom: 2 }}>🧵 Est. Filament</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#f8fafc' }}>{materialUsage}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800, marginBottom: 2 }}>🧊 Recommended</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#ff6b35' }}>{material}</div>
            </div>
          </div>

          <p className="text-sm text-muted" style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.6 }}>
            {design.description || 'High-precision 3D model designed for zero-tolerance FDM and Resin 3D printing.'}
          </p>

          {/* Customer Reviews & Ratings */}
          <div style={{ marginTop: 32 }}>
            <div className="feature-title" style={{ fontSize: 18, fontWeight: 700, color: '#f8fafc', marginBottom: 16 }}>
              Reviews & Ratings ({reviews.length})
            </div>
            {reviews.length === 0 ? (
              <p className="text-sm text-muted" style={{ color: '#64748b' }}>No reviews yet — be the first to order and review this design.</p>
            ) : (
              reviews.map((r, i) => (
                <div key={i} className="card" style={{ background: '#1e293b', padding: 16, borderRadius: 12, marginBottom: 12, border: '1px solid #334155' }}>
                  <div className="flex justify-between items-center" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span className="text-sm" style={{ fontWeight: 600, color: '#f1f5f9' }}>{r.buyer?.full_name ?? 'PrintHive buyer'}</span>
                    <span className="rating" style={{ color: '#fbbf24' }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                  </div>
                  {r.review_text && <p className="text-sm text-muted" style={{ color: '#94a3b8', fontSize: 13 }}>{r.review_text}</p>}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Order Configuration & Purchase Panel */}
        <div>
          {design.category && (
            <span className="badge badge-neutral" style={{ background: '#334155', color: '#f8fafc', padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600, display: 'inline-block', marginBottom: 12 }}>
              {design.category}
            </span>
          )}
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#fff', marginBottom: 12 }}>
            {design.title}
          </h1>

          <div className="flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
            <span className="rating" style={{ color: '#fbbf24', fontWeight: 700 }}>★ {design.rating || '4.9'}</span>
            <span className="rating-count" style={{ color: '#64748b', fontSize: 13 }}>({design.rating_count ?? 18} orders completed)</span>
          </div>

          {/* Designer Card */}
          {design.designer && (
            <div className="card" style={{ background: '#1e293b', border: '1px solid #334155', padding: 16, borderRadius: 12, marginBottom: 24 }}>
              <div className="flex items-center gap-3" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {design.designer.avatar_url ? (
                  <img src={design.designer.avatar_url} alt="Designer avatar" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div className="avatar" style={{ width: 40, height: 40, borderRadius: '50%', background: '#ff6b35', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                    {(design.designer.full_name ?? 'D').charAt(0)}
                  </div>
                )}
                <div>
                  <div className="text-sm" style={{ fontWeight: 600, color: '#f8fafc' }}>{design.designer.full_name ?? 'PrintHive designer'}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>Verified 3D Modeler · 15% Royalty</div>
                </div>
              </div>
            </div>
          )}

          {/* Pricing & Customization Panel */}
          <div className="card" style={{ background: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: 24, borderRadius: 16 }}>
            <div className="design-card-price" style={{ fontSize: 32, fontWeight: 800, color: '#ff6b35', marginBottom: 20 }}>
              ₹{design.price}
            </div>

            {/* Material Selector */}
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="label" style={{ display: 'block', color: '#cbd5e1', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Supported Materials</label>
              <select className="select" value={material} onChange={(e) => setMaterial(e.target.value)} style={{ width: '100%', padding: '10px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#fff' }}>
                {materials.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            {/* Colour Selector */}
            <div className="form-group" style={{ marginBottom: 24 }}>
              <label className="label" style={{ display: 'block', color: '#cbd5e1', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Colour</label>
              <select className="select" value={color} onChange={(e) => setColor(e.target.value)} style={{ width: '100%', padding: '10px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#fff' }}>
                {DEFAULT_COLORS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Action Buttons: Print Now & Buy Model */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Link
                href={`/designs/${design.id}/order?material=${material}&color=${color}`}
                className="btn btn-primary btn-block btn-lg"
                style={{ display: 'block', textAlign: 'center', padding: '14px 0', background: 'linear-gradient(135deg, #ff6b35 0%, #f97316 100%)', color: '#fff', borderRadius: 12, fontWeight: 800, textDecoration: 'none', boxShadow: '0 8px 20px rgba(255, 107, 53, 0.4)' }}
              >
                🚀 Print Now (Local Hub Match)
              </Link>

              <button
                type="button"
                onClick={handleBuyModel}
                style={{ width: '100%', padding: '14px 0', background: '#1e293b', border: '1px solid #3b82f6', color: '#60a5fa', borderRadius: 12, cursor: 'pointer', fontWeight: 800, fontSize: 14 }}
              >
                📥 Buy Model File (Download STL / 3MF)
              </button>

              <button
                type="button"
                style={{ width: '100%', padding: '12px 0', background: 'transparent', border: '1px solid #475569', color: '#cbd5e1', borderRadius: 12, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
                onClick={() => addToWishlist({ id: design.id, name: design.title, price: design.price, type: 'design' })}
                disabled={wished}
              >
                {wished ? '♥ Saved in Wishlist' : '♡ Save to Wishlist'}
              </button>
            </div>

            <p className="help-text" style={{ textAlign: 'center', marginTop: 16, color: '#64748b', fontSize: 12 }}>
              🔒 Razorpay Escrow Protection · Funds held until delivery confirmation
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}