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
  file_format?: string
  file_name?: string
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
      name: `${design.title} (Digital 3D Model)`,
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
              modelUrl={design.file_url}
              format={design.file_format}
              fileName={design.file_name}
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

        {/* RIGHT SIDEBAR: ORDER & ROYALTY ACTION */}
        <div>
          <div className="card text-left" style={{ background: '#1e293b', border: '1px solid #334155', padding: 24, borderRadius: 20, marginBottom: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#8b5cf6', textTransform: 'uppercase', marginBottom: 6 }}>
              {design.category || '3D Printing Model'}
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: '#f8fafc', margin: '0 0 12px', letterSpacing: '-0.5px' }}>
              {design.title}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: design.price === 0 ? '#10b981' : '#f8fafc' }}>
                {design.price === 0 ? 'Free (₹0)' : `₹${design.price}`}
              </div>
              <span style={{ fontSize: 12, background: 'rgba(139,92,246,0.15)', color: '#a78bfa', padding: '4px 12px', borderRadius: 99, fontWeight: 700, border: '1px solid rgba(139,92,246,0.3)' }}>
                {design.price === 0 ? 'Open Source' : '15% Royalty Protected'}
              </span>
            </div>

            {/* DESIGNER / CREATOR PROFILE */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, background: 'rgba(255,255,255,0.03)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)', marginBottom: 20 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#ff6b35', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 16 }}>
                {design.designer?.full_name?.charAt(0) || 'C'}
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Created By</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#f8fafc' }}>{design.designer?.full_name || 'PrintHive Designer'}</div>
              </div>
            </div>

            {/* MATERIAL SELECTION */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 12, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                Select Print Material
              </label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {materials.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMaterial(m)}
                    style={{
                      background: material === m ? '#ff6b35' : 'rgba(255,255,255,0.05)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 10,
                      padding: '8px 16px',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* COLOR SELECTION */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 12, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                Select Filament Color
              </label>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {DEFAULT_COLORS.map((cName) => (
                  <button
                    key={cName}
                    type="button"
                    onClick={() => setColor(cName)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: getColorHex(cName),
                      border: color === cName ? '3px solid #ff6b35' : '1px solid rgba(255,255,255,0.2)',
                      cursor: 'pointer',
                      boxShadow: color === cName ? '0 0 10px rgba(255,107,53,0.5)' : 'none',
                    }}
                    title={cName}
                  />
                ))}
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Link
                href={`/designs/${design.id}/order?material=${encodeURIComponent(material)}&color=${encodeURIComponent(color)}`}
                style={{
                  display: 'block',
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, #ff6b35 0%, #ea580c 100%)',
                  color: '#fff',
                  padding: '14px 24px',
                  borderRadius: 14,
                  fontWeight: 900,
                  fontSize: 15,
                  textDecoration: 'none',
                  boxShadow: '0 8px 24px rgba(255,107,53,0.35)',
                }}
              >
                🖨️ Order Physical Print From Hub
              </Link>

              <button
                type="button"
                onClick={handleBuyModel}
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#f8fafc',
                  padding: '12px 24px',
                  borderRadius: 14,
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                📥 Add Digital 3D STL to Cart (₹{design.price})
              </button>

              <button
                type="button"
                onClick={() => addToWishlist({ id: design.id, name: design.title, price: design.price, type: 'design' })}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  color: wished ? '#ef4444' : '#94a3b8',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  marginTop: 4,
                }}
              >
                {wished ? '❤️ In Your Wishlist' : '🤍 Save to Wishlist'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}