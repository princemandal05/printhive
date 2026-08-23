'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function NewRequestPage() {
  const router = useRouter()
  const [purpose, setPurpose] = useState('')
  const [dimensions, setDimensions] = useState('')
  const [material, setMaterial] = useState('')
  const [budgetMin, setBudgetMin] = useState('')
  const [budgetMax, setBudgetMax] = useState('')
  const [description, setDescription] = useState('')
  const [attachedFiles, setAttachedFiles] = useState<File[]>([])
  const [submitting, setSubmitting] = useState(false)

  const [formError, setFormError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setAttachedFiles((prev) => [...prev, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setFormError(null)
    try {
      const { createClient } = await import('@/utils/supabase/client')
      const supabase = createClient()
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        setFormError('Authentication required. Please log in to post a brief.')
        return
      }

      const uploadedUrls: string[] = []
      for (const file of attachedFiles) {
        try {
          const formData = new FormData()
          formData.append('file', file)
          const res = await fetch('/api/upload', { method: 'POST', body: formData })
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}))
            setFormError(`Failed to upload attachment "${file.name}": ${errData.error || res.statusText}. Please try again.`)
            return
          }
          const resData = await res.json()
          const url = resData.url || resData.secure_url
          if (!url) {
            setFormError(`Failed to retrieve URL for attachment "${file.name}". Please try again.`)
            return
          }
          uploadedUrls.push(url)
        } catch (err: unknown) {
          console.error('File upload error:', err)
          setFormError(`Network error while uploading attachment "${file.name}". Please try again.`)
          return
        }
      }

      const { error: insertErr } = await supabase.from('design_requests').insert({
        buyer_id: user.id,
        buyer_name: user.user_metadata?.full_name || user.email || 'Verified Buyer',
        purpose,
        dimensions,
        material,
        budget_min: Number(budgetMin || 0),
        budget_max: Number(budgetMax || 0),
        description,
        urgency: 'Standard',
        attachment_urls: uploadedUrls,
      })

      if (insertErr) {
        setFormError(insertErr.message || 'Failed to submit request. Please try again.')
        return
      }

      router.push('/dashboard/buyer')
    } catch (err: unknown) {
      console.error('Error inserting design request into Supabase:', err)
      const msg = err instanceof Error ? err.message : 'An error occurred while submitting your brief.'
      setFormError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--color-bg-dark, #0b0f19)', color: '#f8fafc' }}>
      <Navbar />

      <section className="container section-sm" style={{ maxWidth: 720, margin: '0 auto', padding: '40px 20px' }}>
        <div className="section-eyebrow" style={{ color: '#ff6b35', textTransform: 'uppercase', letterSpacing: 1.5, fontSize: 12, fontWeight: 700 }}>
          Custom design request
        </div>
        <h1 className="section-heading" style={{ fontSize: 32, fontWeight: 800, marginBottom: 8, background: 'linear-gradient(135deg, #fff 0%, #cbd5e1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Post a Brief for 3D Designers
        </h1>
        <p className="section-subheading" style={{ color: '#94a3b8', marginBottom: 32, fontSize: 15 }}>
          Describe what you need or upload your Word document specification brief. Top 3D designers will submit competitive bids with price and timeline.
        </p>

        <div className="card" style={{ background: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 16, padding: 32, marginBottom: 24, boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="label label-required" style={{ display: 'block', color: '#cbd5e1', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
              What is this model for? *
            </label>
            <input
              className="input"
              placeholder="e.g. Replacement knob for washing machine, Iron Man helmet with custom name"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              style={{ width: '100%', padding: '12px 16px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#fff' }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div>
              <label className="label" style={{ display: 'block', color: '#cbd5e1', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                Approximate dimensions
              </label>
              <input
                className="input"
                placeholder="e.g. 15cm x 5cm x 2cm"
                value={dimensions}
                onChange={(e) => setDimensions(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#fff' }}
              />
            </div>
            <div>
              <label className="label" style={{ display: 'block', color: '#cbd5e1', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                Preferred material
              </label>
              <select
                className="select"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#fff' }}
              >
                <option value="">No preference</option>
                <option>PLA (Standard)</option>
                <option>PETG (Durable)</option>
                <option>ABS (High Heat / Tough)</option>
                <option>TPU (Flexible)</option>
                <option>Resin (High Detail)</option>
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="label" style={{ display: 'block', color: '#cbd5e1', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
              Budget range (₹)
            </label>
            <div className="flex gap-3" style={{ display: 'flex', gap: 12 }}>
              <input
                className="input"
                type="number"
                placeholder="Min ₹"
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value)}
                style={{ flex: 1, padding: '12px 16px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#fff' }}
              />
              <input
                className="input"
                type="number"
                placeholder="Max ₹"
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
                style={{ flex: 1, padding: '12px 16px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#fff' }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="label label-required" style={{ display: 'block', color: '#cbd5e1', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
              Detailed Description *
            </label>
            <textarea
              className="textarea"
              rows={4}
              placeholder="Describe what you need in detail — shape, texture, function, mounting holes, or special features..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ width: '100%', padding: '12px 16px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#fff', resize: 'vertical' }}
            />
          </div>

          {/* Reference Files: Images, Word Docs (.doc, .docx), PDFs */}
          <div className="form-group" style={{ marginBottom: 12 }}>
            <label className="label" style={{ display: 'block', color: '#cbd5e1', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
              Reference Specifications & Files
            </label>
            <input
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              id="file-upload-input"
            />
            <label
              htmlFor="file-upload-input"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 18px',
                background: '#1e293b',
                border: '1px dashed #475569',
                borderRadius: 8,
                color: '#38bdf8',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              📁 Attach Images or Word Docs (.docx)
            </label>
          </div>

          {/* Attached Files List */}
          {attachedFiles.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 8 }}>Attached files ({attachedFiles.length}):</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {attachedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: '#0f172a',
                      padding: '10px 14px',
                      borderRadius: 8,
                      border: '1px solid #334155',
                      fontSize: 13,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span>
                        {file.name.endsWith('.doc') || file.name.endsWith('.docx')
                          ? '📝'
                          : file.name.endsWith('.pdf')
                          ? '📄'
                          : '🖼️'}
                      </span>
                      <span style={{ color: '#f1f5f9', fontWeight: 500 }}>{file.name}</span>
                      <span style={{ color: '#64748b', fontSize: 11 }}>({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 700 }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {formError && (
          <div role="alert" style={{ background: '#7F1D1D', border: '1px solid #EF4444', color: '#FCA5A5', padding: '12px 16px', borderRadius: 8, fontSize: 14, marginBottom: 16, fontWeight: 600 }}>
            ⚠️ {formError}
          </div>
        )}

        <button
          className="btn btn-primary btn-block btn-lg"
          disabled={submitting || !purpose || !description}
          onClick={handleSubmit}
          style={{
            width: '100%',
            padding: '16px 0',
            background: 'linear-gradient(135deg, #ff6b35 0%, #f97316 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            fontSize: 16,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 10px 25px rgba(255, 107, 53, 0.4)',
            opacity: submitting || !purpose || !description ? 0.6 : 1,
          }}
        >
          {submitting ? 'Posting brief to marketplace...' : 'Post Custom Design Brief'}
        </button>
      </section>

      <Footer />
    </main>
  )
}