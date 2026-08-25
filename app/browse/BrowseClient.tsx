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
}

const FALLBACK_CATEGORIES = ['Toys & Games', 'Home & Office', 'Home & Decor', 'Personalized', 'Repair Parts']

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
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: 12,
          padding: 22,
          maxWidth: 640,
          width: '100%',
          boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#EA580C', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              WebGL 3D Orbit Inspection
            </span>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: '2px 0 0' }}>{design.title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#F1F5F9',
              color: '#0F172A',
              border: 'none',
              borderRadius: 6,
              width: 28,
              height: 28,
              fontSize: 14,
              cursor: 'pointer',
              fontWeight: 700,
            }}
          >
            ✕
          </button>
        </div>

        {/* 3D WebGL Viewport */}
        <div style={{ width: '100%', borderRadius: 8, overflow: 'hidden', border: '1px solid #E2E8F0' }}>
          <ThreeViewer title={design.title} modelUrl={modelUrl} height={360} />
        </div>

        {/* Action Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
          <Link
            href={`/designs/${design.id}`}
            style={{
              background: '#0F172A',
              color: '#FFFFFF',
              padding: '8px 16px',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 700,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            Configure Order (₹{design.price}) <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function BrowseClient({ designs = [] }: { designs: DesignRow[] }) {
  const [modelList, setModelList] = useState<DesignRow[]>(designs)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [sort, setSort] = useState('popular')
  const [previewDesign, setPreviewDesign] = useState<DesignRow | null>(null)

  // Real-time client-side sync with Supabase
  useEffect(() => {
    const supabase = createClient()
    let isMounted = true

    async function fetchLatestDesigns() {
      try {
        const { data, error } = await supabase
          .from('designs')
          .select('id, title, description, file_url, thumbnail_url, price, tags, is_public, designer_id, created_at')
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
            return {
              id: d.id,
              title: d.title || '3D Model',
              price: Number(d.price ?? 0),
              category: tags[0] || 'Toys & Games',
              rating: 5,
              rating_count: 1,
              thumbnail_url: d.thumbnail_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
              file_url: d.file_url || '',
              designer: { full_name: profileMap[d.designer_id] || 'PrintHive Creator' },
            }
          })

          setModelList(parsed)
        }
      } catch (err) {
        console.warn('Live designs fetch warning:', err)
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

        const q = search.toLowerCase().trim()
        const matchesSearch =
          !q ||
          d.title?.toLowerCase().includes(q) ||
          (d.category && d.category.toLowerCase().includes(q)) ||
          (d.designer?.full_name && d.designer.full_name.toLowerCase().includes(q))

        return matchesCategory && matchesSearch
      })
      .sort((a, b) => {
        if (sort === 'rating') return b.rating - a.rating
        if (sort === 'price-low') return a.price - b.price
        if (sort === 'price-high') return b.price - a.price
        return 0
      })
  }, [modelList, search, category, sort])

  return (
    <main style={{ minHeight: '100vh', background: '#FAF8F5', color: '#0F172A', fontFamily: 'inherit' }}>
      <Navbar />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 20px 60px' }}>
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.4px' }}>
                3D CAD Model Repository
              </h1>
              <span style={{ background: '#F1F5F9', color: '#475569', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6, border: '1px solid #E2E8F0' }}>
                STL & 3MF
              </span>
            </div>
            <p style={{ color: '#64748B', fontSize: 14, margin: 0, maxWidth: 680 }}>
              Inspect geometry in real-time WebGL, estimate slicing costs, or order on-demand prints from verified local hubs.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Link
              href="/dashboard/designer/upload"
              style={{
                background: '#FF6B35',
                color: '#FFFFFF',
                padding: '8px 16px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Plus size={15} /> Upload 3D Model
            </Link>
          </div>
        </div>

        {/* SEARCH & FILTER BAR */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: 16, marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 12, marginBottom: 12 }}>
            <div style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: 8, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Search size={16} color="#94A3B8" />
              <input
                type="text"
                placeholder="Search models, creators, or keywords..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%', background: 'transparent', border: 'none', color: '#0F172A', fontSize: 13, outline: 'none' }}
              />
            </div>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: 8, padding: '8px 12px', color: '#0F172A', fontSize: 13, outline: 'none', fontWeight: 600, cursor: 'pointer' }}
            >
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="price-low">Royalty: Low to High</option>
              <option value="price-high">Royalty: High to Low</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {categories.map((cat) => {
              const active = category.toLowerCase() === cat.toLowerCase()
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  style={{
                    background: active ? '#0F172A' : '#F8FAFC',
                    color: active ? '#FFFFFF' : '#475569',
                    border: '1px solid ' + (active ? '#0F172A' : '#E2E8F0'),
                    borderRadius: 6,
                    padding: '5px 12px',
                    fontSize: 12,
                    fontWeight: active ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {cat}
                </button>
              )
            })}
          </div>
        </div>

        {/* 3D MODEL GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 20 }}>
          {filteredDesigns.map((design) => (
            <div
              key={design.id}
              style={{
                background: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transition: 'border-color 0.15s, box-shadow 0.15s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              }}
            >
              {/* 3D PREVIEW THUMBNAIL */}
              <div style={{ height: 200, width: '100%', position: 'relative', background: '#0F172A', overflow: 'hidden' }}>
                <img
                  src={design.thumbnail_url || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80'}
                  alt={design.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />

                {/* Category Pill */}
                <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(15, 23, 42, 0.85)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4, backdropFilter: 'blur(4px)' }}>
                  {design.category || 'Toys & Games'}
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
                    backdropFilter: 'blur(6px)',
                    color: '#fff',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: 6,
                    padding: '5px 10px',
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <Eye size={13} /> 3D View
                </button>
              </div>

              {/* CARD BODY */}
              <div style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>By {design.designer?.full_name || 'PrintHive Creator'}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#D97706', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Star size={11} fill="#D97706" color="#D97706" /> {design.rating}
                    </span>
                  </div>

                  <Link
                    href={`/designs/${design.id}`}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', margin: '0 0 10px', lineHeight: 1.35, height: 40, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {design.title}
                    </h3>
                  </Link>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 12, borderTop: '1px solid #F1F5F9' }}>
                  <div>
                    <div style={{ fontSize: 10, color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Royalty</div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: design.price === 0 ? '#059669' : '#EA580C' }}>
                      {design.price === 0 ? 'Free' : `₹${design.price}`}
                    </div>
                  </div>

                  <Link
                    href={`/designs/${design.id}`}
                    style={{
                      background: '#0F172A',
                      color: '#FFFFFF',
                      borderRadius: 6,
                      padding: '7px 14px',
                      fontSize: 12,
                      fontWeight: 700,
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    Configure <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {previewDesign && <Quick3DModal design={previewDesign} onClose={() => setPreviewDesign(null)} />}

      <Footer />
    </main>
  )
}