'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useStore } from '@/lib/cart-context'
import { createClient } from '@/utils/supabase/client'

type Product = {
  id: string
  name: string
  price: number
  category: string
  rating: number
  seller: string
  stock: number
  description: string
  image: string
  specifications: {
    material: string
    technology: string
    layerHeight: string
    weight: string
    color: string
  }
}

export default function ProductDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params?.id as string
  const { addToCart, addToWishlist, isInWishlist } = useStore()
  const supabase = createClient()

  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [justAdded, setJustAdded] = useState(false)

  useEffect(() => {
    if (!productId) return

    let isMounted = true

    async function loadProductData() {
      setLoading(true)
      try {
        const { data: dbProduct, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .maybeSingle()

        if (error || !dbProduct) {
          if (isMounted) setProduct(null)
          return
        }

        let sellerName = 'PrintHive Verified Seller'
        if (dbProduct.seller_id) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', dbProduct.seller_id)
            .maybeSingle()
          if (profile?.full_name) sellerName = profile.full_name
          else if (profile?.email) sellerName = profile.email.split('@')[0]
        }

        const mapped: Product = {
          id: dbProduct.id,
          name: dbProduct.title || dbProduct.name || '3D Printed Product',
          price: Number(dbProduct.price ?? 499),
          category: dbProduct.category || 'Home Décor',
          rating: 4.9,
          seller: sellerName,
          stock: Number(dbProduct.stock ?? 10),
          description: dbProduct.description || 'Handcrafted 3D printed product built for durability, precision aesthetics, and daily functional use.',
          image: dbProduct.image_url || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
          specifications: {
            material: 'PLA+ / PETG',
            technology: 'FDM Precision Additive',
            layerHeight: '0.16 – 0.20 mm',
            weight: '180 – 350 g',
            color: 'Custom Filament Finish',
          },
        }

        if (isMounted) {
          setProduct(mapped)
        }

        // Fetch related products from database
        const { data: otherRows } = await supabase
          .from('products')
          .select('*')
          .neq('id', productId)
          .limit(4)

        if (otherRows && isMounted) {
          setRelatedProducts(
            otherRows.map((r: any) => ({
              id: r.id,
              name: r.title || r.name || '3D Product',
              price: Number(r.price ?? 499),
              category: r.category || 'Home Décor',
              rating: 4.8,
              seller: 'PrintHive Seller',
              stock: Number(r.stock ?? 10),
              description: r.description || '',
              image: r.image_url || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
              specifications: {
                material: 'PLA',
                technology: 'FDM',
                layerHeight: '0.20 mm',
                weight: '200 g',
                color: 'Black',
              },
            }))
          )
        }
      } catch (err) {
        console.error('Error loading product detail:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadProductData()

    return () => {
      isMounted = false
    }
  }, [productId])

  if (loading) {
    return (
      <main style={{ minHeight: '100vh' }}>
        <Navbar />
        <section className="container section" style={{ maxWidth: 1200, margin: '80px auto', textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>⏳</div>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-main)' }}>Loading Product Details…</h2>
        </section>
        <Footer />
      </main>
    )
  }

  if (!product) {
    return (
      <main style={{ minHeight: '100vh' }}>
        <Navbar />
        <section className="container section" style={{ maxWidth: 1200, margin: '80px auto', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: 'var(--text-main)', marginBottom: 8 }}>Product Not Found</h2>
          <p style={{ color: 'var(--text-sub)', marginBottom: 24 }}>The requested product listing may have been moved or is no longer available.</p>
          <Link href="/shop" className="btn btn-primary" style={{ padding: '12px 24px', borderRadius: 12, textDecoration: 'none', fontWeight: 800 }}>
            ← Back to Physical Shop
          </Link>
        </section>
        <Footer />
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh' }}>
      <Navbar />

      <section className="container section-sm" style={{ maxWidth: 1240, margin: '0 auto', padding: '24px 20px' }}>
        {/* Breadcrumb Navigation */}
        <nav style={{ marginBottom: 24, fontSize: '0.9rem', color: 'var(--text-sub)' }}>
          <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>Home</Link>
          {' / '}
          <Link href="/shop" style={{ textDecoration: 'none', color: 'inherit' }}>Shop</Link>
          {' / '}
          <span style={{ color: 'var(--text-main)', fontWeight: 700 }}>{product.name}</span>
        </nav>

        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 48, alignItems: 'start' }}>
          {/* Product Image Showcase */}
          <div>
            <div
              style={{
                height: 500,
                borderRadius: 20,
                overflow: 'hidden',
                background: '#0F172A',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
                border: '1px solid var(--border-color)',
              }}
            >
              <img
                src={product.image}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#0F172A' }}
              />
            </div>
          </div>

          {/* Product Information */}
          <div>
            <div style={{ display: 'inline-block', background: 'rgba(255,107,53,0.12)', color: '#FF6B35', padding: '4px 12px', borderRadius: 99, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', marginBottom: 12 }}>
              {product.category} • Verified Physical Print
            </div>

            <h1 style={{ fontSize: 32, fontWeight: 900, color: 'var(--text-main)', marginTop: 0, marginBottom: 12, lineHeight: 1.2 }}>
              {product.name}
            </h1>

            <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20, fontSize: 14 }}>
              <span style={{ color: '#F59E0B', fontWeight: 800 }}>★ {product.rating}</span>
              <span style={{ color: 'var(--text-sub)' }}>
                Seller: <strong style={{ color: 'var(--text-main)' }}>{product.seller}</strong>
              </span>
              <span style={{ color: product.stock > 0 ? '#10B981' : '#EF4444', fontWeight: 800 }}>
                {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
              </span>
            </div>

            <div style={{ fontSize: 36, fontWeight: 900, color: '#FF6B35', marginBottom: 24 }}>
              ₹{product.price}
            </div>

            <p style={{ lineHeight: 1.7, color: 'var(--text-sub)', fontSize: 15, marginBottom: 28 }}>
              {product.description}
            </p>

            {/* Quantity Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-main)' }}>Quantity</span>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: 10, overflow: 'hidden', background: 'var(--bg-card)' }}>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  style={{ width: 36, height: 36, background: 'transparent', border: 'none', fontSize: 16, fontWeight: 800, cursor: 'pointer', color: 'var(--text-main)' }}
                >
                  −
                </button>
                <div style={{ width: 44, textAlign: 'center', fontWeight: 800, fontSize: 14, color: 'var(--text-main)' }}>
                  {quantity}
                </div>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  style={{ width: 36, height: 36, background: 'transparent', border: 'none', fontSize: 16, fontWeight: 800, cursor: 'pointer', color: 'var(--text-main)' }}
                >
                  +
                </button>
              </div>
              <span style={{ fontSize: 13, color: 'var(--text-sub)' }}>{product.stock} available</span>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 32 }}>
              <button
                type="button"
                onClick={() => {
                  addToCart({ id: product.id, name: product.name, price: product.price, seller: product.seller, stock: product.stock }, quantity)
                  router.push('/checkout')
                }}
                style={{ flex: 1, minWidth: 160, background: 'linear-gradient(135deg, #FF6B35 0%, #F97316 100%)', color: '#fff', border: 'none', padding: '14px 24px', borderRadius: 14, fontSize: 15, fontWeight: 900, cursor: 'pointer', boxShadow: '0 4px 20px rgba(255,107,53,0.3)' }}
              >
                Buy Now
              </button>

              <button
                type="button"
                onClick={() => {
                  addToCart({ id: product.id, name: product.name, price: product.price, seller: product.seller, stock: product.stock }, quantity)
                  setJustAdded(true)
                  setTimeout(() => setJustAdded(false), 2000)
                }}
                style={{ flex: 1, minWidth: 160, background: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border-color)', padding: '14px 24px', borderRadius: 14, fontSize: 15, fontWeight: 800, cursor: 'pointer' }}
              >
                {justAdded ? '✓ Added to Cart' : '🛒 Add to Cart'}
              </button>

              <button
                type="button"
                onClick={() => addToWishlist({ id: product.id, name: product.name, price: product.price, type: 'product' })}
                disabled={isInWishlist(product.id)}
                style={{ background: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border-color)', padding: '14px 20px', borderRadius: 14, fontSize: 15, fontWeight: 800, cursor: 'pointer' }}
              >
                {isInWishlist(product.id) ? '♥ In Wishlist' : '♡ Wishlist'}
              </button>
            </div>

            {/* Delivery Details Card */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 16, padding: 20, marginBottom: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-main)', marginBottom: 12 }}>
                🚚 Delivery & Guarantee
              </h3>
              <div style={{ fontSize: 13, color: 'var(--text-sub)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div>• <strong>Fast Dispatch:</strong> Ships in 2–4 Business Days via Priority Courier</div>
                <div>• <strong>Escrow Protection:</strong> Razorpay escrow releases payout upon verified delivery</div>
                <div>• <strong>7-Day Replacement:</strong> Free replacement for transit damage</div>
              </div>
            </div>

            {/* Specifications */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 16, padding: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-main)', marginBottom: 12 }}>
                📐 Print Specifications
              </h3>
              <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '6px 0', color: 'var(--text-sub)' }}>Material</td>
                    <td style={{ padding: '6px 0', fontWeight: 700, color: 'var(--text-main)', textAlign: 'right' }}>{product.specifications.material}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '6px 0', color: 'var(--text-sub)' }}>Print Technology</td>
                    <td style={{ padding: '6px 0', fontWeight: 700, color: 'var(--text-main)', textAlign: 'right' }}>{product.specifications.technology}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '6px 0', color: 'var(--text-sub)' }}>Layer Resolution</td>
                    <td style={{ padding: '6px 0', fontWeight: 700, color: 'var(--text-main)', textAlign: 'right' }}>{product.specifications.layerHeight}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '6px 0', color: 'var(--text-sub)' }}>Estimated Weight</td>
                    <td style={{ padding: '6px 0', fontWeight: 700, color: 'var(--text-main)', textAlign: 'right' }}>{product.specifications.weight}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RELATED PRODUCTS */}
        {relatedProducts.length > 0 && (
          <div style={{ marginTop: 64 }}>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: 'var(--text-main)', marginBottom: 20 }}>
              You May Also Like
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
              {relatedProducts.map((p) => (
                <Link
                  key={p.id}
                  href={`/shop/${p.id}`}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 16,
                    overflow: 'hidden',
                    textDecoration: 'none',
                    color: 'inherit',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                  }}
                >
                  <div style={{ height: 160, background: '#0F172A', overflow: 'hidden' }}>
                    <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>
                  <div style={{ padding: 14 }}>
                    <div style={{ fontSize: 11, color: '#FF6B35', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4 }}>{p.category}</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-main)', marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: '#FF6B35' }}>₹{p.price}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      <Footer />
    </main>
  )
}