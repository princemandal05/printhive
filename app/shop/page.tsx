'use client'

import { useMemo, useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useStore } from '@/lib/cart-context'
import { createClient } from '@/utils/supabase/client'
import type { User } from '@supabase/supabase-js'

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

const SEED_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Articulated Mechanical Dragon',
    price: 1499,
    originalPrice: 1999,
    category: 'Toys & Miniatures',
    rating: 4.9,
    reviewsCount: 142,
    seller: 'DragonForge 3D',
    stock: 24,
    image: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=800&auto=format&fit=crop&q=80',
    featured: true,
    trending: true,
    deliveryDays: '2-3 Days',
  },
  {
    id: 'prod-2',
    name: 'Cyberpunk LED Desk Organizer',
    price: 899,
    originalPrice: 1200,
    category: 'Office Accessories',
    rating: 4.8,
    reviewsCount: 98,
    seller: 'NexusPrints',
    stock: 15,
    image: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=800&auto=format&fit=crop&q=80',
    trending: true,
    deliveryDays: '1-2 Days',
  },
  {
    id: 'prod-3',
    name: 'Geometric Voronoi Table Lamp',
    price: 2499,
    originalPrice: 3200,
    category: 'Home Décor',
    rating: 5.0,
    reviewsCount: 64,
    seller: 'LuminaCrafts',
    stock: 8,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80',
    featured: true,
    deliveryDays: '3-5 Days',
  },
  {
    id: 'prod-4',
    name: 'Custom Lithophane Photo Frame',
    price: 699,
    originalPrice: 999,
    category: 'Personalized Gifts',
    rating: 4.9,
    reviewsCount: 210,
    seller: 'MemoriesIn3D',
    stock: 50,
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=80',
    newest: true,
    deliveryDays: '2-4 Days',
  },
  {
    id: 'prod-5',
    name: 'Full-Scale Helmet Replica (PETG)',
    price: 3999,
    originalPrice: 4999,
    category: 'Cosplay Items',
    rating: 4.9,
    reviewsCount: 37,
    seller: 'TitanProps',
    stock: 5,
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80',
    featured: true,
    deliveryDays: '4-6 Days',
  },
  {
    id: 'prod-6',
    name: 'Solar System Planetary Gear Model',
    price: 1299,
    originalPrice: 1699,
    category: 'Educational Kits',
    rating: 4.7,
    reviewsCount: 83,
    seller: 'EduPrint Lab',
    stock: 18,
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    deliveryDays: '2-3 Days',
  },
]

const CATEGORIES = [
  'All',
  'Home Décor',
  'Office Accessories',
  'Toys & Miniatures',
  'Personalized Gifts',
  'Cosplay Items',
  'Educational Kits',
]

const STATS = [
  { value: '25K+', label: 'Ready-Made Products' },
  { value: '850+', label: 'Verified Creators' },
  { value: '15+', label: 'Print Categories' },
  { value: '4.9★', label: 'Customer Rating' },
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
    <div style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid #10B981', padding: '18px 24px', borderRadius: 20, marginBottom: 28, display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ fontSize: 32 }}>🎉</div>
      <div>
        <div style={{ fontSize: 16, fontWeight: 900, color: '#10B981', marginBottom: 2 }}>
          Thank You For Your Review!
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-sub)' }}>
          Your rating and feedback have been published. Explore more trending 3D products below!
        </div>
      </div>
    </div>
  )
}

export default function ShopPage() {
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useStore()
  const [products, setProducts] = useState<Product[]>(SEED_PRODUCTS)
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

        if (allRows.length > 0) {
          const mapped: Product[] = allRows.map((item: ProductRow) => ({
            id: item.id,
            name: item.title || item.name || 'Untitled Product',
            price: Number(item.price ?? 499),
            originalPrice: item.original_price != null ? Number(item.original_price) : undefined,
            category: item.category || 'Home Décor',
            rating: Number(item.rating ?? 4.9),
            reviewsCount: Number(item.reviews_count ?? 12),
            seller: item.seller_name || item.seller || 'PrintHive Verified',
            stock: Number(item.stock ?? 10),
            image: item.image_url || item.image || SEED_PRODUCTS[0].image,
            featured: Boolean(item.featured),
            trending: Boolean(item.trending),
            newest: Boolean(item.newest),
            deliveryDays: item.delivery_days || '2-4 Days',
          }))
          if (isMounted) setProducts(mapped)
        }
      } catch (err) {
        console.error('Error fetching products from Supabase:', err)
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
    })
    setToastMsg(`🛒 Added "${p.name}" to cart!`)
    setTimeout(() => setToastMsg(''), 3000)
  }

  const handleToggleWishlist = (e: React.MouseEvent, p: Product) => {
    e.preventDefault()
    e.stopPropagation()
    const saved = isInWishlist(p.id)
    if (saved) {
      removeFromWishlist(p.id)
      setToastMsg(`Removed "${p.name}" from wishlist`)
    } else {
      addToWishlist({
        id: p.id,
        name: p.name,
        price: p.price,
        type: 'product',
      })
      setToastMsg(`❤️ Saved "${p.name}" to Wishlist!`)
    }
    setTimeout(() => setToastMsg(''), 3000)
  }

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.seller.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase())

      const matchesCategory = category === 'All' || p.category === category

      return matchesSearch && matchesCategory
    }).sort((a, b) => {
      if (sort === 'rating') return b.rating - a.rating
      if (sort === 'price-low') return a.price - b.price
      if (sort === 'price-high') return b.price - a.price
      return 0
    })
  }, [products, search, category, sort])

  return (
    <main style={{ minHeight: '100vh', transition: 'background 0.3s ease' }}>
      <Navbar />

      <section className="container section" style={{ maxWidth: 1240, margin: '0 auto', padding: '24px 20px' }}>
        <Suspense fallback={null}>
          <ShopReviewBanner />
        </Suspense>

        {/* TOAST ALERT NOTIFICATION */}
        {toastMsg && (
          <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000, background: '#0F172A', color: '#fff', padding: '10px 20px', borderRadius: 12, fontSize: 13, fontWeight: 800, boxShadow: '0 8px 30px rgba(0,0,0,0.3)', border: '1px solid #FF6B35' }}>
            {toastMsg}
          </div>
        )}

        {/* HERO HEADER */}
        <div style={{ marginBottom: 24 }}>
          <div className="ateion-pill" style={{ marginBottom: 8, fontSize: 11, padding: '4px 12px' }}>
            🛍️ Physical 3D Marketplace
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--text-main)', marginBottom: 6, letterSpacing: '-0.5px' }}>
            Discover Premium 3D Printed Products
          </h1>
          <p style={{ color: 'var(--text-sub)', fontSize: 14, maxWidth: 680, lineHeight: 1.5 }}>
            Browse ready-made physical 3D printed items from verified sellers & local print hubs. Escrow protected delivery right to your doorstep.
          </p>
        </div>

        {/* METRICS STATS BAR */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 28 }}>
          {STATS.map((item) => (
            <div key={item.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 16, padding: '16px 20px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: 22, color: '#FF6B35', fontWeight: 900 }}>{item.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-sub)', fontWeight: 600, marginTop: 2 }}>{item.label}</div>
            </div>
          ))}
        </div>

        {/* SEARCH & CATEGORY FILTER BAR */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 24, padding: 24, marginBottom: 40, boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 20 }}>
            <div style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', borderRadius: 99, padding: '6px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 16 }}>🔍</span>
              <input
                type="text"
                placeholder="Search products, sellers or categories..."
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
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {CATEGORIES.map((cat) => {
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

        {/* PRODUCT CATALOG GRID */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', background: 'var(--bg-card-hover)', borderRadius: 24, border: '2px dashed var(--border-color)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🛒</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-main)', marginBottom: 6 }}>No Products Listed Yet</div>
            <div style={{ fontSize: 14, color: 'var(--text-sub)', marginBottom: 20 }}>
              {roleLoading
                ? 'Loading user permissions...'
                : userRole === 'seller'
                ? 'List your 3D printed items to start selling on the marketplace!'
                : 'Upload a custom model or request a 3D print job directly from verified makers.'}
            </div>
            {roleLoading ? (
              <div style={{ fontSize: 13, color: 'var(--text-sub)', fontWeight: 600 }}>Checking role...</div>
            ) : userRole === 'seller' ? (
              <Link href="/dashboard/seller/products/new" style={{ background: '#FF6B35', color: '#fff', padding: '12px 24px', borderRadius: 12, fontWeight: 800, textDecoration: 'none', display: 'inline-block' }}>
                + Add Product as Seller
              </Link>
            ) : (
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/print-on-demand" style={{ background: '#FF6B35', color: '#fff', padding: '12px 24px', borderRadius: 12, fontWeight: 800, textDecoration: 'none', display: 'inline-block' }}>
                  ⚡ Print Custom File
                </Link>
                <Link href="/requests/new" style={{ background: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border-color)', padding: '12px 24px', borderRadius: 12, fontWeight: 800, textDecoration: 'none', display: 'inline-block' }}>
                  ✏️ Post Custom Request
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {filtered.map((product) => {
              const saved = isInWishlist(product.id)
              return (
                <Link
                  key={product.id}
                  href={`/shop/${product.id}`}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 16,
                    overflow: 'hidden',
                    textDecoration: 'none',
                    color: 'inherit',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                    transition: 'transform 0.2s, boxShadow 0.2s',
                  }}
                >
                  <div style={{ height: 150, width: '100%', position: 'relative', background: '#E2E8F0', overflow: 'hidden' }}>
                    <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(15,23,42,0.85)', color: '#fff', fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 99, backdropFilter: 'blur(4px)' }}>
                      {product.category}
                    </div>
                  </div>
                  <div style={{ padding: 14, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-main)', marginBottom: 8, lineHeight: 1.3, height: 36, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{product.name}</h3>
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: '#FF6B35' }}>₹{product.price}</div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      <Footer />
    </main>
  )
}