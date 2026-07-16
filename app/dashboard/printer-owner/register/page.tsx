'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const MATERIALS = ['PLA', 'PETG', 'ABS', 'TPU (Flexible)', 'Resin']

export default function RegisterPrinterPage() {
  const router = useRouter()
  const [model, setModel] = useState('')
  const [buildVolume, setBuildVolume] = useState('')
  const [materials, setMaterials] = useState<string[]>(['PLA'])
  const [address, setAddress] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const toggleMaterial = (m: string) => {
    setMaterials((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]))
  }

  const handleSubmit = async () => {
    // Replace with:
    // 1. Geocode `address` to lat/lng (or capture GPS directly)
    // 2. Insert a row into the `printers` table via Supabase
    // 3. Plot the new marker on the Leaflet.js / OpenStreetMap layer
    setSubmitting(true)
    await new Promise((res) => setTimeout(res, 900))
    router.push('/dashboard/printer-owner')
  }

  const s: Record<string, React.CSSProperties> = {
    page: { minHeight: '100vh', background: '#F1F5F9' },
    nav: { background: '#0F172A', padding: '0 32px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    logo: { fontSize: 18, fontWeight: 700, color: '#fff' },
    logoAccent: { color: '#FF6B35' },
    body: { maxWidth: 640, margin: '0 auto', padding: '32px 24px' },
  }

  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <div style={s.logo}>Print<span style={s.logoAccent}>Hive</span></div>
        <a href="/dashboard/printer-owner" style={{ color: '#94A3B8', fontSize: 13 }}>← Back to dashboard</a>
      </nav>

      <div style={s.body}>
        <h1 className="section-heading" style={{ marginBottom: 'var(--space-2)' }}>Register your printer</h1>
        <p className="text-sm text-muted" style={{ marginBottom: 'var(--space-8)' }}>
          List your machine so nearby buyers can send you print jobs.
        </p>

        <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
          <div className="card-header"><div className="card-title">Machine details</div></div>

          <div className="form-group">
            <label className="label label-required">Printer model</label>
            <input className="input" placeholder="e.g. Creality Ender 3 V3" value={model} onChange={(e) => setModel(e.target.value)} />
          </div>

          <div className="form-group">
            <label className="label">Build volume (mm)</label>
            <input className="input" placeholder="e.g. 220 x 220 x 250" value={buildVolume} onChange={(e) => setBuildVolume(e.target.value)} />
          </div>

          <div className="form-group">
            <label className="label">Supported materials</label>
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
          <div className="card-header"><div className="card-title">Location</div></div>
          <div className="form-group">
            <label className="label label-required">Address</label>
            <textarea
              className="textarea"
              placeholder="Flat / House no., street, area, city, PIN code"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <span className="help-text">Shown as an approximate pin on the buyer&apos;s map — exact address stays private</span>
          </div>
          {/* Replace this block with an embedded Leaflet.js map for pin placement */}
          <div
            className="flex items-center justify-center"
            style={{
              height: 200,
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--color-slate-100), var(--color-border-light))',
              color: 'var(--color-slate-400)',
              fontSize: 'var(--text-sm)',
            }}
          >
            Map preview appears here once address is geocoded
          </div>
        </div>

        <button
          className="btn btn-primary btn-block btn-lg"
          disabled={submitting || !model || !address}
          onClick={handleSubmit}
        >
          {submitting ? 'Registering…' : 'Register printer'}
        </button>
      </div>
    </div>
  )
}
