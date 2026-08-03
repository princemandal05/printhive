'use client'

import { useMemo, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useStore } from '@/lib/cart-context'

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

const MOCK_PRODUCTS: Product[] = []

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
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [sort, setSort] = useState('popular')
  const [toastMsg, setToastMsg] = useState('')

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
    return MOCK_PRODUCTS.filter((p) => {
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
  }, [search, category, sort])

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
            <div style={{ fontSize: 14, color: 'var(--text-sub)', marginBottom: 20 }}>Be the first seller to list 3D printed products on the marketplace!</div>
            <Link href="/dashboard/seller/products/new" style={{ background: '#FF6B35', color: '#fff', padding: '12px 24px', borderRadius: 12, fontWeight: 800, textDecoration: 'none', display: 'inline-block' }}>
              + Add Product as Seller
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 28 }}>
            {filtered.map((product) => {
              const saved = isInWishlist(product.id)
              return (
                <Link
                  key={product.id}
                  href={`/shop/${product.id}`}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 24,
                    overflow: 'hidden',
                    textDecoration: 'none',
                    color: 'inherit',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
                    transition: 'transform 0.2s, boxShadow 0.2s',
                  }}
                >
                  <div style={{ height: 210, width: '100%', position: 'relative', background: '#E2E8F0', overflow: 'hidden' }}>
                    <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(15,23,42,0.85)', color: '#fff', fontSize: 11, fontWeight: 800, padding: '4px 12px', borderRadius: 99, backdropFilter: 'blur(4px)' }}>
                      {product.category}
                    </div>
                  </div>
                  <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-main)', marginBottom: 12 }}>{product.name}</h3>
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--text-main)' }}>₹{product.price}</div>
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