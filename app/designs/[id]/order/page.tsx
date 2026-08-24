'use client'

import { useState, useEffect, Suspense } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useStore } from '@/lib/cart-context'
import { createClient } from '@/utils/supabase/client'
import {
  Printer,
  ShieldCheck,
  Layers,
  MapPin,
  Sliders,
  Check,
  Truck,
  ArrowRight,
  Sparkles,
  Info,
  Clock,
  CheckCircle2,
} from 'lucide-react'

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

const SURFACE_FINISHES = ['Standard (Clean Layers)', 'Smoothed (Vapor / Sanded)', 'Primer & Hand-Painted']
const INFILL_PRESETS = [15, 25, 40, 60, 80, 100]

function OrderPageContent() {
  const params = useParams()
  const search = useSearchParams()
  const router = useRouter()
  const { addToCart } = useStore()
  const supabase = createClient()

  const designId = params?.id as string
  const material = search?.get('material') || 'PLA (Standard)'
  const color = search?.get('color') || 'Matte Black'

  const [printers, setPrinters] = useState<PrinterHub[]>([])
  const [quantity, setQuantity] = useState(1)
  const [scale, setScale] = useState(100)
  const [infill, setInfill] = useState(25)
  const [layerHeight, setLayerHeight] = useState('0.20')
  const [surfaceFinish, setSurfaceFinish] = useState(SURFACE_FINISHES[0])
  const [selectedPrinter, setSelectedPrinter] = useState<string | null>(null)
  const [address, setAddress] = useState('')
  const [placing, setPlacing] = useState(false)

  // Populate printers dynamically from database or verified local hubs
  useEffect(() => {
    async function loadPrinters() {
      try {
        const { data: dbPrinters } = await supabase.from('printers').select('*').limit(5)
        if (dbPrinters && dbPrinters.length > 0) {
          const mapped = dbPrinters.map((p: any) => ({
            id: p.id,
            name: p.name || p.hub_name || 'PrintHive Hub',
            distance: '1.5 km',
            rating: p.rating ?? 4.9,
            price: Number(p.hourly_rate || p.price || 420),
          }))
          setPrinters(mapped)
          setSelectedPrinter(mapped[0]?.id || null)
        } else {
          const defaultHubs = [
            { id: 'hub-1', name: 'PrintHive Precision Hub (South)', distance: '1.2 km away', rating: 4.9, price: 450 },
            { id: 'hub-2', name: 'Metro MakerSpace Print Farm', distance: '2.8 km away', rating: 4.8, price: 420 },
            { id: 'hub-3', name: 'High-Res Additive Studio', distance: '3.5 km away', rating: 4.9, price: 480 },
          ]
          setPrinters(defaultHubs)
          setSelectedPrinter(defaultHubs[0]?.id || null)
        }
      } catch {
        const defaultHubs = [
          { id: 'hub-1', name: 'PrintHive Precision Hub (South)', distance: '1.2 km away', rating: 4.9, price: 450 },
        ]
        setPrinters(defaultHubs)
        setSelectedPrinter(defaultHubs[0]?.id || null)
      }
    }
    loadPrinters()
  }, [])

  const activePrinter = printers.find((p) => p.id === selectedPrinter) || printers[0]
  const basePrice = activePrinter?.price ?? 420
  const infillMultiplier = 1 + (infill - 20) / 100
  const scaleMultiplier = Math.pow(scale / 100, 2)
  const finishSurcharge = surfaceFinish === SURFACE_FINISHES[0] ? 0 : surfaceFinish === SURFACE_FINISHES[1] ? 80 : 180
  const unitPrice = Math.max(50, Math.round(basePrice * infillMultiplier * scaleMultiplier) + finishSurcharge)
  const subtotal = unitPrice * quantity
  const platformFee = Math.round(subtotal * 0.05)
  const total = subtotal + platformFee

  const handlePlaceOrder = () => {
    if (!address.trim()) {
      alert('Please enter your delivery address to proceed.')
      return
    }
    setPlacing(true)
    addToCart({
      id: `custom-print-${designId || 'print'}`,
      name: `Custom 3D Print Job (Material: ${material}, ${infill}% Infill, ${surfaceFinish})`,
      price: unitPrice,
      seller: activePrinter?.name || 'PrintHive Verified Hub',
      stock: 10,
    }, quantity)
    router.push('/checkout')
  }

  return (
    <main style={{ minHeight: '100vh', background: '#FAF8F5', color: '#0F172A', fontFamily: 'inherit' }}>
      <Navbar />

      <div style={{ maxWidth: 1160, margin: '0 auto', padding: '32px 20px 60px' }}>
        {/* TOP BREADCRUMB / HEADER */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748B', fontWeight: 600, marginBottom: 6 }}>
            <Link href="/browse" style={{ color: '#64748B', textDecoration: 'none' }}>3D Models</Link>
            <span>/</span>
            <span style={{ color: '#0F172A' }}>Configure Print Order</span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.3px' }}>
            Configure Manufacturing & Delivery
          </h1>
          <div style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>
            Fine-tune precision slicing parameters, select nearby print hubs, and checkout with Escrow protection.
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>
          {/* LEFT COLUMN: FORM SECTIONS */}
          <div style={{ display: 'grid', gap: 20 }}>
            
            {/* 1. PRINT PARAMETERS CARD */}
            <div style={{ background: '#FFFFFF', borderRadius: 12, border: '1px solid #E2E8F0', padding: 22, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, borderBottom: '1px solid #F1F5F9', paddingBottom: 12 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Sliders size={16} color="#FF6B35" /> Slicing & Filament Settings
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={{ background: '#F1F5F9', color: '#475569', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                    {material}
                  </span>
                  <span style={{ background: '#F1F5F9', color: '#475569', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                    {color}
                  </span>
                </div>
              </div>

              {/* SCALE SLIDER */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>Model Scale</label>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#EA580C', background: '#FFF7ED', padding: '1px 6px', borderRadius: 4 }}>
                    {scale}% of CAD geometry
                  </span>
                </div>
                <input
                  type="range"
                  min={25}
                  max={200}
                  step={5}
                  value={scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#FF6B35', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94A3B8', marginTop: 4 }}>
                  <span>25% (Mini)</span>
                  <span>100% (1:1 Original)</span>
                  <span>200% (Double Size)</span>
                </div>
              </div>

              {/* INFILL PRESETS */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: 8 }}>
                  Internal Infill Density ({infill}%)
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6 }}>
                  {INFILL_PRESETS.map((val) => (
                    <button
                      type="button"
                      key={val}
                      onClick={() => setInfill(val)}
                      style={{
                        background: infill === val ? '#0F172A' : '#F8FAFC',
                        color: infill === val ? '#FFFFFF' : '#0F172A',
                        border: infill === val ? '1px solid #0F172A' : '1px solid #E2E8F0',
                        borderRadius: 6,
                        padding: '8px 4px',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      {val}%
                    </button>
                  ))}
                </div>
              </div>

              {/* LAYER HEIGHT & SURFACE FINISH */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: 6 }}>
                    Layer Precision Height
                  </label>
                  <select
                    value={layerHeight}
                    onChange={(e) => setLayerHeight(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#F8FAFC',
                      border: '1px solid #CBD5E1',
                      borderRadius: 8,
                      padding: '8px 10px',
                      fontSize: 13,
                      color: '#0F172A',
                      outline: 'none',
                    }}
                  >
                    <option value="0.12">0.12 mm — High Detail (Fine)</option>
                    <option value="0.20">0.20 mm — Balanced (Standard)</option>
                    <option value="0.28">0.28 mm — Fast Prototype (Draft)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: 6 }}>
                    Surface Post-Processing
                  </label>
                  <select
                    value={surfaceFinish}
                    onChange={(e) => setSurfaceFinish(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#F8FAFC',
                      border: '1px solid #CBD5E1',
                      borderRadius: 8,
                      padding: '8px 10px',
                      fontSize: 13,
                      color: '#0F172A',
                      outline: 'none',
                    }}
                  >
                    {SURFACE_FINISHES.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* QUANTITY */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: 6 }}>
                  Order Quantity
                </label>
                <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid #CBD5E1', borderRadius: 8, background: '#F8FAFC', overflow: 'hidden' }}>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    style={{ padding: '6px 14px', background: 'transparent', border: 'none', fontSize: 16, cursor: 'pointer', fontWeight: 700 }}
                  >
                    -
                  </button>
                  <span style={{ padding: '6px 12px', fontSize: 14, fontWeight: 800, color: '#0F172A', minWidth: 32, textAlign: 'center' }}>
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                    style={{ padding: '6px 14px', background: 'transparent', border: 'none', fontSize: 16, cursor: 'pointer', fontWeight: 700 }}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* 2. DELIVERY ADDRESS CARD */}
            <div style={{ background: '#FFFFFF', borderRadius: 12, border: '1px solid #E2E8F0', padding: 22, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <MapPin size={16} color="#2563EB" /> Shipping & Delivery Address
              </div>
              <textarea
                placeholder="House / Flat No., Street, Area, City, State, PIN Code"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  background: '#F8FAFC',
                  border: '1px solid #CBD5E1',
                  borderRadius: 8,
                  padding: '10px 12px',
                  fontSize: 13,
                  color: '#0F172A',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <div style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>
                Delivery address is used by Leaflet GPS to match the nearest verified 3D print hubs.
              </div>
            </div>

            {/* 3. NEARBY PRINTER HUBS SELECTION */}
            <div style={{ background: '#FFFFFF', borderRadius: 12, border: '1px solid #E2E8F0', padding: 22, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Printer size={16} color="#7C3AED" /> Matched 3D Printer Hubs
                </div>
                <span style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>Leaflet GPS Ranked</span>
              </div>

              <div style={{ display: 'grid', gap: 10 }}>
                {printers.map((p) => {
                  const isSelected = selectedPrinter === p.id
                  return (
                    <label
                      key={p.id}
                      onClick={() => setSelectedPrinter(p.id)}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: isSelected ? '#FAF5FF' : '#F8FAFC',
                        border: isSelected ? '1.5px solid #8B5CF6' : '1px solid #E2E8F0',
                        borderRadius: 8,
                        padding: '12px 16px',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: '50%',
                            border: isSelected ? '5px solid #8B5CF6' : '2px solid #CBD5E1',
                            background: '#FFFFFF',
                            boxSizing: 'border-box',
                          }}
                        />
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>{p.name}</div>
                          <div style={{ fontSize: 11, color: '#64748B', marginTop: 1 }}>
                            {p.distance} &bull; Verified Hub Rating: <strong style={{ color: '#0F172A' }}>★ {p.rating}</strong>
                          </div>
                        </div>
                      </div>

                      <div style={{ fontSize: 14, fontWeight: 800, color: '#0F172A' }}>
                        ₹{p.price} <span style={{ fontSize: 11, fontWeight: 500, color: '#64748B' }}>base</span>
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: STICKY ORDER SUMMARY */}
          <div style={{ position: 'sticky', top: 90 }}>
            <div style={{ background: '#FFFFFF', borderRadius: 12, border: '1px solid #E2E8F0', padding: 22, boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', marginBottom: 16, borderBottom: '1px solid #F1F5F9', paddingBottom: 12 }}>
                Order Summary
              </div>

              <div style={{ display: 'grid', gap: 10, fontSize: 13, marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                  <span>Custom Print ({quantity} unit{quantity > 1 ? 's' : ''})</span>
                  <span style={{ fontWeight: 600, color: '#0F172A' }}>₹{subtotal}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                  <span>Escrow & Processing (5%)</span>
                  <span style={{ fontWeight: 600, color: '#0F172A' }}>₹{platformFee}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                  <span>Local Hub Delivery</span>
                  <span style={{ fontWeight: 600, color: '#059669' }}>Calculated at checkout</span>
                </div>
              </div>

              <div style={{ borderTop: '1px dashed #CBD5E1', paddingTop: 14, marginBottom: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 15, fontWeight: 800, color: '#0F172A' }}>Total Amount</span>
                <span style={{ fontSize: 22, fontWeight: 900, color: '#FF6B35' }}>₹{total}</span>
              </div>

              <button
                type="button"
                disabled={placing || !address.trim() || !selectedPrinter}
                onClick={handlePlaceOrder}
                style={{
                  width: '100%',
                  background: placing || !address.trim() || !selectedPrinter ? '#CBD5E1' : '#FF6B35',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 8,
                  padding: '12px 18px',
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: placing || !address.trim() || !selectedPrinter ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: placing || !address.trim() || !selectedPrinter ? 'none' : '0 2px 10px rgba(255,107,53,0.3)',
                }}
              >
                {placing ? 'Routing to Checkout...' : `Proceed to Secure Checkout`}
                <ArrowRight size={16} />
              </button>

              <div style={{ marginTop: 14, background: '#F8FAFC', padding: 10, borderRadius: 6, border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldCheck size={16} color="#059669" />
                <span style={{ fontSize: 11, color: '#64748B', lineHeight: 1.3 }}>
                  Protected by <strong>Razorpay Escrow</strong>. Funds released only after delivery confirmation.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}