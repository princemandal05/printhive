'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import Navbar from '@/components/Navbar'

type UserRecord = {
  id: string
  name: string
  email: string
  role: string
  joined: string
  status: 'active' | 'pending' | 'verified'
}

type ProductApproval = {
  id: string
  name: string
  seller: string
  submitted: string
  status: 'pending' | 'approved' | 'rejected'
}

type Complaint = {
  id: string
  subject: string
  name?: string
  email?: string
  from: string
  message?: string
  status: 'open' | 'resolved'
  created_at?: string
}

const INITIAL_USERS: UserRecord[] = []
const INITIAL_PRODUCTS: ProductApproval[] = []

export default function AdminDashboard() {
  const router = useRouter()
  const supabase = createClient()

  const [users, setUsers] = useState<UserRecord[]>(INITIAL_USERS)
  const [products, setProducts] = useState<ProductApproval[]>(INITIAL_PRODUCTS)
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [toastMsg, setToastMsg] = useState('')

  useEffect(() => {
    async function loadAdminData() {
      try {
        // 1. Fetch real profiles
        const { data: dbProfiles } = await supabase
          .from('profiles')
          .select('id, email, role, full_name, created_at, is_verified')
          .order('created_at', { ascending: false })

        if (dbProfiles && dbProfiles.length > 0) {
          const formattedUsers: UserRecord[] = dbProfiles.map((p: any) => ({
            id: p.id,
            name: p.full_name || p.email?.split('@')[0] || 'PrintHive User',
            email: p.email || 'user@printhive.com',
            role: p.role || 'buyer',
            joined: p.created_at ? new Date(p.created_at).toISOString().split('T')[0] : '2026-08-01',
            status: p.is_verified ? 'verified' : 'active',
          }))
          setUsers(formattedUsers)
        }

        // 2. Fetch real products
        const { data: dbProducts } = await supabase
          .from('products')
          .select('id, title, name, seller, seller_name, created_at')
          .order('created_at', { ascending: false })

        if (dbProducts && dbProducts.length > 0) {
          const formattedProducts: ProductApproval[] = dbProducts.map((prod: any) => ({
            id: prod.id,
            name: prod.title || prod.name || '3D Printed Product',
            seller: prod.seller || prod.seller_name || 'Store Seller',
            submitted: prod.created_at ? new Date(prod.created_at).toISOString().split('T')[0] : '2026-08-01',
            status: 'approved',
          }))
          setProducts(formattedProducts)
        }

        // 3. Fetch real complaints
        const res = await fetch('/api/contact')
        const data = await res.json()
        if (data.success && data.complaints) {
          const formatted = data.complaints.map((c: any) => ({
            id: c.id,
            subject: c.subject,
            name: c.name || c.email?.split('@')[0] || 'User',
            email: c.email,
            from: `${c.name || 'User'} (${c.email})`,
            message: c.message,
            status: c.status || 'open',
            created_at: c.created_at,
          }))
          setComplaints(formatted)
        }
      } catch (err) {
        console.error('Failed to load admin operations hub data:', err)
      }
    }
    loadAdminData()
  }, [])

  const handleSignOut = async () => {
    document.cookie = 'printhive_guest_role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
    document.cookie = 'printhive_auth_role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 3000)
  }

  const handleVerifyUser = (userId: string, userName: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: 'verified' } : u))
    )
    showToast(`✅ ${userName} verified and approved on PrintHive network!`)
  }

  const handleApproveProduct = (prodId: string, prodName: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === prodId ? { ...p, status: 'approved' } : p))
    )
    showToast(`✅ ${prodName} approved and published to live marketplace!`)
  }

  const handleRejectProduct = (prodId: string, prodName: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === prodId ? { ...p, status: 'rejected' } : p))
    )
    showToast(`❌ ${prodName} returned for modification.`)
  }

  const handleResolveComplaint = async (compId: string) => {
    setComplaints((prev) =>
      prev.map((c) => (c.id === compId ? { ...c, status: 'resolved' } : c))
    )
    try {
      await fetch('/api/contact', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: compId, status: 'resolved' }),
      })
    } catch (e) {}

    showToast(`✅ Contact support ticket resolved and closed.`)
  }

  const pendingVerificationsCount = users.filter((u) => u.status === 'pending').length
  const openComplaintsCount = complaints.filter((c) => c.status === 'open').length

  const s: Record<string, React.CSSProperties> = {
    page: { minHeight: '100vh', background: 'var(--bg-canvas)', color: 'var(--text-main)', fontFamily: 'inherit' },
    body: { maxWidth: 1280, margin: '0 auto', padding: '28px 24px' },
    headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap' as const, gap: 16 },
    title: { fontSize: 24, fontWeight: 900, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.5px' },
    sub: { fontSize: 13, color: 'var(--text-sub)', marginTop: 4 },
    metricGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 },
    card: { background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border-color)', padding: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.04)', marginBottom: 24 },
    metricVal: { fontSize: 26, fontWeight: 900, color: 'var(--text-main)', marginTop: 6, letterSpacing: '-0.5px' },
    metricLabel: { fontSize: 11, color: 'var(--text-sub)', fontWeight: 800, textTransform: 'uppercase' as const, letterSpacing: 0.5 },
    table: { width: '100%', borderCollapse: 'collapse' as const, textAlign: 'left' as const },
    th: { background: 'var(--bg-card)', padding: '12px 16px', fontSize: 11, fontWeight: 800, color: 'var(--text-sub)', textTransform: 'uppercase' as const, letterSpacing: 0.5, borderBottom: '1px solid var(--border-color)' },
    td: { padding: '14px 16px', fontSize: 13, borderBottom: '1px solid var(--border-color)', color: 'var(--text-main)' },
    rowBtn: { background: '#0F172A', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s' },
    rowBtnGhost: { background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', color: 'var(--text-main)' },
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
            <h1 style={s.title}>System Control & Operations Hub</h1>
            <div style={s.sub}>Platform moderation, catalog approvals, user management, and support desk</div>
          </div>
        </div>

      {/* TOAST NOTIFICATION */}
      {toastMsg && (
        <div
          style={{
            position: 'fixed',
            top: 84,
            right: 32,
            background: '#0F172A',
            color: '#fff',
            padding: '14px 22px',
            borderRadius: 14,
            fontWeight: 800,
            fontSize: 14,
            boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
            zIndex: 9999,
          }}
        >
          {toastMsg}
        </div>
      )}



        {/* METRICS ROW */}
        <div style={s.metricGrid}>
          <div style={s.card}>
            <div style={s.metricLabel}>Total Registered Network Users</div>
            <div style={s.metricVal}>{users.length}</div>
          </div>

          <div style={s.card}>
            <div style={s.metricLabel}>Pending Identity Verifications</div>
            <div style={{ ...s.metricVal, color: pendingVerificationsCount > 0 ? '#ea580c' : '#10B981' }}>
              {pendingVerificationsCount}
            </div>
          </div>

          <div style={s.card}>
            <div style={s.metricLabel}>Products Pending Review</div>
            <div style={s.metricVal}>{products.filter((p) => p.status === 'pending').length}</div>
          </div>

          <div style={s.card}>
            <div style={s.metricLabel}>Open Support Tickets & Complaints</div>
            <div style={{ ...s.metricVal, color: openComplaintsCount > 0 ? '#EF4444' : '#10B981' }}>
              {openComplaintsCount} Open
            </div>
          </div>
        </div>

        {/* USER VERIFICATION MANAGEMENT */}
        <div style={s.card}>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#0F172A', marginBottom: 20 }}>
            👤 Network Accounts & Identity Verification
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>User</th>
                  <th style={s.th}>Role</th>
                  <th style={s.th}>Joined</th>
                  <th style={s.th}>Status</th>
                  <th style={s.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ ...s.td, textAlign: 'center', color: '#64748B', padding: '36px' }}>
                      No users registered yet.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id}>
                      <td style={{ ...s.td, fontWeight: 800, color: '#0F172A' }}>
                        {u.name}
                        <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>{u.email}</div>
                      </td>
                      <td style={s.td}>
                        <span style={{ background: '#F1F5F9', color: '#334155', padding: '4px 10px', borderRadius: 99, fontSize: 12, fontWeight: 800 }}>
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td style={s.td}>{u.joined}</td>
                      <td style={s.td}>
                        <span style={{ padding: '4px 10px', borderRadius: 99, fontSize: 12, fontWeight: 800, background: u.status === 'verified' ? '#ECFDF5' : u.status === 'pending' ? '#FFF7ED' : '#F1F5F9', color: u.status === 'verified' ? '#10B981' : u.status === 'pending' ? '#EA580C' : '#64748B' }}>
                          {u.status}
                        </span>
                      </td>
                      <td style={s.td}>
                        {u.status === 'pending' ? (
                          <button
                            type="button"
                            onClick={() => handleVerifyUser(u.id, u.name)}
                            style={s.rowBtn}
                          >
                            Verify & Approve
                          </button>
                        ) : (
                          <span style={{ fontSize: 13, color: '#10B981', fontWeight: 800 }}>Verified ✓</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* MARKETPLACE PRODUCT REVIEW QUEUE */}
        <div style={s.card}>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#0F172A', marginBottom: 20 }}>
            📦 Marketplace Product Review Queue
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Product Title</th>
                  <th style={s.th}>Seller</th>
                  <th style={s.th}>Submitted Date</th>
                  <th style={s.th}>Status</th>
                  <th style={s.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ ...s.td, textAlign: 'center', color: '#64748B', padding: '36px' }}>
                      No product listings pending review.
                    </td>
                  </tr>
                ) : (
                  products.map((p) => (
                    <tr key={p.id}>
                      <td style={{ ...s.td, fontWeight: 800, color: '#0F172A' }}>{p.name}</td>
                      <td style={{ ...s.td, color: '#64748B' }}>{p.seller}</td>
                      <td style={s.td}>{p.submitted}</td>
                      <td style={s.td}>
                        <span style={{ padding: '4px 10px', borderRadius: 99, fontSize: 12, fontWeight: 800, background: p.status === 'approved' ? '#ECFDF5' : p.status === 'rejected' ? '#FEF2F2' : '#FFF7ED', color: p.status === 'approved' ? '#10B981' : p.status === 'rejected' ? '#EF4444' : '#EA580C' }}>
                          {p.status}
                        </span>
                      </td>
                      <td style={s.td}>
                        {p.status === 'pending' ? (
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              type="button"
                              onClick={() => handleApproveProduct(p.id, p.name)}
                              style={s.rowBtn}
                            >
                              Approve Listing
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRejectProduct(p.id, p.name)}
                              style={s.rowBtnGhost}
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: 13, color: p.status === 'approved' ? '#10B981' : '#EF4444', fontWeight: 800 }}>
                            {p.status.toUpperCase()}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* COMPLAINTS & SUPPORT TICKETS QUEUE */}
        <div style={s.card}>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#0F172A', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>⚠️ Contact Support Messages & Complaints Queue</span>
            <span style={{ fontSize: 12, background: 'rgba(234,88,12,0.1)', color: '#ea580c', padding: '4px 12px', borderRadius: 99, fontWeight: 800 }}>
              Live Support Inbox
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Subject & Inquiry</th>
                  <th style={s.th}>From User</th>
                  <th style={s.th}>Message Details</th>
                  <th style={s.th}>Status</th>
                  <th style={s.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {complaints.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ ...s.td, textAlign: 'center', color: '#64748B', padding: '36px' }}>
                      No support tickets or complaints received yet.
                    </td>
                  </tr>
                ) : (
                  complaints.map((c) => (
                    <tr key={c.id}>
                      <td style={{ ...s.td, fontWeight: 800, color: '#0F172A', maxWidth: 220 }}>
                        {c.subject}
                      </td>
                      <td style={{ ...s.td, color: '#64748B', maxWidth: 200 }}>
                        <div style={{ fontWeight: 800, color: '#0F172A' }}>{c.name || 'User'}</div>
                        <div style={{ fontSize: 12 }}>{c.email}</div>
                      </td>
                      <td style={{ ...s.td, color: '#334155', maxWidth: 360, fontSize: 13, lineHeight: 1.5 }}>
                        {c.message || 'Support inquiry submitted via contact form.'}
                      </td>
                      <td style={s.td}>
                        <span style={{ padding: '4px 10px', borderRadius: 99, fontSize: 12, fontWeight: 800, background: c.status === 'resolved' ? '#ECFDF5' : '#FEF2F2', color: c.status === 'resolved' ? '#10B981' : '#EF4444' }}>
                          {c.status}
                        </span>
                      </td>
                      <td style={s.td}>
                        {c.status === 'open' ? (
                          <button
                            type="button"
                            onClick={() => handleResolveComplaint(c.id)}
                            style={{ ...s.rowBtn, background: '#FF6B35' }}
                          >
                            Resolve Ticket
                          </button>
                        ) : (
                          <span style={{ fontSize: 13, color: '#10B981', fontWeight: 800 }}>Resolved ✓</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}