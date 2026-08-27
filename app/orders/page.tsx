'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { createClient } from '@/utils/supabase/client'
import {
  Package,
  ShieldCheck,
  Printer,
  CheckCircle2,
  Clock,
  Truck,
  ArrowRight,
  Sparkles,
  Layers,
  RotateCcw,
} from 'lucide-react'

type OrderStatus =
  | 'pending_payment'
  | 'processing'
  | 'assigned'
  | 'printing'
  | 'quality_check'
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

const LIFECYCLE_STAGES = [
  { key: 'placed', label: 'Placed' },
  { key: 'escrow', label: 'Escrow Secured' },
  { key: 'assigned', label: 'Hub Assigned' },
  { key: 'printing', label: 'Printing' },
  { key: 'qa', label: 'Quality Check' },
  { key: 'shipped', label: 'Dispatched' },
  { key: 'delivered', label: 'Delivered' },
]

function getStageIndex(status: string): number {
  switch (status.toLowerCase()) {
    case 'cancelled': return -1
    case 'pending_payment': return 0
    case 'processing': return 1
    case 'assigned': return 2
    case 'printing': return 3
    case 'quality_check': return 4
    case 'shipped': return 5
    case 'delivered': return 6
    default: return 1
  }
}

const FILTERS = ['All', 'active', 'printing', 'shipped', 'delivered', 'cancelled']

export default function OrdersPage() {
  const supabase = createClient()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')

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
              seller: o.seller || 'PrintHive Verified Hub',
              total: o.total_price || o.total || 0,
              quantity: o.items?.[0]?.quantity || 1,
              status: (o.status as OrderStatus) || 'processing',
              orderedOn: o.created_at ? new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently',
              estimatedDelivery: '2-4 Business Days',
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

      let matchesFilter = true
      if (filter === 'active') {
        matchesFilter = order.status !== 'delivered' && order.status !== 'cancelled'
      } else if (filter !== 'All') {
        matchesFilter = order.status === filter
      }

      return matchesSearch && matchesFilter
    })
  }, [orders, search, filter])

  const totalOrders = orders.length
  const deliveredOrders = orders.filter((o) => o.status === 'delivered').length
  const activeOrders = orders.filter(
    (o) => o.status !== 'delivered' && o.status !== 'cancelled'
  ).length

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-canvas)', color: 'var(--text-main)', transition: 'background 0.3s ease' }}>
      <Navbar />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '36px 20px 80px' }}>
        {/* HEADER */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.5px' }}>
              Order Lifecycle &amp; Manufacturing History
            </h1>
            <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', border: '1px solid rgba(16, 185, 129, 0.3)', fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 99 }}>
              Escrow Monitored
            </span>
          </div>
          <p style={{ color: 'var(--text-sub)', fontSize: 14.5, margin: 0, maxWidth: 680, lineHeight: 1.5 }}>
            Real-time status tracking from slicing and print queue to quality inspection, dispatch, and final escrow payout release.
          </p>
        </div>

        {/* STATS SUMMARY BAR */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 20, padding: 22 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-sub)', textTransform: 'uppercase', marginBottom: 4 }}>Total Print Orders</div>
            <div style={{ fontSize: 30, fontWeight: 900, color: 'var(--text-main)' }}>{totalOrders}</div>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 20, padding: 22 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-sub)', textTransform: 'uppercase', marginBottom: 4 }}>Active Orders</div>
            <div style={{ fontSize: 30, fontWeight: 900, color: '#ea580c' }}>{activeOrders}</div>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 20, padding: 22 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-sub)', textTransform: 'uppercase', marginBottom: 4 }}>Delivered &amp; Verified</div>
            <div style={{ fontSize: 30, fontWeight: 900, color: '#10B981' }}>{deliveredOrders}</div>
          </div>
        </div>

        {/* SEARCH & FILTERS */}
        {orders.length > 0 && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 16, padding: 16, marginBottom: 28, display: 'grid', gridTemplateColumns: '1fr 200px', gap: 12 }}>
            <input
              placeholder="Search orders by product name or order ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: 'var(--text-main)', outline: 'none' }}
            />

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: 'var(--text-main)', fontWeight: 700, outline: 'none' }}
            >
              {FILTERS.map((item) => (
                <option key={item} value={item}>
                  {item.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* ORDERS LIST */}
        {loading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-sub)' }}>
            Loading manufacturing orders pipeline...
          </div>
        ) : filteredOrders.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {filteredOrders.map((order) => {
              const currentStage = getStageIndex(order.status)
              const isCancelled = order.status === 'cancelled'
              return (
                <div
                  key={order.id}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 24,
                    padding: 26,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                  }}
                >
                  {/* TOP ROW: PRODUCT INFO & PRICE */}
                  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr auto', gap: 22, alignItems: 'center', marginBottom: 22 }}>
                    <div style={{ height: 110, borderRadius: 16, background: 'var(--bg-card-hover)', overflow: 'hidden' }}>
                      <img
                        src={order.image || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80'}
                        alt={order.product}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-main)', margin: 0 }}>
                          {order.product}
                        </h3>
                      </div>

                      <div style={{ fontSize: 12.5, color: 'var(--text-sub)', display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 4 }}>
                        <span>Order ID: <strong style={{ color: 'var(--text-main)' }}>#{order.id.slice(0, 8)}</strong></span>
                        <span>•</span>
                        <span>Hub: <strong style={{ color: 'var(--text-main)' }}>{order.seller}</strong></span>
                        <span>•</span>
                        <span>Ordered: <strong style={{ color: 'var(--text-main)' }}>{order.orderedOn}</strong></span>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-sub)', textTransform: 'uppercase' }}>Escrow Total</div>
                      <div style={{ fontSize: 24, fontWeight: 900, color: isCancelled ? '#EF4444' : '#ea580c' }}>₹{order.total}</div>
                      <div style={{ fontSize: 11, color: isCancelled ? '#EF4444' : order.status === 'delivered' ? '#10B981' : '#10B981', fontWeight: 800, marginTop: 2 }}>
                        {isCancelled ? '✕ Cancelled & Refunded' : order.status === 'delivered' ? '✓ Payout Released' : '🔒 Escrow Held'}
                      </div>
                    </div>
                  </div>

                  {/* 7-STAGE MANUFACTURING LIFECYCLE TRACKER OR CANCELLED STATUS */}
                  {isCancelled ? (
                    <div style={{ background: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 16, padding: '14px 20px', marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#EF4444', fontWeight: 800, fontSize: 13.5 }}>
                        <span>✕ This print job was cancelled</span>
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--text-sub)' }}>Escrow funds returned to buyer account</span>
                    </div>
                  ) : (
                    <div style={{ background: 'var(--bg-card-hover)', borderRadius: 16, padding: '16px 20px', marginBottom: 18 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, position: 'relative' }}>
                        {LIFECYCLE_STAGES.map((stage, idx) => {
                          const isDone = idx <= currentStage
                          const isCurrent = idx === currentStage
                          return (
                            <div key={stage.key} style={{ textAlign: 'center' }}>
                              <div
                                style={{
                                  width: 22,
                                  height: 22,
                                  borderRadius: '50%',
                                  background: isDone ? '#ea580c' : 'var(--border-color)',
                                  color: '#fff',
                                  fontSize: 10,
                                  fontWeight: 900,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  margin: '0 auto 6px',
                                  boxShadow: isCurrent ? '0 0 0 3px rgba(234, 88, 12, 0.25)' : 'none',
                                }}
                              >
                                {isDone ? '✓' : idx + 1}
                              </div>
                              <div style={{ fontSize: 11, fontWeight: isCurrent ? 800 : 600, color: isCurrent ? '#ea580c' : isDone ? 'var(--text-main)' : 'var(--text-sub)' }}>
                                {stage.label}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* BOTTOM ACTION BAR */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14, borderTop: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: 12, color: 'var(--text-sub)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Truck size={14} color="#ea580c" />
                      <span>Estimated delivery: <strong>{order.estimatedDelivery}</strong></span>
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                      <Link
                        href={`/orders/${order.id}`}
                        style={{
                          background: '#ea580c',
                          color: '#fff',
                          padding: '7px 16px',
                          borderRadius: 99,
                          fontSize: 12,
                          fontWeight: 800,
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        Inspect Details <ArrowRight size={13} />
                      </Link>

                      {order.status === 'delivered' && (
                        <Link
                          href={`/orders/${order.id}/review`}
                          style={{
                            background: 'var(--bg-card-hover)',
                            color: 'var(--text-main)',
                            border: '1px solid var(--border-color)',
                            padding: '7px 14px',
                            borderRadius: 99,
                            fontSize: 12,
                            fontWeight: 700,
                            textDecoration: 'none',
                          }}
                        >
                          Rate Print Quality
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : orders.length > 0 ? (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 24, padding: '48px 24px', textAlign: 'center', maxWidth: 460, margin: '40px auto' }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(234, 88, 12, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', color: '#ea580c' }}>
              <Package size={24} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 900, marginBottom: 6 }}>No Matching Orders</h3>
            <p style={{ fontSize: 13, color: 'var(--text-sub)', marginBottom: 20 }}>
              No orders matched your search &ldquo;{search}&rdquo; or active filter &ldquo;{filter}&rdquo;.
            </p>
            <button
              type="button"
              onClick={() => { setSearch(''); setFilter('All') }}
              style={{ background: '#ea580c', color: '#fff', border: 'none', padding: '9px 18px', borderRadius: 99, fontWeight: 800, fontSize: 12.5, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <RotateCcw size={13} /> Reset Filters
            </button>
          </div>
        ) : (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 24, padding: '60px 24px', textAlign: 'center', maxWidth: 480, margin: '40px auto' }}>
            <div style={{ width: 56, height: 56, borderRadius: 18, background: 'rgba(234, 88, 12, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#ea580c' }}>
              <Package size={26} />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: 8 }}>No Print Orders Yet</h3>
            <p style={{ fontSize: 13.5, color: 'var(--text-sub)', marginBottom: 24, lineHeight: 1.6 }}>
              You haven&apos;t placed any 3D print orders. Explore ready-made products in our marketplace or upload your own STL file.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <Link href="/shop" style={{ background: '#ea580c', color: '#fff', padding: '10px 20px', borderRadius: 99, fontWeight: 800, fontSize: 13, textDecoration: 'none' }}>
                Explore Marketplace
              </Link>
              <Link href="/print-on-demand" style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', color: 'var(--text-main)', padding: '10px 18px', borderRadius: 99, fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
                Upload Custom STL
              </Link>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </main>
  )
}