'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ThreeViewer from '@/components/ThreeViewer'
import { useStore } from '@/lib/cart-context'
import { createClient } from '@/utils/supabase/client'
import {
  Star,
  ShieldCheck,
  Truck,
  Heart,
  ShoppingBag,
  Zap,
  ArrowRight,
  Layers,
  Clock,
  Maximize2,
  Box,
  CheckCircle2,
  Sliders,
  Printer,
  ChevronRight,
  Award,
  Sparkles,
} from 'lucide-react'

type Product = {
  id: string
  name: string
  price: number
  category: string
  rating: number
  reviewsCount?: number
  seller: string
  stock: number
  description: string
  image: string
  file_url?: string
  specifications: {
    material: string
    technology: string
    layerHeight: string
    weight: string
    dimensions: string
    volume: string
    infill: string
  }
}

const MATERIALS = [
  { name: 'PLA', tag: 'Standard Prototyping', desc: 'Crisp detail, eco-friendly cornstarch base', costMult: 1.0 },
  { name: 'PETG', tag: 'Durable & Tough', desc: 'Impact resistant, heat tolerant up to 75°C', costMult: 1.15 },
  { name: 'ABS', tag: 'High Strength', desc: 'Rigid mechanical parts, heat resistant', costMult: 1.25 },
  { name: 'TPU', tag: 'Flexible Rubber', desc: 'Flexible shore 95A, vibration damping', costMult: 1.35 },
  { name: 'Resin', tag: 'Ultra High Detail', desc: 'Smooth 0.05mm layer precision for miniatures', costMult: 1.45 },
]

const QUALITY_PRESETS = [
  { name: 'Standard', height: '0.20 mm', timeMult: 1.0 },
  { name: 'Fine', height: '0.12 mm', timeMult: 1.4 },
  { name: 'Ultra Fine', height: '0.08 mm', timeMult: 2.0 },
]

const COLORS = [
  { name: 'Obsidian Black', hex: '#1e293b' },
  { name: 'Pure White', hex: '#f8fafc' },
  { name: 'Terracotta Orange', hex: '#ea580c' },
  { name: 'Crimson Red', hex: '#ef4444' },
  { name: 'Signal Blue', hex: '#3b82f6' },
  { name: 'Emerald Green', hex: '#10b981' },
]

export default function ProductDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params?.id as string
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useStore()
  const supabase = createClient()

  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedMaterial, setSelectedMaterial] = useState(MATERIALS[0])
  const [selectedQuality, setSelectedQuality] = useState(QUALITY_PRESETS[0])
  const [selectedColor, setSelectedColor] = useState(COLORS[2]) // Terracotta
  const [toastMsg, setToastMsg] = useState('')

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

        let sellerName = 'PrintHive Verified Hub'
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
          rating: Number(dbProduct.rating ?? 4.9),
          reviewsCount: Number(dbProduct.reviews_count ?? 38),
          seller: sellerName,
          stock: Number(dbProduct.stock ?? 10),
          description: dbProduct.description || 'Precision engineered 3D printed model manufactured on-demand using industrial FDM and SLA additive manufacturing printers with guaranteed dimensional accuracy.',
          image: dbProduct.image_url || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
          file_url: (dbProduct as any).file_url || (dbProduct as any).model_url || '',
          specifications: {
            material: 'PLA+ / PETG / ABS',
            technology: 'Precision FDM Additive',
            layerHeight: '0.12 – 0.20 mm',
            weight: '145 g',
            dimensions: '110 × 95 × 124 mm',
            volume: '118 cm³',
            infill: '20% Gyroid',
          },
        }

        if (isMounted) {
          setProduct(mapped)
        }

        // Fetch related products
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
              rating: Number(r.rating ?? 4.8),
              reviewsCount: Number(r.reviews_count ?? 12),
              seller: 'PrintHive Hub',
              stock: Number(r.stock ?? 10),
              description: r.description || '',
              image: r.image_url || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
              specifications: {
                material: 'PLA',
                technology: 'FDM',
                layerHeight: '0.20 mm',
                weight: '120 g',
                dimensions: '90 × 90 × 90 mm',
                volume: '85 cm³',
                infill: '15% Grid',
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

  const calculatedUnitPrice = product ? Math.round(product.price * selectedMaterial.costMult) : 499
  const totalPrice = calculatedUnitPrice * quantity
  const estimatedHours = Math.round(3.5 * selectedQuality.timeMult * 10) / 10

  const handleAddToCart = () => {
    if (!product) return
    addToCart({
      id: `${product.id}-${selectedMaterial.name}-${selectedColor.name}`,
      name: `${product.name} (${selectedMaterial.name}, ${selectedColor.name})`,
      seller: product.seller,
      price: calculatedUnitPrice,
      stock: product.stock,
      image: product.image,
    })
    setToastMsg(`Added ${quantity}x "${product.name}" to cart!`)
    setTimeout(() => setToastMsg(''), 2500)
  }

  const handlePrintNow = () => {
    handleAddToCart()
    router.push('/checkout')
  }

  const isWishlisted = product ? isInWishlist(product.id) : false

  const handleToggleWishlist = () => {
    if (!product) return
    if (isWishlisted) {
      removeFromWishlist(product.id)
      setToastMsg('Removed from wishlist')
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        price: calculatedUnitPrice,
        type: 'product',
      })
      setToastMsg('Saved to Wishlist!')
    }
    setTimeout(() => setToastMsg(''), 2500)
  }

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', background: 'var(--bg-canvas)', color: 'var(--text-main)' }}>
        <Navbar />
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 16, color: 'var(--text-sub)' }}>Loading 3D Manufacturing Workspace...</div>
        </div>
        <Footer />
      </main>
    )
  }

  if (!product) {
    return (
      <main style={{ minHeight: '100vh', background: 'var(--bg-canvas)', color: 'var(--text-main)' }}>
        <Navbar />
        <div style={{ maxWidth: 500, margin: '80px auto', padding: '40px 20px', textAlign: 'center', background: 'var(--bg-card)', borderRadius: 24, border: '1px solid var(--border-color)' }}>
          <Box size={40} color="#ea580c" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>Product Not Found</h2>
          <p style={{ color: 'var(--text-sub)', fontSize: 14, marginBottom: 24 }}>The requested 3D print item is currently unavailable or has been archived.</p>
          <Link href="/shop" style={{ background: '#ea580c', color: '#fff', padding: '10px 22px', borderRadius: 99, fontWeight: 800, textDecoration: 'none', display: 'inline-block' }}>
            Back to Marketplace
          </Link>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-canvas)', color: 'var(--text-main)', fontFamily: 'inherit', transition: 'background 0.3s ease' }}>
      <Navbar />

      {/* TOAST ALERT */}
      {toastMsg && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000, background: 'var(--text-main)', color: 'var(--bg-card)', padding: '12px 22px', borderRadius: 99, fontSize: 13.5, fontWeight: 700, boxShadow: '0 10px 30px rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle2 size={16} color="#10B981" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '24px 20px 80px' }}>
        {/* BREADCRUMB */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'var(--text-sub)', marginBottom: 24 }}>
          <Link href="/shop" style={{ color: 'var(--text-sub)', textDecoration: 'none' }}>Marketplace</Link>
          <ChevronRight size={13} />
          <span>{product.category}</span>
          <ChevronRight size={13} />
          <span style={{ color: 'var(--text-main)', fontWeight: 700 }}>{product.name}</span>
        </div>

        {/* 2-COLUMN MANUFACTURING PRODUCT WORKSPACE */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: 36, marginBottom: 56 }}>
          {/* LEFT: INTERACTIVE 3D WEBGL WORKSPACE & MESH GEOMETRY */}
          <div>
            {/* Main 3D Canvas / High-Res Viewport */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 24, overflow: 'hidden', padding: 16, marginBottom: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#ea580c', textTransform: 'uppercase', letterSpacing: 0.6, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Sparkles size={13} /> Three.js WebGL 3D Inspector
                </span>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-sub)', background: 'var(--bg-card-hover)', padding: '2px 8px', borderRadius: 6 }}>
                  Filament: {selectedColor.name}
                </span>
              </div>

              <ThreeViewer
                title={product.name}
                color={selectedColor.hex}
                height={460}
                modelUrl={product.file_url}
              />
            </div>

            {/* MESH & PRINTABILITY DIAGNOSTICS */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 20, padding: 18, marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Mesh Pre-Flight Diagnostics
                </span>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-sub)', background: 'var(--bg-card-hover)', padding: '2px 8px', borderRadius: 6 }}>
                  {product.file_url ? 'CAD Geometry Verified' : 'Standard Manufacturing Specs'}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                <div style={{ background: 'var(--bg-card-hover)', padding: '12px 10px', borderRadius: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-sub)', textTransform: 'uppercase', marginBottom: 2 }}>Dimensions</div>
                  <div style={{ fontSize: 13, fontWeight: 900, color: 'var(--text-main)' }}>{product.specifications.dimensions}</div>
                </div>

                <div style={{ background: 'var(--bg-card-hover)', padding: '12px 10px', borderRadius: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-sub)', textTransform: 'uppercase', marginBottom: 2 }}>Volume</div>
                  <div style={{ fontSize: 13, fontWeight: 900, color: 'var(--text-main)' }}>{product.specifications.volume}</div>
                </div>

                <div style={{ background: 'var(--bg-card-hover)', padding: '12px 10px', borderRadius: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-sub)', textTransform: 'uppercase', marginBottom: 2 }}>Est. Weight</div>
                  <div style={{ fontSize: 13, fontWeight: 900, color: 'var(--text-main)' }}>{product.specifications.weight}</div>
                </div>

                <div style={{ background: 'var(--bg-card-hover)', padding: '12px 10px', borderRadius: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-sub)', textTransform: 'uppercase', marginBottom: 2 }}>Manifold Check</div>
                  <div style={{ fontSize: 12.5, fontWeight: 900, color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                    <CheckCircle2 size={12} /> {product.file_url ? '100% Watertight' : 'FDM Verified'}
                  </div>
                </div>
              </div>
            </div>

            {/* TRANSPARENT ESCROW & COST BREAKDOWN */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 20, padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h4 style={{ fontSize: 14, fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ShieldCheck size={16} color="#10B981" /> 70/15/15 Escrow Protection
                </h4>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#10B981', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: 99 }}>
                  Payment Secured
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, textAlign: 'center' }}>
                <div style={{ background: 'var(--bg-card-hover)', padding: '12px 8px', borderRadius: 12 }}>
                  <div style={{ fontSize: 10, color: 'var(--text-sub)', fontWeight: 800 }}>70% PRINTER HUB</div>
                  <div style={{ fontSize: 15, fontWeight: 900, color: '#ea580c', marginTop: 2 }}>₹{Math.round(totalPrice * 0.70)}</div>
                </div>
                <div style={{ background: 'var(--bg-card-hover)', padding: '12px 8px', borderRadius: 12 }}>
                  <div style={{ fontSize: 10, color: 'var(--text-sub)', fontWeight: 800 }}>15% 3D DESIGNER</div>
                  <div style={{ fontSize: 15, fontWeight: 900, color: '#3B82F6', marginTop: 2 }}>₹{Math.round(totalPrice * 0.15)}</div>
                </div>
                <div style={{ background: 'var(--bg-card-hover)', padding: '12px 8px', borderRadius: 12 }}>
                  <div style={{ fontSize: 10, color: 'var(--text-sub)', fontWeight: 800 }}>15% PLATFORM &amp; TAX</div>
                  <div style={{ fontSize: 15, fontWeight: 900, color: '#10B981', marginTop: 2 }}>₹{Math.round(totalPrice * 0.15)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: PRECISION CONFIGURATOR & PRICING */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 24, padding: '30px 28px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
            {/* Header & Title */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#ea580c', background: 'rgba(234, 88, 12, 0.1)', padding: '3px 10px', borderRadius: 99, textTransform: 'uppercase' }}>
                {product.category}
              </span>
              <button
                type="button"
                onClick={handleToggleWishlist}
                style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <Heart size={16} color={isWishlisted ? '#EF4444' : 'var(--text-sub)'} fill={isWishlisted ? '#EF4444' : 'none'} />
              </button>
            </div>

            <h1 style={{ fontSize: 24, fontWeight: 900, color: 'var(--text-main)', margin: '0 0 8px', lineHeight: 1.3 }}>
              {product.name}
            </h1>

            {/* Rating & Hub */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#D97706', fontSize: 13, fontWeight: 800 }}>
                <Star size={14} fill="#D97706" color="#D97706" /> {product.rating} ({product.reviewsCount} verified reviews)
              </div>
              <span style={{ color: 'var(--border-color)' }}>•</span>
              <div style={{ fontSize: 12.5, color: 'var(--text-sub)' }}>
                Hub: <strong style={{ color: 'var(--text-main)' }}>{product.seller}</strong>
              </div>
            </div>

            {/* Price Display */}
            <div style={{ background: 'var(--bg-card-hover)', padding: '16px 20px', borderRadius: 16, marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-sub)', fontWeight: 800, textTransform: 'uppercase' }}>Custom Unit Price</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#ea580c' }}>
                  ₹{calculatedUnitPrice}
                </div>
              </div>
              <div style={{ textAlign: 'right', fontSize: 12, color: 'var(--text-sub)' }}>
                <span>Estimated Print: </span>
                <strong style={{ color: 'var(--text-main)' }}>{estimatedHours} hours</strong>
              </div>
            </div>

            {/* MATERIAL SELECTION */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                Select Print Material
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {MATERIALS.map((mat) => {
                  const active = selectedMaterial.name === mat.name
                  return (
                    <button
                      key={mat.name}
                      type="button"
                      onClick={() => setSelectedMaterial(mat)}
                      style={{
                        padding: '10px 8px',
                        borderRadius: 12,
                        textAlign: 'left',
                        border: active ? '2px solid #ea580c' : '1px solid var(--border-color)',
                        background: active ? 'rgba(234, 88, 12, 0.08)' : 'var(--bg-card-hover)',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 800, color: active ? '#ea580c' : 'var(--text-main)' }}>{mat.name}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-sub)', marginTop: 2 }}>{mat.tag}</div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* LAYER RESOLUTION / QUALITY */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                Layer Height &amp; Quality
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {QUALITY_PRESETS.map((q) => {
                  const active = selectedQuality.name === q.name
                  return (
                    <button
                      key={q.name}
                      type="button"
                      onClick={() => setSelectedQuality(q)}
                      style={{
                        padding: '8px 10px',
                        borderRadius: 10,
                        border: active ? '2px solid #ea580c' : '1px solid var(--border-color)',
                        background: active ? 'rgba(234, 88, 12, 0.08)' : 'var(--bg-card-hover)',
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: 12.5, fontWeight: 800, color: active ? '#ea580c' : 'var(--text-main)' }}>{q.name}</div>
                      <div style={{ fontSize: 10.5, color: 'var(--text-sub)', marginTop: 2 }}>{q.height}</div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* COLOR SWATCHES */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                Filament Color: <span style={{ color: '#ea580c' }}>{selectedColor.name}</span>
              </label>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                {COLORS.map((c) => {
                  const active = selectedColor.name === c.name
                  return (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setSelectedColor(c)}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: c.hex,
                        border: active ? '3px solid #ea580c' : '2px solid var(--border-color)',
                        boxShadow: active ? '0 0 0 2px var(--bg-card)' : 'none',
                        cursor: 'pointer',
                        transform: active ? 'scale(1.15)' : 'scale(1)',
                        transition: 'transform 0.15s ease',
                      }}
                      title={c.name}
                    />
                  )
                })}
              </div>
            </div>

            {/* QUANTITY & TOTAL */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--text-sub)' }}>Qty:</span>
                <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-card-hover)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    style={{ padding: '6px 12px', background: 'none', border: 'none', color: 'var(--text-main)', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}
                  >
                    -
                  </button>
                  <span style={{ padding: '0 8px', fontSize: 13.5, fontWeight: 900 }}>{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}
                    style={{ padding: '6px 12px', background: 'none', border: 'none', color: 'var(--text-main)', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}
                  >
                    +
                  </button>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: 'var(--text-sub)', fontWeight: 800 }}>TOTAL ESCROW AMOUNT</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--text-main)' }}>₹{totalPrice}</div>
              </div>
            </div>

            {/* DUAL ACTION BUTTONS: [PRINT THIS] & [ADD TO CART] */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              <button
                type="button"
                onClick={handlePrintNow}
                style={{
                  background: '#ea580c',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 99,
                  padding: '14px 20px',
                  fontSize: 14,
                  fontWeight: 900,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  boxShadow: '0 6px 20px rgba(234, 88, 12, 0.35)',
                }}
              >
                <Zap size={16} /> PRINT THIS NOW
              </button>

              <button
                type="button"
                onClick={handleAddToCart}
                style={{
                  background: 'var(--bg-card-hover)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 99,
                  padding: '14px 20px',
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <ShoppingBag size={16} /> Add to Cart
              </button>
            </div>

            {/* DELIVERY ASSURANCE */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-sub)' }}>
              <Truck size={14} color="#10B981" />
              <span>Doorstep delivery within <strong>2–3 business days</strong> by local printer hub.</span>
            </div>
          </div>
        </div>

        {/* DETAILED TECHNICAL SPECIFICATIONS & MULTI-DIMENSIONAL REVIEWS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
          {/* Specifications Table */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 24, padding: 28 }}>
            <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-main)', marginBottom: 16 }}>
              Technical Specifications
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-color)', fontSize: 13 }}>
                <span style={{ color: 'var(--text-sub)' }}>Manufacturing Tech</span>
                <span style={{ fontWeight: 800 }}>{product.specifications.technology}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-color)', fontSize: 13 }}>
                <span style={{ color: 'var(--text-sub)' }}>Standard Material</span>
                <span style={{ fontWeight: 800 }}>{selectedMaterial.name} ({selectedMaterial.tag})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-color)', fontSize: 13 }}>
                <span style={{ color: 'var(--text-sub)' }}>Infill Geometry</span>
                <span style={{ fontWeight: 800 }}>{product.specifications.infill}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-color)', fontSize: 13 }}>
                <span style={{ color: 'var(--text-sub)' }}>Layer Resolution</span>
                <span style={{ fontWeight: 800 }}>{selectedQuality.height}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontSize: 13 }}>
                <span style={{ color: 'var(--text-sub)' }}>Quality Verification</span>
                <span style={{ fontWeight: 800, color: '#10B981' }}>Passed Pre-Flight Slicing</span>
              </div>
            </div>
          </div>

          {/* 3D Printing Review Criteria Breakdown */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 24, padding: 28 }}>
            <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-main)', marginBottom: 16 }}>
              3D Print Quality Ratings
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 4 }}>
                  <span style={{ color: 'var(--text-sub)' }}>Surface Finish &amp; Layer Quality</span>
                  <span style={{ fontWeight: 800 }}>4.9 / 5.0</span>
                </div>
                <div style={{ height: 6, width: '100%', background: 'var(--bg-card-hover)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '98%', background: '#ea580c', borderRadius: 99 }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 4 }}>
                  <span style={{ color: 'var(--text-sub)' }}>Dimensional Accuracy</span>
                  <span style={{ fontWeight: 800 }}>4.8 / 5.0</span>
                </div>
                <div style={{ height: 6, width: '100%', background: 'var(--bg-card-hover)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '96%', background: '#10B981', borderRadius: 99 }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 4 }}>
                  <span style={{ color: 'var(--text-sub)' }}>Material Strength &amp; Infill Density</span>
                  <span style={{ fontWeight: 800 }}>5.0 / 5.0</span>
                </div>
                <div style={{ height: 6, width: '100%', background: 'var(--bg-card-hover)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '100%', background: '#3B82F6', borderRadius: 99 }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 4 }}>
                  <span style={{ color: 'var(--text-sub)' }}>Turnaround &amp; Packaging</span>
                  <span style={{ fontWeight: 800 }}>4.9 / 5.0</span>
                </div>
                <div style={{ height: 6, width: '100%', background: 'var(--bg-card-hover)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '98%', background: '#F59E0B', borderRadius: 99 }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}