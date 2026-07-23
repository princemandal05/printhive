'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const MATERIALS = ['PLA', 'PETG', 'ABS', 'TPU (Flexible)', 'Resin']
const COLORS = ['White', 'Black', 'Red', 'Blue', 'Green', 'Grey', 'Custom (specify in notes)']
const SURFACE_FINISHES = ['Standard', 'Smoothed (vapor/sanded)', 'Painted']
const INFILL_PRESETS = [10, 20, 35, 50, 75, 100]

// Mock nearby printer owners — replace with a Supabase + Leaflet query
// filtered by GPS distance from the buyer's address, and material/machine match.
const NEARBY_PRINTERS = [
  { id: 'p1', name: 'Rohan\u2019s PrintLab', distance: '1.2 km', rating: 4.9, basePrice: 350 },
  { id: 'p2', name: 'Andheri 3D Studio', distance: '2.8 km', rating: 4.7, basePrice: 320 },
  { id: 'p3', name: 'Bandra MakerSpace', distance: '4.1 km', rating: 4.8, basePrice: 380 },
]

export default function PrintOnDemandUploadPage() {
  const router = useRouter()

  const [fileName, setFileName] = useState('')
  const [material, setMaterial] = useState(MATERIALS[0])
  const [color, setColor] = useState(COLORS[0])
  const [scale, setScale] = useState(100)
  const [infill, setInfill] = useState(20)
  const [layerHeight, setLayerHeight] = useState('0.20')
  const [surfaceFinish, setSurfaceFinish] = useState(SURFACE_FINISHES[0])
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState('')
  const [address, setAddress] = useState('')
  const [selectedPrinter, setSelectedPrinter] = useState(NEARBY_PRINTERS[0].id)
  const [placing, setPlacing] = useState(false)

  const printer = NEARBY_PRINTERS.find((p) => p.id === selectedPrinter)!

  // Rough live price estimate — replace with the Gemini smart-price-estimation
  // endpoint once the file is actually uploaded and analysed server-side.
  const infillMultiplier = 1 + (infill - 20) / 100
  const scaleMultiplier = Math.pow(scale / 100, 2)
  const finishSurcharge = surfaceFinish === 'Standard' ? 0 : surfaceFinish === 'Smoothed (vapor/sanded)' ? 80 : 180
  const unitPrice = Math.max(50, Math.round(printer.basePrice * infillMultiplier * scaleMultiplier) + finishSurcharge)
  const subtotal = unitPrice * quantity
  const platformFee = Math.round(subtotal * 0.05)
  const total = subtotal + platformFee

  const canSubmit = !!fileName && !!address && quantity > 0

  const handlePlaceOrder = async () => {
    // Replace with:
    // 1. Upload the STL/3MF/OBJ file to Cloudinary
    // 2. Insert a row into `orders` (design_id null, custom_file_url set,
    //    material, color, scale, infill, layer_height, surface_finish,
    //    printer_id, quantity, subtotal, platform_fee, total)
    // 3. Open Razorpay test-mode checkout, holding `total` in escrow
    setPlacing(true)
    await new Promise((res) => setTimeout(res, 900))
    router.push('/orders/demo-order-id')
  }

  return (
    <main>
      <Navbar />

      <section className="container section-sm">
        <div className="section-eyebrow">Print-on-demand</div>
        <h1 className="section-heading" style={{ marginBottom: 'var(--space-2)' }}>
          Upload your own file to print
        </h1>
        <p className="section-subheading" style={{ marginBottom: 'var(--space-8)' }}>
          Already have an STL, 3MF, or OBJ file? Upload it, choose your print
          settings, and we&apos;ll match you with a nearby printer owner.
        </p>

        <div className="grid grid-cols-2 gap-8" style={{ gridTemplateColumns: '1.2fr 0.8fr' }}>
          <div>
            {/* File upload */}
            <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
              <div className="card-header"><div className="card-title">Your file</div></div>
              <label
                htmlFor="model-file"
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
                  {fileName || 'Click to upload STL, 3MF, or OBJ'}
                </span>
                <span className="help-text">Up to 200MB</span>
                <input
                  id="model-file"
                  type="file"
                  accept=".stl,.3mf,.obj"
                  style={{ display: 'none' }}
                  onChange={(e) => setFileName(e.target.files?.[0]?.name || '')}
                />
              </label>
            </div>

            {/* Print settings */}
            <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
              <div className="card-header"><div className="card-title">Print settings</div></div>

              <div className="flex gap-4">
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="label">Material</label>
                  <select className="select" value={material} onChange={(e) => setMaterial(e.target.value)}>
                    {MATERIALS.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="label">Colour</label>
                  <select className="select" value={color} onChange={(e) => setColor(e.target.value)}>
                    {COLORS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="label">Scale ({scale}% of original size)</label>
                <input
                  type="range" min={25} max={200} step={5}
                  value={scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                  style={{ width: '100%' }}
                />
                <div className="flex justify-between text-xs text-muted">
                  <span>25%</span><span>100% (original)</span><span>200%</span>
                </div>
              </div>

              <div className="form-group">
                <label className="label">Infill density ({infill}%)</label>
                <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                  {INFILL_PRESETS.map((val) => (
                    <button
                      type="button"
                      key={val}
                      onClick={() => setInfill(val)}
                      className={`badge ${infill === val ? 'badge-primary' : 'badge-neutral'}`}
                      style={{ cursor: 'pointer', border: 'none', padding: '8px 16px' }}
                    >
                      {val}%
                    </button>
                  ))}
                </div>
                <span className="help-text">Higher infill = stronger part, more material, higher price</span>
              </div>

              <div className="flex gap-4">
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="label">Layer height (mm)</label>
                  <select className="select" value={layerHeight} onChange={(e) => setLayerHeight(e.target.value)}>
                    <option value="0.12">0.12 mm — fine detail, slower</option>
                    <option value="0.20">0.20 mm — standard</option>
                    <option value="0.28">0.28 mm — fast, draft quality</option>
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="label">Surface finish</label>
                  <select className="select" value={surfaceFinish} onChange={(e) => setSurfaceFinish(e.target.value)}>
                    {SURFACE_FINISHES.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ maxWidth: 160 }}>
                <label className="label">Quantity</label>
                <input
                  type="number" min={1} max={50} className="input"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                />
              </div>

              <div className="form-group">
                <label className="label">Notes for the printer (optional)</label>
                <textarea
                  className="textarea"
                  placeholder="Any special instructions — support structures, orientation, tolerances, etc."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            {/* Delivery address */}
            <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
              <div className="card-header"><div className="card-title">Delivery address</div></div>
              <div className="form-group">
                <label className="label">Address</label>
                <textarea
                  className="textarea"
                  placeholder="Flat / House no., street, area, city, PIN code"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
                <span className="help-text">Used to find printer owners near you on the map</span>
              </div>
            </div>

            {/* Nearby printers */}
            <div className="card">
              <div className="card-header"><div className="card-title">Nearby printer owners</div></div>
              {/* Replace this list with a Leaflet.js + OpenStreetMap view
                  plotting each printer owner's GPS location, filtered to
                  those supporting the selected material */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {NEARBY_PRINTERS.map((p) => (
                  <label
                    key={p.id}
                    className="flex items-center justify-between"
                    style={{
                      border: `1px solid ${selectedPrinter === p.id ? 'var(--color-primary)' : 'var(--color-border-light)'}`,
                      borderRadius: 'var(--radius-md)',
                      padding: 'var(--space-4)',
                      cursor: 'pointer',
                      background: selectedPrinter === p.id ? 'var(--color-primary-tint)' : 'transparent',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio" className="radio" name="printer"
                        checked={selectedPrinter === p.id}
                        onChange={() => setSelectedPrinter(p.id)}
                      />
                      <div>
                        <div className="text-sm" style={{ fontWeight: 600 }}>{p.name}</div>
                        <div className="text-xs text-muted">{p.distance} away · ★ {p.rating}</div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Order summary */}
          <div>
            <div className="card" style={{ position: 'sticky', top: 'calc(var(--navbar-height) + 24px)' }}>
              <div className="card-header"><div className="card-title">Estimated price</div></div>
              <div className="flex justify-between text-sm" style={{ marginBottom: 'var(--space-2)' }}>
                <span className="text-muted">Per unit (est.)</span>
                <span>₹{unitPrice}</span>
              </div>
              <div className="flex justify-between text-sm" style={{ marginBottom: 'var(--space-2)' }}>
                <span className="text-muted">Quantity</span>
                <span>× {quantity}</span>
              </div>
              <div className="flex justify-between text-sm" style={{ marginBottom: 'var(--space-4)' }}>
                <span className="text-muted">Platform fee</span>
                <span>₹{platformFee}</span>
              </div>
              <div className="divider" />
              <div className="flex justify-between" style={{ marginBottom: 'var(--space-6)', fontWeight: 700, fontSize: 'var(--text-lg)' }}>
                <span>Total (est.)</span>
                <span>₹{total}</span>
              </div>
              <button
                className="btn btn-primary btn-block btn-lg"
                disabled={placing || !canSubmit}
                onClick={handlePlaceOrder}
              >
                {placing ? 'Placing order…' : `Pay ₹${total} securely`}
              </button>
              <p className="help-text" style={{ textAlign: 'center', marginTop: 'var(--space-3)' }}>
                Final price confirmed once the printer owner reviews your file
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}