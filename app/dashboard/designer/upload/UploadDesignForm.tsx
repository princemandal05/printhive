'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'

const CATEGORIES = ['Toys & Games', 'Home & Office', 'Home & Decor', 'Personalized', 'Repair Parts']
const MATERIALS = ['PLA', 'PETG', 'ABS', 'TPU (Flexible)', 'Resin']

export default function UploadDesignForm() {
  const router = useRouter()
  const supabase = createClient()
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [materials, setMaterials] = useState<string[]>(['PLA'])
  const [pricingType, setPricingType] = useState<'free' | 'one_time' | 'royalty'>('royalty')
  const [price, setPrice] = useState('150')
  const [description, setDescription] = useState('')
  const [fileName, setFileName] = useState('')
  const [cloudinaryFileUrl, setCloudinaryFileUrl] = useState('')
  const [uploadingFile, setUploadingFile] = useState(false)
  const [generatingAi, setGeneratingAi] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [statusMsg, setStatusMsg] = useState('')

  const toggleMaterial = (m: string) => {
    setMaterials((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]))
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    setUploadingFile(true)
    setStatusMsg('⚡ Uploading STL/3MF model to Cloudinary CDN...')

    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.url) {
        setCloudinaryFileUrl(data.url)
        setStatusMsg('✅ 3D Model successfully saved to Cloudinary CDN!')
      }
    } catch (err) {
      console.warn('Cloudinary design upload note:', err)
    } finally {
      setUploadingFile(false)
    }
  }

  const handleGeminiAiGenerate = async () => {
    if (!title) {
      alert('Please enter a design title first.')
      return
    }
    setGeneratingAi(true)
    setStatusMsg('✨ Gemini AI is generating 3D printing slicing notes...')

    try {
      const res = await fetch('/api/ai/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, category, material: materials.join(', ') }),
      })
      const data = await res.json()
      if (data.description) {
        setDescription(data.description)
        setStatusMsg('✅ Gemini AI description & print specs generated!')
      }
    } catch (err) {
      console.warn('Gemini AI note:', err)
    } finally {
      setGeneratingAi(false)
    }
  }

  const handleSubmit = async () => {
    if (!title) return
    setSubmitting(true)
    setStatusMsg('🚀 Publishing 3D Model to PrintHive Creator Studio...')

    const defaultStlUrl = '/models/demo.stl'
    const fileUrl = cloudinaryFileUrl || defaultStlUrl
    const previewUrl = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80'

    const designPayload = {
      title,
      description: description || `Original 3D model ${title} designed for precision printing.`,
      category,
      materials,
      pricing_type: pricingType,
      price: pricingType === 'free' ? 0 : Number(price) || 0,
      file_url: fileUrl,
      preview_url: previewUrl,
    }

    try {
      const res = await fetch('/api/designs/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(designPayload),
      })
      const data = await res.json()

      // Also persist to localStorage for instant client rendering
      const existingStr = localStorage.getItem('printhive_uploaded_designs') || '[]'
      const existing = JSON.parse(existingStr)
      const newDesignObj = data.design || {
        id: `custom-${Date.now()}`,
        ...designPayload,
        status: 'published',
      }
      localStorage.setItem('printhive_uploaded_designs', JSON.stringify([newDesignObj, ...existing]))
    } catch (insertError: any) {
      console.warn('Design insert note:', insertError)
    }

    setSubmitting(false)
    router.push('/dashboard/designer')
    router.refresh()
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: '#F8FAFC',
    border: '1px solid #CBD5E1',
    borderRadius: 12,
    padding: '12px 16px',
    fontSize: 14,
    color: '#0F172A',
    outline: 'none',
    boxSizing: 'border-box',
    fontWeight: 600,
  }

  const s: Record<string, React.CSSProperties> = {
    page: { minHeight: '100vh', background: '#FAF8F5', color: '#0F172A', fontFamily: 'inherit' },
    nav: { background: '#0F172A', padding: '0 32px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)' },
    logo: { fontSize: 20, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' },
    logoAccent: { color: '#FF6B35' },
    body: { maxWidth: 1100, margin: '0 auto', padding: '36px 24px' },
    card: { background: '#FFFFFF', borderRadius: 20, border: '1px solid #E2E8F0', padding: 28, boxShadow: '0 8px 30px rgba(0,0,0,0.04)', marginBottom: 24 },
    label: { fontSize: 13, fontWeight: 800, color: '#334155', marginBottom: 6, display: 'block', textTransform: 'uppercase' as const, letterSpacing: 0.5 },
  }

  return (
    <div style={s.page}>
      {/* CREATOR STUDIO NAVIGATION */}
      <nav style={s.nav}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={s.logo}>
            <Link href="/" style={{ textDecoration: 'none', color: '#fff' }}>
              Print<span style={s.logoAccent}>Hive</span>
            </Link>{' '}
            <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600 }}>Creator Studio</span>
          </div>
        </div>
        <a href="/dashboard/designer" style={{ color: '#94A3B8', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>← Back to Creator Studio</a>
      </nav>

      <div style={s.body}>
        {/* PAGE TITLE & STEPPER */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(139,92,246,0.12)', color: '#8B5CF6', border: '1px solid rgba(139,92,246,0.3)', padding: '6px 16px', borderRadius: 99, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
            🎨 3D Model Upload & Royalty Publishing
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.5px' }}>
            Publish STL / 3MF Design
          </h1>
          <p style={{ color: '#64748B', marginTop: 4, fontSize: 15 }}>
            Upload digital 3D models to Cloudinary CDN and earn 15% automated royalties whenever printed.
          </p>
        </div>

        {statusMsg && (
          <div style={{ background: '#ECFDF5', color: '#065F46', padding: '14px 20px', borderRadius: 14, fontSize: 14, marginBottom: 24, fontWeight: 700, border: '1px solid #A7F3D0' }}>
            {statusMsg}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 28, alignItems: 'start' }}>
          {/* LEFT FORM COLUMNS */}
          <div>
            {/* STEP 1: STL FILE UPLOAD */}
            <div style={s.card}>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#0F172A', marginBottom: 16 }}>
                1. 3D Model Geometry File (Cloudinary CDN)
              </div>
              <label
                htmlFor="stl-file"
                style={{
                  border: '2px dashed #CBD5E1',
                  borderRadius: 16,
                  padding: 32,
                  cursor: 'pointer',
                  textAlign: 'center',
                  display: 'block',
                  background: '#F8FAFC',
                }}
              >
                <div style={{ fontSize: 36, marginBottom: 8 }}>📦</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#0F172A' }}>
                  {uploadingFile ? 'Uploading 3D Model to Cloudinary CDN…' : fileName ? `Uploaded: ${fileName}` : 'Click to Upload STL or 3MF Model File'}
                </div>
                <div style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>Maximum file size: 50MB · Served via Cloudinary CDN</div>
                <input
                  id="stl-file"
                  type="file"
                  accept=".stl,.3mf"
                  style={{ display: 'none' }}
                  onChange={handleFileSelect}
                />
              </label>
            </div>

            {/* STEP 2: METADATA & GEMINI AI */}
            <div style={s.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
                  2. Design Title & Printing Instructions
                </div>
                <button
                  type="button"
                  onClick={handleGeminiAiGenerate}
                  disabled={generatingAi}
                  style={{ background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)', color: '#fff', border: 'none', borderRadius: 99, padding: '6px 14px', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}
                >
                  {generatingAi ? 'Generating…' : '✨ Gemini AI Specs'}
                </button>
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={s.label}>Design Title *</label>
                <input
                  style={inputStyle}
                  placeholder="e.g. Ergonomic Headphone Stand v2"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={s.label}>Category</label>
                <select style={inputStyle} value={category} onChange={(e) => setCategory(e.target.value)}>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={s.label}>Recommended Filament Materials</label>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {MATERIALS.map((m) => {
                    const active = materials.includes(m)
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => toggleMaterial(m)}
                        style={{
                          padding: '6px 16px',
                          borderRadius: 99,
                          fontSize: 13,
                          fontWeight: 700,
                          border: active ? '1px solid #8B5CF6' : '1px solid #CBD5E1',
                          background: active ? '#F3E8FF' : '#F8FAFC',
                          color: active ? '#7C3AED' : '#334155',
                          cursor: 'pointer',
                        }}
                      >
                        {m}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={s.label}>Print Settings & Description</label>
                <textarea
                  style={{ ...inputStyle, minHeight: 100 }}
                  placeholder="Layer height (e.g. 0.2mm), infill %, nozzle diameter, support notes..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            {/* STEP 3: MONETIZATION & ROYALTY */}
            <div style={s.card}>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#0F172A', marginBottom: 16 }}>
                3. Royalty & Monetization Settings
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 16 }}>
                {[
                  { id: 'royalty', title: '15% Royalty Split', sub: 'Earn on every print' },
                  { id: 'one_time', title: 'Flat File Price', sub: 'Digital download' },
                  { id: 'free', title: 'Open Source', sub: 'Free community model' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setPricingType(item.id as any)}
                    style={{
                      background: pricingType === item.id ? '#F3E8FF' : '#F8FAFC',
                      border: pricingType === item.id ? '2px solid #8B5CF6' : '1px solid #CBD5E1',
                      borderRadius: 14,
                      padding: 14,
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontWeight: 800, fontSize: 13, color: '#0F172A' }}>{item.title}</div>
                    <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>{item.sub}</div>
                  </button>
                ))}
              </div>

              {pricingType !== 'free' && (
                <div>
                  <label style={s.label}>Royalty / Download Price (₹)</label>
                  <input
                    type="number"
                    style={{ ...inputStyle, maxWidth: 220 }}
                    placeholder="150"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting || !title || uploadingFile}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                color: '#fff',
                border: 'none',
                padding: '16px 32px',
                borderRadius: 16,
                fontSize: 16,
                fontWeight: 900,
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(139,92,246,0.35)',
              }}
            >
              {submitting ? 'Publishing 3D Model…' : '🚀 Publish 3D Model Live'}
            </button>
          </div>

          {/* RIGHT PREVIEW */}
          <div style={{ position: 'sticky', top: 24 }}>
            <div style={s.card}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#8B5CF6', textTransform: 'uppercase', marginBottom: 12 }}>
                Live Model Preview
              </div>

              <div style={{ background: '#F8FAFC', borderRadius: 16, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                <img
                  src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80"
                  alt="3D Preview"
                  style={{ width: '100%', height: 180, objectFit: 'cover' }}
                />
                <div style={{ padding: 18 }}>
                  <div style={{ fontSize: 11, color: '#8B5CF6', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4 }}>{category}</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: '#0F172A', marginBottom: 6 }}>{title || 'Model Title Preview'}</div>
                  <div style={{ fontSize: 12, color: '#64748B', marginBottom: 12 }}>Materials: {materials.join(', ')}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 900, color: pricingType === 'free' ? '#10B981' : '#0F172A' }}>
                      {pricingType === 'free' ? 'Free (₹0)' : `₹${price || '0'}`}
                    </div>
                    <span
                      style={{
                        background: pricingType === 'free' ? '#10B981' : pricingType === 'one_time' ? '#0284C7' : '#8B5CF6',
                        color: '#fff',
                        padding: '4px 12px',
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 800,
                      }}
                    >
                      {pricingType === 'free' ? 'Open Source' : pricingType === 'one_time' ? 'Flat Price' : '15% Royalty'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}