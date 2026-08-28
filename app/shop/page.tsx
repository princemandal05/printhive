'use client'

import { useMemo, useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useStore } from '@/lib/cart-context'
import { createClient } from '@/utils/supabase/client'
import { ROUTES } from '@/lib/routes'
import {
  ShoppingBag,
  Search,
  SlidersHorizontal,
  Star,
  Heart,
  Truck,
  ShieldCheck,
  Plus,
  ArrowRight,
  Sparkles,
  Layers,
  MapPin,
  Clock,
  Printer,
  RotateCcw,
  Zap,
  CheckCircle2,
} from 'lucide-react'

type Product = {
  id: string
  name: string
  price: number
  originalPrice?: number
  category: string
  rating: number
  reviewsCount: number
  seller: string
  stock: number
  image: string
  featured?: boolean
  trending?: boolean
  newest?: boolean
  deliveryDays: string
  material?: string
  printTime?: string
  nearbyHubs?: number
}

const CATEGORIES = [
  'All',
  'Home Décor',
  'Office Accessories',
  'Toys & Miniatures',
  'Personalized Gifts',
  'Cosplay Items',
  'Educational Kits',
]

const MATERIALS = ['All Materials', 'PLA', 'PETG', 'ABS', 'TPU', 'Resin', 'Nylon']

type ProductRow = {
  id: string
  title?: string
  name?: string
  price?: number
  original_price?: number
  category?: string
  rating?: number
  reviews_count?: number
  seller_name?: string
  seller?: string
  stock?: number
  image_url?: string
  image?: string
  featured?: boolean
  trending?: boolean
  newest?: boolean
  delivery_days?: string
  created_at?: string
  material?: string
}

function ShopReviewBanner() {
  const searchParams = useSearchParams()
  const isReviewed = searchParams?.get('reviewed') === 'true'

  if (!isReviewed) return null

  return (
    <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '14px 20px', borderRadius: 12, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ fontSize: 22 }}>🎉</div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#059669', marginBottom: 2 }}>
          Thank You For Your Review!
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-sub)' }}>
          Your rating and feedback have been published. Explore more trending 3D products below!
        </div>
      </div>
    </div>
  )
}

function parsePrintTimeToMinutes(timeStr?: string): number {
  if (!timeStr) return 9999
  const hoursMatch = timeStr.match(/(\d+)\s*h/i)
  const minsMatch = timeStr.match(/(\d+)\s*m/i)
  const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0
  const mins = minsMatch ? parseInt(minsMatch[1], 10) : 0
  return hours * 60 + mins
}

function ShopContent() {
  const searchParams = useSearchParams()
  const qParam = searchParams?.get('q') || ''
  const catParam = searchParams?.get('category') || 'All'

  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useStore()
  const [products, setProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [search, setSearch] = useState(qParam)
  const [category, setCategory] = useState(catParam)
  const [selectedMaterial, setSelectedMaterial] = useState('All Materials')
  const [quickFilter, setQuickFilter] = useState<'all' | 'nearby' | 'fast' | 'best'>('all')
  const [sort, setSort] = useState('popular')
  const [toastMsg, setToastMsg] = useState('')

  const fetchProducts = async () => {
    const supabase = createClient()
    setLoadingProducts(true)
    setFetchError(null)

    try {
      let allRows: ProductRow[] = []
      let from = 0
      const limit = 1000
      let hasMore = true

      while (hasMore) {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false })
          .order('id', { ascending: false })
          .range(from, from + limit - 1)

        if (error) throw error

        if (data && data.length > 0) {
          allRows = allRows.concat(data as ProductRow[])
          if (data.length < limit) hasMore = false
          else from += limit
        } else {
          hasMore = false
        }
      }

      let mappedDbProducts: Product[] = []
      if (allRows.length > 0) {
        mappedDbProducts = allRows.map((item: ProductRow) => {
          const itemMat = item.material || (item.category === 'Cosplay Items' ? 'ABS' : item.category === 'Toys & Miniatures' ? 'PLA' : undefined)
          const printTimeStr = (item as any).print_time || (item as any).estimated_print_time || undefined
          const nearbyCount = (item as any).nearby_hubs != null ? Number((item as any).nearby_hubs) : undefined

          return {
            id: item.id,
            name: item.title || item.name || 'Custom 3D Product',
            price: Number(item.price ?? 499),
            originalPrice: item.original_price != null ? Number(item.original_price) : undefined,
            category: item.category || 'Home Décor',
            rating: item.rating !== null && item.rating !== undefined ? Number(item.rating) : 0,
            reviewsCount: item.reviews_count !== null && item.reviews_count !== undefined ? Number(item.reviews_count) : 0,
            seller: item.seller_name || item.seller || 'PrintHive Hub',
            stock: Number(item.stock ?? 10),
            image: item.image_url || item.image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
            featured: Boolean(item.featured),
            trending: Boolean(item.trending),
            newest: Boolean(item.newest),
            deliveryDays: item.delivery_days || 'Tomorrow',
            material: itemMat,
            printTime: printTimeStr,
            nearbyHubs: nearbyCount,
          }
        })
      }

      setProducts(mappedDbProducts)
    } catch (err) {
      console.error('Failed to fetch marketplace products:', err)
      setFetchError(err instanceof Error ? err.message : 'Failed to retrieve products from database.')
    } finally {
      setLoadingProducts(false)
    }
  }

  useEffect(() => {
    if (qParam) setSearch(qParam)
  }, [qParam])

  useEffect(() => {
    if (catParam) setCategory(catParam)
  }, [catParam])

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleAddToCart = (e: React.MouseEvent, p: Product) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart({
      id: p.id,
      name: p.name,
      seller: p.seller,
      price: p.price,
      stock: p.stock,
      image: p.image,
    })
    setToastMsg(`Added "${p.name}" to cart!`)
    setTimeout(() => setToastMsg(''), 2500)
  }

  const handleToggleWishlist = (e: React.MouseEvent, p: Product) => {
    e.preventDefault()
    e.stopPropagation()
    const saved = isInWishlist(p.id)
    if (saved) {
      removeFromWishlist(p.id)
      setToastMsg(`Removed from wishlist`)
    } else {
      addToWishlist({
        id: p.id,
        name: p.name,
        price: p.price,
        type: 'product',
      })
      setToastMsg(`Saved to Wishlist!`)
    }
    setTimeout(() => setToastMsg(''), 2500)
  }

  const filtered = useMemo(() => {
    return products
      .filter((p) => {
        const matchesSearch =
          !search.trim() ||
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.seller.toLowerCase().includes(search.toLowerCase()) ||
          p.category.toLowerCase().includes(search.toLowerCase()) ||
          (p.material && p.material.toLowerCase().includes(search.toLowerCase()))

        const matchesCategory = category === 'All' || p.category.toLowerCase() === category.toLowerCase()

        const matchesMaterial =
          selectedMaterial === 'All Materials' ||
          (p.material && p.material.toUpperCase() === selectedMaterial.toUpperCase())

        let matchesQuick = true
        if (quickFilter === 'nearby') matchesQuick = p.nearbyHubs !== undefined && p.nearbyHubs >= 1
        if (quickFilter === 'fast') matchesQuick = p.deliveryDays.toLowerCase().includes('tomorrow') || p.deliveryDays.includes('1-2')
        if (quickFilter === 'best') matchesQuick = p.rating >= 4.8

        return matchesSearch && matchesCategory && matchesMaterial && matchesQuick
      })
      .sort((a, b) => {
        if (sort === 'rating') return b.rating - a.rating
        if (sort === 'price-low') return a.price - b.price
        if (sort === 'price-high') return b.price - a.price
        if (sort === 'print-time') return parsePrintTimeToMinutes(a.printTime) - parsePrintTimeToMinutes(b.printTime)
        return 0
      })
  }, [products, search, category, selectedMaterial, quickFilter, sort])

  return (
    <div style={{ maxWidth: 1240, margin: '0 auto', padding: '32px 20px 80px' }}>
      <Suspense fallback={null}>
        <ShopReviewBanner />
      </Suspense>

      {/* TOAST NOTIFICATION */}
      {toastMsg && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000, background: 'var(--text-main)', color: 'var(--bg-card)', padding: '12px 22px', borderRadius: 99, fontSize: 13.5, fontWeight: 700, boxShadow: '0 10px 30px rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle2 size={16} color="#10B981" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.5px' }}>
              3D Print Marketplace
            </h1>
            <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', border: '1px solid rgba(16, 185, 129, 0.3)', fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 99, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <ShieldCheck size={13} /> Razorpay Escrow Protected
            </span>
          </div>
          <p style={{ color: 'var(--text-sub)', fontSize: 14.5, margin: 0, maxWidth: 640, lineHeight: 1.5 }}>
            Discover precision-printed products made on-demand by verified printer owners across India.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <Link
            href={ROUTES.printOnDemand}
            style={{
              background: 'var(--bg-card)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-color)',
              padding: '9px 16px',
              borderRadius: 99,
              fontSize: 13,
              fontWeight: 700,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Zap size={14} color="#ea580c" /> Slicer &amp; Print Custom STL
          </Link>

          <Link
            href={ROUTES.requests}
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
            <Plus size={15} /> Post CAD Brief
          </Link>
        </div>
      </div>

      {/* SEARCH, SORT & ADVANCED FILTERS PANEL */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 20, padding: '20px 22px', marginBottom: 32, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
        {/* Top Search & Sort Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 12, marginBottom: 16 }}>
          <div style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Search size={17} color="#ea580c" />
            <input
              type="text"
              placeholder="Search products, materials (e.g. PLA, TPU), or makers..."
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
            <option value="price-low">💰 Price: Low to High</option>
            <option value="price-high">💎 Price: High to Low</option>
            <option value="print-time">⚡ Fastest Print Time</option>
          </select>
        </div>

        {/* Categories Bar */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
          {CATEGORIES.map((cat) => {
            const active = category === cat
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                style={{
                  padding: '7px 14px',
                  borderRadius: 99,
                  fontSize: 12.5,
                  fontWeight: active ? 800 : 600,
                  border: active ? '1px solid #ea580c' : '1px solid var(--border-color)',
                  background: active ? '#ea580c' : 'var(--bg-card-hover)',
                  color: active ? '#FFFFFF' : 'var(--text-main)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {cat}
              </button>
            )
          })}
        </div>

        {/* Secondary Filter Badges: Materials & Quick Intent Filters */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, paddingTop: 14, borderTop: '1px solid var(--border-color)' }}>
          {/* Material Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
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

          {/* Quick Filters: Nearby / Fastest / Best Rated */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => setQuickFilter(quickFilter === 'nearby' ? 'all' : 'nearby')}
              style={{
                padding: '4px 10px',
                borderRadius: 99,
                fontSize: 11.5,
                fontWeight: quickFilter === 'nearby' ? 800 : 600,
                border: quickFilter === 'nearby' ? '1px solid #10B981' : '1px solid var(--border-color)',
                background: quickFilter === 'nearby' ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                color: quickFilter === 'nearby' ? '#10B981' : 'var(--text-sub)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <MapPin size={12} /> Near You
            </button>

            <button
              type="button"
              onClick={() => setQuickFilter(quickFilter === 'fast' ? 'all' : 'fast')}
              style={{
                padding: '4px 10px',
                borderRadius: 99,
                fontSize: 11.5,
                fontWeight: quickFilter === 'fast' ? 800 : 600,
                border: quickFilter === 'fast' ? '1px solid #3B82F6' : '1px solid var(--border-color)',
                background: quickFilter === 'fast' ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                color: quickFilter === 'fast' ? '#3B82F6' : 'var(--text-sub)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Truck size={12} /> Fastest Delivery
            </button>

            <button
              type="button"
              onClick={() => setQuickFilter(quickFilter === 'best' ? 'all' : 'best')}
              style={{
                padding: '4px 10px',
                borderRadius: 99,
                fontSize: 11.5,
                fontWeight: quickFilter === 'best' ? 800 : 600,
                border: quickFilter === 'best' ? '1px solid #F59E0B' : '1px solid var(--border-color)',
                background: quickFilter === 'best' ? 'rgba(245, 158, 11, 0.1)' : 'transparent',
                color: quickFilter === 'best' ? '#F59E0B' : 'var(--text-sub)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Star size={12} fill="#F59E0B" color="#F59E0B" /> Top Rated
            </button>
          </div>
        </div>
      </div>

      {/* LOADING SKELETON STATE */}
      {loadingProducts && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
          {[1, 2, 3, 4, 5, 6].map((sk) => (
            <div key={sk} style={{ background: 'var(--bg-card)', borderRadius: 20, border: '1px solid var(--border-color)', height: 380, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ height: 210, borderRadius: 14, background: 'var(--bg-card-hover)' }} />
              <div style={{ height: 16, width: '60%', borderRadius: 4, background: 'var(--bg-card-hover)' }} />
              <div style={{ height: 20, width: '90%', borderRadius: 4, background: 'var(--bg-card-hover)' }} />
              <div style={{ height: 36, marginTop: 'auto', borderRadius: 8, background: 'var(--bg-card-hover)' }} />
            </div>
          ))}
        </div>
      )}

      {/* FETCH ERROR STATE WITH RETRY */}
      {!loadingProducts && fetchError && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 24, padding: '48px 24px', textAlign: 'center', maxWidth: 500, margin: '40px auto' }}>
          <div style={{ width: 56, height: 56, borderRadius: 18, background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#EF4444' }}>
            <SlidersHorizontal size={24} />
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-main)', marginBottom: 8 }}>
            Unable to Load Marketplace Products
          </h3>
          <p style={{ fontSize: 13.5, color: 'var(--text-sub)', marginBottom: 24, lineHeight: 1.6 }}>
            {fetchError}
          </p>
          <button
            type="button"
            onClick={fetchProducts}
            style={{
              background: '#ea580c',
              color: '#fff',
              border: 'none',
              padding: '10px 22px',
              borderRadius: 99,
              fontSize: 13,
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <RotateCcw size={14} /> Retry Loading
          </button>
        </div>
      )}

      {/* EMPTY RESULTS STATE */}
      {!loadingProducts && !fetchError && filtered.length === 0 && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 24, padding: '60px 24px', textAlign: 'center', maxWidth: 500, margin: '40px auto' }}>
          <div style={{ width: 56, height: 56, borderRadius: 18, background: 'rgba(234, 88, 12, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#ea580c' }}>
            <SlidersHorizontal size={24} />
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-main)', marginBottom: 8 }}>
            No Matching 3D Products Found
          </h3>
          <p style={{ fontSize: 13.5, color: 'var(--text-sub)', marginBottom: 24, lineHeight: 1.6 }}>
            Try broadening your search query, changing the material filter, or resetting categories.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch('')
              setCategory('All')
              setSelectedMaterial('All Materials')
              setQuickFilter('all')
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
            <RotateCcw size={14} /> Reset All Filters
          </button>
        </div>
      )}

      {/* PRECISION 3D MANUFACTURING PRODUCT GRID */}
      {!loadingProducts && filtered.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
          {filtered.map((product) => {
            const isWishlisted = isInWishlist(product.id)
            return (
              <div
                key={product.id}
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
                {/* 3D PREVIEW / RENDER IMAGE */}
                <div style={{ height: 210, width: '100%', position: 'relative', background: 'var(--bg-card-hover)', overflow: 'hidden' }}>
                  <img
                    src={product.image}
                    alt={product.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />

                  {/* Category Pill */}
                  <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(15, 23, 42, 0.85)', color: '#fff', fontSize: 10.5, fontWeight: 800, padding: '3px 9px', borderRadius: 99, backdropFilter: 'blur(6px)' }}>
                    {product.category}
                  </div>

                  {/* Wishlist Button */}
                  <button
                    type="button"
                    onClick={(e) => handleToggleWishlist(e, product)}
                    aria-label="Save to Wishlist"
                    style={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      background: 'rgba(255, 255, 255, 0.95)',
                      border: 'none',
                      borderRadius: '50%',
                      width: 34,
                      height: 34,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
                    }}
                  >
                    <Heart size={15} color={isWishlisted ? '#EF4444' : '#64748B'} fill={isWishlisted ? '#EF4444' : 'none'} />
                  </button>
                </div>

                {/* PRODUCT CARD BODY */}
                <div style={{ padding: '18px 18px 20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    {/* Seller & Rating Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: 11.5, color: 'var(--text-sub)', fontWeight: 700 }}>
                        {product.seller}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 800, color: '#D97706', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Star size={12} fill="#D97706" color="#D97706" /> {product.rating} ({product.reviewsCount})
                      </span>
                    </div>

                    {/* Product Name Link */}
                    <Link
                      href={`/shop/${product.id}`}
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      <h3 style={{ fontSize: 15.5, fontWeight: 800, color: 'var(--text-main)', margin: '0 0 10px', lineHeight: 1.35, minHeight: 42, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {product.name}
                      </h3>
                    </Link>

                    {/* Manufacturing Specs: Material • Print Time & Local Availability */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                      <span style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Layers size={11} color="#ea580c" /> {product.material} • {product.printTime}
                      </span>

                      <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                        <Printer size={11} /> {product.nearbyHubs} nearby
                      </span>
                    </div>
                  </div>

                  <div>
                    {/* Pricing & Actions */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14, borderTop: '1px solid var(--border-color)' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                          <span style={{ fontSize: 20, fontWeight: 900, color: '#ea580c' }}>
                            ₹{product.price}
                          </span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span style={{ fontSize: 12.5, color: 'var(--text-sub)', textDecoration: 'line-through' }}>
                              ₹{product.originalPrice}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Dual Action Buttons: [View Details] & [Add to Cart] */}
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          type="button"
                          onClick={(e) => handleAddToCart(e, product)}
                          style={{
                            background: '#ea580c',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: 99,
                            padding: '7px 14px',
                            fontSize: 12,
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            boxShadow: '0 3px 10px rgba(234, 88, 12, 0.25)',
                          }}
                        >
                          <ShoppingBag size={13} /> Add
                        </button>

                        <Link
                          href={`/shop/${product.id}`}
                          style={{
                            background: 'var(--bg-card-hover)',
                            color: 'var(--text-main)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 99,
                            padding: '7px 12px',
                            fontSize: 12,
                            fontWeight: 700,
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          View <ArrowRight size={13} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function ShopPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-canvas)', color: 'var(--text-main)', fontFamily: 'inherit', transition: 'background 0.3s ease' }}>
      <Navbar />
      <Suspense fallback={<div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-sub)' }}>Loading 3D Marketplace...</div>}>
        <ShopContent />
      </Suspense>
      <Footer />
    </main>
  )
}