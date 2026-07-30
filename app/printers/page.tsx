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

const INDIAN_PRINTER_HUBS: PrinterOwner[] = [
  {
    id: 'p1',
    name: 'Connaught Precision Hub',
    location: 'Connaught Place, New Delhi',
    city: 'Delhi NCR',
    distance: '1.2 km away',
    rating: 4.9,
    completedOrders: 142,
    machines: ['Bambu Lab X1-Carbon', 'Ender 3 V2'],
    materials: ['PLA', 'PETG', 'ABS', 'TPU'],
    maxVolume: '256 x 256 x 256 mm',
    status: 'available',
    lat: 28.6315,
    lng: 77.2167,
  },
  {
    id: 'p2',
    name: 'Indiranagar 3D Tech Studio',
    location: 'Indiranagar, Bengaluru',
    city: 'Bengaluru',
    distance: '2.4 km away',
    rating: 5.0,
    completedOrders: 98,
    machines: ['Prusa MK4 Dual-Color', 'Elegoo Saturn 3'],
    materials: ['PLA', 'Resin (8K Detail)', 'PETG'],
    maxVolume: '250 x 210 x 220 mm',
    status: 'available',
    lat: 12.9784,
    lng: 77.6408,
  },
  {
    id: 'p3',
    name: 'Bandra Resin & Filament Lab',
    location: 'Bandra West, Mumbai',
    city: 'Mumbai',
    distance: '0.8 km away',
    rating: 4.95,
    completedOrders: 176,
    machines: ['Formlabs Form 3+ Resin', 'Bambu P1S'],
    materials: ['ABS', 'ASA', 'Tough Resin', 'PLA'],
    maxVolume: '300 x 300 x 300 mm',
    status: 'busy',
    lat: 19.0596,
    lng: 72.8295,
  },
  {
    id: 'p4',
    name: 'HITECH City Additive Hub',
    location: 'HITECH City, Hyderabad',
    city: 'Hyderabad',
    distance: '3.1 km away',
    rating: 4.88,
    completedOrders: 115,
    machines: ['Bambu Lab X1-Carbon', 'Formlabs Form 3+'],
    materials: ['PLA', 'PETG', 'Resin (8K Detail)'],
    maxVolume: '256 x 256 x 256 mm',
    status: 'available',
    lat: 17.4435,
    lng: 78.3772,
  },
  {
    id: 'p5',
    name: 'Adyar Precision Print Works',
    location: 'Adyar, Chennai',
    city: 'Chennai',
    distance: '1.9 km away',
    rating: 4.92,
    completedOrders: 87,
    machines: ['Creality K1 Max', 'Prusa MK4'],
    materials: ['PLA', 'TPU', 'PETG'],
    maxVolume: '300 x 300 x 300 mm',
    status: 'available',
    lat: 13.0012,
    lng: 80.2565,
  },
  {
    id: 'p6',
    name: 'Salt Lake Cyber Print Hub',
    location: 'Salt Lake Sector V, Kolkata',
    city: 'Kolkata',
    distance: '2.8 km away',
    rating: 4.85,
    completedOrders: 64,
    machines: ['Anycubic Kobra 2', 'Ender 3 V3'],
    materials: ['PLA', 'PETG', 'ABS'],
    maxVolume: '220 x 220 x 250 mm',
    status: 'available',
    lat: 22.5726,
    lng: 88.4129,
  },
  {
    id: 'p7',
    name: 'Kothrud Rapid Prototyping',
    location: 'Kothrud, Pune',
    city: 'Pune',
    distance: '1.5 km away',
    rating: 4.97,
    completedOrders: 154,
    machines: ['Bambu Lab P1S Dual-Extruder', 'Prusa i3 MK3S+'],
    materials: ['PLA', 'PETG', 'TPU', 'Carbon Fiber PLA'],
    maxVolume: '256 x 256 x 256 mm',
    status: 'available',
    lat: 18.5074,
    lng: 73.8077,
  },
  {
    id: 'p8',
    name: 'SG Highway 3D Makers',
    location: 'SG Highway, Ahmedabad',
    city: 'Ahmedabad',
    distance: '3.4 km away',
    rating: 4.91,
    completedOrders: 103,
    machines: ['Bambu Lab A1 Mini', 'Elegoo Mars 4'],
    materials: ['PLA', 'Resin (8K Detail)', 'PETG'],
    maxVolume: '180 x 180 x 180 mm',
    status: 'available',
    lat: 23.0225,
    lng: 72.5714,
  },
]

export default function PrinterDirectoryPage() {
  const [filterCity, setFilterCity] = useState('All')
  const [filterMaterial, setFilterMaterial] = useState('All')
  const [selectedHub, setSelectedHub] = useState<PrinterOwner>(INDIAN_PRINTER_HUBS[0])

  const filteredPrinters = INDIAN_PRINTER_HUBS.filter((p) => {
    const matchesCity = filterCity === 'All' || p.city === filterCity
    const matchesMaterial = filterMaterial === 'All' || p.materials?.includes(filterMaterial)
    return matchesCity && matchesMaterial
  })

  return (
    <main style={{ minHeight: '100vh', transition: 'background 0.3s ease' }}>
      <Navbar />

      <section className="container section-sm" style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px' }}>
        <div className="ateion-pill" style={{ marginBottom: 12 }}>
          🇮🇳 India OpenStreetMap & Leaflet GPS Matching
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 900, marginBottom: 8, color: 'var(--text-main)' }}>
          Verified 3D Printer Hubs Across India
        </h1>
        <p style={{ color: 'var(--text-sub)', fontSize: 16, marginBottom: 32, maxWidth: 720 }}>
          OpenStreetMap GPS matching connects your 3D orders to verified local printer owners in New Delhi, Mumbai, Bengaluru, Hyderabad, Chennai, Kolkata, Pune & Ahmedabad for fast, low-carbon doorstep delivery.
        </p>

        {/* REAL LEAFLET OPENSTREETMAP INDIA MAP WIDGET */}
        <div style={{ marginBottom: 36, border: '1px solid var(--border-color)', borderRadius: 24, overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          <OpenStreetMap
            locations={filteredPrinters}
            selectedId={selectedHub.id}
            onSelectLocation={(loc) => setSelectedHub(loc as PrinterOwner)}
            center={[20.5937, 78.9629]} // Centered on India Map
            zoom={5}
            height="440px"
          />
        </div>

        {/* Filter Controls: City & Material */}
        <div style={{ background: 'var(--bg-card)', padding: 20, borderRadius: 20, border: '1px solid var(--border-color)', marginBottom: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* City Filter */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#ea580c', textTransform: 'uppercase' }}>🇮🇳 Select City:</span>
            {['All', 'Delhi NCR', 'Bengaluru', 'Mumbai', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad'].map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => setFilterCity(city)}
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

          {/* Material Filter */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', borderTop: '1px dashed var(--border-color)', paddingTop: 14 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-sub)', textTransform: 'uppercase' }}>🧵 Filter Material:</span>
            {['All', 'PLA', 'PETG', 'ABS', 'Resin (8K Detail)', 'TPU'].map((mat) => (
              <button
                key={mat}
                type="button"
                onClick={() => setFilterMaterial(mat)}
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
          {/* Selected Active Hub Panel */}
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
              {selectedHub.machines?.map((m) => (
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

          {/* Directory List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {filteredPrinters.map((printer) => {
              const isSelected = printer.id === selectedHub.id
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>{printer.name}</h3>
                      <span style={{ background: printer.status === 'available' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: printer.status === 'available' ? '#10B981' : '#EF4444', padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 800 }}>
                        {printer.status === 'available' ? 'Online • Ready' : 'Busy'}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-sub)' }}>
                      📍 {printer.location} • <strong style={{ color: '#ea580c' }}>{printer.distance}</strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    style={{ background: isSelected ? '#ea580c' : 'var(--bg-card-hover)', color: isSelected ? '#fff' : 'var(--text-main)', border: '1px solid var(--border-color)', padding: '10px 18px', borderRadius: 99, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                  >
                    {isSelected ? 'Selected Pin' : 'Focus on Map'}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
