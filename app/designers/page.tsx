'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { createClient } from '@/utils/supabase/client'

type Designer = {
  id: string
  name: string
  handle: string
  specialty: string
  rating: number
  ratingCount: number
  followers: number
  modelsCount: number
  bio: string
  avatar: string
}

export default function DesignersDirectoryPage() {
  const supabase = createClient()
  const [designers, setDesigners] = useState<Designer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function loadDesigners() {
      setLoading(true)
      try {
        // Query profiles with designer role or who published designs
        const { data: profiles, error: profErr } = await supabase
          .from('profiles')
          .select('id, full_name, role, avatar_url, bio, specialty')
          .or('role.eq.designer,role.eq.seller')

        // Query designs count grouped by designer
        const { data: designs } = await supabase.from('designs').select('id, designer_id')

        const countMap: Record<string, number> = {}
        if (designs) {
          designs.forEach((d: any) => {
            if (d.designer_id) {
              countMap[d.designer_id] = (countMap[d.designer_id] || 0) + 1
            }
          })
        }

        if (profiles && profiles.length > 0) {
          const mapped: Designer[] = profiles.map((p: any) => {
            const mCount = countMap[p.id] || 0
            const name = p.full_name || 'PrintHive Designer'
            const handle = `@${name.toLowerCase().replace(/[^a-z0-9]/g, '')}`
            return {
              id: p.id,
              name,
              handle,
              specialty: p.specialty || 'CAD Modeling & 3D Prototyping',
              rating: 0,
              ratingCount: 0,
              followers: 0,
              modelsCount: mCount,
              bio: p.bio || 'Verified PrintHive 3D creator and CAD engineer.',
              avatar: p.avatar_url || '🎨',
            }
          })
          setDesigners(mapped)
        } else {
          setDesigners([])
        }
      } catch (err) {
        console.error('Error fetching designers:', err)
        setDesigners([])
      } finally {
        setLoading(false)
      }
    }

    loadDesigners()
  }, [])

  const filtered = designers.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.specialty.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-canvas)', color: 'var(--text-main)', transition: 'background 0.3s ease' }}>
      <Navbar />

      <section className="container section-sm" style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px 80px' }}>
        <div style={{ color: '#ea580c', textTransform: 'uppercase', letterSpacing: 1.5, fontSize: 12, fontWeight: 800 }}>
          3D Creators &amp; Modellers
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 900, marginBottom: 8, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
          Browse Top 3D Designers
        </h1>
        <p style={{ color: 'var(--text-sub)', fontSize: 16, marginBottom: 32, maxWidth: 680 }}>
          Explore portfolios from verified 3D sculptors and CAD engineers. Hire them for custom design briefs or print their 3D CAD files.
        </p>

        <div style={{ marginBottom: 32, maxWidth: 400 }}>
          <input
            className="input"
            placeholder="Search designers by name or specialty..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '12px 16px', background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', borderRadius: 12, color: 'var(--text-main)' }}
          />
        </div>

        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-sub)', fontSize: 14 }}>
            ⏳ Connecting to verified 3D creators...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', background: 'var(--bg-card)', borderRadius: 20, border: '1px dashed var(--border-color)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎨</div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-main)', marginBottom: 6 }}>
              No Designers Found
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-sub)', maxWidth: 420, margin: '0 auto 20px' }}>
              Join the creator community and showcase your 3D CAD portfolio to buyers across India.
            </p>
            <Link
              href="/signup"
              style={{ background: '#ea580c', color: '#fff', padding: '10px 22px', borderRadius: 9999, fontWeight: 800, fontSize: 13, textDecoration: 'none' }}
            >
              Join as 3D Designer ↗
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}>
            {filtered.map((d) => (
              <div
                key={d.id}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 20,
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                  transition: 'all 0.2s ease',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                    <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(234, 88, 12, 0.1)', border: '1px solid rgba(234, 88, 12, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, overflow: 'hidden' }}>
                      {d.avatar.startsWith('http') ? (
                        <img src={d.avatar} alt={d.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        d.avatar
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-main)' }}>{d.name}</div>
                      <div style={{ fontSize: 13, color: '#ea580c', fontWeight: 700 }}>{d.handle}</div>
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-card-hover)', padding: '5px 12px', borderRadius: 8, fontSize: 11.5, fontWeight: 700, color: 'var(--text-sub)', display: 'inline-block', marginBottom: 14 }}>
                    {d.specialty}
                  </div>

                  <p style={{ fontSize: 13.5, color: 'var(--text-sub)', lineHeight: 1.5, marginBottom: 20 }}>
                    {d.bio}
                  </p>

                  <div style={{ display: 'flex', gap: 16, borderTop: '1px solid var(--border-color)', paddingTop: 14, marginBottom: 20, fontSize: 12.5, color: 'var(--text-sub)', alignItems: 'center' }}>
                    <div><strong style={{ color: 'var(--text-main)' }}>{d.modelsCount}</strong> Models</div>
                    <div>
                      {d.rating > 0 ? (
                        <span style={{ color: '#fbbf24', fontWeight: 800 }}>★ {d.rating.toFixed(1)}</span>
                      ) : (
                        <span style={{ color: 'var(--text-sub)', fontWeight: 700 }}>★ 0.0 • 🆕 New Creator</span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                  <Link
                    href="/browse"
                    style={{ flex: 1, textAlign: 'center', padding: '10px 0', background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', color: 'var(--text-main)', borderRadius: 10, fontSize: 13, fontWeight: 800, textDecoration: 'none' }}
                  >
                    Portfolio
                  </Link>
                  <Link
                    href="/requests/new"
                    style={{ flex: 1, textAlign: 'center', padding: '10px 0', background: '#ea580c', color: '#fff', borderRadius: 10, fontSize: 13, fontWeight: 800, textDecoration: 'none' }}
                  >
                    Hire Designer
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  )
}
