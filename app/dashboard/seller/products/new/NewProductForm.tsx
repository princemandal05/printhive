'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'

const CATEGORIES = [
  'Home Décor',
  'Toys & Miniatures',
  'Office Accessories',
  'Engineering Models',
  'Cosplay Items',
  'Personalized Gifts',
  'Educational Kits',
  'Lifestyle Products',
]

const DEFAULT_PRODUCT_IMAGE = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80'

export default function NewProductForm() {
  const router = useRouter()
  const supabase = createClient()

  const [name, setName] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('15')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [photoName, setPhotoName] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')
  const [cloudinaryUrl, setCloudinaryUrl] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [generatingAi, setGeneratingAi] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'info' | 'success' | 'error' } | null>(null)

  const uploadIdRef = useRef(0)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Auto-dismiss success status messages after 5s
  useEffect(() => {
    if (statusMsg?.type === 'success') {
      const timer = setTimeout(() => setStatusMsg(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [statusMsg])

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Cancel any previous in-flight upload
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    const abortController = new AbortController()
    abortControllerRef.current = abortController

    const currentUploadId = ++uploadIdRef.current
    setPhotoName(file.name)

    // Instant local preview for zero-delay UI feedback
    const localBlob = URL.createObjectURL(file)
    setPreviewUrl(localBlob)
    setCloudinaryUrl('')

    setUploadingPhoto(true)
    setUploadProgress(15)
    setStatusMsg({ text: 'Uploading photo to Cloudinary CDN...', type: 'info' })

    const progressInterval = setInterval(() => {
      if (uploadIdRef.current === currentUploadId) {
        setUploadProgress(prev => (prev < 85 ? prev + 15 : prev))
      }
    }, 250)

    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        signal: abortController.signal,
      })

      clearInterval(progressInterval)

      if (uploadIdRef.current !== currentUploadId) {
        return // Superseded by a newer selection
      }

      setUploadProgress(100)

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || `Upload failed with HTTP ${res.status}`)
      }

      const data = await res.json()
      if (uploadIdRef.current !== currentUploadId) return

      if (data.url || data.secure_url) {
        const finalUrl = data.secure_url || data.url
        setCloudinaryUrl(finalUrl)
        setPreviewUrl(finalUrl)
        setStatusMsg({ text: 'Image successfully uploaded to Cloudinary CDN!', type: 'success' })
      } else {
        throw new Error('No image URL returned from server')
      }
    } catch (err: any) {
      clearInterval(progressInterval)
      if (uploadIdRef.current !== currentUploadId) return

      if (err.name === 'AbortError') return

      console.error('Cloudinary upload error:', err)
      setCloudinaryUrl('')
      setStatusMsg({
        text: `Image upload failed: ${err.message || 'Could not upload photo'}. A default cover will be used if published.`,
        type: 'error',
      })
    } finally {
      if (uploadIdRef.current === currentUploadId) {
        setUploadingPhoto(false)
      }
    }
  }

  const handleGeminiAiGenerate = async () => {
    if (!name.trim()) {
      alert('Please enter a product title first so Gemini AI can generate a description.')
      return
    }
    setGeneratingAi(true)
    setStatusMsg({ text: 'Gemini AI is writing high-converting product copy...', type: 'info' })

    try {
      const res = await fetch('/api/ai/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: name.trim(), category, material: 'PLA' }),
      })
      const data = await res.json()
      if (data.description) {
        setDescription(data.description)
        if (data.tags) setTags(data.tags)
        setStatusMsg({ text: 'Gemini AI description & SEO tags generated!', type: 'success' })
      } else {
        setStatusMsg({ text: 'AI copywriter generated basic product metadata.', type: 'info' })
      }
    } catch (err) {
      console.warn('Gemini AI note:', err)
      setStatusMsg(null)
    } finally {
      setGeneratingAi(false)
    }
  }

  const handleSubmit = async () => {
    if (!name.trim()) {
      alert('Please enter a product title.')
      return
    }

    const parsedPrice = parseFloat(price)
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      alert('Please enter a valid price greater than 0.')
      return
    }

    const parsedStock = parseInt(stock.trim(), 10)
    if (isNaN(parsedStock) || parsedStock < 0) {
      alert('Please enter a valid non-negative stock quantity (0 or greater).')
      return
    }

    if (uploadingPhoto) {
      alert('Please wait for photo upload to finish.')
      return
    }

    setSubmitting(true)
    setStatusMsg({ text: 'Publishing product listing live to PrintHive Marketplace...', type: 'info' })

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        throw new Error('Authentication required: Please sign in as a seller to publish products.')
      }

      // Strictly use durable Cloudinary URL or verified default image (never local blob URLs)
      const finalImageUrl = cloudinaryUrl && !cloudinaryUrl.startsWith('blob:')
        ? cloudinaryUrl
        : DEFAULT_PRODUCT_IMAGE

      const { data, error } = await supabase.from('products').insert({
        seller_id: user.id,
        title: name.trim(),
        description: description.trim() || `Handcrafted 3D printed ${name.trim()} made with precision and premium materials.`,
        category: category,
        price: parsedPrice,
        stock: parsedStock,
        image_url: finalImageUrl,
        created_at: new Date().toISOString(),
      }).select()

      if (error) {
        console.error('Supabase product insert error:', error)
        throw new Error(error.message || 'Failed to publish product.')
      }

      setStatusMsg({ text: 'Product published live successfully! Redirecting...', type: 'success' })
      setTimeout(() => {
        router.push('/dashboard/seller')
      }, 1000)
    } catch (err: any) {
      console.error('Publishing error:', err)
      setStatusMsg({ text: err?.message || 'Failed to publish product. Please try again.', type: 'error' })
      setSubmitting(false)
    }
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
      {/* SELLER HUB NAVIGATION */}
      <nav style={s.nav}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={s.logo}>
            <Link href="/" style={{ textDecoration: 'none', color: '#fff' }}>
              Print<span style={s.logoAccent}>Hive</span>
            </Link>{' '}
            <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600 }}>Seller Central</span>
          </div>
        </div>
        <Link href="/dashboard/seller" style={{ color: '#94A3B8', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
          ← Back to Seller Hub
        </Link>
      </nav>

      <div style={s.body}>
        {/* PAGE TITLE & STEPPER */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,107,53,0.12)', color: '#FF6B35', border: '1px solid rgba(255,107,53,0.3)', padding: '6px 16px', borderRadius: 99, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
            ⚡ Amazon Seller Listing Wizard
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.5px' }}>
            List a Ready-Made Product
          </h1>
          <p style={{ color: '#64748B', marginTop: 4, fontSize: 15 }}>
            Publish ready-to-ship physical 3D printed items with Cloudinary media CDN & Gemini AI metadata.
          </p>
        </div>

        {statusMsg && (
          <div style={{
            background: statusMsg.type === 'success' ? '#ECFDF5' : statusMsg.type === 'error' ? '#FEF2F2' : '#EFF6FF',
            color: statusMsg.type === 'success' ? '#065F46' : statusMsg.type === 'error' ? '#991B1B' : '#1E40AF',
            padding: '14px 20px',
            borderRadius: 14,
            fontSize: 14,
            marginBottom: 24,
            fontWeight: 700,
            border: statusMsg.type === 'success' ? '1px solid #A7F3D0' : statusMsg.type === 'error' ? '1px solid #FECACA' : '1px solid #BFDBFE',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {uploadingPhoto && <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⚡</span>}
              <span>{statusMsg.text}</span>
            </div>
            <button
              onClick={() => setStatusMsg(null)}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 16, color: 'inherit', fontWeight: 900 }}
            >
              ✕
            </button>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 28, alignItems: 'start' }}>
          {/* LEFT FORM COLUMNS */}
          <div>
            {/* STEP 1: MEDIA UPLOAD */}
            <div style={s.card}>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#0F172A', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span>1.</span> Product Photos (Cloudinary CDN)
              </div>
              <label
                htmlFor="product-photo"
                style={{
                  border: '2px dashed #CBD5E1',
                  borderRadius: 16,
                  padding: 32,
                  cursor: uploadingPhoto ? 'wait' : 'pointer',
                  textAlign: 'center',
                  display: 'block',
                  background: '#F8FAFC',
                  transition: 'all 0.2s',
                  position: 'relative',
                  overflow: 'hidden',
                  opacity: uploadingPhoto ? 0.75 : 1,
                }}
              >
                {/* Upload Progress Bar Animation */}
                {uploadingPhoto && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: 4,
                    width: `${uploadProgress}%`,
                    background: 'linear-gradient(90deg, #FF6B35, #8B5CF6)',
                    transition: 'width 0.2s ease',
                  }} />
                )}

                <div style={{ fontSize: 36, marginBottom: 8 }}>
                  {uploadingPhoto ? '⏳' : previewUrl ? '🖼️' : '☁️'}
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#0F172A' }}>
                  {uploadingPhoto
                    ? `Uploading to Cloudinary CDN (${uploadProgress}%)…`
                    : photoName
                    ? `Uploaded: ${photoName}`
                    : 'Click to Upload High-Res Product Photos'}
                </div>
                <div style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>
                  Auto-optimized PNG/JPG delivered via Cloudinary CDN
                </div>
                <input
                  id="product-photo"
                  type="file"
                  accept="image/*"
                  disabled={uploadingPhoto}
                  style={{ display: 'none' }}
                  onChange={handlePhotoSelect}
                />
              </label>

              {previewUrl && (
                <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 12, background: '#F1F5F9', padding: 10, borderRadius: 12 }}>
                  <img src={previewUrl} alt="Thumbnail" style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover' }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#0F172A' }}>{photoName || 'Product Image'}</div>
                    <span style={{ fontSize: 12, color: cloudinaryUrl ? '#10B981' : '#F59E0B', fontWeight: 700 }}>
                      {cloudinaryUrl ? '✅ Cloudinary CDN ready' : '⚡ Local preview (upload pending)'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* STEP 2: PRODUCT DETAILS & GEMINI AI */}
            <div style={s.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span>2.</span> Listing Information & AI Copywriter
                </div>
                <button
                  type="button"
                  onClick={handleGeminiAiGenerate}
                  disabled={generatingAi}
                  style={{ background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)', color: '#fff', border: 'none', borderRadius: 99, padding: '6px 14px', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}
                >
                  {generatingAi ? 'Generating…' : '✨ Auto-Fill with Gemini AI'}
                </button>
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={s.label}>Product Title *</label>
                <input
                  style={inputStyle}
                  placeholder="e.g. Ergonomic Desk Headphone Stand v2"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={s.label}>Category</label>
                <select
                  style={inputStyle}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={s.label}>Product Description</label>
                <textarea
                  style={{ ...inputStyle, minHeight: 110, resize: 'vertical' }}
                  placeholder="Describe your product specs, materials, dimensions, and finish..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {tags.length > 0 && (
                <div>
                  <label style={s.label}>Gemini AI SEO Keywords</label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {tags.map((t) => (
                      <span key={t} style={{ background: '#F3E8FF', color: '#7C3AED', padding: '4px 10px', borderRadius: 99, fontSize: 12, fontWeight: 700 }}>
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* STEP 3: PRICING & INVENTORY */}
            <div style={s.card}>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#0F172A', marginBottom: 16 }}>
                3. Pricing & Inventory Management
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={s.label}>Listing Price (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    style={inputStyle}
                    placeholder="799"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
                <div>
                  <label style={s.label}>Stock Quantity *</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    style={inputStyle}
                    placeholder="15"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', padding: 14, borderRadius: 12, fontSize: 13, color: '#1E40AF', fontWeight: 600 }}>
                💡 <strong>Seller Payout Split:</strong> You receive <strong>70% direct payout</strong> on orders, held securely by Razorpay Escrow until customer delivery confirmation.
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting || !name || !price || uploadingPhoto}
              style={{
                width: '100%',
                background: (submitting || !name || !price || uploadingPhoto)
                  ? '#94A3B8'
                  : 'linear-gradient(135deg, #FF6B35 0%, #F97316 100%)',
                color: '#fff',
                border: 'none',
                padding: '16px 32px',
                borderRadius: 16,
                fontSize: 16,
                fontWeight: 900,
                cursor: (submitting || !name || !price || uploadingPhoto) ? 'not-allowed' : 'pointer',
                boxShadow: '0 8px 24px rgba(255,107,53,0.35)',
                transition: 'all 0.2s ease',
              }}
            >
              {submitting ? 'Publishing Product Listing…' : '🚀 Publish Product Listing Live'}
            </button>
          </div>

          {/* RIGHT SIDE: LIVE PRODUCT CARD PREVIEW */}
          <div style={{ position: 'sticky', top: 24 }}>
            <div style={s.card}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#FF6B35', textTransform: 'uppercase', marginBottom: 12 }}>
                Live Marketplace Preview
              </div>

              <div style={{ background: '#F8FAFC', borderRadius: 16, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                <div style={{ height: 200, background: '#E2E8F0', position: 'relative' }}>
                  <img
                    src={previewUrl || cloudinaryUrl || DEFAULT_PRODUCT_IMAGE}
                    alt="Preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', top: 12, right: 12, background: '#ECFDF5', color: '#10B981', padding: '4px 10px', borderRadius: 99, fontSize: 11, fontWeight: 800 }}>
                    In Stock ({stock || 0})
                  </div>
                </div>

                <div style={{ padding: 18 }}>
                  <div style={{ fontSize: 11, color: '#FF6B35', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4 }}>{category}</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: '#0F172A', marginBottom: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {name || 'Product Title Preview'}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748B', marginBottom: 14, height: 36, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {description || 'Product description preview will appear here as you type...'}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 20, fontWeight: 900, color: '#0F172A' }}>₹{price || '799'}</div>
                    <span style={{ background: '#FF6B35', color: '#fff', padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 800 }}>
                      Add to Cart
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