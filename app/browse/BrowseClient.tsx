'use client'

import { useMemo, useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import * as THREE from 'three'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import type { DesignRow } from './page'

const FALLBACK_CATEGORIES = ['Toys & Games', 'Home & Office', 'Home & Decor', 'Personalized', 'Repair Parts']

function Quick3DModal({ design, onClose }: { design: DesignRow; onClose: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [wireframe, setWireframe] = useState(false)
  const [rotationSpeed, setRotationSpeed] = useState(0.01)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const width = container.clientWidth || 480
    const height = container.clientHeight || 360
    const aspect = width / height

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0f172a)

    const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100)
    camera.position.set(0, 1.2, 3.8)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    const ambient = new THREE.AmbientLight(0xffffff, 0.8)
    scene.add(ambient)

    const keyLight = new THREE.DirectionalLight(0xff6b35, 2.2)
    keyLight.position.set(4, 6, 4)
    scene.add(keyLight)

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 1.2)
    fillLight.position.set(-4, 2, -3)
    scene.add(fillLight)

    const group = new THREE.Group()

    // Render a high-detail 3D geometry mesh for inspection
    const geo = new THREE.IcosahedronGeometry(1.1, 2)
    const mat = new THREE.MeshStandardMaterial({
      color: 0xff6b35,
      roughness: 0.25,
      metalness: 0.7,
      wireframe,
    })
    const mesh = new THREE.Mesh(geo, mat)
    group.add(mesh)

    // Sleek outer grid ring
    const gridGeo = new THREE.RingGeometry(1.4, 1.42, 32)
    const gridMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide })
    const gridMesh = new THREE.Mesh(gridGeo, gridMat)
    gridMesh.rotation.x = Math.PI / 2
    gridMesh.position.y = -1.2
    group.add(gridMesh)

    scene.add(group)

    let frameId: number
    const animate = () => {
      group.rotation.y += rotationSpeed
      mesh.material.wireframe = wireframe
      renderer.render(scene, camera)
      frameId = requestAnimationFrame(animate)
    }
    animate()

    const handleResize = () => {
      if (!container) return
      const w = container.clientWidth || 480
      const h = container.clientHeight || 360
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', handleResize)
      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [wireframe, rotationSpeed])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(11, 15, 25, 0.85)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#0F172A',
          border: '1px solid rgba(255, 107, 53, 0.3)',
          borderRadius: 24,
          padding: 28,
          maxWidth: 580,
          width: '100%',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#FF6B35', textTransform: 'uppercase', letterSpacing: 1 }}>
              WebGL 3D Orbit Inspection
            </span>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: '#fff', margin: '2px 0 0' }}>{design.title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.1)',
              color: '#fff',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              fontSize: 16,
              cursor: 'pointer',
              fontWeight: 800,
            }}
          >
            ✕
          </button>
        </div>

        {/* 3D WebGL Viewport Container */}
        <div
          ref={containerRef}
          style={{ width: '100%', height: 320, borderRadius: 16, overflow: 'hidden', position: 'relative' }}
        />

        {/* Inspection Controls Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 18, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={() => setWireframe(!wireframe)}
              style={{
                background: wireframe ? '#FF6B35' : 'rgba(255,255,255,0.1)',
                color: '#fff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: 99,
                fontSize: 12,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              {wireframe ? 'Mesh Solid View' : 'Wireframe View'}
            </button>
            <button
              type="button"
              onClick={() => setRotationSpeed(rotationSpeed === 0 ? 0.01 : 0)}
              style={{
                background: rotationSpeed === 0 ? '#10B981' : 'rgba(255,255,255,0.1)',
                color: '#fff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: 99,
                fontSize: 12,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              {rotationSpeed === 0 ? 'Resume Orbit' : 'Pause Orbit'}
            </button>
          </div>

          <Link
            href={`/designs/${design.id}`}
            style={{
              background: 'linear-gradient(135deg, #FF6B35 0%, #EA580C 100%)',
              color: '#fff',
              padding: '10px 22px',
              borderRadius: 99,
              fontSize: 13,
              fontWeight: 800,
              textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(255,107,53,0.3)',
            }}
          >
            Order Print (₹{design.price}) →
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function BrowseClient({ designs }: { designs: DesignRow[] }) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [sort, setSort] = useState('popular')
  const [previewDesign, setPreviewDesign] = useState<DesignRow | null>(null)

  const categories = useMemo(() => {
    const fromData = Array.from(new Set(designs.map((d) => d.category).filter(Boolean))) as string[]
    return ['All', ...(fromData.length ? fromData : FALLBACK_CATEGORIES)]
  }, [designs])

  const filtered = useMemo(() => {
    return designs
      .filter((d) => {
        const matchesCategory = category === 'All' || d.category === category
        const matchesSearch =
          d.title.toLowerCase().includes(search.toLowerCase()) ||
          (d.designer?.full_name || '').toLowerCase().includes(search.toLowerCase())
        return matchesCategory && matchesSearch
      })
      .sort((a, b) => {
        if (sort === 'rating') return b.rating - a.rating
        if (sort === 'price-low') return a.price - b.price
        if (sort === 'price-high') return b.price - a.price
        return 0
      })
  }, [designs, search, category, sort])

  return (
    <main style={{ minHeight: '100vh' }}>
      <Navbar />

      <section className="container section" style={{ maxWidth: 1240, margin: '0 auto', padding: '40px 20px' }}>
        {/* HERO HEADER */}
        <div style={{ marginBottom: 36 }}>
          <div className="ateion-pill" style={{ marginBottom: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
            <span>3D STL & 3MF Digital Model Repository</span>
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 900, color: 'var(--text-main)', marginBottom: 8, letterSpacing: '-0.5px' }}>
            Explore Interactive 3D Models & CAD Files
          </h1>
          <p style={{ color: 'var(--text-sub)', fontSize: 16, maxWidth: 740, lineHeight: 1.6 }}>
            Browse verified digital 3D models. Inspect wireframe geometry in real-time 3D WebGL, estimate print slicing costs, or order physical prints from local printer hubs.
          </p>
        </div>

        {/* SEARCH & FILTER CONTROLS */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 24, padding: 24, marginBottom: 40, boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 20 }}>
            <div style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', borderRadius: 99, padding: '6px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-sub)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search 3D models, creators, or file types..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text-main)', fontSize: 14, outline: 'none' }}
              />
            </div>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', borderRadius: 99, padding: '0 20px', color: 'var(--text-main)', fontSize: 14, outline: 'none', fontWeight: 700, cursor: 'pointer' }}
            >
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="price-low">Royalty: Low to High</option>
              <option value="price-high">Royalty: High to Low</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {categories.map((cat) => {
              const active = category === cat
              return (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  style={{
                    padding: '8px 20px',
                    borderRadius: 99,
                    fontSize: 13,
                    fontWeight: active ? 800 : 600,
                    border: active ? '1px solid #FF6B35' : '1px solid var(--border-color)',
                    background: active ? '#FF6B35' : 'var(--bg-card-hover)',
                    color: active ? '#fff' : 'var(--text-main)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {cat}
                </button>
              )
            })}
          </div>
        </div>

        {/* 3D MODEL CARDS GRID */}
        {filtered.length === 0 ? (
          <div style={{ background: 'var(--bg-card)', border: '1px dashed var(--border-color)', borderRadius: 24, padding: 60, textAlign: 'center' }}>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-main)', marginBottom: 8 }}>No 3D Models Found</h3>
            <p style={{ color: 'var(--text-sub)', fontSize: 14 }}>Try searching for &quot;Dragon&quot;, &quot;Organizer&quot;, or selecting &quot;All&quot; categories.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
            {filtered.map((design) => (
              <div
                key={design.id}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 18,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                  transition: 'transform 0.2s, boxShadow 0.2s',
                }}
              >
                {/* 3D PREVIEW THUMBNAIL */}
                <div style={{ height: 160, width: '100%', position: 'relative', background: '#0F172A', overflow: 'hidden' }}>
                  <img
                    src={design.thumbnail_url || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80'}
                    alt={design.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />

                  {/* Category Pill */}
                  <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(255,107,53,0.9)', color: '#fff', fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 99, backdropFilter: 'blur(4px)' }}>
                    {design.category || '3D STL Model'}
                  </div>

                  {/* Quick 3D View Button */}
                  <button
                    type="button"
                    onClick={() => setPreviewDesign(design)}
                    style={{
                      position: 'absolute',
                      bottom: 10,
                      right: 10,
                      background: 'rgba(15, 23, 42, 0.85)',
                      backdropFilter: 'blur(8px)',
                      color: '#fff',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: 99,
                      padding: '5px 12px',
                      fontSize: 11,
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <span>Inspect 3D</span>
                  </button>
                </div>

                {/* CARD CONTENT BODY */}
                <div style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: 11, color: 'var(--text-sub)', fontWeight: 600 }}>By {design.designer?.full_name || 'PrintHive Designer'}</span>
                      <span style={{ fontSize: 11, fontWeight: 800, color: '#D97706' }}>★ {design.rating}</span>
                    </div>

                    <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-main)', marginBottom: 8, lineHeight: 1.3, height: 38, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {design.title}
                    </h3>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                      <div>
                        <div style={{ fontSize: 10, color: 'var(--text-sub)', fontWeight: 700, textTransform: 'uppercase' }}>Royalty</div>
                        <div style={{ fontSize: 18, fontWeight: 900, color: '#FF6B35' }}>₹{design.price}</div>
                      </div>

                      <Link
                        href={`/designs/${design.id}`}
                        style={{ background: 'var(--bg-card-hover)', color: 'var(--text-main)', border: '1px solid var(--border-color)', padding: '7px 14px', borderRadius: 10, fontSize: 12, fontWeight: 800, textDecoration: 'none' }}
                      >
                        Details →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* QUICK 3D INSPECTION MODAL */}
      {previewDesign && <Quick3DModal design={previewDesign} onClose={() => setPreviewDesign(null)} />}

      <Footer />
    </main>
  )
}