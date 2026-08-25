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
    <main style={{ minHeight: '100vh', background: '#FAF6F1', color: '#1A1A2E', fontFamily: 'inherit' }}>
      <Navbar />

      <div style={{ maxWidth: 1360, margin: '0 auto', padding: '32px 24px 80px' }}>
        <Suspense fallback={null}>
          <ShopReviewBanner />
        </Suspense>

        {/* TOAST ALERT NOTIFICATION */}
        {toastMsg && (
          <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000, background: '#1A1A2E', color: '#fff', padding: '12px 22px', borderRadius: 9999, fontSize: 13.5, fontWeight: 700, boxShadow: '0 8px 30px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>{toastMsg}</span>
          </div>
        )}

        {/* HEADER SECTION (printhive.org style) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
          <div>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#F97316', textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Creator&apos;s Studio & Marketplace
            </span>
            <h1 style={{ fontFamily: 'var(--font-fraunces), Fraunces, Georgia, serif', fontSize: 32, fontWeight: 800, color: '#1A1A2E', margin: '4px 0 8px', letterSpacing: '-0.5px' }}>
              Handcrafted 3D Creations & Hampers
            </h1>
            <p style={{ color: '#64748B', fontSize: 14.5, margin: 0, maxWidth: 640 }}>
              Paint-your-own 3D printed hampers, physical designer models, and bespoke creations crafted by verified makers across India.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Link
              href="/print-on-demand"
              style={{
                background: '#FFFFFF',
                color: '#1A1A2E',
                border: '1px solid #E2E8F0',
                padding: '10px 18px',
                borderRadius: 9999,
                fontSize: 13.5,
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}
            >
              Custom Slicer
            </Link>

            <Link
              href="/requests/new"
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
              <Plus size={16} /> Request Custom 3D
            </Link>
          </div>
        </div>

        {/* SEARCH & FILTER CONTROLS */}
        <div style={{ background: '#FFFFFF', border: '1px solid #F0ECE6', borderRadius: 24, padding: 20, marginBottom: 36, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 14, marginBottom: 16 }}>
            <div style={{ background: '#FAF6F1', border: '1px solid #E2E8F0', borderRadius: 9999, padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Search size={16} color="#94A3B8" />
              <input
                type="text"
                placeholder="Search creations, paint kits, or makers..."
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
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {CATEGORIES.map((cat) => {
              const active = category === cat
              return (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: 9999,
                    fontSize: 12.5,
                    fontWeight: active ? 800 : 600,
                    border: active ? '1px solid #F97316' : '1px solid #E2E8F0',
                    background: active ? '#F97316' : '#FAF6F1',
                    color: active ? '#FFFFFF' : '#64748B',
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

        {/* PRODUCTS GRID (printhive.org rounded-3xl cards) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
          {filtered.map((product) => {
            const isWishlisted = isInWishlist(product.id)
            return (
              <div
                key={product.id}
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
                {/* IMAGE CONTAINER */}
                <div style={{ height: 230, width: '100%', position: 'relative', background: '#F8FAFC', overflow: 'hidden' }}>
                  <img
                    src={product.image}
                    alt={product.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />

                  {/* Category & Difficulty Badge */}
                  <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6 }}>
                    <div style={{ background: 'rgba(255, 255, 255, 0.92)', color: '#7C3AED', fontSize: 10.5, fontWeight: 800, padding: '4px 10px', borderRadius: 9999, backdropFilter: 'blur(6px)', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                      {product.category}
                    </div>
                  </div>

                  {/* Wishlist Button */}
                  <button
                    type="button"
                    onClick={(e) => handleToggleWishlist(e, product)}
                    style={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      background: 'rgba(255, 255, 255, 0.92)',
                      border: 'none',
                      borderRadius: '50%',
                      width: 34,
                      height: 34,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    }}
                  >
                    <Heart size={16} color={isWishlisted ? '#EF4444' : '#64748B'} fill={isWishlisted ? '#EF4444' : 'none'} />
                  </button>
                </div>

                {/* CONTENT BODY */}
                <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600 }}>By {product.seller}</span>
                      <span style={{ fontSize: 12, fontWeight: 800, color: '#D97706', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Star size={12} fill="#D97706" color="#D97706" /> {product.rating} ({product.reviewsCount})
                      </span>
                    </div>

                    <Link
                      href={`/shop/${product.id}`}
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      <h3 style={{ fontFamily: 'var(--font-fraunces), Fraunces, Georgia, serif', fontSize: 17, fontWeight: 700, color: '#1A1A2E', margin: '0 0 10px', lineHeight: 1.3, height: 44, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {product.name}
                      </h3>
                    </Link>
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748B', marginBottom: 16 }}>
                      <Truck size={13} color="#16A34A" />
                      <span>{product.deliveryDays} Delivery · Escrow Guard</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14, borderTop: '1px solid #F0ECE6' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                          <span style={{ fontSize: 20, fontWeight: 900, color: '#F97316' }}>
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
                            background: '#F97316',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: 9999,
                            padding: '8px 16px',
                            fontSize: 13,
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            boxShadow: '0 2px 10px rgba(249,115,22,0.3)',
                          }}
                        >
                          <ShoppingBag size={14} /> Add
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {filtered.length === 0 && !loadingProducts && (
          <div style={{ textAlign: 'center', padding: '64px 20px', background: '#FFFFFF', borderRadius: 24, border: '1px solid #F0ECE6', margin: '40px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎨</div>
            <h3 style={{ fontFamily: 'var(--font-fraunces), Fraunces, Georgia, serif', fontSize: 20, fontWeight: 700, color: '#1A1A2E', margin: '0 0 6px' }}>No creations found</h3>
            <p style={{ fontSize: 14, color: '#64748B', maxWidth: 360, margin: '0 auto 20px' }}>
              Try searching with another keyword or explore our full category list.
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

      <Footer />
    </main>
  )
}