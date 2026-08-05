'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { createClient } from '@/utils/supabase/client'

type OrderStatus =
  | 'processing'
  | 'printing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

type Order = {
  id: string
  product: string
  seller: string
  total: number
  quantity: number
  status: OrderStatus
  orderedOn: string
  estimatedDelivery: string
  image?: string
}

const FILTERS = [
  'All',
  'processing',
  'printing',
  'shipped',
  'delivered',
  'cancelled',
]

export default function OrdersPage() {
  const supabase = createClient()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')

  // Fetch real user orders from database
  useEffect(() => {
    async function fetchUserOrders() {
      setLoading(true)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const escapedEmail = user.email ? user.email.replace(/\\/g, '\\\\').replace(/"/g, '\\"') : null
          const orFilter = escapedEmail ? `buyer_id.eq.${user.id},buyer_email.eq."${escapedEmail}"` : `buyer_id.eq.${user.id}`

          const { data, error } = await supabase
            .from('orders')
            .select('*')
            .or(orFilter)
            .order('created_at', { ascending: false })

          if (error) {
            console.error('Supabase orders query error:', error.message)
            setOrders([])
          } else if (data && data.length > 0) {
            const mappedOrders: Order[] = data.map((o: any) => ({
              id: String(o.id || ''),
              product: o.items?.[0]?.name || o.product_name || '3D Printed Custom Order',
              seller: o.seller || 'PrintHive Verified Partner',
              total: o.total_price || o.total || 0,
              quantity: o.items?.[0]?.quantity || 1,
              status: (o.status as OrderStatus) || 'processing',
              orderedOn: o.created_at ? new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently',
              estimatedDelivery: '3-5 Business Days',
              image: o.items?.[0]?.image || undefined,
            }))
            setOrders(mappedOrders)
          } else {
            setOrders([])
          }
        } else {
          setOrders([])
        }
      } catch (e) {
        console.error('Error fetching orders:', e)
        setOrders([])
      } finally {
        setLoading(false)
      }
    }
    fetchUserOrders()
  }, [])

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.product.toLowerCase().includes(search.toLowerCase()) ||
        order.id.toLowerCase().includes(search.toLowerCase())

      const matchesFilter =
        filter === 'All' || order.status === filter

      return matchesSearch && matchesFilter
    })
  }, [orders, search, filter])

  const totalOrders = orders.length
  const deliveredOrders = orders.filter((o) => o.status === 'delivered').length
  const activeOrders = orders.filter(
    (o) => o.status === 'processing' || o.status === 'printing' || o.status === 'shipped'
  ).length

  return (
    <main style={{ minHeight: '100vh', transition: 'background 0.3s ease' }}>
      <Navbar />

      <section className="container section-sm" style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 20px' }}>
        <div className="section-eyebrow">My Orders</div>
        <h1 className="section-heading" style={{ marginBottom: 12 }}>
          Order History
        </h1>

        <p className="section-subheading" style={{ marginBottom: 40 }}>
          Track your purchases, monitor real-time delivery status, download invoices, and reorder your 3D printed items.
        </p>

        {/* Statistics Bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px',
            marginBottom: '40px',
          }}
        >
          <div className="glass-card" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: 32, fontWeight: 900, color: 'var(--text-main)', margin: 0 }}>{totalOrders}</h2>
            <p className="text-muted" style={{ margin: '4px 0 0' }}>Total Orders</p>
          </div>

          <div className="glass-card" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: 32, fontWeight: 900, color: '#f59e0b', margin: 0 }}>{activeOrders}</h2>
            <p className="text-muted" style={{ margin: '4px 0 0' }}>Active Orders</p>
          </div>

          <div className="glass-card" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: 32, fontWeight: 900, color: '#10b981', margin: 0 }}>{deliveredOrders}</h2>
            <p className="text-muted" style={{ margin: '4px 0 0' }}>Delivered Orders</p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        {orders.length > 0 && (
          <div className="glass-card" style={{ padding: '24px', marginBottom: '40px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
              <input
                className="input"
                placeholder="Search orders by product or order ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <select
                className="input"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                {FILTERS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-sub)' }}>
            ⚡ Fetching your real order history...
          </div>
        ) : filteredOrders.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {filteredOrders.map((order) => (
              <div key={order.id} className="glass-card" style={{ padding: '28px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr auto', gap: '24px', alignItems: 'center' }}>
                  {/* Product Image Thumbnail */}
                  <div
                    style={{
                      height: '140px',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      background: 'linear-gradient(135deg,var(--color-slate-100),var(--color-border-light))',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    {order.image ? (
                      <img src={order.image} alt={order.product} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="var(--color-slate-400)" strokeWidth="1.5">
                        <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    )}
                  </div>

                  {/* Order Info */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
                      <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>{order.product}</h2>

                      <span
                        className={`badge ${
                          order.status === 'delivered'
                            ? 'badge-success'
                            : order.status === 'cancelled'
                            ? 'badge-danger'
                            : order.status === 'shipped'
                            ? 'badge-primary'
                            : 'badge-warning'
                        }`}
                      >
                        {order.status.toUpperCase()}
                      </span>
                    </div>

                    <p className="text-muted" style={{ margin: '3px 0' }}>
                      Order ID: <strong>{order.id}</strong>
                    </p>
                    <p className="text-muted" style={{ margin: '3px 0' }}>
                      Seller: <strong>{order.seller}</strong>
                    </p>
                    <p className="text-muted" style={{ margin: '3px 0' }}>
                      Quantity: {order.quantity}
                    </p>
                    <p className="text-muted" style={{ margin: '3px 0' }}>
                      Ordered On: {order.orderedOn}
                    </p>
                    <p className="text-muted" style={{ margin: '3px 0' }}>
                      Expected Delivery: {order.estimatedDelivery}
                    </p>

                    <div style={{ marginTop: '14px', fontSize: '1.4rem', fontWeight: 800, color: '#ea580c' }}>
                      ₹{order.total}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '180px' }}>
                    <Link href={`/orders/${order.id}`} className="btn btn-primary">
                      Track Order
                    </Link>

                    {order.status === 'delivered' && (
                      <Link href={`/orders/${order.id}/review`} className="btn btn-secondary">
                        Write Review
                      </Link>
                    )}

                    <Link href="/contact" className="btn btn-secondary">
                      Support Inquiry
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : orders.length > 0 ? (
          <div className="empty-state" style={{ padding: '60px 30px', textAlign: 'center', background: 'var(--bg-card)', borderRadius: 24, border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: 42, marginBottom: 12 }}>🔍</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-main)', marginBottom: 8 }}>No Matching Orders Found</h2>
            <p className="text-muted" style={{ maxWidth: 480, margin: '0 auto', fontSize: 14 }}>
              No orders matched your search or status filter. Try clearing your filter or searching for another keyword.
            </p>
          </div>
        ) : (
          <div className="empty-state" style={{ padding: '80px 30px', textAlign: 'center', background: 'var(--bg-card)', borderRadius: 24, border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-main)', marginBottom: 8 }}>No Orders Placed Yet</h2>
            <p className="text-muted" style={{ maxWidth: 480, margin: '0 auto 24px', fontSize: 14 }}>
              You haven&apos;t placed any 3D print orders yet. Browse our marketplace or upload a custom model to start your first order!
            </p>

            <Link href="/shop" className="btn btn-primary" style={{ background: '#ea580c', color: '#fff', padding: '12px 28px', borderRadius: 99, fontWeight: 800, textDecoration: 'none' }}>
              Start Shopping
            </Link>
          </div>
        )}

        {/* Customer Support Band */}
        <section className="glass-card" style={{ marginTop: '60px', padding: '40px', textAlign: 'center' }}>
          <div className="section-eyebrow">Customer Support</div>
          <h2 style={{ fontSize: '2rem', marginTop: '10px', marginBottom: '18px' }}>
            Need Help With Your Order?
          </h2>
          <p className="text-muted" style={{ maxWidth: '720px', margin: '0 auto 32px' }}>
            Our support team can help with delivery updates, refunds, damaged products, replacements, custom printing requests and invoice issues.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <Link href="/contact" className="btn btn-primary">
              Contact Support
            </Link>
            <Link href="/shop" className="btn btn-secondary">
              Continue Shopping
            </Link>
          </div>
        </section>
      </section>

      <Footer />
    </main>
  )
}