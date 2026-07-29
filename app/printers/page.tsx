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
}

const PRINTERS: PrinterOwner[] = [
  {
    id: 'p1',
    name: 'Rohan’s PrintLab',
    location: 'Andheri West, Mumbai',
    distance: '1.2 km',
    rating: 4.9,
    completedOrders: 142,
    machines: ['Bambu Lab X1-Carbon', 'Ender 3 V2'],
    materials: ['PLA', 'PETG', 'ABS', 'TPU'],
    maxVolume: '256 x 256 x 256 mm',
    status: 'available',
  },
  {
    id: 'p2',
    name: 'Bandra MakerSpace',
    location: 'Bandra West, Mumbai',
    distance: '3.4 km',
    rating: 4.8,
    completedOrders: 98,
    machines: ['Prusa MK4', 'Elegoo Saturn 3 (Resin)'],
    materials: ['PLA', 'Resin (8K Detail)', 'PETG'],
    maxVolume: '250 x 210 x 220 mm',
    status: 'available',
  },
  {
    id: 'p3',
    name: 'Powai TechStudio',
    location: 'Powai, Mumbai',
    distance: '6.1 km',
    rating: 4.7,
    completedOrders: 65,
    machines: ['Voron 2.4', 'Bambu P1S'],
    materials: ['ABS', 'ASA', 'Nylon', 'PLA'],
    maxVolume: '300 x 300 x 300 mm',
    status: 'busy',
  },
]

export default function PrinterDirectoryPage() {
  const [filterMaterial, setFilterMaterial] = useState('All')

  return (
    <main style={{ minHeight: '100vh', background: '#0b0f19', color: '#f8fafc' }}>
      <Navbar />

      <section className="container section-sm" style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ color: '#38bdf8', textTransform: 'uppercase', letterSpacing: 1.5, fontSize: 12, fontWeight: 700 }}>
          Distributed Micro-Factories
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8, background: 'linear-gradient(135deg, #fff 0%, #cbd5e1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Nearby Printer Owners
        </h1>
        <p style={{ color: '#94a3b8', fontSize: 16, marginBottom: 32, maxWidth: 680 }}>
          Leaflet GPS matching pairs your order with verified 3D printer hubs near your pincode for fast, low-carbon local delivery.
        </p>

        {/* Leaflet GPS Map Placeholder UI */}
        <div
          style={{
            height: 300,
            borderRadius: 16,
            background: 'radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            marginBottom: 40,
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'inset 0 0 50px rgba(0,0,0,0.5)',
          }}
        >
          {/* Simulated Map Grid lines */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(#38bdf8 1px, transparent 1px)', backgroundSize: '24px 24px', opacity: 0.2 }} />

          {/* Map Location Pins */}
          <div style={{ position: 'absolute', top: '30%', left: '25%', textAlign: 'center' }}>
            <div style={{ fontSize: 24, filter: 'drop-shadow(0 4px 10px rgba(56,189,248,0.8))' }}>📍</div>
            <div style={{ fontSize: 11, background: '#0f172a', padding: '2px 6px', borderRadius: 4, color: '#38bdf8', fontWeight: 700 }}>Rohan (1.2 km)</div>
          </div>
          <div style={{ position: 'absolute', top: '55%', left: '60%', textAlign: 'center' }}>
            <div style={{ fontSize: 24, filter: 'drop-shadow(0 4px 10px rgba(255,107,53,0.8))' }}>📍</div>
            <div style={{ fontSize: 11, background: '#0f172a', padding: '2px 6px', borderRadius: 4, color: '#ff6b35', fontWeight: 700 }}>Bandra (3.4 km)</div>
          </div>

          <div style={{ position: 'relative', background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)', padding: '12px 24px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>🗺️ Interactive GPS Leaflet Map Active</span>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Showing 3 active printer hubs near your current location</div>
          </div>
        </div>

        {/* Filter Bar */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
          {['All', 'PLA', 'PETG', 'ABS', 'Resin (8K Detail)'].map((mat) => (
            <button
              key={mat}
              onClick={() => setFilterMaterial(mat)}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: 'none',
                background: filterMaterial === mat ? '#ff6b35' : '#1e293b',
                color: '#fff',
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              {mat}
            </button>
          ))}
        </div>

        {/* Printer Owners Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 24 }}>
          {PRINTERS.filter((p) => filterMaterial === 'All' || p.materials.includes(filterMaterial)).map((p) => (
            <div
              key={p.id}
              style={{
                background: 'rgba(30, 41, 59, 0.7)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 16,
                padding: 24,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{p.name}</h3>
                  <div style={{ fontSize: 13, color: '#94a3b8' }}>📍 {p.location} ({p.distance})</div>
                </div>
                <span
                  style={{
                    padding: '4px 10px',
                    borderRadius: 99,
                    fontSize: 11,
                    fontWeight: 700,
                    background: p.status === 'available' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    color: p.status === 'available' ? '#10b981' : '#f59e0b',
                  }}
                >
                  ● {p.status.toUpperCase()}
                </span>
              </div>

              <div style={{ display: 'flex', gap: 12, marginBottom: 16, fontSize: 13, color: '#cbd5e1' }}>
                <span>★ <strong style={{ color: '#fbbf24' }}>{p.rating}</strong></span>
                <span>·</span>
                <span><strong>{p.completedOrders}</strong> orders fulfilled</span>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>MACHINES:</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {p.machines.map((m) => (
                    <span key={m} style={{ background: '#0f172a', color: '#38bdf8', padding: '4px 10px', borderRadius: 6, fontSize: 12 }}>
                      🖨️ {m}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>SUPPORTED MATERIALS:</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {p.materials.map((m) => (
                    <span key={m} style={{ background: '#0f172a', color: '#cbd5e1', padding: '4px 10px', borderRadius: 6, fontSize: 12 }}>
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              <Link
                href="/print-on-demand"
                style={{
                  display: 'block',
                  textAlign: 'center',
                  padding: '12px 0',
                  background: 'linear-gradient(135deg, #ff6b35 0%, #f97316 100%)',
                  color: '#fff',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                Send Order to this Hub →
              </Link>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  )
}
