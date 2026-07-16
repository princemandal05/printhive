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
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    // Replace with: insert a row into the `design_requests` table via
    // Supabase; matching designers get notified and can submit bids.
    setSubmitting(true)
    await new Promise((res) => setTimeout(res, 900))
    router.push('/dashboard/buyer')
  }

  return (
    <main>
      <Navbar />

      <section className="container section-sm" style={{ maxWidth: 640, margin: '0 auto' }}>
        <div className="section-eyebrow">Custom design request</div>
        <h1 className="section-heading" style={{ marginBottom: 'var(--space-2)' }}>
          Can&apos;t find what you need?
        </h1>
        <p className="section-subheading" style={{ marginBottom: 'var(--space-8)' }}>
          Post a brief and let designers bid with a price and timeline.
        </p>

        <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
          <div className="form-group">
            <label className="label label-required">What is this for?</label>
            <input className="input" placeholder="e.g. Replacement knob for a washing machine" value={purpose} onChange={(e) => setPurpose(e.target.value)} />
          </div>

          <div className="form-group">
            <label className="label">Approximate dimensions</label>
            <input className="input" placeholder="e.g. 5cm x 5cm x 2cm" value={dimensions} onChange={(e) => setDimensions(e.target.value)} />
          </div>

          <div className="form-group">
            <label className="label">Preferred material</label>
            <select className="select" value={material} onChange={(e) => setMaterial(e.target.value)}>
              <option value="">No preference</option>
              <option>PLA</option>
              <option>PETG</option>
              <option>ABS</option>
              <option>TPU (Flexible)</option>
              <option>Resin</option>
            </select>
          </div>

          <div className="form-group">
            <label className="label">Budget range (₹)</label>
            <div className="flex gap-3">
              <input className="input" type="number" placeholder="Min" value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} />
              <input className="input" type="number" placeholder="Max" value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label className="label label-required">Description & style references</label>
            <textarea
              className="textarea"
              placeholder="Describe what you need in detail — the more context, the better the bids"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="label">Reference images (optional)</label>
            <input type="file" accept="image/*" multiple className="input" />
          </div>
        </div>

        <button
          className="btn btn-primary btn-block btn-lg"
          disabled={submitting || !purpose || !description}
          onClick={handleSubmit}
        >
          {submitting ? 'Posting request…' : 'Post request'}
        </button>
      </section>

      <Footer />
    </main>
  )
}