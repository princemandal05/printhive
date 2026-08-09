'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { updateOrderStatus, type OrderStatus } from '@/utils/order-lifecycle'

export type PrinterHub = {
  id: string
  name: string
  model: string
  technology: string
  volume: string
  resolution?: string
  working_hours?: string
  base_price?: number
  status: 'online' | 'offline' | 'busy' | string
  is_active: boolean
  rating?: number
  address?: string
  image_url?: string
}

export type OrderJob = {
  id: string
  created_at: string
  status: OrderStatus | string
  material: string
  color: string
  quantity: number
  total: number
  payout: number
  customer_name?: string
  shipping_address?: string
}

type Props = {
  user: { id: string; email?: string; full_name?: string; avatar_url?: string }
  initialPrinters: PrinterHub[]
  initialOrders: OrderJob[]
}

export default function PrinterOwnerClient({ user, initialPrinters, initialOrders }: Props) {
  const supabase = createClient()
  const [printers, setPrinters] = useState<PrinterHub[]>(initialPrinters)
  const [orders, setOrders] = useState<OrderJob[]>(initialOrders)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  // Real Database Status Toggle Handler
  const handleToggleStatus = async (printerId: string, currentStatus: string) => {
    setUpdatingId(printerId)
    const nextStatus = currentStatus === 'online' ? 'offline' : currentStatus === 'offline' ? 'busy' : 'online'
    const nextActive = nextStatus === 'online'

    try {
      const { error } = await supabase
        .from('printers')
        .update({ status: nextStatus, is_active: nextActive })
        .eq('id', printerId)

      if (!error) {
        setPrinters((prev) =>
          prev.map((p) => (p.id === printerId ? { ...p, status: nextStatus, is_active: nextActive } : p))
        )
      } else {
        console.warn('Printer status update error:', error)
      }
    } catch (err) {
      console.warn('Status toggle exception:', err)
    } finally {
      setUpdatingId(null)
    }
  }

  // Calculate live metrics
  const activeJobs = orders.filter((o) => ['accepted', 'in_production'].includes(o.status)).length
  const pendingJobs = orders.filter((o) => o.status === 'pending').length
  const completedJobs = orders.filter((o) => o.status === 'completed').length

  const totalEarnings = orders
    .filter((o) => o.status === 'completed')
    .reduce((sum, o) => sum + (o.payout || Math.round(o.total * 0.7)), 0)

  const onlinePrintersCount = printers.filter((p) => p.status === 'online').length
  const utilizationRate = printers.length > 0 ? Math.round((activeJobs / printers.length) * 100) : 0

  const avgRating = printers.length > 0
    ? (printers.reduce((sum, p) => sum + (p.rating || 4.9), 0) / printers.length).toFixed(1)
    : '4.9'

  const s: Record<string, React.CSSProperties> = {
    page: { minHeight: '100vh', background: '#FAF8F5', color: '#0F172A', fontFamily: 'inherit' },
    nav: { background: '#0F172A', padding: '0 32px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)' },
    logo: { fontSize: 20, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' },
    logoAccent: { color: '#FF6B35' },
    badge: { background: 'rgba(37, 99, 235, 0.15)', color: '#2563EB', border: '1px solid rgba(37,99,235,0.3)', borderRadius: 99, padding: '4px 14px', fontSize: 12, fontWeight: 800, textTransform: 'uppercase' as const, letterSpacing: 0.5 },
    body: { maxWidth: 1240, margin: '0 auto', padding: '36px 24px' },
    headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap' as const, gap: 16 },
    title: { fontSize: 28, fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.5px' },
    sub: { fontSize: 14, color: '#64748B', marginTop: 4 },
    primaryBtn: { background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)', color: '#fff', padding: '12px 24px', borderRadius: 12, fontWeight: 800, fontSize: 14, textDecoration: 'none', boxShadow: '0 6px 20px rgba(37,99,235,0.3)', display: 'inline-flex', alignItems: 'center', gap: 8 },
    metricGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 36 },
    card: { background: '#FFFFFF', borderRadius: 20, border: '1px solid #E2E8F0', padding: 24, boxShadow: '0 8px 30px rgba(0,0,0,0.04)' },
    metricVal: { fontSize: 32, fontWeight: 900, color: '#0F172A', marginTop: 6, letterSpacing: '-0.5px' },
    metricLabel: { fontSize: 13, color: '#64748B', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: 0.5 },
    table: { width: '100%', borderCollapse: 'collapse' as const, textAlign: 'left' as const },
    th: { background: '#F8FAFC', padding: '14px 18px', fontSize: 12, fontWeight: 800, color: '#475569', textTransform: 'uppercase' as const, letterSpacing: 0.5, borderBottom: '1px solid #E2E8F0' },
    td: { padding: '16px 18px', fontSize: 14, borderBottom: '1px solid #F1F5F9', color: '#334155' },
  }

  return (
    <div style={s.page}>
      {/* PRINTER COMMAND HUB NAVIGATION */}
      <nav style={s.nav}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={s.logo}>
            <Link href="/" style={{ textDecoration: 'none', color: '#fff' }}>
              Print<span style={s.logoAccent}>Hive</span>
            </Link>{' '}
            <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600 }}>Printer Hub Command</span>
          </div>
          <span style={s.badge}>🖨️ Printer Owner</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {user.avatar_url ? (
              <img src={user.avatar_url} alt="Avatar" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#FF6B35', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                {(user.full_name || 'U').charAt(0)}
              </div>
            )}
            <div style={{ textAlign: 'left' }}>
              <div style={{ color: '#fff', fontSize: 13, fontWeight: 800, lineHeight: 1.2 }}>
                {user.full_name || 'Printer Owner'}
              </div>
              <div style={{ color: '#94A3B8', fontSize: 11, fontWeight: 600 }}>{user.email}</div>
            </div>
          </div>
          <a href="/" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>
            Exit Hub
          </a>
        </div>
      </nav>

      <div style={s.body}>
        {/* DASHBOARD HEADER */}
        <div style={s.headerRow}>
          <div>
            <h1 style={s.title}>Printer Fleet & Job Management</h1>
            <div style={s.sub}>Monetize idle 3D printers, accept nearby print jobs, and receive 70% direct payouts</div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Link href="/printers" style={{ background: '#F8FAFC', color: '#0F172A', border: '1px solid #CBD5E1', padding: '12px 20px', borderRadius: 12, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
              📍 Nearby Printer Map
            </Link>
            <Link href="/dashboard/printer-owner/register" style={s.primaryBtn}>
              <span>+ Register New Printer</span>
            </Link>
          </div>
        </div>

        {/* METRICS CARDS GRID (REAL DB METRICS) */}
        <div style={s.metricGrid}>
          <div style={s.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={s.metricLabel}>Total Payout Earnings</div>
              <span style={{ fontSize: 22 }}>💰</span>
            </div>
            <div style={s.metricVal}>₹{totalEarnings}</div>
            <div style={{ fontSize: 12, color: '#10B981', marginTop: 8, fontWeight: 700 }}>70% Escrow Direct Payout</div>
          </div>

          <div style={s.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={s.metricLabel}>Active Jobs</div>
              <span style={{ fontSize: 22 }}>⚡</span>
            </div>
            <div style={s.metricVal}>{activeJobs} Active</div>
            <div style={{ fontSize: 12, color: '#2563EB', marginTop: 8, fontWeight: 700 }}>
              {pendingJobs} Pending · {completedJobs} Completed
            </div>
          </div>

          <div style={s.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={s.metricLabel}>Printer Utilization</div>
              <span style={{ fontSize: 22 }}>📊</span>
            </div>
            <div style={s.metricVal}>{utilizationRate}%</div>
            <div style={{ fontSize: 12, color: '#8B5CF6', marginTop: 8, fontWeight: 700 }}>
              {onlinePrintersCount} / {printers.length} Hubs Online
            </div>
          </div>

          <div style={s.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={s.metricLabel}>Hub Fleet Rating</div>
              <span style={{ fontSize: 22 }}>★</span>
            </div>
            <div style={s.metricVal}>★ {avgRating}</div>
            <div style={{ fontSize: 12, color: '#F59E0B', marginTop: 8, fontWeight: 700 }}>Verified PrintHub Partner</div>
          </div>
        </div>

        {/* REGISTERED MACHINES FLEET (REAL DB INTEGRATION WITH LIVE STATUS TOGGLE) */}
        <div style={{ ...s.card, marginBottom: 36 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#0F172A' }}>⚙️ Registered 3D Printer Fleet ({printers.length})</div>
              <div style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>Click status badge to toggle machine online/offline live in database</div>
            </div>
            <Link href="/dashboard/printer-owner/register" style={{ color: '#2563EB', fontWeight: 800, fontSize: 14, textDecoration: 'none' }}>
              + Register Machine
            </Link>
          </div>

          {printers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 24px', background: '#F8FAFC', borderRadius: 16, border: '2px dashed #CBD5E1' }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🖨️</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#0F172A', marginBottom: 4 }}>No 3D Printers Registered Yet</div>
              <div style={{ fontSize: 13, color: '#64748B', marginBottom: 16 }}>Register your 3D printing equipment to start fulfilling nearby print jobs and earning 70% payouts.</div>
              <Link href="/dashboard/printer-owner/register" style={s.primaryBtn}>
                + Register Your First 3D Printer
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
              {printers.map((p) => {
                const isOnline = p.status === 'online'
                const isBusy = p.status === 'busy'
                return (
                  <div key={p.id} style={{ background: '#F8FAFC', borderRadius: 16, border: '1px solid #E2E8F0', padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      {p.image_url && (
                        <img src={p.image_url} alt={p.name} style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 12, marginBottom: 12 }} />
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ fontSize: 11, color: '#2563EB', fontWeight: 800, textTransform: 'uppercase' }}>{p.technology}</span>
                        {p.base_price && <span style={{ fontSize: 13, fontWeight: 800, color: '#0F172A' }}>₹{p.base_price}/job</span>}
                      </div>
                      <div style={{ fontSize: 18, fontWeight: 900, color: '#0F172A', marginBottom: 4 }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: '#64748B', marginBottom: 6 }}>Model: {p.model}</div>
                      <div style={{ fontSize: 12, color: '#64748B', marginBottom: 12 }}>Build Volume: {p.volume}</div>
                      {p.address && <div style={{ fontSize: 12, color: '#475569', marginBottom: 12 }}>📍 {p.address}</div>}
                    </div>

                    {/* LIVE STATUS TOGGLE BUTTON */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FFFFFF', padding: '10px 14px', borderRadius: 12, border: '1px solid #E2E8F0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 10, height: 10, borderRadius: '50%', background: isOnline ? '#10B981' : isBusy ? '#F59E0B' : '#EF4444' }} />
                        <span style={{ fontSize: 13, fontWeight: 800, color: isOnline ? '#10B981' : isBusy ? '#F59E0B' : '#EF4444', textTransform: 'capitalize' }}>
                          {p.status}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleStatus(p.id, p.status)}
                        disabled={updatingId === p.id}
                        style={{
                          background: isOnline ? '#FEF2F2' : '#ECFDF5',
                          color: isOnline ? '#DC2626' : '#059669',
                          border: `1px solid ${isOnline ? '#FCA5A5' : '#A7F3D0'}`,
                          borderRadius: 8,
                          padding: '4px 12px',
                          fontSize: 12,
                          fontWeight: 800,
                          cursor: 'pointer',
                        }}
                      >
                        {updatingId === p.id ? 'Updating…' : isOnline ? 'Switch Offline' : 'Switch Online'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* JOBS QUEUE TABLE */}
        <div style={s.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#0F172A' }}>📦 Print Jobs Queue ({orders.length})</div>
              <div style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>Manage order states and update manufacturing status</div>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Order ID</th>
                  <th style={s.th}>Material & Spec</th>
                  <th style={s.th}>Qty</th>
                  <th style={s.th}>70% Payout</th>
                  <th style={s.th}>Current Status</th>
                  <th style={s.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '32px 16px', color: '#64748B', fontSize: 13, fontWeight: 600 }}>
                      No active print jobs in your queue yet. When buyers submit print requests in your area, jobs will appear here automatically.
                    </td>
                  </tr>
                ) : (
                  orders.map((o) => {
                    const handleNextStep = async (nextStatus: OrderStatus, notes: string) => {
                      setUpdatingId(o.id)
                      await updateOrderStatus(supabase, o.id, nextStatus, notes, user.id)
                      setOrders((prev) => prev.map((item) => (item.id === o.id ? { ...item, status: nextStatus as any } : item)))
                      setUpdatingId(null)
                    }

                    return (
                      <tr key={o.id}>
                        <td style={{ ...s.td, fontWeight: 800 }}>
                          <Link href={`/orders/${o.id}`} style={{ color: '#2563EB', textDecoration: 'none' }}>
                            #{o.id.slice(0, 8)} ↗
                          </Link>
                        </td>
                        <td style={s.td}>{o.material} ({o.color})</td>
                        <td style={s.td}>{o.quantity}×</td>
                        <td style={{ ...s.td, fontWeight: 800, color: '#10B981' }}>₹{o.payout || Math.round(o.total * 0.7)}</td>
                        <td style={s.td}>
                          <span style={{ background: '#EFF6FF', color: '#2563EB', padding: '4px 10px', borderRadius: 6, fontWeight: 800, fontSize: 12 }}>
                            {o.status}
                          </span>
                        </td>
                        <td style={s.td}>
                          {['PRINTER_ASSIGNED', 'FINDING_PRINTER', 'pending'].includes(o.status) && (
                            <button
                              onClick={() => handleNextStep('PRINTER_ACCEPTED', 'Printer hub accepted job.')}
                              disabled={updatingId === o.id}
                              style={{ background: '#2563EB', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                            >
                              Accept Job
                            </button>
                          )}
                          {['PRINTER_ACCEPTED', 'accepted'].includes(o.status) && (
                            <button
                              onClick={() => handleNextStep('PRINTING', '3D printing started on machine.')}
                              disabled={updatingId === o.id}
                              style={{ background: '#ea580c', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                            >
                              Start Printing
                            </button>
                          )}
                          {['PRINTING', 'in_production'].includes(o.status) && (
                            <button
                              onClick={() => handleNextStep('QUALITY_CHECK', 'Print finished, starting quality inspection.')}
                              disabled={updatingId === o.id}
                              style={{ background: '#8B5CF6', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                            >
                              Quality Check
                            </button>
                          )}
                          {o.status === 'QUALITY_CHECK' && (
                            <button
                              onClick={() => handleNextStep('READY', 'Quality check passed, packaged for courier.')}
                              disabled={updatingId === o.id}
                              style={{ background: '#10B981', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                            >
                              Mark Ready
                            </button>
                          )}
                          {o.status === 'READY' && (
                            <button
                              onClick={() => handleNextStep('DISPATCHED', 'Package dispatched with courier.')}
                              disabled={updatingId === o.id}
                              style={{ background: '#0284C7', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                            >
                              Dispatch Courier
                            </button>
                          )}
                          {['DISPATCHED', 'DELIVERED', 'COMPLETED'].includes(o.status) && (
                            <span style={{ fontSize: 12, color: '#10B981', fontWeight: 800 }}>✓ Dispatched</span>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
