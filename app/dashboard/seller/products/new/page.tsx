'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const CATEGORIES = ['Home Décor', 'Toys & Miniatures', 'Office Accessories', 'Engineering Models', 'Cosplay Items', 'Personalized Gifts', 'Educational Kits', 'Lifestyle Products']

export default function NewProductPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('')
  const [description, setDescription] = useState('')
  const [photoName, setPhotoName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    // Replace with:
    // 1. Upload product photos to Cloudinary
    // 2. Insert a row into the `products` table via Supabase (seller_id, name,
    //    category, price, stock, description, image_url)
    setSubmitting(true)
    await new Promise((res) => setTimeout(res, 900))
    router.push('/dashboard/seller')
  }

  const s: Record<string, React.CSSProperties> = {
    page: { minHeight: '100vh', background: '#F1F5F9' },
    nav: { background: '#0F172A', padding: '0 32px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    logo: { fontSize: 18, fontWeight: 700, color: '#fff' },
    logoAccent: { color: '#FF6B35' },
    body: { maxWidth: 720, margin: '0 auto', padding: '32px 24px' },
  }

  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <div style={s.logo}>Print<span style={s.logoAccent}>Hive</span></div>
        <a href="/dashboard/seller" style={{ color: '#94A3B8', fontSize: 13 }}>← Back to dashboard</a>
      </nav>

      <div style={s.body}>
        <h1 className="section-heading" style={{ marginBottom: 'var(--space-2)' }}>Add a product</h1>
        <p className="text-sm text-muted" style={{ marginBottom: 'var(--space-8)' }}>
          List a ready-made 3D printed product in your store.
        </p>

        <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
          <div className="card-header"><div className="card-title">Product photos</div></div>
          <div className="form-group">
            <label htmlFor="product-photo" className="flex flex-col items-center justify-center" style={{
              border: '2px dashed var(--color-border-strong)', borderRadius: 'var(--radius-md)',
              padding: 'var(--space-8)', cursor: 'pointer', textAlign: 'center',
            }}>
              <span style={{ fontSize: 28, marginBottom: 'var(--space-2)' }}>📷</span>
              <span className="text-sm" style={{ fontWeight: 600 }}>{photoName || 'Click to upload product photos'}</span>
              <span className="help-text">JPG or PNG, multiple images supported</span>
              <input id="product-photo" type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={(e) => setPhotoName(e.target.files?.[0]?.name || '')} />
            </label>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
          <div className="card-header"><div className="card-title">Product details</div></div>
          <div className="form-group">
            <label className="label label-required">Product name</label>
            <input className="input" placeholder="e.g. Geometric Planter Set" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="label">Description</label>
            <textarea className="textarea" placeholder="Describe the product, dimensions, and materials used" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="label">Category</label>
            <select className="select" value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
          <div className="card-header"><div className="card-title">Pricing & inventory</div></div>
          <div className="flex gap-4">
            <div className="form-group" style={{ flex: 1 }}>
              <label className="label label-required">Price (₹)</label>
              <input className="input" type="number" min={0} placeholder="599" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="label label-required">Stock quantity</label>
              <input className="input" type="number" min={0} placeholder="25" value={stock} onChange={(e) => setStock(e.target.value)} />
            </div>
          </div>
          <span className="help-text">You&apos;ll get a low-stock alert once inventory drops below 5 units.</span>
        </div>

        <button
          className="btn btn-primary btn-block btn-lg"
          disabled={submitting || !name || !price || !stock}
          onClick={handleSubmit}
        >
          {submitting ? 'Publishing…' : 'List product'}
        </button>
      </div>
    </div>
  )
}
