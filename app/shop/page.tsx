'use client'

import { useMemo, useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useStore } from '@/lib/cart-context'
import { createClient } from '@/utils/supabase/client'
import type { User } from '@supabase/supabase-js'
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
}

function ShopReviewBanner() {
  const searchParams = useSearchParams()
  const isReviewed = searchParams?.get('reviewed') === 'true'

  if (!isReviewed) return null

  return (
    <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '14px 20px', borderRadius: 8, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ fontSize: 22 }}>🎉</div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#059669', marginBottom: 2 }}>
          Thank You For Your Review!
        </div>
        <div style={{ fontSize: 12, color: '#64748B' }}>
          Your rating and feedback have been published. Explore more trending 3D products below!
        </div>
      </div>
    </div>
  )
}

export default function ShopPage() {
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useStore()
  const [products, setProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [sort, setSort] = useState('popular')
  const [toastMsg, setToastMsg] = useState('')
  const [userRole, setUserRole] = useState<string | null>(null)
  const [roleLoading, setRoleLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    let isMounted = true
    let activeRequestId = 0

    async function fetchProducts() {
      try {
        let allRows: ProductRow[] = []
        let from = 0
        const limit = 1000
        let hasMore = true

        while (hasMore) {
          if (!isMounted) break

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
          mappedDbProducts = allRows.map((item: ProductRow) => ({
            id: item.id,
            name: item.title || item.name || 'Untitled Product',
            price: Number(item.price ?? 499),
            originalPrice: item.original_price != null ? Number(item.original_price) : undefined,
            category: item.category || 'Home Décor',
            rating: Number(item.rating ?? 4.9),
            reviewsCount: Number(item.reviews_count ?? 12),
            seller: item.seller_name || item.seller || 'PrintHive Verified',
            stock: Number(item.stock ?? 10),
            image: item.image_url || item.image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
            featured: Boolean(item.featured),
            trending: Boolean(item.trending),
            newest: Boolean(item.newest),
            deliveryDays: item.delivery_days || '2-4 Days',
          }))
        }

        if (isMounted) {
          setProducts(mappedDbProducts)
        }
      } catch (err) {
        console.error('Error fetching products from Supabase:', err)
        if (isMounted) {
          setProducts([])
        }
      } finally {
        if (isMounted) setLoadingProducts(false)
      }
    }

    fetchProducts()

    async function fetchRole(user: User | null, reqId?: number) {
      const requestId = reqId || ++activeRequestId
      if (!user) {
        if (isMounted && requestId === activeRequestId) {
          setUserRole(null)
          setRoleLoading(false)
        }
        return
      }
      if (isMounted && requestId === activeRequestId) {
        setRoleLoading(true)
      }
      try {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
        if (isMounted && requestId === activeRequestId) {
          setUserRole(profile?.role || null)
        }
      } catch {
        if (isMounted && requestId === activeRequestId) {
          setUserRole(null)
        }
      } finally {
        if (isMounted && requestId === activeRequestId) {
          setRoleLoading(false)
        }
      }
    }

    const initialReqId = ++activeRequestId
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (isMounted) fetchRole(user, initialReqId)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) fetchRole(session?.user || null)
    })

    return () => {
      isMounted = false
      activeRequestId++
      subscription.unsubscribe()
    }
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
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.seller.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase())

      const matchesCategory = category === 'All' || p.category.toLowerCase() === category.toLowerCase()

      return matchesSearch && matchesCategory
    }).sort((a, b) => {
      if (sort === 'rating') return b.rating - a.rating
      if (sort === 'price-low') return a.price - b.price
      if (sort === 'price-high') return b.price - a.price
      return 0
    })
  }, [products, search, category, sort])

  return (
    <main style={{ minHeight: '100vh', background: '#FAF8F5', color: '#0F172A', fontFamily: 'inherit' }}>
      <Navbar />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 20px 60px' }}>
        <Suspense fallback={null}>
          <ShopReviewBanner />
        </Suspense>

        {/* TOAST ALERT NOTIFICATION */}
        {toastMsg && (
          <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000, background: '#0F172A', color: '#fff', padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 700, boxShadow: '0 8px 30px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>{toastMsg}</span>
          </div>
        )}

        {/* HEADER SECTION */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.4px' }}>
                Physical 3D Marketplace
              </h1>
              <span style={{ background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6 }}>
                Escrow Protected
              </span>
            </div>
            <p style={{ color: '#64748B', fontSize: 14, margin: 0, maxWidth: 640 }}>
              Browse ready-made physical 3D printed items from verified creators and local print hubs across India.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Link
              href="/print-on-demand"
              style={{
                background: '#FFFFFF',
                color: '#0F172A',
                border: '1px solid #CBD5E1',
                padding: '8px 14px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              Print Custom STL
            </Link>

            <Link
              href="/requests/new"
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
              <Plus size={15} /> Request Custom 3D
            </Link>
          </div>
        </div>

        {/* SEARCH & FILTER CONTROLS */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: 16, marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 12, marginBottom: 12 }}>
            <div style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: 8, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Search size={16} color="#94A3B8" />
              <input
                type="text"
                placeholder="Search products, materials, or makers..."
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
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {CATEGORIES.map((cat) => {
              const active = category === cat
              return (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: active ? 700 : 500,
                    border: active ? '1px solid #0F172A' : '1px solid #E2E8F0',
                    background: active ? '#0F172A' : '#F8FAFC',
                    color: active ? '#FFFFFF' : '#475569',
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

        {/* PRODUCTS GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 20 }}>
          {filtered.map((product) => {
            const isWishlisted = isInWishlist(product.id)
            return (
              <div
                key={product.id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: 12,
                  border: '1px solid #E2E8F0',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                }}
              >
                {/* IMAGE CONTAINER */}
                <div style={{ height: 210, width: '100%', position: 'relative', background: '#F1F5F9', overflow: 'hidden' }}>
                  <img
                    src={product.image}
                    alt={product.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />

                  {/* Category Badge */}
                  <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(15, 23, 42, 0.85)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4, backdropFilter: 'blur(4px)' }}>
                    {product.category}
                  </div>

                  {/* Wishlist Button */}
                  <button
                    type="button"
                    onClick={(e) => handleToggleWishlist(e, product)}
                    style={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      background: 'rgba(255, 255, 255, 0.9)',
                      border: 'none',
                      borderRadius: '50%',
                      width: 32,
                      height: 32,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    }}
                  >
                    <Heart size={15} color={isWishlisted ? '#EF4444' : '#64748B'} fill={isWishlisted ? '#EF4444' : 'none'} />
                  </button>
                </div>

                {/* CONTENT BODY */}
                <div style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>{product.seller}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#D97706', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Star size={11} fill="#D97706" color="#D97706" /> {product.rating} ({product.reviewsCount})
                      </span>
                    </div>

                    <Link
                      href={`/shop/${product.id}`}
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', margin: '0 0 10px', lineHeight: 1.35, height: 40, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {product.name}
                      </h3>
                    </Link>
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#64748B', marginBottom: 12 }}>
                      <Truck size={12} />
                      <span>{product.deliveryDays} doorstep delivery</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid #F1F5F9' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                          <span style={{ fontSize: 18, fontWeight: 900, color: '#FF6B35' }}>
                            ₹{product.price}
                          </span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span style={{ fontSize: 12, color: '#94A3B8', textDecoration: 'line-through' }}>
                              ₹{product.originalPrice}
                            </span>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          type="button"
                          onClick={(e) => handleAddToCart(e, product)}
                          style={{
                            background: '#0F172A',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: 6,
                            padding: '6px 12px',
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <ShoppingBag size={13} /> Add
                        </button>

                        <Link
                          href={`/shop/${product.id}`}
                          style={{
                            background: '#F1F5F9',
                            color: '#0F172A',
                            border: '1px solid #CBD5E1',
                            borderRadius: 6,
                            padding: '6px 10px',
                            fontSize: 12,
                            fontWeight: 700,
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                          }}
                        >
                          <ArrowRight size={13} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <Footer />
    </main>
  )
}