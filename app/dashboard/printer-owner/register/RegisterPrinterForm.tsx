'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { createClient } from '@/utils/supabase/client'
import type { MapLocation } from '@/components/OpenStreetMap'
import CloudinaryUploader, { type CloudinaryMetadata } from '@/components/CloudinaryUploader'

const OpenStreetMap = dynamic(() => import('@/components/OpenStreetMap'), {
  ssr: false,
  loading: () => (
    <div style={{ height: 340, background: 'var(--bg-card)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-sub)', fontSize: 13, fontWeight: 700 }}>
      🗺️ Loading Leaflet OpenStreetMap Engine...
    </div>
  ),
})

const MATERIALS = ['PLA', 'PETG', 'ABS', 'TPU (Flexible)', 'Resin (8K)', 'Nylon', 'Carbon Fiber']
const TECHNOLOGIES = ['FDM Dual-Color Precision', 'SLA Resin High-Detail', 'SLS Industrial Nylon', 'DLP Precision']

export default function RegisterPrinterForm() {
  const router = useRouter()
  const supabase = createClient()

  const [printerName, setPrinterName] = useState('')
  const [model, setModel] = useState('')
  const [technology, setTechnology] = useState(TECHNOLOGIES[0])
  const [buildVolume, setBuildVolume] = useState('256 x 256 x 256 mm')
  const [maxResolution, setMaxResolution] = useState('0.05 mm (50 microns)')
  const [basePrice, setBasePrice] = useState('350')
  const [workingHours, setWorkingHours] = useState('09:00 AM - 09:00 PM (Mon-Sat)')
  const [initialStatus, setInitialStatus] = useState<'online' | 'offline' | 'busy'>('online')
  const [materials, setMaterials] = useState<string[]>(['PLA', 'PETG'])
  const [address, setAddress] = useState('')
  const [lat, setLat] = useState(28.6315)
  const [lng, setLng] = useState(77.2167)
  const [printerImageUrl, setPrinterImageUrl] = useState('')
  const [cloudinaryPublicId, setCloudinaryPublicId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [statusMsg, setStatusMsg] = useState('')

  const toggleMaterial = (m: string) => {
    setMaterials((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]))
  }

  const handleLocationPicked = (pickedLat: number, pickedLng: number) => {
    setLat(Number(pickedLat.toFixed(5)))
    setLng(Number(pickedLng.toFixed(5)))
  }

  const handlePrinterPhotoSuccess = (meta: CloudinaryMetadata) => {
    setPrinterImageUrl(meta.secure_url)
    setCloudinaryPublicId(meta.cloudinary_public_id)
    setStatusMsg('✅ Printer hub machine photo uploaded to Cloudinary!')
  }

  const handleSubmit = async () => {
    if (!model && !printerName) return
    setSubmitting(true)
    setStatusMsg('⚡ Registering 3D Printer Machine on Leaflet OpenStreetMap Hub...')

    try {
      const { data: { user }, error: authErr } = await supabase.auth.getUser()
      if (authErr || !user) {
        setStatusMsg('❌ Authentication required: Please log in to register your printer machine.')
        setSubmitting(false)
        router.push('/login?next=/dashboard/printer-owner/register')
        return
      }

      const displayName = printerName.trim() || model.trim() || '3D Printer Unit'

      const { error: insertErr } = await supabase.from('printers').insert({
        owner_id: user.id,
        printer_model: model || displayName,
        technology,
        build_volume: buildVolume,
        max_resolution: maxResolution,
        base_price: Number(basePrice) || 350,
        working_hours: workingHours,
        materials,
        latitude: lat,
        longitude: lng,
        address: address || 'New Delhi Print Hub',
        image_url: printerImageUrl,
        cloudinary_public_id: cloudinaryPublicId,
        status: initialStatus,
        is_active: initialStatus === 'online',
        created_at: new Date().toISOString(),
      })

      if (insertErr) {
        console.error('Failed to register printer in database:', insertErr.message)
        setStatusMsg(`❌ Registration failed: ${insertErr.message}`)
        setSubmitting(false)
        return
      }
    } catch (err: unknown) {
      const error = err as Error
      console.error('Printer insert exception:', error)
      setStatusMsg(`❌ Registration exception: ${error.message}`)
      setSubmitting(false)
      return
    }

    setSubmitting(false)
    router.push('/dashboard/printer-owner')
    router.refresh()
  }

  const pickerLocations: MapLocation[] = [
    {
      id: 'pin-1',
      name: printerName || model || 'New Printer Hub Pin',
      location: address || 'Selected GPS Coordinates',
      lat,
      lng,
    },
  ]

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
      {/* COMMAND HUB NAVIGATION */}
      <nav style={s.nav}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={s.logo}>
            <Link href="/" style={{ textDecoration: 'none', color: '#fff' }}>
              Print<span style={s.logoAccent}>Hive</span>
            </Link>{' '}
            <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600 }}>Printer Hub Command</span>
          </div>
        </div>
        <a href="/dashboard/printer-owner" style={{ color: '#94A3B8', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>← Back to Command Hub</a>
      </nav>

      <div style={s.body}>
        {/* PAGE HEADER */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(37,99,235,0.12)', color: '#2563EB', border: '1px solid rgba(37,99,235,0.3)', padding: '6px 16px', borderRadius: 99, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
            🖨️ Machine Registration & Leaflet GPS Placement
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.5px' }}>
            Register 3D Printer Hub
          </h1>
          <p style={{ color: '#64748B', marginTop: 4, fontSize: 15 }}>
            Monetize idle machine hours and start receiving local 3D print orders with 70% direct payouts.
          </p>
        </div>

        {statusMsg && (
          <div style={{ background: '#ECFDF5', color: '#065F46', padding: '14px 20px', borderRadius: 14, fontSize: 14, marginBottom: 24, fontWeight: 700, border: '1px solid #A7F3D0' }}>
            {statusMsg}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, alignItems: 'start' }}>
          {/* LEFT FORM */}
          <div>
            <div style={s.card}>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#0F172A', marginBottom: 16 }}>
                1. Machine Specifications & Pricing
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={s.label}>Printer Hub / Display Name *</label>
                <input
                  style={inputStyle}
                  placeholder="e.g. Rohan’s Precision PrintLab"
                  value={printerName}
                  onChange={(e) => setPrinterName(e.target.value)}
                />
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={s.label}>Printer Model *</label>
                <input
                  style={inputStyle}
                  placeholder="e.g. Bambu Lab X1-Carbon Combo / Creality K1"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                />
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={s.label}>Printing Technology</label>
                <select style={inputStyle} value={technology} onChange={(e) => setTechnology(e.target.value)}>
                  {TECHNOLOGIES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
                <div>
                  <label style={s.label}>Build Volume (mm)</label>
                  <input
                    style={inputStyle}
                    placeholder="256 x 256 x 256"
                    value={buildVolume}
                    onChange={(e) => setBuildVolume(e.target.value)}
                  />
                </div>
                <div>
                  <label style={s.label}>Max Resolution</label>
                  <input
                    style={inputStyle}
                    placeholder="0.05 mm"
                    value={maxResolution}
                    onChange={(e) => setMaxResolution(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
                <div>
                  <label style={s.label}>Base Price per Job (₹)</label>
                  <input
                    type="number"
                    style={inputStyle}
                    placeholder="350"
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                  />
                </div>
                <div>
                  <label style={s.label}>Initial Hub Availability</label>
                  <select style={inputStyle} value={initialStatus} onChange={(e) => setInitialStatus(e.target.value as typeof initialStatus)}>
                    <option value="online">🟢 Online & Ready</option>
                    <option value="busy">🟡 Busy / Printing</option>
                    <option value="offline">🔴 Offline / Maintenance</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={s.label}>Working Operating Hours</label>
                <input
                  style={inputStyle}
                  placeholder="e.g. 09:00 AM - 09:00 PM (Mon-Sat)"
                  value={workingHours}
                  onChange={(e) => setWorkingHours(e.target.value)}
                />
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={s.label}>Supported Materials</label>
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
                          border: active ? '1px solid #2563EB' : '1px solid #CBD5E1',
                          background: active ? '#EFF6FF' : '#F8FAFC',
                          color: active ? '#2563EB' : '#334155',
                          cursor: 'pointer',
                        }}
                      >
                        {m}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div style={{ marginTop: 18 }}>
                <CloudinaryUploader
                  acceptType="image"
                  label="Machine Hub Photo (.jpg, .png, .webp)"
                  onUploadSuccess={handlePrinterPhotoSuccess}
                  currentUrl={printerImageUrl}
                />
              </div>
            </div>

            <div style={s.card}>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#0F172A', marginBottom: 16 }}>
                2. Hub Physical Location & Dispatch Radius
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={s.label}>Street Address / Neighborhood</label>
                <textarea
                  style={{ ...inputStyle, minHeight: 80 }}
                  placeholder="Enter full address for courier pickups and local job matching..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting || (!model && !printerName)}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                color: '#fff',
                border: 'none',
                padding: '16px 32px',
                borderRadius: 16,
                fontSize: 16,
                fontWeight: 900,
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(37,99,235,0.35)',
              }}
            >
              {submitting ? 'Registering Machine Hub…' : '🚀 Register Machine on Leaflet Map'}
            </button>
          </div>

          {/* RIGHT SIDE: LEAFLET OPENSTREETMAP PIN PICKER */}
          <div style={{ position: 'sticky', top: 24 }}>
            <div style={s.card}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#2563EB', textTransform: 'uppercase', marginBottom: 8 }}>
                📍 Interactive OpenStreetMap GPS Pin
              </div>
              <div style={{ fontSize: 12, color: '#64748B', marginBottom: 16 }}>
                Click anywhere on the map or drag the pin to set your exact printer hub dispatch coordinates.
              </div>

              <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid #CBD5E1', marginBottom: 16 }}>
                <OpenStreetMap
                  locations={pickerLocations}
                  height="300px"
                  onLocationPicked={handleLocationPicked}
                  isPicker
                />
              </div>

              <div style={{ background: '#F8FAFC', padding: 14, borderRadius: 12, border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700 }}>
                <span>Lat: {lat}</span>
                <span>Lng: {lng}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}