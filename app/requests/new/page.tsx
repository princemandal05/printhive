'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
    if (!purpose.trim()) {
      setFormError('Please enter what you want designed or manufactured.')
      return
    }

    setSubmitting(true)
    setFormError(null)

    try {
      const { createClient } = await import('@/utils/supabase/client')
      const supabase = createClient()
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        setFormError('Authentication required: Please log in to post a custom brief.')
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
        purpose: purpose.trim(),
        dimensions: dimensions.trim() || 'Custom Size',
        material: material || 'PLA',
        budget_min: Number(budgetMin || 0),
        budget_max: Number(budgetMax || 0),
        description: description.trim() || `Custom 3D model specification for ${purpose.trim()}.`,
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

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 13,
    fontWeight: 800,
    color: '#334155',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  }

  return (
    <main style={{ minHeight: '100vh', background: '#FAF8F5', color: '#0F172A' }}>
      <Navbar />

      <section style={{ maxWidth: 760, margin: '0 auto', padding: '40px 20px' }}>
        {/* HEADER SECTION */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,107,53,0.12)', color: '#FF6B35', border: '1px solid rgba(255,107,53,0.3)', padding: '6px 16px', borderRadius: 99, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
            ✨ Custom 3D Design & Print Brief
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: '#0F172A', margin: '0 0 8px', letterSpacing: '-0.5px' }}>
            Request a Custom 3D Part
          </h1>
          <p style={{ color: '#64748B', fontSize: 15, lineHeight: 1.5, margin: 0 }}>
            Describe what you need designed or manufactured. Top freelance 3D designers and verified print hubs will review your brief and submit competitive quotes.
          </p>
        </div>

        {/* ERROR NOTIFICATION BANNER */}
        {formError && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', padding: '14px 20px', borderRadius: 14, fontSize: 14, fontWeight: 700, marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>⚠️</span>
              <span>{formError}</span>
            </div>
            <button
              onClick={() => setFormError(null)}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 16, color: 'inherit', fontWeight: 900 }}
            >
              ✕
            </button>
          </div>
        )}

        {/* MAIN FORM CARD */}
        <div style={{ background: '#FFFFFF', borderRadius: 20, border: '1px solid #E2E8F0', padding: 32, boxShadow: '0 8px 30px rgba(0,0,0,0.04)', marginBottom: 24 }}>
          {/* PURPOSE */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>
              What do you need designed or printed? *
            </label>
            <input
              style={inputStyle}
              placeholder="e.g. Replacement knob for washing machine, Custom Drone Battery Mount"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
            />
          </div>

          {/* DIMENSIONS & MATERIAL */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div>
              <label style={labelStyle}>
                Approximate Dimensions
              </label>
              <input
                style={inputStyle}
                placeholder="e.g. 15cm x 5cm x 2cm"
                value={dimensions}
                onChange={(e) => setDimensions(e.target.value)}
              />
            </div>
            <div>
              <label style={labelStyle}>
                Preferred Material
              </label>
              <select
                style={inputStyle}
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
              >
                <option value="">No preference (Designer decides)</option>
                <option>PLA (Standard Prototyping)</option>
                <option>PETG (Durable & Weatherproof)</option>
                <option>ABS (High Heat / Tough)</option>
                <option>TPU (Flexible Rubber-like)</option>
                <option>Resin (Ultra High Detail)</option>
              </select>
            </div>
          </div>

          {/* BUDGET RANGE */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>
              Target Budget Range (₹)
            </label>
            <div style={{ display: 'flex', gap: 14 }}>
              <input
                type="number"
                min="0"
                style={inputStyle}
                placeholder="Min Budget (₹ e.g. 300)"
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value)}
              />
              <input
                type="number"
                min="0"
                style={inputStyle}
                placeholder="Max Budget (₹ e.g. 800)"
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
              />
            </div>
          </div>

          {/* DESCRIPTION */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>
              Detailed Description & Requirements *
            </label>
            <textarea
              style={{ ...inputStyle, minHeight: 110, resize: 'vertical' }}
              placeholder="Describe your requirements in detail — shape, texture, function, mounting holes, or special constraints..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* REFERENCE ATTACHMENTS */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>
              Reference Specifications & Files
            </label>
            <input
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx,.txt"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              id="file-upload-input"
            />
            <label
              htmlFor="file-upload-input"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '24px 20px',
                background: '#F8FAFC',
                border: '2px dashed #CBD5E1',
                borderRadius: 14,
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ fontSize: 28 }}>📁</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#0F172A' }}>
                Click to attach reference photos, sketches, or Word/PDF specs
              </div>
              <div style={{ fontSize: 12, color: '#64748B' }}>
                Supports PNG, JPG, PDF, DOCX, and TXT files (Up to 15MB each)
              </div>
            </label>
          </div>

          {/* ATTACHED FILES LIST */}
          {attachedFiles.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: 8 }}>
                Attached files ({attachedFiles.length}):
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {attachedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: '#F1F5F9',
                      padding: '10px 16px',
                      borderRadius: 10,
                      border: '1px solid #E2E8F0',
                      fontSize: 13,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span>📄</span>
                      <span style={{ fontWeight: 800, color: '#0F172A' }}>{file.name}</span>
                      <span style={{ fontSize: 11, color: '#64748B' }}>({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      style={{ background: 'transparent', border: 'none', color: '#EF4444', fontSize: 16, cursor: 'pointer', fontWeight: 900 }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <button
            onClick={handleSubmit}
            disabled={submitting || !purpose.trim()}
            style={{
              width: '100%',
              background: submitting || !purpose.trim()
                ? '#94A3B8'
                : 'linear-gradient(135deg, #FF6B35 0%, #F97316 100%)',
              color: '#fff',
              border: 'none',
              padding: '16px 32px',
              borderRadius: 16,
              fontSize: 16,
              fontWeight: 900,
              cursor: submitting || !purpose.trim() ? 'not-allowed' : 'pointer',
              boxShadow: '0 8px 24px rgba(255,107,53,0.35)',
              transition: 'all 0.2s ease',
            }}
          >
            {submitting ? 'Submitting Your Custom Brief…' : '🚀 Post Custom Design Brief'}
          </button>
        </div>
      </section>

      <Footer />
    </main>
  )
}