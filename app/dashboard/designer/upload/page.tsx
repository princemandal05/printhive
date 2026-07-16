'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const CATEGORIES = ['Toys & Games', 'Home & Office', 'Home & Decor', 'Personalized', 'Repair Parts']
const MATERIALS = ['PLA', 'PETG', 'ABS', 'TPU (Flexible)', 'Resin']

export default function UploadDesignPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [materials, setMaterials] = useState<string[]>(['PLA'])
  const [pricingType, setPricingType] = useState<'free' | 'one_time' | 'royalty'>('royalty')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [fileName, setFileName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const toggleMaterial = (m: string) => {
    setMaterials((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]))
  }

  const handleSubmit = async () => {
    // Replace with:
    // 1. Upload the STL/3MF file to Cloudinary
    // 2. Insert a row into the `designs` table via Supabase
    // 3. Optionally call the Gemini API auto-tag endpoint on the description
    setSubmitting(true)
    await new Promise((res) => setTimeout(res, 900))
    router.push('/dashboard/designer')
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
        <a href="/dashboard/designer" style={{ color: '#94A3B8', fontSize: 13 }}>← Back to dashboard</a>
      </nav>

      <div style={s.body}>
        <h1 className="section-heading" style={{ marginBottom: 'var(--space-2)' }}>Upload a new design</h1>
        <p className="text-sm text-muted" style={{ marginBottom: 'var(--space-8)' }}>
          Publish an STL or 3MF file to the marketplace and start earning.
        </p>

        <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
          <div className="card-header"><div className="card-title">Model file</div></div>
          <div className="form-group">
            <label className="label label-required">STL / 3MF file</label>
            <label
              htmlFor="stl-file"
              className="flex flex-col items-center justify-center"
              style={{
                border: '2px dashed var(--color-border-strong)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-8)',
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: 28, marginBottom: 'var(--space-2)' }}>📦</span>
              <span className="text-sm" style={{ fontWeight: 600 }}>
                {fileName || 'Click to choose a file'}
              </span>
              <span className="help-text">STL or 3MF, up to 200MB</span>
              <input
                id="stl-file"
                type="file"
                accept=".stl,.3mf"
                style={{ display: 'none' }}
                onChange={(e) => setFileName(e.target.files?.[0]?.name || '')}
              />
            </label>
          </div>

          <div className="form-group">
            <label className="label">Reference photos</label>
            <input type="file" accept="image/*" multiple className="input" />
            <span className="help-text">Buyers see these on the design detail page</span>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
          <div className="card-header"><div className="card-title">Details</div></div>

          <div className="form-group">
            <label className="label label-required">Title</label>
            <input className="input" placeholder="e.g. Articulated Dragon" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="form-group">
            <label className="label">Description</label>
            <textarea className="textarea" placeholder="Describe the design, print settings, and any tips" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="form-group">
            <label className="label">Category</label>
            <select className="select" value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="label">Compatible materials</label>
            <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
              {MATERIALS.map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => toggleMaterial(m)}
                  className={`badge ${materials.includes(m) ? 'badge-primary' : 'badge-neutral'}`}
                  style={{ cursor: 'pointer', border: 'none', padding: '8px 16px' }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
          <div className="card-header"><div className="card-title">Pricing</div></div>
          <div className="radio-group" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
            {[
              { key: 'free', label: 'Free', desc: 'No charge — great for building a following' },
              { key: 'one_time', label: 'One-time price', desc: 'Buyer pays a flat price you set' },
              { key: 'royalty', label: 'Per-print royalty', desc: 'Earn 15% automatically on every order' },
            ].map((opt) => (
              <label key={opt.key} className="flex items-center gap-3" style={{ cursor: 'pointer' }}>
                <input
                  type="radio"
                  className="radio"
                  name="pricing"
                  checked={pricingType === opt.key}
                  onChange={() => setPricingType(opt.key as typeof pricingType)}
                />
                <div>
                  <div className="text-sm" style={{ fontWeight: 600 }}>{opt.label}</div>
                  <div className="text-xs text-muted">{opt.desc}</div>
                </div>
              </label>
            ))}
          </div>

          {pricingType !== 'free' && (
            <div className="form-group" style={{ marginTop: 'var(--space-4)', maxWidth: 200 }}>
              <label className="label">Price (₹)</label>
              <input className="input" type="number" min={0} placeholder="450" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
          )}
        </div>

        <button
          className="btn btn-primary btn-block btn-lg"
          disabled={submitting || !title || !fileName}
          onClick={handleSubmit}
        >
          {submitting ? 'Publishing…' : 'Publish design'}
        </button>
      </div>
    </div>
  )
}