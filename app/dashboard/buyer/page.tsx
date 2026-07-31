import { createClient } from '@/utils/supabase/server'
import { requireRole } from '@/utils/supabase/require-role'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const ACTIVE_ORDERS = [
  {
    id: 'ORD-89210',
    item: 'Ergonomic Desk Headphone Stand',
    seller: 'Delhi Precision 3D Hub (3.8 km away)',
    price: 1299,
    status: 'In Slicing & Manufacturing',
    progress: 45,
    eta: 'Tomorrow, 4:00 PM',
    image: 'https://images.unsplash.com/photo-1612815150546-a3a1617296e8?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'ORD-89198',
    item: 'Articulated Dragon V2 (Ruby Red)',
    seller: 'Kolkata Additive Lab',
    price: 799,
    status: 'Delivered & Verified',
    progress: 100,
    eta: 'Delivered 29 Jul 2026',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
  },
]

const FEATURED_PRODUCTS = [
  { id: '1', title: 'Cyberpunk Helmet Prop', price: 2499, rating: 4.9, image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80', tag: 'Top Seller' },
  { id: '2', title: 'Geometric Planter Pot Set', price: 549, rating: 4.8, image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=600&q=80', tag: 'Trending' },
  { id: '3', title: 'Modular Cable Manager', price: 349, rating: 4.9, image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80', tag: 'Fast Ship' },
]

export default async function BuyerDashboard() {
  const { user } = await requireRole('buyer')

  const handleSignOut = async () => {
    'use server'
    const s = await createClient()
    await s.auth.signOut()
    redirect('/')
  }

  const s: Record<string, React.CSSProperties> = {
    page: { minHeight: '100vh', background: '#FAF8F5', color: '#0F172A', fontFamily: 'inherit' },
    nav: { background: '#0F172A', padding: '0 32px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)' },
    logo: { fontSize: 20, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' },
    logoAccent: { color: '#FF6B35' },
    badge: { background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 99, padding: '4px 14px', fontSize: 12, fontWeight: 800, textTransform: 'uppercase' as const, letterSpacing: 0.5 },
    body: { maxWidth: 1240, margin: '0 auto', padding: '36px 24px' },
    headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap' as const, gap: 16 },
    title: { fontSize: 28, fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.5px' },
    sub: { fontSize: 14, color: '#64748B', marginTop: 4 },
    primaryBtn: { background: 'linear-gradient(135deg, #FF6B35 0%, #F97316 100%)', color: '#fff', padding: '12px 24px', borderRadius: 12, fontWeight: 800, fontSize: 14, textDecoration: 'none', boxShadow: '0 6px 20px rgba(255,107,53,0.3)', display: 'inline-flex', alignItems: 'center', gap: 8 },
    metricGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 36 },
    card: { background: '#FFFFFF', borderRadius: 20, border: '1px solid #E2E8F0', padding: 24, boxShadow: '0 8px 30px rgba(0,0,0,0.04)' },
    metricVal: { fontSize: 32, fontWeight: 900, color: '#0F172A', marginTop: 6, letterSpacing: '-0.5px' },
    metricLabel: { fontSize: 13, color: '#64748B', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: 0.5 },
    actionCard: { background: '#FFFFFF', borderRadius: 20, border: '1px solid #E2E8F0', padding: 24, textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: 18, transition: 'all 0.2s' },
  }

  return (
    <div style={s.page}>
      {/* BUYER ACCOUNT NAVIGATION */}
      <nav style={s.nav}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={s.logo}>
            <Link href="/" style={{ textDecoration: 'none', color: '#fff' }}>
              Print<span style={s.logoAccent}>Hive</span>
            </Link>{' '}
            <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600 }}>Buyer Account</span>
          </div>
          <span style={s.badge}>🛍️ Verified Buyer</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <span style={{ color: '#94A3B8', fontSize: 13, fontWeight: 600 }}>{user.email}</span>
          <form action={handleSignOut}>
            <button type="submit" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
              Sign Out
            </button>
          </form>
        </div>
      </nav>

      <div style={s.body}>
        {/* DASHBOARD HEADER */}
        <div style={s.headerRow}>
          <div>
            <h1 style={s.title}>My Buyer Portal</h1>
            <div style={s.sub}>Track live print orders, manage escrow payments, and explore 3D marketplaces</div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Link href="/shop" style={s.primaryBtn}>
              🛒 Browse Shop Marketplace
            </Link>
            <Link href="/print-on-demand" style={{ background: '#F8FAFC', color: '#0F172A', border: '1px solid #CBD5E1', padding: '12px 20px', borderRadius: 12, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
              🖨️ Instant Print Estimator
            </Link>
          </div>
        </div>

        {/* METRICS CARDS GRID */}
        <div style={s.metricGrid}>
          <div style={s.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={s.metricLabel}>Total Orders Placed</div>
              <span style={{ fontSize: 22 }}>📦</span>
            </div>
            <div style={s.metricVal}>2 Orders</div>
            <div style={{ fontSize: 12, color: '#10B981', marginTop: 8, fontWeight: 700 }}>1 Active in Print Queue</div>
          </div>

          <div style={s.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={s.metricLabel}>Escrow Protection</div>
              <span style={{ fontSize: 22 }}>🔒</span>
            </div>
            <div style={s.metricVal}>₹2,098</div>
            <div style={{ fontSize: 12, color: '#2563EB', marginTop: 8, fontWeight: 700 }}>100% Razorpay Escrow Safe</div>
          </div>

          <div style={s.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={s.metricLabel}>Nearby Printer Hubs</div>
              <span style={{ fontSize: 22 }}>📍</span>
            </div>
            <div style={s.metricVal}>8 Hubs</div>
            <div style={{ fontSize: 12, color: '#64748B', marginTop: 8, fontWeight: 600 }}>Within 15 km Delivery Radius</div>
          </div>

          <div style={s.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={s.metricLabel}>Wishlist & Saved</div>
              <span style={{ fontSize: 22 }}>❤️</span>
            </div>
            <div style={s.metricVal}>6 Models</div>
            <div style={{ fontSize: 12, color: '#FF6B35', marginTop: 8, fontWeight: 700 }}>Ready for 1-Click Order</div>
          </div>
        </div>

        {/* QUICK ACTIONS BANNER */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 36 }}>
          <Link href="/shop" style={s.actionCard}>
            <div style={{ fontSize: 32 }}>🛍️</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color: '#0F172A' }}>Ready-Made Shop</div>
              <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>Browse physical 3D printed items</div>
            </div>
          </Link>

          <Link href="/print-on-demand" style={s.actionCard}>
            <div style={{ fontSize: 32 }}>⚡</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color: '#0F172A' }}>Print Custom File</div>
              <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>Upload STL for instant slicing cost</div>
            </div>
          </Link>

          <Link href="/requests/new" style={s.actionCard}>
            <div style={{ fontSize: 32 }}>✏️</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color: '#0F172A' }}>Post Custom Request</div>
              <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>Get bids from top 3D designers</div>
            </div>
          </Link>
        </div>

        {/* LIVE ORDERS PIPELINE (AMAZON STYLE) */}
        <div style={{ ...s.card, marginBottom: 36 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#0F172A' }}>🚚 Active Orders & Tracking</div>
              <div style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>Live status pushing from printer hub slicing to doorstep delivery</div>
            </div>
            <Link href="/orders" style={{ color: '#FF6B35', fontWeight: 800, fontSize: 14, textDecoration: 'none' }}>
              View All Orders →
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {ACTIVE_ORDERS.map((o) => (
              <div key={o.id} style={{ background: '#F8FAFC', borderRadius: 16, border: '1px solid #E2E8F0', padding: 20, display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
                <img src={o.image} alt={o.item} style={{ width: 80, height: 80, borderRadius: 12, objectFit: 'cover' }} />
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontWeight: 900, fontSize: 15, color: '#0F172A' }}>{o.id}</span>
                    <span style={{ fontSize: 12, background: o.progress === 100 ? '#ECFDF5' : '#FEF3C7', color: o.progress === 100 ? '#10B981' : '#D97706', padding: '2px 8px', borderRadius: 99, fontWeight: 800 }}>
                      {o.status}
                    </span>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>{o.item}</div>
                  <div style={{ fontSize: 13, color: '#64748B' }}>Hub: {o.seller} · ETA: {o.eta}</div>

                  {/* Progress Bar */}
                  <div style={{ width: '100%', height: 6, background: '#E2E8F0', borderRadius: 99, marginTop: 12, overflow: 'hidden' }}>
                    <div style={{ width: `${o.progress}%`, height: '100%', background: 'linear-gradient(90deg, #FF6B35, #10B981)', borderRadius: 99 }} />
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: '#0F172A' }}>₹{o.price}</div>
                  <Link
                    href={`/orders/${o.id}`}
                    style={{ background: '#FF6B35', color: '#fff', padding: '8px 16px', borderRadius: 10, fontWeight: 700, fontSize: 13, textDecoration: 'none', display: 'inline-block', marginTop: 8 }}
                  >
                    Track Order →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TRENDING RECOMMENDATIONS */}
        <div style={s.card}>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#0F172A', marginBottom: 20 }}>🔥 Trending Products For You</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
            {FEATURED_PRODUCTS.map((p) => (
              <div key={p.id} style={{ background: '#F8FAFC', borderRadius: 16, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                <img src={p.image} alt={p.title} style={{ width: '100%', height: 160, objectFit: 'cover' }} />
                <div style={{ padding: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#FF6B35', textTransform: 'uppercase', marginBottom: 4 }}>{p.tag}</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', marginBottom: 8 }}>{p.title}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 900, color: '#0F172A' }}>₹{p.price}</div>
                    <Link href={`/shop/${p.id}`} style={{ color: '#FF6B35', fontWeight: 800, fontSize: 13, textDecoration: 'none' }}>
                      View Details →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}