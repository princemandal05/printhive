'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

type PrinterOwner = {
  id: string
  name: string
  location: string
  distance: string
  rating: number
  completedOrders: number
  machines: string[]
  materials: string[]
  maxVolume: string
  status: 'available' | 'busy'
  lat: number
  lng: number
}

const PRINTERS: PrinterOwner[] = [
  {
    id: 'p1',
    name: 'Connaught Precision Hub',
    location: 'Connaught Place, New Delhi',
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
    name: 'Indiranagar 3D Studio',
    location: 'Indiranagar, Bengaluru',
    distance: '2.4 km away',
    rating: 5.0,
    completedOrders: 98,
    machines: ['Prusa MK4 dual-color', 'Elegoo Saturn 3'],
    materials: ['PLA', 'Resin (8K Detail)', 'PETG'],
    maxVolume: '250 x 210 x 220 mm',
    status: 'available',
    lat: 12.9784,
    lng: 77.6408,
  },
  {
    id: 'p3',
    name: 'Bandra Resin Lab',
    location: 'Bandra West, Mumbai',
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
]

export default function PrinterDirectoryPage() {
  const [filterMaterial, setFilterMaterial] = useState('All')
  const [selectedHub, setSelectedHub] = useState<PrinterOwner>(PRINTERS[0])

  const filteredPrinters = filterMaterial === 'All'
    ? PRINTERS
    : PRINTERS.filter((p) => p.materials.includes(filterMaterial))

  return (
    <main style={{ minHeight: '100vh', transition: 'background 0.3s ease' }}>
      <Navbar />

      <section className="container section-sm" style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px' }}>
        <div className="ateion-pill" style={{ marginBottom: 12 }}>
          📍 Leaflet GPS Matching
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 900, marginBottom: 8, color: 'var(--text-main)' }}>
          Nearby Verified 3D Printer Hubs
        </h1>
        <p style={{ color: 'var(--text-sub)', fontSize: 16, marginBottom: 32, maxWidth: 680 }}>
          Leaflet GPS matching connects your 3D orders to verified local printer owners near your pincode for fast, low-carbon doorstep delivery.
        </p>

        {/* INTERACTIVE LEAFLET MAP MOCKUP WIDGET */}
        <div
          style={{
            height: 340,
            borderRadius: 24,
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            marginBottom: 40,
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Grid lines background texture */}
          <div className="grid-pattern-bg" style={{ position: 'absolute', inset: 0, opacity: 0.6 }} />

          {/* Interactive Map Pin 1 */}
          <button
            type="button"
            onClick={() => setSelectedHub(PRINTERS[0])}
            style={{
              position: 'absolute',
              top: '32%',
              left: '22%',
              background: selectedHub.id === 'p1' ? '#ea580c' : 'var(--bg-card)',
              color: selectedHub.id === 'p1' ? '#fff' : 'var(--text-main)',
              padding: '8px 14px',
              borderRadius: 99,
              border: '2px solid #ea580c',
              fontSize: 12,
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(234,88,12,0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.2s',
            }}
          >
            <span>📍</span>
            <span>Connaught Hub (1.2 km)</span>
          </button>

          {/* Interactive Map Pin 2 */}
          <button
            type="button"
            onClick={() => setSelectedHub(PRINTERS[1])}
            style={{
              position: 'absolute',
              top: '55%',
              left: '52%',
              background: selectedHub.id === 'p2' ? '#ea580c' : 'var(--bg-card)',
              color: selectedHub.id === 'p2' ? '#fff' : 'var(--text-main)',
              padding: '8px 14px',
              borderRadius: 99,
              border: '2px solid #ea580c',
              fontSize: 12,
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(234,88,12,0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.2s',
            }}
          >
            <span>📍</span>
            <span>Indiranagar Studio (2.4 km)</span>
          </button>

          {/* Interactive Map Pin 3 */}
          <button
            type="button"
            onClick={() => setSelectedHub(PRINTERS[2])}
            style={{
              position: 'absolute',
              top: '25%',
              left: '72%',
              background: selectedHub.id === 'p3' ? '#ea580c' : 'var(--bg-card)',
              color: selectedHub.id === 'p3' ? '#fff' : 'var(--text-main)',
              padding: '8px 14px',
              borderRadius: 99,
              border: '2px solid #ea580c',
              fontSize: 12,
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(234,88,12,0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.2s',
            }}
          >
            <span>📍</span>
            <span>Bandra Resin Lab (0.8 km)</span>
          </button>

          {/* Selected Hub Overlay Info Pill */}
          <div style={{ position: 'absolute', bottom: 20, left: 20, right: 20, background: 'var(--bg-card)', backdropFilter: 'blur(16px)', padding: '14px 20px', borderRadius: 16, border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-main)' }}>{selectedHub.name} ({selectedHub.location})</div>
              <div style={{ fontSize: 13, color: 'var(--text-sub)' }}>Machines: {selectedHub.machines.join(', ')} • Rating: {selectedHub.rating} ★</div>
            </div>
            <Link href="/print-on-demand" className="btn btn-primary" style={{ background: '#ea580c', color: '#fff', padding: '8px 18px', borderRadius: 99, fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
              Assign Job →
            </Link>
          </div>
        </div>

        {/* Material Filter Tabs */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
          {['All', 'PLA', 'PETG', 'ABS', 'Resin'].map((mat) => (
            <button
              key={mat}
              type="button"
              onClick={() => setFilterMaterial(mat)}
              style={{
                padding: '8px 18px',
                borderRadius: 99,
                border: '1px solid var(--border-color)',
                background: filterMaterial === mat ? '#ea580c' : 'var(--bg-card)',
                color: filterMaterial === mat ? '#fff' : 'var(--text-main)',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              {mat}
            </button>
          ))}
        </div>

        {/* Directory Grid */}
        <div className="grid grid-cols-3 gap-6">
          {filteredPrinters.map((p) => (
            <div
              key={p.id}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 20,
                padding: 24,
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#ea580c' }}>📍 {p.distance}</span>
                  <span style={{ background: p.status === 'available' ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)', color: p.status === 'available' ? '#10B981' : '#F59E0B', padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700 }}>
                    {p.status === 'available' ? 'Available' : 'Busy'}
                  </span>
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-main)', marginBottom: 4 }}>{p.name}</h3>
                <div style={{ fontSize: 13, color: 'var(--text-sub)', marginBottom: 16 }}>{p.location}</div>

                <div style={{ fontSize: 13, color: 'var(--text-sub)', marginBottom: 8 }}>
                  <strong>Machines:</strong> {p.machines.join(', ')}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-sub)', marginBottom: 16 }}>
                  <strong>Build Volume:</strong> {p.maxVolume}
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: 14 }}>{p.rating} ★</span>
                  <span style={{ fontSize: 12, color: 'var(--text-sub)', marginLeft: 4 }}>({p.completedOrders} jobs)</span>
                </div>
                <Link href="/print-on-demand" style={{ color: '#ea580c', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
                  Select Hub →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  )
}
