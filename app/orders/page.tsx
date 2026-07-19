'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

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
}

const MOCK_ORDERS: Order[] = [
  {
    id: 'ORD-1001',
    product: 'Geometric Planter Set',
    seller: 'UrbanPrint Co.',
    total: 1298,
    quantity: 2,
    status: 'printing',
    orderedOn: '10 July 2026',
    estimatedDelivery: '15 July 2026',
  },
  {
    id: 'ORD-1002',
    product: 'Articulated Dragon',
    seller: 'MiniMakers',
    total: 899,
    quantity: 1,
    status: 'shipped',
    orderedOn: '8 July 2026',
    estimatedDelivery: '13 July 2026',
  },
  {
    id: 'ORD-1003',
    product: 'Desk Organizer',
    seller: 'DeskWorks',
    total: 399,
    quantity: 1,
    status: 'delivered',
    orderedOn: '3 July 2026',
    estimatedDelivery: '8 July 2026',
  },
  {
    id: 'ORD-1004',
    product: 'Cosplay Helmet',
    seller: 'PropForge',
    total: 2499,
    quantity: 1,
    status: 'processing',
    orderedOn: '12 July 2026',
    estimatedDelivery: '18 July 2026',
  },
]

const FILTERS = [
  'All',
  'processing',
  'printing',
  'shipped',
  'delivered',
  'cancelled',
]

export default function OrdersPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')

  const filteredOrders = useMemo(() => {
    return MOCK_ORDERS.filter((order) => {
      const matchesSearch =
        order.product.toLowerCase().includes(search.toLowerCase()) ||
        order.id.toLowerCase().includes(search.toLowerCase())

      const matchesFilter =
        filter === 'All' || order.status === filter

      return matchesSearch && matchesFilter
    })
  }, [search, filter])

  const totalOrders = MOCK_ORDERS.length
  const deliveredOrders = MOCK_ORDERS.filter(
    (o) => o.status === 'delivered'
  ).length

  const activeOrders = MOCK_ORDERS.filter(
    (o) =>
      o.status === 'processing' ||
      o.status === 'printing' ||
      o.status === 'shipped'
  ).length

  return (
    <main>
      <Navbar />

      <section className="container section-sm">

        <div className="section-eyebrow">
          My Orders
        </div>

        <h1
          className="section-heading"
          style={{
            marginBottom: '16px',
          }}
        >
          Order History
        </h1>

        <p
          className="section-subheading"
          style={{
            marginBottom: '48px',
          }}
        >
          Track your purchases, monitor delivery status,
          download invoices and reorder your favourite
          3D printed products.
        </p>

        {/* Statistics */}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit,minmax(220px,1fr))',
            gap: '20px',
            marginBottom: '40px',
          }}
        >
          <div className="glass-card" style={{ padding: '24px' }}>
            <h2>{totalOrders}</h2>
            <p className="text-muted">Total Orders</p>
          </div>

          <div className="glass-card" style={{ padding: '24px' }}>
            <h2>{activeOrders}</h2>
            <p className="text-muted">Active Orders</p>
          </div>

          <div className="glass-card" style={{ padding: '24px' }}>
            <h2>{deliveredOrders}</h2>
            <p className="text-muted">Delivered Orders</p>
          </div>
        </div>

        {/* Search & Filter */}

        <div
          className="glass-card"
          style={{
            padding: '24px',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr',
              gap: '20px',
            }}
          >
            <input
              className="input"
              placeholder="Search orders..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

            <select
              className="input"
              value={filter}
              onChange={(e) =>
                setFilter(e.target.value)
              }
            >
              {FILTERS.map((item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>

                {/* Orders List */}

        {filteredOrders.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gap: '24px',
            }}
          >
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="glass-card"
                style={{
                  padding: '28px',
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '160px 1fr auto',
                    gap: '24px',
                    alignItems: 'center',
                  }}
                >
                  {/* Product Image */}

                  <div
                    style={{
                      height: '140px',
                      borderRadius: '16px',
                      background:
                        'linear-gradient(135deg,var(--color-slate-100),var(--color-border-light))',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <svg
                      width="60"
                      height="60"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--color-slate-400)"
                      strokeWidth="1.5"
                    >
                      <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>

                  {/* Order Details */}

                  <div>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '12px',
                        marginBottom: '12px',
                      }}
                    >
                      <h2>{order.product}</h2>

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

                    <p className="text-muted">
                      Order ID: <strong>{order.id}</strong>
                    </p>

                    <p className="text-muted">
                      Seller: <strong>{order.seller}</strong>
                    </p>

                    <p className="text-muted">
                      Quantity: {order.quantity}
                    </p>

                    <p className="text-muted">
                      Ordered On: {order.orderedOn}
                    </p>

                    <p className="text-muted">
                      Expected Delivery: {order.estimatedDelivery}
                    </p>

                    <div
                      style={{
                        marginTop: '18px',
                        fontSize: '1.4rem',
                        fontWeight: 700,
                        color: 'var(--color-primary)',
                      }}
                    >
                      ₹{order.total}
                    </div>

                  </div>

                  {/* Actions */}

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      minWidth: '180px',
                    }}
                  >
                    <Link
                      href={`/orders/${order.id}`}
                      className="btn btn-primary"
                    >
                      Track Order
                    </Link>

                    <Link
                      href={`/orders/${order.id}/review`}
                      className="btn btn-secondary"
                    >
                      Write Review
                    </Link>

                    <button className="btn btn-secondary">
                      Reorder
                    </button>

                    <button className="btn btn-secondary">
                      Download Invoice
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            className="empty-state"
            style={{
              padding: '80px 30px',
            }}
          >
            <svg
              width="72"
              height="72"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-slate-400)"
              strokeWidth="1.5"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>

            <h2
              style={{
                marginTop: '20px',
              }}
            >
              No Orders Found
            </h2>

            <p className="text-muted">
              Try changing your search term or filter.
            </p>

            <Link
              href="/shop"
              className="btn btn-primary"
              style={{
                marginTop: '24px',
              }}
            >
              Continue Shopping
            </Link>
          </div>
        )}

                {/* Order Summary */}

        <section
          className="glass-card"
          style={{
            marginTop: '60px',
            padding: '40px',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit,minmax(220px,1fr))',
              gap: '24px',
            }}
          >
            <div>
              <h3>Total Orders</h3>
              <p
                style={{
                  fontSize: '2rem',
                  fontWeight: 700,
                  color: 'var(--color-primary)',
                }}
              >
                {totalOrders}
              </p>
            </div>

            <div>
              <h3>Active Orders</h3>
              <p
                style={{
                  fontSize: '2rem',
                  fontWeight: 700,
                  color: '#f59e0b',
                }}
              >
                {activeOrders}
              </p>
            </div>

            <div>
              <h3>Delivered</h3>
              <p
                style={{
                  fontSize: '2rem',
                  fontWeight: 700,
                  color: '#22c55e',
                }}
              >
                {deliveredOrders}
              </p>
            </div>
          </div>
        </section>

        {/* Need Help */}

        <section
          className="glass-card"
          style={{
            marginTop: '50px',
            padding: '50px',
            textAlign: 'center',
          }}
        >
          <div className="section-eyebrow">
            Customer Support
          </div>

          <h2
            style={{
              fontSize: '2rem',
              marginTop: '10px',
              marginBottom: '18px',
            }}
          >
            Need Help With Your Order?
          </h2>

          <p
            className="text-muted"
            style={{
              maxWidth: '720px',
              margin: '0 auto 32px',
            }}
          >
            Our support team can help with delivery updates,
            refunds, damaged products, replacements,
            custom printing requests and invoice issues.
          </p>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '16px',
              flexWrap: 'wrap',
            }}
          >
            <Link
              href="/requests"
              className="btn btn-primary"
            >
              Contact Support
            </Link>

            <Link
              href="/shop"
              className="btn btn-secondary"
            >
              Continue Shopping
            </Link>
          </div>
        </section>

      </section>

      <Footer />
    </main>
  )
}