'use client'

import { useState, Suspense } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

interface PrinterHub {
  id: string
  name: string
  distance?: string
  rating?: number
  price: number
}

export default function OrderPage() {
  return (
    <Suspense fallback={null}>
      <OrderPageContent />
    </Suspense>
  )
}

const SURFACE_FINISHES = ['Standard', 'Smoothed (vapor/sanded)', 'Painted']
const INFILL_PRESETS = [10, 20, 35, 50, 75, 100]

function OrderPageContent() {
  const params = useParams()
  const search = useSearchParams()
  const router = useRouter()

  const designId = params?.id as string
  const material = search?.get('material') || 'PLA'
  const color = search?.get('color') || 'Default'

  const [printers, setPrinters] = useState<PrinterHub[]>([])
  const [quantity, setQuantity] = useState(1)
  const [scale, setScale] = useState(100)
  const [infill, setInfill] = useState(20)
  const [layerHeight, setLayerHeight] = useState('0.20')
  const [surfaceFinish, setSurfaceFinish] = useState(SURFACE_FINISHES[0])
  const [selectedPrinter, setSelectedPrinter] = useState<string | null>(null)
  const [address, setAddress] = useState('')
  const [placing, setPlacing] = useState(false)

  // Populate printers dynamically when delivery address becomes available
  useEffect(() => {
    if (address.trim()) {
      setPrinters([
        { id: 'p1', name: 'Rohan’s PrintLab', distance: '1.2 km', rating: 4.9, price: 450 },
        { id: 'p2', name: 'Andheri 3D Studio', distance: '2.8 km', rating: 4.7, price: 420 },
        { id: 'p3', name: 'Bandra MakerSpace', distance: '4.1 km', rating: 4.8, price: 480 },
      ])
    } else {
      setPrinters([])
      setSelectedPrinter(null)
    }
  }, [address])

  const activePrinter = printers.find((p) => p.id === selectedPrinter)
  const basePrice = activePrinter?.price ?? 400
  const infillMultiplier = 1 + (infill - 20) / 100
  const scaleMultiplier = Math.pow(scale / 100, 2)
  const finishSurcharge = surfaceFinish === 'Standard' ? 0 : surfaceFinish === 'Smoothed (vapor/sanded)' ? 80 : 180
  const unitPrice = Math.max(50, Math.round(basePrice * infillMultiplier * scaleMultiplier) + finishSurcharge)
  const subtotal = unitPrice * quantity
  const platformFee = Math.round(subtotal * 0.05)
  const total = subtotal + platformFee

  const handlePlaceOrder = async () => {
    // Replace with: create row in `orders` table, then open Razorpay
    // test-mode checkout, holding `total` in escrow until delivery confirm.
    setPlacing(true)
    await new Promise((res) => setTimeout(res, 900))
    router.push('/orders/demo-order-id')
  }

  return (
    <main>
      <Navbar />

      <section className="container section-sm">
        <div className="section-eyebrow">Design #{designId}</div>
        <h1 className="section-heading" style={{ marginBottom: 'var(--space-8)' }}>
          Confirm your order
        </h1>

        <div className="grid grid-cols-2 gap-8" style={{ gridTemplateColumns: '1.2fr 0.8fr' }}>
          <div>
            <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
              <div className="card-header">
                <div className="card-title">Print details</div>
              </div>
              <div className="flex gap-6" style={{ marginBottom: 'var(--space-4)' }}>
                <span className="badge badge-neutral">Material: {material}</span>
                <span className="badge badge-neutral">Colour: {color}</span>
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
                  type="number"
                  min={1}
                  max={20}
                  className="input"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                />
              </div>
            </div>

            <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
              <div className="card-header">
                <div className="card-title">Delivery address</div>
              </div>
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

            <div className="card">
              <div className="card-header">
                <div className="card-title">Nearby printer owners</div>
              </div>
              {/* Replace this list with a Leaflet.js + OpenStreetMap view
                  plotting each printer owner's GPS location */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {printers.length === 0 ? (
                  <div style={{ padding: '24px 16px', textAlign: 'center', background: 'var(--bg-card-hover)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-color)' }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>🖨️</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)', marginBottom: 4 }}>
                      No Verified Printers Selected
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-sub)', maxWidth: 320, margin: '0 auto' }}>
                      Once you enter your delivery address, local printer hubs will be matched dynamically.
                    </div>
                  </div>
                ) : (
                  printers.map((p) => (
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
                          type="radio"
                          className="radio"
                          name="printer"
                          checked={selectedPrinter === p.id}
                          onChange={() => setSelectedPrinter(p.id)}
                        />
                        <div>
                          <div className="text-sm" style={{ fontWeight: 600 }}>{p.name}</div>
                          <div className="text-xs text-muted">
                            {p.distance || 'Nearby'} · {p.rating !== undefined ? `★ ${p.rating}` : 'Unrated'}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm" style={{ fontWeight: 600 }}>from ₹{p.price}</div>
                    </label>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Order summary */}
          <div>
            <div className="card" style={{ position: 'sticky', top: 'calc(var(--navbar-height) + 24px)' }}>
              <div className="card-header">
                <div className="card-title">Order summary</div>
              </div>
              <div className="flex justify-between text-sm" style={{ marginBottom: 'var(--space-2)' }}>
                <span className="text-muted">Print ({quantity}×)</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-sm" style={{ marginBottom: 'var(--space-4)' }}>
                <span className="text-muted">Platform fee</span>
                <span>₹{platformFee}</span>
              </div>
              <div className="divider" />
              <div className="flex justify-between" style={{ marginBottom: 'var(--space-6)', fontWeight: 700, fontSize: 'var(--text-lg)' }}>
                <span>Total</span>
                <span>₹{total}</span>
              </div>
              <button
                className="btn btn-primary btn-block btn-lg"
                disabled={placing || !address.trim() || !selectedPrinter}
                onClick={handlePlaceOrder}
              >
                {placing ? 'Placing order…' : `Pay ₹${total} securely`}
              </button>
              <p className="help-text" style={{ textAlign: 'center', marginTop: 'var(--space-3)' }}>
                Razorpay test mode · funds released only after you confirm delivery
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}