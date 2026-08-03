'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import OpenStreetMap, { MapLocation } from '@/components/OpenStreetMap'

type PrinterOwner = MapLocation & {
  completedOrders: number
  maxVolume: string
  status: 'available' | 'busy'
  city: string
}

const INDIAN_PRINTER_HUBS: PrinterOwner[] = []

export default function PrinterDirectoryPage() {
  const [filterCity, setFilterCity] = useState('All')
  const [filterMaterial, setFilterMaterial] = useState('All')
  const [selectedHub, setSelectedHub] = useState<PrinterOwner | null>(null)
  const [visibleCount, setVisibleCount] = useState(6)

  const filteredPrinters = INDIAN_PRINTER_HUBS.filter((p) => {
    const matchesCity = filterCity === 'All' || p.city === filterCity
    const matchesMaterial = filterMaterial === 'All' || p.materials?.includes(filterMaterial)
    return matchesCity && matchesMaterial
  })

  const displayedPrinters = filteredPrinters.slice(0, visibleCount)

  return (
    <main style={{ minHeight: '100vh', transition: 'background 0.3s ease' }}>
      <Navbar />

      <section className="container section-sm" style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px' }}>
        <div className="ateion-pill" style={{ marginBottom: 12 }}>
          🇮🇳 India OpenStreetMap Only
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 900, marginBottom: 8, color: 'var(--text-main)' }}>
          Verified 3D Printer Hubs Across India
        </h1>
        <p style={{ color: 'var(--text-sub)', fontSize: 16, marginBottom: 32, maxWidth: 720 }}>
          OpenStreetMap GPS matching strictly centered over India. As more printer hubs join PrintHive across Indian cities, the directory dynamically extends down the page with live sticky navigation.
        </p>

        {/* INDIA OPENSTREETMAP MAP WIDGET */}
        <div style={{ marginBottom: 36, border: '1px solid var(--border-color)', borderRadius: 24, overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          <OpenStreetMap
            locations={filteredPrinters}
            selectedId={selectedHub?.id}
            onSelectLocation={(loc) => setSelectedHub(loc as PrinterOwner)}
            center={[20.5937, 78.9629]}
            zoom={5}
            height="440px"
          />
        </div>

        {/* Filter Controls: City & Material */}
        <div style={{ background: 'var(--bg-card)', padding: 20, borderRadius: 20, border: '1px solid var(--border-color)', marginBottom: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#ea580c', textTransform: 'uppercase' }}>🇮🇳 Select City:</span>
            {['All', 'Delhi NCR', 'Bengaluru', 'Mumbai', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad'].map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => { setFilterCity(city); setVisibleCount(6) }}
                style={{
                  padding: '6px 14px',
                  borderRadius: 99,
                  border: filterCity === city ? '1px solid #ea580c' : '1px solid var(--border-color)',
                  background: filterCity === city ? '#ea580c' : 'var(--bg-card-hover)',
                  color: filterCity === city ? '#fff' : 'var(--text-main)',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {city}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', borderTop: '1px dashed var(--border-color)', paddingTop: 14 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-sub)', textTransform: 'uppercase' }}>🧵 Filter Material:</span>
            {['All', 'PLA', 'PETG', 'ABS', 'Resin (8K Detail)', 'TPU'].map((mat) => (
              <button
                key={mat}
                type="button"
                onClick={() => { setFilterMaterial(mat); setVisibleCount(6) }}
                style={{
                  padding: '5px 12px',
                  borderRadius: 8,
                  border: filterMaterial === mat ? '1px solid #10B981' : '1px solid var(--border-color)',
                  background: filterMaterial === mat ? 'rgba(16,185,129,0.15)' : 'var(--bg-card-hover)',
                  color: filterMaterial === mat ? '#10B981' : 'var(--text-sub)',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {mat}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Hub Card & Directory Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 32, alignItems: 'start' }}>
          {selectedHub ? (
            <div style={{ background: 'var(--bg-card)', padding: 28, borderRadius: 24, border: '2px solid #ea580c', boxShadow: '0 10px 30px rgba(234,88,12,0.1)', position: 'sticky', top: 90 }}>
              <div style={{ fontSize: 12, textTransform: 'uppercase', color: '#ea580c', fontWeight: 800, letterSpacing: 1, marginBottom: 8 }}>
                Active Map Selection:
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 900, color: 'var(--text-main)', marginBottom: 4 }}>
                {selectedHub.name}
              </h2>
              <div style={{ fontSize: 13, color: 'var(--text-sub)', marginBottom: 16 }}>
                📍 {selectedHub.location} ({selectedHub.distance})
              </div>

              <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                <div style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981', padding: '6px 12px', borderRadius: 10, fontSize: 13, fontWeight: 800 }}>
                  ★ {selectedHub.rating} Rating
                </div>
                <div style={{ background: 'var(--bg-card-hover)', color: 'var(--text-main)', padding: '6px 12px', borderRadius: 10, fontSize: 13, fontWeight: 700 }}>
                  📦 {selectedHub.completedOrders} Orders
                </div>
              </div>

              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', marginBottom: 8 }}>
                Available 3D Printers:
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
                {selectedHub.machines?.map((m: string) => (
                  <span key={m} style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', padding: '4px 10px', borderRadius: 8, fontSize: 12, color: 'var(--text-main)' }}>
                    {m}
                  </span>
                ))}
              </div>

              <Link
                href="/print-on-demand"
                style={{ display: 'block', textAlign: 'center', background: '#ea580c', color: '#fff', padding: '14px', borderRadius: 99, fontWeight: 800, textDecoration: 'none', boxShadow: '0 4px 16px rgba(234,88,12,0.35)' }}
              >
                Order 3D Print From This Hub →
              </Link>
            </div>
          ) : (
            <div style={{ background: 'var(--bg-card)', padding: 28, borderRadius: 24, border: '1px border-color', textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🗺️</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-sub)' }}>Click any printer pin on the map to inspect hub details.</div>
            </div>
          )}

          {/* Directory List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-main)' }}>
                Showing {displayedPrinters.length} of {filteredPrinters.length} Verified Printer Hubs
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-sub)' }}>
                Sorted by Proximity & Rating
              </span>
            </div>

            {filteredPrinters.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 24px', background: 'var(--bg-card)', borderRadius: 20, border: '2px dashed var(--border-color)' }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>🖨️</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--text-main)', marginBottom: 4 }}>No Registered 3D Printer Hubs Yet</div>
                <div style={{ fontSize: 13, color: 'var(--text-sub)', marginBottom: 16 }}>Be the first 3D printer owner to register your machine and accept nearby print jobs!</div>
                <Link href="/dashboard/printer-owner/register" style={{ background: '#ea580c', color: '#fff', padding: '10px 20px', borderRadius: 12, fontWeight: 800, textDecoration: 'none', display: 'inline-block' }}>
                  + Register 3D Printer Hub
                </Link>
              </div>
            ) : (
              displayedPrinters.map((printer) => {
                const isSelected = selectedHub && printer.id === selectedHub.id
                return (
                  <div
                    key={printer.id}
                    onClick={() => setSelectedHub(printer)}
                    style={{
                      background: 'var(--bg-card)',
                      padding: 24,
                      borderRadius: 20,
                      border: isSelected ? '2px solid #ea580c' : '1px solid var(--border-color)',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-main)', marginBottom: 4 }}>{printer.name}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-sub)' }}>📍 {printer.location} • {printer.distance}</div>
                    </div>
                  </div>
                )
              })
            )}

            {visibleCount < filteredPrinters.length && (
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + 4)}
                style={{
                  width: '100%',
                  background: 'var(--bg-card)',
                  color: '#ea580c',
                  border: '2px dashed #ea580c',
                  borderRadius: 16,
                  padding: '16px',
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: 'pointer',
                  marginTop: 12,
                  transition: 'all 0.2s',
                }}
              >
                Load More Verified Printer Hubs in India ↓
              </button>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
