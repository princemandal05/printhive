'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

// Mock order — replace with a Supabase Realtime subscription on the
// `orders` table filtered by id, so status updates push live to the buyer.
const MOCK_ORDER = {
  id: 'demo-order-id',
  designTitle: 'Articulated Dragon',
  material: 'PLA',
  color: 'Red',
  quantity: 1,
  total: 495,
  printer: { name: 'Rohan\u2019s PrintLab', rating: 4.9 },
  status: 'printing' as 'pending' | 'printing' | 'shipped' | 'delivered',
  placedAt: '9 Jul 2026, 2:40 PM',
}

const STEPS: { key: typeof MOCK_ORDER.status; label: string }[] = [
  { key: 'pending', label: 'Order confirmed' },
  { key: 'printing', label: 'Printing' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
]

export default function OrderTrackingPage() {
  const params = useParams()
  const order = { ...MOCK_ORDER, id: (params?.id as string) || MOCK_ORDER.id }
  const currentIndex = STEPS.findIndex((s) => s.key === order.status)

  return (
    <main>
      <Navbar />

      <section className="container section-sm" style={{ maxWidth: 760, margin: '0 auto' }}>
        <div className="section-eyebrow">Order #{order.id.slice(0, 8)}</div>
        <h1 className="section-heading" style={{ marginBottom: 'var(--space-2)' }}>
          {order.designTitle}
        </h1>
        <p className="text-sm text-muted" style={{ marginBottom: 'var(--space-8)' }}>
          Placed {order.placedAt} · {order.material} · {order.color} · Qty {order.quantity}
        </p>

        <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
          <div className="progress-track">
            {STEPS.map((step, i) => (
              <div
                key={step.key}
                className={`progress-step ${i < currentIndex ? 'completed' : ''} ${i === currentIndex ? 'active' : ''}`}
              >
                <div className="progress-dot">{i < currentIndex ? '✓' : i + 1}</div>
                <div className="progress-label">{step.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
          <div className="card-header">
            <div className="card-title">Printer owner</div>
            <span className={`badge status-${order.status}`}>{order.status}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="avatar">{order.printer.name.charAt(0)}</div>
            <div>
              <div className="text-sm" style={{ fontWeight: 600 }}>{order.printer.name}</div>
              <div className="text-xs text-muted">★ {order.printer.rating} rating</div>
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
          <div className="card-header">
            <div className="card-title">Payment</div>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted">Total (held in escrow)</span>
            <span style={{ fontWeight: 600 }}>₹{order.total}</span>
          </div>
          <p className="help-text" style={{ marginTop: 'var(--space-2)' }}>
            Funds release to the printer owner and designer automatically once
            you confirm delivery below.
          </p>
        </div>

        {order.status === 'shipped' && (
          <button className="btn btn-primary btn-block btn-lg">
            Confirm delivery & release payment
          </button>
        )}
        {order.status === 'delivered' && (
          <Link href={`/orders/${order.id}/review`} className="btn btn-secondary btn-block btn-lg">
            Leave a review
          </Link>
        )}
      </section>

      <Footer />
    </main>
  )
}