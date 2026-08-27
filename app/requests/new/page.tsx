'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import {
  FileText,
  UploadCloud,
  Trash2,
  Plus,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  Layers,
  Sparkles,
} from 'lucide-react'

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
      setFormError('Please enter what you need designed or manufactured.')
      return
    }

    if (!description.trim()) {
      setFormError('Please enter technical specifications and requirements in the description.')
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

      const fullDescription = [
        description.trim(),
        dimensions.trim() ? `\n📐 Dimensions: ${dimensions.trim()}` : '',
        material ? `\n🧪 Preferred Material: ${material}` : '',
        (budgetMin || budgetMax) ? `\n💰 Budget Range: ₹${budgetMin || '0'} – ₹${budgetMax || budgetMin || '0'}` : '',
        uploadedUrls.length > 0 ? `\n📎 Reference Attachments:\n${uploadedUrls.map((url, i) => `[Attachment ${i+1}](${url})`).join('\n')}` : '',
      ].filter(Boolean).join('\n')

      const finalBudget = Number(budgetMax || budgetMin || 500)

      const { data: insertResult, error: insertErr } = await supabase.from('design_requests').insert({
        buyer_id: user.id,
        title: purpose.trim(),
        description: fullDescription,
        budget: finalBudget,
        status: 'open',
      }).select().single()

      if (insertErr) {
        console.error('Insert error:', insertErr)
        setFormError(insertErr.message || 'Failed to submit request. Please try again.')
        setSubmitting(false)
        return
      }

      router.push(`/requests/${insertResult.id}`)
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
    background: 'var(--bg-card-hover)',
    border: '1px solid var(--border-color)',
    borderRadius: 8,
    padding: '10px 12px',
    fontSize: 13,
    color: 'var(--text-main)',
    outline: 'none',
    boxSizing: 'border-box',
    fontWeight: 500,
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 12,
    fontWeight: 700,
    color: 'var(--text-main)',
    marginBottom: 6,
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-canvas)', color: 'var(--text-main)', fontFamily: 'inherit' }}>
      <Navbar />

      <div style={{ maxWidth: 780, margin: '0 auto', padding: '32px 20px 60px' }}>
        {/* HEADER SECTION */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-sub)', fontWeight: 600, marginBottom: 6 }}>
            <Link href="/dashboard/buyer" style={{ color: 'var(--text-sub)', textDecoration: 'none' }}>Dashboard</Link>
            <span>/</span>
            <span style={{ color: 'var(--text-main)' }}>New Custom Brief</span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.3px' }}>
            Post a Custom 3D Design Brief
          </h1>
          <p style={{ color: 'var(--text-sub)', fontSize: 13, lineHeight: 1.5, margin: '4px 0 0' }}>
            Submit technical requirements for CAD modeling or on-demand printing. Verified designers and print farms across India will review and bid.
          </p>
        </div>

        {/* ERROR NOTIFICATION BANNER */}
        {formError && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', padding: '12px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={16} />
              <span>{formError}</span>
            </div>
            <button
              onClick={() => setFormError(null)}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 14, color: 'inherit', fontWeight: 700 }}
            >
              ✕
            </button>
          </div>
        )}

        {/* MAIN FORM CARD */}
        <div style={{ background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border-color)', padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
          {/* PURPOSE */}
          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>
              Project Title or Part Name *
            </label>
            <input
              style={inputStyle}
              placeholder="e.g., Replacement Gears for Coffee Grinder, Custom GoPro Gimbal Mount"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
            />
          </div>

          {/* DIMENSIONS & MATERIAL */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
            <div>
              <label style={labelStyle}>
                Approximate Dimensions (Optional)
              </label>
              <input
                style={inputStyle}
                placeholder="e.g., 120mm x 45mm x 25mm"
                value={dimensions}
                onChange={(e) => setDimensions(e.target.value)}
              />
            </div>
            <div>
              <label style={labelStyle}>
                Preferred Polymer / Material
              </label>
              <select
                style={inputStyle}
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
              >
                <option value="">No preference (Designer decides)</option>
                <option>PLA (Standard Prototyping)</option>
                <option>PETG (Durable & Chemical Resistant)</option>
                <option>ABS (High Heat / Toughness)</option>
                <option>TPU (Flexible Rubber-like)</option>
                <option>Resin (Ultra High Detail / Smooth)</option>
              </select>
            </div>
          </div>

          {/* BUDGET RANGE */}
          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>
              Target Budget Range (₹ INR)
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <input
                type="number"
                min="0"
                style={inputStyle}
                placeholder="Min Budget (e.g. ₹400)"
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value)}
              />
              <input
                type="number"
                min="0"
                style={inputStyle}
                placeholder="Max Budget (e.g. ₹1200)"
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
              />
            </div>
          </div>

          {/* DESCRIPTION */}
          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>
              Technical Specifications & Functional Requirements *
            </label>
            <textarea
              style={{ ...inputStyle, minHeight: 110, resize: 'vertical', lineHeight: 1.5 }}
              placeholder="Describe what this model does, mounting hole diameters, structural load, tolerances, or mating parts..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* REFERENCE ATTACHMENTS */}
          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>
              Reference Attachments (Sketches, Photos, or Specs)
            </label>
            <input
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx,.txt,.stl"
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
                gap: 4,
                padding: '20px 16px',
                background: 'var(--bg-card-hover)',
                border: '1px dashed var(--border-color)',
                borderRadius: 8,
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.15s',
              }}
            >
              <UploadCloud size={24} color="var(--text-sub)" />
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', marginTop: 4 }}>
                Click to attach reference photos, CAD files, or PDF/Word specs
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-sub)' }}>
                Supports PNG, JPG, PDF, DOCX, TXT, and STL files (Up to 15MB each)
              </div>
            </label>
          </div>

          {/* ATTACHED FILES LIST */}
          {attachedFiles.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', marginBottom: 6 }}>
                Attached files ({attachedFiles.length}):
              </div>
              <div style={{ display: 'grid', gap: 6 }}>
                {attachedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'var(--bg-card-hover)',
                      padding: '8px 12px',
                      borderRadius: 6,
                      border: '1px solid var(--border-color)',
                      fontSize: 12,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <FileText size={14} color="var(--text-sub)" />
                      <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{file.name}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-sub)' }}>({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', padding: 2 }}
                    >
                      <Trash2 size={13} />
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
              background: submitting || !purpose.trim() ? 'var(--bg-card-hover)' : 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
              color: '#FFFFFF',
              border: 'none',
              padding: '12px 20px',
              borderRadius: 9999,
              fontSize: 14,
              fontWeight: 800,
              cursor: submitting || !purpose.trim() ? 'not-allowed' : 'pointer',
              boxShadow: submitting || !purpose.trim() ? 'none' : '0 4px 16px rgba(234,88,12,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'all 0.15s ease',
            }}
          >
            {submitting ? 'Submitting Your Custom Brief…' : 'Publish Custom Brief to Network'}
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      <Footer />
    </main>
  )
}