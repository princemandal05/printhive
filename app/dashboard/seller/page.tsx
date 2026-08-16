import { createClient } from '@/utils/supabase/server'
import { requireRole } from '@/utils/supabase/require-role'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'

import DashboardSidebar from '@/components/DashboardSidebar'

interface SellerProductCard {
  id: string
  title: string
  category: string
  price: number
  stock: number
  sales: number
  rating: number | null
  ratingText: string
  seller: string
  image: string
  status: 'Out of Stock' | 'Low Stock' | 'Active'
}

interface DbProductRow {
  id?: string
  title?: string
  name?: string
  category?: string
  price?: number
  stock_quantity?: number
  rating?: number
  seller?: string
  seller_name?: string
  images?: string[]
}

export default async function SellerDashboard() {
  const { user } = await requireRole('seller')

  const handleSignOut = async () => {
    'use server'
    const cookieStore = await cookies()
    cookieStore.set('printhive_guest_role', '', { maxAge: 0, path: '/' })
    cookieStore.set('printhive_auth_role', '', { maxAge: 0, path: '/' })
    const s = await createClient()
    await s.auth.signOut()
    redirect('/')
  }

  // Fetch live products from Supabase with error tracking
  let products: SellerProductCard[] = []
  let loadError: string | null = null

  try {
    const supabase = await createClient()
    const { data: dbProducts, error } = await supabase.from('products').select('*').order('created_at', { ascending: false })

    if (error) {
      loadError = error.message
    } else if (dbProducts && dbProducts.length > 0) {
      products = dbProducts.map((p: DbProductRow, index: number) => {
        const stock = p.stock_quantity ?? 0
        let status: 'Out of Stock' | 'Low Stock' | 'Active' = 'Active'
        if (stock === 0) {
          status = 'Out of Stock'
        } else if (stock < 5) {
          status = 'Low Stock'
        }

        const ratingVal = typeof p.rating === 'number' ? p.rating : null

        return {
          id: p.id || `p-${index}`,
          title: p.title || p.name || 'Custom Product',
          category: p.category || 'General',
          price: p.price || 499,
          stock,
          sales: 0,
          rating: ratingVal,
          ratingText: ratingVal !== null ? `⭐ ${ratingVal}` : 'No ratings yet',
          seller: p.seller || p.seller_name || user.email?.split('@')[0] || 'Seller',
          image: Array.isArray(p.images) && p.images[0] ? p.images[0] : 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
          status,
        }
      })
    }
  } catch (err: unknown) {
    const error = err as Error
    loadError = error.message || 'Failed to query product inventory.'
  }

  const totalRevenue = 0
  const activeListings = products.length

  const s: Record<string, React.CSSProperties> = {
    page: { minHeight: '100vh', background: '#FAF8F5', color: '#0F172A', fontFamily: 'inherit', display: 'flex' },
    main: { flex: 1, padding: '24px 32px', minWidth: 0, overflowX: 'hidden' },
    headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' as const, gap: 16 },
    title: { fontSize: 22, fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.5px' },
    sub: { fontSize: 13, color: '#64748B', marginTop: 4 },
    primaryBtn: { background: 'linear-gradient(135deg, #FF6B35 0%, #F97316 100%)', color: '#fff', padding: '10px 18px', borderRadius: 10, fontWeight: 800, fontSize: 13, textDecoration: 'none', boxShadow: '0 4px 14px rgba(255,107,53,0.25)', transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', gap: 6 },
    metricGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16, marginBottom: 20 },
    card: { background: '#FFFFFF', borderRadius: 14, border: '1px solid #E2E8F0', padding: 18, boxShadow: '0 2px 10px rgba(0,0,0,0.03)', transition: 'transform 0.2s' },
    metricVal: { fontSize: 24, fontWeight: 900, color: '#0F172A', marginTop: 6, letterSpacing: '-0.5px' },
    metricLabel: { fontSize: 11, color: '#64748B', fontWeight: 800, textTransform: 'uppercase' as const, letterSpacing: 0.5 },
    changeTag: { fontSize: 11, fontWeight: 800, color: '#10B981', background: '#ECFDF5', padding: '2px 6px', borderRadius: 6, display: 'inline-block', marginTop: 6 },
    sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
    sectionTitle: { fontSize: 16, fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 8 },
    table: { width: '100%', borderCollapse: 'collapse' as const, textAlign: 'left' as const },
    th: { background: '#F8FAFC', padding: '10px 14px', fontSize: 11, fontWeight: 800, color: '#475569', textTransform: 'uppercase' as const, letterSpacing: 0.5, borderBottom: '1px solid #E2E8F0' },
    td: { padding: '12px 14px', fontSize: 13, borderBottom: '1px solid #F1F5F9', color: '#334155' },
  }

  return (
    <div style={s.page}>
      {/* SAAS SIDEBAR NAVIGATION */}
      <DashboardSidebar
        role="seller"
        userEmail={user.email || ''}
        userName={user.user_metadata?.full_name || user.user_metadata?.name}
        avatarUrl={user.user_metadata?.avatar_url || user.user_metadata?.picture}
        signOutAction={handleSignOut}
      />

      {/* MAIN CONTENT CANVAS */}
      <main style={s.main}>
        {/* DASHBOARD HEADER */}
        <div style={s.headerRow}>
          <div>
            <h1 style={s.title}>Store Overview & Analytics</h1>
            <div style={s.sub}>Manage ready-made physical products, track orders, and view Escrow payouts</div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link href="/shop" style={{ background: '#FFFFFF', color: '#0F172A', border: '1px solid #CBD5E1', padding: '10px 18px', borderRadius: 10, fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
              🏪 View Live Shop
            </Link>
            <Link href="/dashboard/seller/products/new" style={s.primaryBtn}>
              <span>+ Add New Product</span>
            </Link>
          </div>
        </div>

        {/* ERROR ALERT BANNER */}
        {loadError && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#B91C1C', padding: '16px 20px', borderRadius: 16, marginBottom: 28, fontSize: 14, fontWeight: 700 }}>
            ⚠️ Error loading product catalog: {loadError}
          </div>
        )}

        {/* METRICS CARDS GRID (AMAZON SELLER STYLE) */}
        <div style={s.metricGrid}>
          <div style={s.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={s.metricLabel}>Total Revenue</div>
              <span style={{ fontSize: 22 }}>💰</span>
            </div>
            <div style={s.metricVal}>₹{totalRevenue}</div>
            <div style={{ fontSize: 12, color: '#64748B', marginTop: 8, fontWeight: 600 }}>70% Seller Escrow Share</div>
          </div>

          <div style={s.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={s.metricLabel}>Active Listings</div>
              <span style={{ fontSize: 22 }}>🏬</span>
            </div>
            <div style={s.metricVal}>{activeListings} Products</div>
            <div style={{ fontSize: 12, color: '#64748B', marginTop: 8, fontWeight: 600 }}>All synced to live marketplace</div>
          </div>

          <div style={s.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={s.metricLabel}>Orders Total</div>
              <span style={{ fontSize: 22 }}>📦</span>
            </div>
            <div style={s.metricVal}>0 Orders</div>
            <div style={s.changeTag}>100% Escrow Protected</div>
          </div>

          <div style={s.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={s.metricLabel}>Seller Rating</div>
              <span style={{ fontSize: 22 }}>⭐</span>
            </div>
            <div style={s.metricVal}>{products.length > 0 && products[0].rating ? `${products[0].rating} / 5.0` : 'New Seller'}</div>
            <div style={{ fontSize: 12, color: '#10B981', marginTop: 8, fontWeight: 700 }}>Verified PrintHive Seller</div>
          </div>
        </div>

        {/* STORE PRODUCTS CATALOG GRID */}
        <div style={{ ...s.card, marginBottom: 36 }}>
          <div style={s.sectionHeader}>
            <div>
              <div style={s.sectionTitle}>
                <span>🛍️</span> My Store Inventory ({products.length} Products)
              </div>
              <div style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>Ready-made 3D printed items listed on the marketplace</div>
            </div>
            <Link href="/dashboard/seller/products/new" style={{ color: '#FF6B35', fontWeight: 800, fontSize: 14, textDecoration: 'none' }}>
              + Add Product
            </Link>
          </div>

          {products.length === 0 && !loadError ? (
            <div style={{ textAlign: 'center', padding: '48px 24px', background: '#F8FAFC', borderRadius: 16, border: '2px dashed #CBD5E1' }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🏬</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#0F172A', marginBottom: 4 }}>No Products Listed Yet</div>
              <div style={{ fontSize: 13, color: '#64748B', marginBottom: 16 }}>List your ready-made 3D printed creations to start selling across India.</div>
              <Link href="/dashboard/seller/products/new" style={s.primaryBtn}>
                + Add Your First Product
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
              {products.map((p) => (
                <Link
                  key={p.id}
                  href={`/shop/${p.id}`}
                  style={{ background: '#F8FAFC', borderRadius: 16, border: '1px solid #E2E8F0', overflow: 'hidden', textDecoration: 'none', color: 'inherit', display: 'block', transition: 'all 0.2s' }}
                >
                  <div style={{ height: 160, width: '100%', background: '#E2E8F0', position: 'relative' }}>
                    <img src={p.image} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', top: 12, right: 12, background: p.status === 'Out of Stock' ? '#FEF2F2' : p.status === 'Low Stock' ? '#FFFBEB' : '#ECFDF5', color: p.status === 'Out of Stock' ? '#EF4444' : p.status === 'Low Stock' ? '#D97706' : '#10B981', border: `1px solid ${p.status === 'Out of Stock' ? '#FCA5A5' : p.status === 'Low Stock' ? '#FCD34D' : '#A7F3D0'}`, borderRadius: 99, padding: '4px 10px', fontSize: 11, fontWeight: 800 }}>
                      {p.status} ({p.stock})
                    </div>
                    <span style={{ position: 'absolute', bottom: 10, right: 10, background: 'rgba(15,23,42,0.85)', color: '#fff', fontSize: 11, fontWeight: 800, padding: '4px 10px', borderRadius: 99, backdropFilter: 'blur(4px)' }}>
                      View Product 🛍️
                    </span>
                  </div>
                  <div style={{ padding: 18 }}>
                    <div style={{ fontSize: 12, color: '#FF6B35', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4 }}>{p.category}</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', marginBottom: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: 20, fontWeight: 900, color: '#0F172A' }}>₹{p.price}</div>
                      <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>{p.ratingText} ({p.sales} sold)</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* RECENT ORDERS TABLE (FLIPKART STYLE) */}
        <div style={s.card}>
          <div style={s.sectionHeader}>
            <div>
              <div style={s.sectionTitle}>
                <span>🚚</span> Recent Customer Orders & Escrow Payouts
              </div>
              <div style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>Real-time order statuses backed by Razorpay Escrow protection</div>
            </div>
            <Link href="/orders" style={{ color: '#FF6B35', fontWeight: 800, fontSize: 14, textDecoration: 'none' }}>
              View All Orders
            </Link>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Order ID</th>
                  <th style={s.th}>Customer</th>
                  <th style={s.th}>Product Item</th>
                  <th style={s.th}>Order Total</th>
                  <th style={s.th}>Seller Escrow Share</th>
                  <th style={s.th}>Status</th>
                  <th style={s.th}>Date</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '32px 16px', color: '#64748B', fontSize: 13, fontWeight: 600 }}>
                    No orders placed yet. Orders will appear here automatically when buyers place purchases.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* CUSTOMER SUPPORT TICKETS DESK FOR SELLERS */}
        <div style={{ ...s.card, marginTop: 36 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#0F172A' }}>🎧 Seller Support & Complaint Desk</div>
              <div style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>Need help with payouts, listing inquiries, or buyer disputes? Contact Support directly.</div>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href="/support-tickets" style={{ background: '#0F172A', color: '#fff', padding: '10px 18px', borderRadius: 12, fontWeight: 800, fontSize: 13, textDecoration: 'none' }}>
                📋 My Support Tickets
              </Link>
              <Link href="/contact" style={{ background: '#ea580c', color: '#ffffff', padding: '10px 18px', borderRadius: 12, fontWeight: 800, fontSize: 13, textDecoration: 'none' }}>
                ✉️ Send Message to Support
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}