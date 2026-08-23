import { createClient } from '@/utils/supabase/server'
import { requireRole } from '@/utils/supabase/require-role'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default async function BuyerDashboard() {
  const { user } = await requireRole('buyer')
  const supabase = await createClient()

  // Fetch buyer's custom 3D design briefs
  const { data: myRequestsData } = await supabase
    .from('design_requests')
    .select('*')
    .eq('buyer_id', user.id)
    .order('created_at', { ascending: false })

  const myRequests = myRequestsData || []

  // Fetch buyer's live orders
  const { data: myOrdersData } = await supabase
    .from('orders')
    .select('*')
    .eq('buyer_id', user.id)
    .order('created_at', { ascending: false })

  const myOrders = myOrdersData || []

  const s: Record<string, React.CSSProperties> = {
    page: { minHeight: '100vh', background: 'var(--bg-canvas, #FAF8F5)', color: 'var(--text-main, #0F172A)', fontFamily: 'inherit' },
    body: { maxWidth: 1280, margin: '0 auto', padding: '32px 24px' },
    headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap' as const, gap: 16 },
    title: { fontSize: 28, fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.5px' },
    sub: { fontSize: 14, color: '#64748B', marginTop: 4 },
    primaryBtn: { background: 'linear-gradient(135deg, #FF6B35 0%, #F97316 100%)', color: '#fff', padding: '12px 22px', borderRadius: 12, fontWeight: 800, fontSize: 13, textDecoration: 'none', boxShadow: '0 4px 14px rgba(255,107,53,0.25)', display: 'inline-flex', alignItems: 'center', gap: 8 },
    metricGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 28 },
    card: { background: '#FFFFFF', borderRadius: 18, border: '1px solid #E2E8F0', padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' },
    metricVal: { fontSize: 26, fontWeight: 900, color: '#0F172A', marginTop: 6, letterSpacing: '-0.5px' },
    metricLabel: { fontSize: 11, color: '#64748B', fontWeight: 800, textTransform: 'uppercase' as const, letterSpacing: 0.5 },
    actionCard: { background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0', padding: 20, textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 4px 16px rgba(0,0,0,0.02)', transition: 'all 0.2s' },
  }

  return (
    <div style={s.page}>
      {/* SITE TOP NAVBAR */}
      <Navbar />

      {/* MAIN CONTENT CONTAINER */}
      <div style={s.body}>
        {/* DASHBOARD HEADER */}
        <div style={s.headerRow}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,107,53,0.12)', color: '#FF6B35', padding: '4px 12px', borderRadius: 99, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
              🛍️ Buyer Dashboard
            </div>
            <h1 style={s.title}>My Buyer Portal</h1>
            <div style={s.sub}>Track custom design briefs, live 3D print orders, and escrow-protected transactions</div>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/requests/new" style={s.primaryBtn}>
              ✨ + Request Custom 3D
            </Link>
            <Link href="/shop" style={{ background: '#FFFFFF', color: '#0F172A', border: '1px solid #CBD5E1', padding: '12px 20px', borderRadius: 12, fontWeight: 800, fontSize: 13, textDecoration: 'none' }}>
              🛒 Shop Marketplace
            </Link>
          </div>
        </div>

        {/* METRICS CARDS GRID */}
        <div style={s.metricGrid}>
          <div style={s.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={s.metricLabel}>Custom 3D Briefs</div>
              <span style={{ fontSize: 22 }}>✨</span>
            </div>
            <div style={s.metricVal}>{myRequests.length} Active</div>
            <div style={{ fontSize: 12, color: '#FF6B35', marginTop: 8, fontWeight: 700 }}>
              {myRequests.length > 0 ? 'Accepting Designer Bids' : 'No active briefs'}
            </div>
          </div>

          <div style={s.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={s.metricLabel}>Total Orders Placed</div>
              <span style={{ fontSize: 22 }}>📦</span>
            </div>
            <div style={s.metricVal}>{myOrders.length} Orders</div>
            <div style={{ fontSize: 12, color: '#64748B', marginTop: 8, fontWeight: 600 }}>100% Live Order Tracking</div>
          </div>

          <div style={s.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={s.metricLabel}>Escrow Protection</div>
              <span style={{ fontSize: 22 }}>🔒</span>
            </div>
            <div style={s.metricVal}>100% Protected</div>
            <div style={{ fontSize: 12, color: '#10B981', marginTop: 8, fontWeight: 700 }}>Razorpay Escrow Safe</div>
          </div>

          <div style={s.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={s.metricLabel}>Instant Slicing</div>
              <span style={{ fontSize: 22 }}>⚡</span>
            </div>
            <div style={s.metricVal}>On-Demand</div>
            <div style={{ fontSize: 12, color: '#64748B', marginTop: 8, fontWeight: 600 }}>Realtime Print Quotation</div>
          </div>
        </div>

        {/* QUICK ACTIONS BANNER */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 32 }}>
          <Link href="/requests/new" style={s.actionCard}>
            <div style={{ fontSize: 32 }}>✨</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color: '#0F172A' }}>Post Custom Request</div>
              <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>Get bids from top 3D designers</div>
            </div>
          </Link>

          <Link href="/print-on-demand" style={s.actionCard}>
            <div style={{ fontSize: 32 }}>⚡</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color: '#0F172A' }}>Print Custom File</div>
              <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>Upload STL for instant slicing cost</div>
            </div>
          </Link>

          <Link href="/shop" style={s.actionCard}>
            <div style={{ fontSize: 32 }}>🛍️</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color: '#0F172A' }}>Ready-Made Shop</div>
              <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>Browse physical 3D printed items</div>
            </div>
          </Link>
        </div>

        {/* MY CUSTOM 3D BRIEFS SECTION */}
        <div style={{ ...s.card, marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#0F172A' }}>✨ My Custom 3D Briefs & Requests</div>
              <div style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>
                Custom CAD design and manufacturing jobs you have posted for creators to bid on
              </div>
            </div>
            <Link href="/requests/new" style={{ color: '#FF6B35', fontWeight: 800, fontSize: 14, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              + Request New Brief →
            </Link>
          </div>

          {myRequests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 24px', background: '#F8FAFC', borderRadius: 16, border: '2px dashed #CBD5E1' }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>✏️</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#0F172A', marginBottom: 4 }}>No Custom Requests Posted Yet</div>
              <div style={{ fontSize: 13, color: '#64748B', marginBottom: 16 }}>
                Need a replacement part or custom 3D model made from scratch? Post a brief to get proposals!
              </div>
              <Link href="/requests/new" style={s.primaryBtn}>
                ✨ Post Your First Custom Brief
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 14 }}>
              {myRequests.map((r: any) => (
                <div
                  key={r.id}
                  style={{
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: 14,
                    padding: 20,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 16,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 260 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                      <span style={{ background: '#ECFDF5', color: '#10B981', border: '1px solid #A7F3D0', borderRadius: 99, padding: '3px 10px', fontSize: 11, fontWeight: 800 }}>
                        ⚡ {r.status === 'open' ? 'Open for Bids' : r.status}
                      </span>
                      <span style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>
                        Posted on {r.created_at ? new Date(r.created_at).toLocaleDateString() : 'Recently'}
                      </span>
                      {r.budget > 0 && (
                        <span style={{ fontSize: 13, fontWeight: 900, color: '#FF6B35' }}>
                          Budget: ₹{r.budget}
                        </span>
                      )}
                    </div>

                    <h3 style={{ fontSize: 17, fontWeight: 900, color: '#0F172A', margin: '0 0 6px' }}>
                      {r.title || r.purpose || 'Custom 3D Request'}
                    </h3>

                    <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.4, margin: 0, whiteSpace: 'pre-line', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {r.description}
                    </p>
                  </div>

                  <Link
                    href={`/requests/${r.id}`}
                    style={{
                      background: '#0F172A',
                      color: '#fff',
                      padding: '10px 20px',
                      borderRadius: 10,
                      fontWeight: 800,
                      fontSize: 13,
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    View Brief & Proposals →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* LIVE ORDERS PIPELINE */}
        <div style={{ ...s.card, marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#0F172A' }}>🚚 Active Orders & Tracking</div>
              <div style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>Live status tracking from printer hub manufacturing to doorstep delivery</div>
            </div>
            <Link href="/orders" style={{ color: '#FF6B35', fontWeight: 800, fontSize: 14, textDecoration: 'none' }}>
              View All Orders
            </Link>
          </div>

          {myOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 24px', background: '#F8FAFC', borderRadius: 16, border: '2px dashed #CBD5E1' }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🚚</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#0F172A', marginBottom: 4 }}>No Active Orders Found</div>
              <div style={{ fontSize: 13, color: '#64748B', marginBottom: 16 }}>Your active physical purchases and print-on-demand jobs will track here in real time.</div>
              <Link href="/shop" style={s.primaryBtn}>
                🛒 Explore Shop Marketplace
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {myOrders.map((order: any) => (
                <div key={order.id} style={{ background: '#F8FAFC', padding: 16, borderRadius: 12, border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 800, color: '#0F172A' }}>Order #{order.id?.slice(0, 8)}</div>
                    <div style={{ fontSize: 12, color: '#64748B' }}>Placed on {new Date(order.created_at).toLocaleDateString()} • ₹{order.total_amount}</div>
                  </div>
                  <Link href={`/orders/${order.id}`} style={{ color: '#FF6B35', fontWeight: 800, fontSize: 13, textDecoration: 'none' }}>
                    Track Order →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CUSTOMER SUPPORT TICKETS DESK */}
        <div style={s.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#0F172A' }}>🎧 Support Desk & Live Complaint Tracker</div>
              <div style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>Submit tickets, report order issues, or check live complaint resolution status</div>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href="/support-tickets" style={{ background: '#0F172A', color: '#fff', padding: '10px 18px', borderRadius: 12, fontWeight: 800, fontSize: 13, textDecoration: 'none' }}>
                📋 My Support Tickets
              </Link>
              <Link href="/contact" style={{ background: '#c2410c', color: '#ffffff', padding: '10px 18px', borderRadius: 12, fontWeight: 800, fontSize: 13, textDecoration: 'none' }}>
                ✉️ Send Message to Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}