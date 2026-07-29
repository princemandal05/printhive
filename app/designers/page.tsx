'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

type Designer = {
  id: string
  name: string
  handle: string
  specialty: string
  rating: number
  followers: number
  modelsCount: number
  bio: string
  avatar: string
}

const DESIGNERS: Designer[] = [
  {
    id: 'd1',
    name: 'Aarav Mehta',
    handle: '@aarav3d',
    specialty: 'Mechanical & Functional Parts',
    rating: 4.9,
    followers: 1420,
    modelsCount: 48,
    bio: 'Mechanical engineer crafting zero-tolerance functional prints, replacement parts, and low-poly desk gear.',
    avatar: '👨‍💻',
  },
  {
    id: 'd2',
    name: 'Sneha Kulkarni',
    handle: '@sneha_art',
    specialty: 'Cosplay & Props',
    rating: 4.8,
    followers: 2890,
    modelsCount: 64,
    bio: 'Digital sculptor creating wearable cosplay armor, helmets, and miniature tabletop gaming figures.',
    avatar: '🎨',
  },
  {
    id: 'd3',
    name: 'Vikramaditya Roy',
    handle: '@vroy_design',
    specialty: 'Home & Decorative Art',
    rating: 4.9,
    followers: 3510,
    modelsCount: 92,
    bio: 'Parametric designer specializing in modern geometric planters, lampshades, and home decor objects.',
    avatar: '🏺',
  },
]

export default function DesignersDirectoryPage() {
  const [search, setSearch] = useState('')

  const filtered = DESIGNERS.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.specialty.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <main style={{ minHeight: '100vh', background: '#0b0f19', color: '#f8fafc' }}>
      <Navbar />

      <section className="container section-sm" style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ color: '#ff6b35', textTransform: 'uppercase', letterSpacing: 1.5, fontSize: 12, fontWeight: 700 }}>
          3D Creators & Modellers
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8, background: 'linear-gradient(135deg, #fff 0%, #cbd5e1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Browse Top 3D Designers
        </h1>
        <p style={{ color: '#94a3b8', fontSize: 16, marginBottom: 32, maxWidth: 680 }}>
          Explore portfolios from verified 3D sculptors and CAD engineers. Hire them for custom design briefs or buy their STL files.
        </p>

        <div style={{ marginBottom: 32, maxWidth: 400 }}>
          <input
            className="input"
            placeholder="Search designers by name or specialty..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '12px 16px', background: '#1e293b', border: '1px solid #334155', borderRadius: 10, color: '#fff' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}>
          {filtered.map((d) => (
            <div
              key={d.id}
              style={{
                background: 'rgba(30, 41, 59, 0.7)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 16,
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                  <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg, #ff6b35, #f97316)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>
                    {d.avatar}
                  </div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>{d.name}</div>
                    <div style={{ fontSize: 13, color: '#38bdf8' }}>{d.handle}</div>
                  </div>
                </div>

                <div style={{ background: '#0f172a', padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, color: '#94a3b8', display: 'inline-block', marginBottom: 14 }}>
                  {d.specialty}
                </div>

                <p style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.5, marginBottom: 20 }}>
                  {d.bio}
                </p>

                <div style={{ display: 'flex', gap: 16, borderTop: '1px solid #334155', paddingTop: 14, marginBottom: 20, fontSize: 13, color: '#94a3b8' }}>
                  <div><strong style={{ color: '#fff' }}>{d.modelsCount}</strong> Models</div>
                  <div><strong style={{ color: '#fff' }}>{d.followers}</strong> Followers</div>
                  <div><span style={{ color: '#fbbf24' }}>★ {d.rating}</span></div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <Link
                  href="/browse"
                  style={{ flex: 1, textAlign: 'center', padding: '10px 0', background: '#334155', color: '#fff', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}
                >
                  Portfolio
                </Link>
                <Link
                  href="/requests/new"
                  style={{ flex: 1, textAlign: 'center', padding: '10px 0', background: '#ff6b35', color: '#fff', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}
                >
                  Hire Designer
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
