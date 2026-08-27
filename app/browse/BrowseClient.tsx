'use client'

import { useMemo, useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ThreeViewer from '@/components/ThreeViewer'
import { createClient } from '@/utils/supabase/client'
import {
  Box,
  Search,
  SlidersHorizontal,
  Star,
  ArrowRight,
  Eye,
  Layers,
  Sparkles,
  Plus,
  Zap,
  Printer,
  Clock,
  RotateCcw,
} from 'lucide-react'

export interface DesignRow {
  id: string
  title: string
  price: number
  category: string
  rating: number
  rating_count: number
  thumbnail_url: string
  file_url: string
  designer?: {
    full_name?: string
  }
  material?: string
  estimatedTime?: string
  tags?: string[]
}

const FALLBACK_CATEGORIES = ['All', 'Toys & Miniatures', 'Mechanical Parts', 'Home Décor', 'Gadget Mounts', 'Wearables']
const MATERIALS = ['All Materials', 'PLA', 'PETG', 'ABS', 'TPU', 'Resin']

function Quick3DModal({ design, onClose }: { design: DesignRow; onClose: () => void }) {
  const modelUrl = design.file_url || (design as any).preview_url

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 24,
          padding: 24,
          maxWidth: 680,
          width: '100%',
          boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#ea580c', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              WebGL 3D Interactive Orbit
            </span>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-main)', margin: '2px 0 0' }}>{design.title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'var(--bg-card-hover)',
              color: 'var(--text-main)',
              border: 'none',
              borderRadius: 99,
              width: 32,
              height: 32,
              fontSize: 14,
              cursor: 'pointer',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        {/* 3D WebGL Viewport */}
        <div style={{ width: '100%', borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border-color)' }}>
          <ThreeViewer title={design.title} modelUrl={modelUrl} height={380} />
        </div>

        {/* Modal Action Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 18 }}>
          <div style={{ fontSize: 13, color: 'var(--text-sub)' }}>
            Designer: <strong style={{ color: 'var(--text-main)' }}>{design.designer?.full_name || 'PrintHive Creator'}</strong>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <Link
              href={`/designs/${design.id}`}
              style={{
                background: '#ea580c',
                color: '#FFFFFF',
                borderRadius: 99,
                padding: '9px 18px',
                fontSize: 13,
                fontWeight: 800,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 4px 14px rgba(234, 88, 12, 0.3)',
              }}
            >
              <Zap size={14} /> Configure &amp; Print
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function BrowseClient({ designs = [] }: { designs: DesignRow[] }) {
  const [modelList, setModelList] = useState<DesignRow[]>(designs)
  const [loading, setLoading] = useState(designs.length === 0)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [selectedMaterial, setSelectedMaterial] = useState('All Materials')
  const [sort, setSort] = useState('popular')
  const [previewDesign, setPreviewDesign] = useState<DesignRow | null>(null)

  // Real-time client-side sync with Supabase
  useEffect(() => {
    const supabase = createClient()
    let isMounted = true

    async function fetchLatestDesigns() {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('designs')
          .select('id, title, description, file_url, thumbnail_url, price, tags, is_public, designer_id, created_at, rating, rating_count, materials, estimated_print_time')
          .order('created_at', { ascending: false })

        if (!error && data && isMounted) {
          const designerIds = Array.from(new Set(data.map((d: any) => d.designer_id).filter(Boolean)))
          const profileMap: Record<string, string> = {}

          if (designerIds.length > 0) {
            const { data: profiles } = await supabase
              .from('profiles')
              .select('id, full_name')
              .in('id', designerIds)

            if (profiles) {
              profiles.forEach((p: any) => {
                profileMap[p.id] = p.full_name
              })
            }
          }

          const parsed: DesignRow[] = data.map((d: any) => {
            const tags = Array.isArray(d.tags) ? d.tags : []
            const matchedTagMat = tags
              .map((t: string) => MATERIALS.find((m) => m.toLowerCase() === String(t).toLowerCase() && m !== 'All Materials'))
              .find(Boolean)
            const recordMat = (Array.isArray(d.materials) && d.materials[0]) || (typeof d.material === 'string' ? d.material : null) || matchedTagMat || 'PLA'
            const recordEstTime = d.estimated_print_time || (d.estimated_time ? String(d.estimated_time) : undefined)

            return {
              id: d.id,
              title: d.title || 'Custom 3D CAD Model',
              price: Number(d.price ?? 0),
              category: tags[0] || d.category || 'Toys & Miniatures',
              rating: Number(d.rating ?? 4.9),
              rating_count: Number(d.rating_count ?? 1),
              thumbnail_url: d.thumbnail_url || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
              file_url: d.file_url || '',
              designer: { full_name: profileMap[d.designer_id] || 'PrintHive Creator' },
              material: recordMat,
              estimatedTime: recordEstTime,
              tags,
            }
          })

          setModelList(parsed)
        }
      } catch (err) {
        console.warn('Live designs fetch warning:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchLatestDesigns()

    return () => {
      isMounted = false
    }
  }, [])

  const categories = useMemo(() => {
    const set = new Set<string>()
    modelList.forEach((d) => {
      if (d.category) set.add(d.category)
    })
    const fromData = Array.from(set)
    const combined = Array.from(new Set(['All', ...FALLBACK_CATEGORIES, ...fromData]))
    return combined
  }, [modelList])

  const filteredDesigns = useMemo(() => {
    return modelList
      .filter((d) => {
        const matchesCategory =
          category === 'All' ||
          d.category?.toLowerCase() === category.toLowerCase()

        const matchesMaterial =
          selectedMaterial === 'All Materials' ||
          (d.material && d.material.toUpperCase() === selectedMaterial.toUpperCase())

        const q = search.toLowerCase().trim()
        const matchesSearch =
          !q ||
          d.title?.toLowerCase().includes(q) ||
          (d.category && d.category.toLowerCase().includes(q)) ||
          (d.designer?.full_name && d.designer.full_name.toLowerCase().includes(q)) ||
          (d.material && d.material.toLowerCase().includes(q)) ||
          (d.tags && d.tags.some((tag) => tag.toLowerCase().includes(q)))

        return matchesCategory && matchesMaterial && matchesSearch
      })
      .sort((a, b) => {
        if (sort === 'rating') return b.rating - a.rating
        if (sort === 'price-low') return a.price - b.price
        if (sort === 'price-high') return b.price - a.price
        return 0
      })
  }, [modelList, search, category, selectedMaterial, sort])

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-canvas)', color: 'var(--text-main)', fontFamily: 'inherit', transition: 'background 0.3s ease' }}>
      <Navbar />

      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '32px 20px 80px' }}>
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.5px' }}>
                3D CAD Model Repository
              </h1>
              <span style={{ background: 'rgba(234, 88, 12, 0.1)', color: '#ea580c', fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 99, border: '1px solid rgba(234, 88, 12, 0.3)' }}>
                STL &amp; 3MF Library
              </span>
            </div>
            <p style={{ color: 'var(--text-sub)', fontSize: 14.5, margin: 0, maxWidth: 680, lineHeight: 1.5 }}>
              Inspect CAD geometry in real-time WebGL, calculate instant slicing volumes, or dispatch print jobs to nearby verified hubs.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Link
              href="/dashboard/designer/upload"
              style={{
                background: '#ea580c',
                color: '#FFFFFF',
                padding: '9px 18px',
                borderRadius: 99,
                fontSize: 13,
                fontWeight: 800,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 4px 14px rgba(234, 88, 12, 0.3)',
              }}
            >
              <Plus size={15} /> Upload 3D Model
            </Link>
          </div>
        </div>

        {/* SEARCH & FILTER BAR */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 20, padding: '20px 22px', marginBottom: 32, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 12, marginBottom: 16 }}>
            <div style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Search size={17} color="#ea580c" />
              <input
                type="text"
                placeholder="Search CAD models, tags, or designers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text-main)', fontSize: 13.5, outline: 'none' }}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  style={{ background: 'none', border: 'none', color: 'var(--text-sub)', fontSize: 13, cursor: 'pointer', fontWeight: 700 }}
                >
                  ✕
                </button>
              )}
            </div>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', borderRadius: 12, padding: '10px 14px', color: 'var(--text-main)', fontSize: 13, outline: 'none', fontWeight: 700, cursor: 'pointer' }}
            >
              <option value="popular">🔥 Most Popular</option>
              <option value="rating">⭐ Highest Rated</option>
              <option value="price-low">💰 Royalty: Low to High</option>
              <option value="price-high">💎 Royalty: High to Low</option>
            </select>
          </div>

          {/* Categories Filter Pills */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
            {categories.map((cat) => {
              const active = category.toLowerCase() === cat.toLowerCase()
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  style={{
                    background: active ? '#ea580c' : 'var(--bg-card-hover)',
                    color: active ? '#FFFFFF' : 'var(--text-main)',
                    border: '1px solid ' + (active ? '#ea580c' : 'var(--border-color)'),
                    borderRadius: 99,
                    padding: '6px 14px',
                    fontSize: 12.5,
                    fontWeight: active ? 800 : 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {cat}
                </button>
              )
            })}
          </div>

          {/* Material Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', paddingTop: 14, borderTop: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-sub)', marginRight: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>Material:</span>
            {MATERIALS.map((mat) => {
              const active = selectedMaterial === mat
              return (
                <button
                  key={mat}
                  type="button"
                  onClick={() => setSelectedMaterial(mat)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 6,
                    fontSize: 11.5,
                    fontWeight: active ? 800 : 600,
                    border: active ? '1px solid #ea580c' : '1px solid var(--border-color)',
                    background: active ? 'rgba(234, 88, 12, 0.12)' : 'transparent',
                    color: active ? '#ea580c' : 'var(--text-sub)',
                    cursor: 'pointer',
                  }}
                >
                  {mat}
                </button>
              )
            })}
          </div>
        </div>

        {/* LOADING SKELETON */}
        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
            {[1, 2, 3, 4, 5, 6].map((sk) => (
              <div key={sk} style={{ background: 'var(--bg-card)', borderRadius: 20, border: '1px solid var(--border-color)', height: 380, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ height: 200, borderRadius: 14, background: 'var(--bg-card-hover)' }} />
                <div style={{ height: 16, width: '60%', borderRadius: 4, background: 'var(--bg-card-hover)' }} />
                <div style={{ height: 20, width: '90%', borderRadius: 4, background: 'var(--bg-card-hover)' }} />
                <div style={{ height: 36, marginTop: 'auto', borderRadius: 8, background: 'var(--bg-card-hover)' }} />
              </div>
            ))}
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && filteredDesigns.length === 0 && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 24, padding: '60px 24px', textAlign: 'center', maxWidth: 500, margin: '40px auto' }}>
            <div style={{ width: 56, height: 56, borderRadius: 18, background: 'rgba(234, 88, 12, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#ea580c' }}>
              <Box size={24} />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-main)', marginBottom: 8 }}>
              No 3D Models Found
            </h3>
            <p style={{ fontSize: 13.5, color: 'var(--text-sub)', marginBottom: 24, lineHeight: 1.6 }}>
              No designs matched your active search or category filters. Try clearing your search.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch('')
                setCategory('All')
                setSelectedMaterial('All Materials')
              }}
              style={{
                background: '#ea580c',
                color: '#fff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: 99,
                fontSize: 13,
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <RotateCcw size={14} /> Reset Filters
            </button>
          </div>
        )}

        {/* 3D CAD MODEL GRID */}
        {!loading && filteredDesigns.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
            {filteredDesigns.map((design) => (
              <div
                key={design.id}
                style={{
                  background: 'var(--bg-card)',
                  borderRadius: 20,
                  border: '1px solid var(--border-color)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                }}
              >
                {/* 3D PREVIEW THUMBNAIL WITH QUICK ORBIT VIEWER */}
                <div style={{ height: 210, width: '100%', position: 'relative', background: 'var(--bg-card-hover)', overflow: 'hidden' }}>
                  <img
                    src={design.thumbnail_url || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80'}
                    alt={design.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />

                  {/* Category Pill */}
                  <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(15, 23, 42, 0.85)', color: '#fff', fontSize: 10.5, fontWeight: 800, padding: '3px 9px', borderRadius: 99, backdropFilter: 'blur(6px)' }}>
                    {design.category || 'Toys & Miniatures'}
                  </div>

                  {/* Quick 3D View Button */}
                  <button
                    type="button"
                    onClick={() => setPreviewDesign(design)}
                    style={{
                      position: 'absolute',
                      bottom: 12,
                      right: 12,
                      background: 'rgba(15, 23, 42, 0.88)',
                      backdropFilter: 'blur(8px)',
                      color: '#fff',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: 99,
                      padding: '5px 12px',
                      fontSize: 11.5,
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    }}
                  >
                    <Eye size={13} color="#ea580c" /> 3D Orbit
                  </button>
                </div>

                {/* CARD BODY */}
                <div style={{ padding: '18px 18px 20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: 11.5, color: 'var(--text-sub)', fontWeight: 700 }}>
                        By {design.designer?.full_name || 'PrintHive Creator'}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 800, color: '#D97706', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Star size={12} fill="#D97706" color="#D97706" /> {design.rating}
                      </span>
                    </div>

                    <Link
                      href={`/designs/${design.id}`}
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      <h3 style={{ fontSize: 15.5, fontWeight: 800, color: 'var(--text-main)', margin: '0 0 10px', lineHeight: 1.35, minHeight: 42, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {design.title}
                      </h3>
                    </Link>

                    {/* Manufacturing Specs */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                      <span style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Layers size={11} color="#ea580c" /> {design.material || 'PLA'}{design.estimatedTime ? ` • ~${design.estimatedTime}` : ''}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14, borderTop: '1px solid var(--border-color)' }}>
                    <div>
                      <div style={{ fontSize: 10, color: 'var(--text-sub)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>Royalty</div>
                      <div style={{ fontSize: 19, fontWeight: 900, color: design.price === 0 ? '#10B981' : '#ea580c' }}>
                        {design.price === 0 ? 'Free STL' : `₹${design.price}`}
                      </div>
                    </div>

                    <Link
                      href={`/designs/${design.id}`}
                      style={{
                        background: '#ea580c',
                        color: '#FFFFFF',
                        borderRadius: 99,
                        padding: '7px 16px',
                        fontSize: 12.5,
                        fontWeight: 800,
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        boxShadow: '0 3px 10px rgba(234, 88, 12, 0.25)',
                      }}
                    >
                      <Zap size={13} /> Configure <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {previewDesign && <Quick3DModal design={previewDesign} onClose={() => setPreviewDesign(null)} />}

      <Footer />
    </main>
  )
}