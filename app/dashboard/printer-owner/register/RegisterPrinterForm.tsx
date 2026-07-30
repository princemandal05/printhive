'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import OpenStreetMap, { MapLocation } from '@/components/OpenStreetMap'

const MATERIALS = ['PLA', 'PETG', 'ABS', 'TPU (Flexible)', 'Resin']

export default function RegisterPrinterForm() {
  const router = useRouter()
  const [model, setModel] = useState('')
  const [buildVolume, setBuildVolume] = useState('')
  const [materials, setMaterials] = useState<string[]>(['PLA'])
  const [address, setAddress] = useState('')
  const [lat, setLat] = useState(28.6315)
  const [lng, setLng] = useState(77.2167)
  const [submitting, setSubmitting] = useState(false)

  const toggleMaterial = (m: string) => {
    setMaterials((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]))
  }

  const handleLocationPicked = (pickedLat: number, pickedLng: number) => {
    setLat(Number(pickedLat.toFixed(5)))
    setLng(Number(pickedLng.toFixed(5)))
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    await new Promise((res) => setTimeout(res, 900))
    router.push('/dashboard/printer-owner')
  }

  const pickerLocations: MapLocation[] = [
    {
      id: 'pin-1',
      name: model || 'New Printer Hub Pin',
      location: address || 'Selected Coordinates',
      lat,
      lng,
    },
  ]

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
          List your machine on OpenStreetMap so nearby buyers can send you print jobs.
        </p>

        <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
          <div className="card-header"><div className="card-title">Machine details</div></div>

          <div className="form-group">
            <label className="label label-required">Printer model</label>
            <input className="input" placeholder="e.g. Bambu Lab X1-Carbon" value={model} onChange={(e) => setModel(e.target.value)} />
          </div>

          <div className="form-group">
            <label className="label">Build volume (mm)</label>
            <input className="input" placeholder="e.g. 256 x 256 x 256" value={buildVolume} onChange={(e) => setBuildVolume(e.target.value)} />
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
          <div className="card-header"><div className="card-title">Location & OpenStreetMap GPS Pin</div></div>
          <div className="form-group">
            <label className="label label-required">Address</label>
            <textarea
              className="textarea"
              placeholder="Flat / House no., street, area, city, PIN code"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <span className="help-text">Click on the OpenStreetMap below to set your hub pin coordinates:</span>
          </div>

          {/* Interactive OpenStreetMap Location Picker */}
          <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border-color)', marginBottom: 12 }}>
            <OpenStreetMap
              locations={pickerLocations}
              isPicker={true}
              onLocationPicked={handleLocationPicked}
              center={[lat, lng]}
              zoom={13}
              height="240px"
            />
          </div>

          <div style={{ fontSize: 12, color: 'var(--text-sub)', background: 'var(--bg-card-hover)', padding: '8px 12px', borderRadius: 8 }}>
            📍 GPS Pin Coordinates: <strong>{lat}, {lng}</strong>
          </div>
        </div>

        <button
          className="btn btn-primary btn-block btn-lg"
          disabled={submitting || !model || !address}
          onClick={handleSubmit}
        >
          {submitting ? 'Registering…' : 'Register printer on OpenStreetMap'}
        </button>
      </div>
    </div>
  )
}