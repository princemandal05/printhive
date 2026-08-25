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
    <main style={{ minHeight: '100vh', background: '#FAF6F1', color: '#1A1A2E', fontFamily: 'inherit' }}>
      <Navbar />

      <div style={{ maxWidth: 1360, margin: '0 auto', padding: '32px 24px 80px' }}>
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
          <div>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#F97316', textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Creator&apos;s Shelf · Digital Library
            </span>
            <h1 style={{ fontFamily: 'var(--font-fraunces), Fraunces, Georgia, serif', fontSize: 32, fontWeight: 800, color: '#1A1A2E', margin: '4px 0 8px', letterSpacing: '-0.5px' }}>
              3D CAD Models & Digital Library
            </h1>
            <p style={{ color: '#64748B', fontSize: 14.5, margin: 0, maxWidth: 680 }}>
              Inspect CAD geometry in interactive 360° WebGL, estimate automated slicing costs, or order on-demand prints from verified print hubs.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Link
              href="/dashboard/designer/upload"
              style={{
                background: '#F97316',
                color: '#FFFFFF',
                padding: '10px 20px',
                borderRadius: 9999,
                fontSize: 13.5,
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 4px 14px rgba(249,115,22,0.3)',
              }}
            >
              <Plus size={16} /> Upload 3D Model
            </Link>
          </div>
        </div>

        {/* SEARCH & FILTER BAR */}
        <div style={{ background: '#FFFFFF', border: '1px solid #F0ECE6', borderRadius: 24, padding: 20, marginBottom: 36, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 14, marginBottom: 16 }}>
            <div style={{ background: '#FAF6F1', border: '1px solid #E2E8F0', borderRadius: 9999, padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Search size={16} color="#94A3B8" />
              <input
                type="text"
                placeholder="Search models, creators, or keywords..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%', background: 'transparent', border: 'none', color: '#1A1A2E', fontSize: 13.5, outline: 'none' }}
              />
            </div>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              style={{ background: '#FAF6F1', border: '1px solid #E2E8F0', borderRadius: 9999, padding: '10px 18px', color: '#1A1A2E', fontSize: 13.5, outline: 'none', fontWeight: 600, cursor: 'pointer' }}
            >
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="price-low">Royalty: Low to High</option>
              <option value="price-high">Royalty: High to Low</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {categories.map((cat) => {
              const active = category.toLowerCase() === cat.toLowerCase()
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  style={{
                    background: active ? '#F97316' : '#FAF6F1',
                    color: active ? '#FFFFFF' : '#64748B',
                    border: '1px solid ' + (active ? '#F97316' : '#E2E8F0'),
                    borderRadius: 9999,
                    padding: '8px 18px',
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
        </div>

        {/* 3D MODEL GRID (printhive.org rounded-3xl cards) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
          {filteredDesigns.map((design) => (
            <div
              key={design.id}
              style={{
                background: '#FFFFFF',
                borderRadius: 24,
                border: '1px solid #F0ECE6',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
              }}
            >
              {/* THUMBNAIL CONTAINER */}
              <div style={{ height: 220, width: '100%', position: 'relative', background: '#F8FAFC', overflow: 'hidden' }}>
                <img
                  src={design.thumbnail_url || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'}
                  alt={design.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />

                {/* 3D WebGL Quick Inspect Pill */}
                <button
                  type="button"
                  onClick={() => setPreviewDesign(design)}
                  style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    background: 'rgba(255, 255, 255, 0.94)',
                    color: '#7C3AED',
                    border: 'none',
                    borderRadius: 9999,
                    padding: '6px 12px',
                    fontSize: 11,
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    backdropFilter: 'blur(6px)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  }}
                >
                  <Eye size={13} /> 3D View
                </button>

                {/* Category Badge */}
                <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(255, 255, 255, 0.92)', color: '#F97316', fontSize: 10.5, fontWeight: 800, padding: '4px 10px', borderRadius: 9999, backdropFilter: 'blur(6px)', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                  {design.category || 'CAD Model'}
                </div>
              </div>

              {/* CONTENT BODY */}
              <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600 }}>
                      By {design.designer?.full_name || 'Verified Designer'}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 800, color: '#D97706', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Star size={12} fill="#D97706" color="#D97706" /> {design.rating || 5.0} ({design.rating_count || 12})
                    </span>
                  </div>

                  <Link href={`/designs/${design.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <h3 style={{ fontFamily: 'var(--font-fraunces), Fraunces, Georgia, serif', fontSize: 17, fontWeight: 700, color: '#1A1A2E', margin: '0 0 10px', lineHeight: 1.3, height: 44, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {design.title}
                    </h3>
                  </Link>
                </div>

                <div style={{ paddingTop: 14, borderTop: '1px solid #F0ECE6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: 11, color: '#94A3B8', display: 'block', fontWeight: 600 }}>Designer Royalty</span>
                    <span style={{ fontSize: 20, fontWeight: 900, color: '#F97316' }}>
                      {design.price === 0 ? 'FREE' : `₹${design.price}`}
                    </span>
                  </div>

                  <Link
                    href={`/designs/${design.id}/order`}
                    style={{
                      background: '#F97316',
                      color: '#FFFFFF',
                      borderRadius: 9999,
                      padding: '8px 18px',
                      fontSize: 13,
                      fontWeight: 800,
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      boxShadow: '0 2px 10px rgba(249,115,22,0.3)',
                    }}
                  >
                    Print 3D <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredDesigns.length === 0 && (
          <div style={{ textAlign: 'center', padding: '64px 20px', background: '#FFFFFF', borderRadius: 24, border: '1px solid #F0ECE6', margin: '40px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
            <h3 style={{ fontFamily: 'var(--font-fraunces), Fraunces, Georgia, serif', fontSize: 20, fontWeight: 700, color: '#1A1A2E', margin: '0 0 6px' }}>No 3D Models Found</h3>
            <p style={{ fontSize: 14, color: '#64748B', maxWidth: 360, margin: '0 auto 20px' }}>
              Try another search term or browse all available design categories.
            </p>
            <button
              type="button"
              onClick={() => { setSearch(''); setCategory('All') }}
              style={{ background: '#F97316', color: '#fff', border: 'none', padding: '10px 22px', borderRadius: 9999, fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* QUICK 3D MODAL */}
      {previewDesign && (
        <Quick3DModal design={previewDesign} onClose={() => setPreviewDesign(null)} />
      )}

      <Footer />
    </main>
  )
}