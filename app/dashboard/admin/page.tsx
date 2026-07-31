'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

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
  from: string
  status: 'open' | 'resolved'
}

const INITIAL_USERS: UserRecord[] = [
  { id: 'u1', name: 'Priya Sharma', email: 'priya@example.com', role: 'buyer', joined: '12 Jul 2026', status: 'active' },
  { id: 'u2', name: 'UrbanPrint Co.', email: 'urbanprint@example.com', role: 'seller', joined: '10 Jul 2026', status: 'pending' },
  { id: 'u3', name: 'Aarav Mehta', email: 'aarav@example.com', role: 'designer', joined: '8 Jul 2026', status: 'active' },
  { id: 'u4', name: "Rohan's PrintLab", email: 'rohan@example.com', role: 'printer_owner', joined: '5 Jul 2026', status: 'pending' },
]

const INITIAL_PRODUCTS: ProductApproval[] = [
  { id: 'p1', name: 'Geometric Planter Set (3)', seller: 'UrbanPrint Co.', submitted: '2 days ago', status: 'pending' },
  { id: 'p2', name: 'Cosplay Helmet Shell', seller: 'PropForge', submitted: '5 hours ago', status: 'pending' },
]

const INITIAL_COMPLAINTS: Complaint[] = [
  { id: 'c1', subject: 'Late delivery on order #PH-2291', from: 'Priya S.', status: 'open' },
  { id: 'c2', subject: 'Print quality did not match preview', from: 'Rohan K.', status: 'open' },
]

export default function AdminDashboard() {
  const router = useRouter()
  const supabase = createClient()

  const [users, setUsers] = useState<UserRecord[]>(INITIAL_USERS)
  const [products, setProducts] = useState<ProductApproval[]>(INITIAL_PRODUCTS)
  const [complaints, setComplaints] = useState<Complaint[]>(INITIAL_COMPLAINTS)
  const [toastMsg, setToastMsg] = useState('')

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

  const handleResolveComplaint = (compId: string) => {
    setComplaints((prev) =>
      prev.map((c) => (c.id === compId ? { ...c, status: 'resolved' } : c))
    )
    showToast(`✅ Complaint resolved and closed.`)
  }

  const pendingVerificationsCount = users.filter((u) => u.status === 'pending').length
  const openComplaintsCount = complaints.filter((c) => c.status === 'open').length

  const s: Record<string, React.CSSProperties> = {
    page: { minHeight: '100vh', background: '#FAF8F5', color: '#0F172A', fontFamily: 'inherit' },
    nav: { background: '#0F172A', padding: '0 32px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)' },
    logo: { fontSize: 20, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' },
    logoAccent: { color: '#FF6B35' },
    badge: { background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 99, padding: '4px 14px', fontSize: 12, fontWeight: 800, textTransform: 'uppercase' as const, letterSpacing: 0.5 },
    body: { maxWidth: 1240, margin: '0 auto', padding: '36px 24px' },
    headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap' as const, gap: 16 },
    title: { fontSize: 28, fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.5px' },
    sub: { fontSize: 14, color: '#64748B', marginTop: 4 },
    metricGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 36 },
    card: { background: '#FFFFFF', borderRadius: 20, border: '1px solid #E2E8F0', padding: 24, boxShadow: '0 8px 30px rgba(0,0,0,0.04)', marginBottom: 28 },
    metricVal: { fontSize: 32, fontWeight: 900, color: '#0F172A', marginTop: 6, letterSpacing: '-0.5px' },
    metricLabel: { fontSize: 13, color: '#64748B', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: 0.5 },
    table: { width: '100%', borderCollapse: 'collapse' as const, textAlign: 'left' as const },
    th: { background: '#F8FAFC', padding: '14px 18px', fontSize: 12, fontWeight: 800, color: '#475569', textTransform: 'uppercase' as const, letterSpacing: 0.5, borderBottom: '1px solid #E2E8F0' },
    td: { padding: '16px 18px', fontSize: 14, borderBottom: '1px solid #F1F5F9', color: '#334155' },
    rowBtn: { background: '#0F172A', color: '#fff', border: 'none', borderRadius: 10, padding: '8px 18px', fontSize: 13, fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s' },
    rowBtnGhost: { background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: 10, padding: '8px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer', color: '#475569' },
  }

  return (
    <div style={s.page}>
      {/* ADMIN CONTROL HUB NAVIGATION */}
      <nav style={s.nav}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={s.logo}>
            <Link href="/" style={{ textDecoration: 'none', color: '#fff' }}>
              Print<span style={s.logoAccent}>Hive</span>
            </Link>{' '}
            <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600 }}>Admin Console</span>
          </div>
          <span style={s.badge}>🛡️ Administrator</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <button type="button" onClick={handleSignOut} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
            Sign Out
          </button>
        </div>
      </nav>

      <div style={s.body}>
        {/* DASHBOARD HEADER */}
        <div style={s.headerRow}>
          <div>
            <h1 style={s.title}>Platform Control & Verification Portal</h1>
            <div style={s.sub}>Automated seller verification, product approvals, and complaint dispute resolution</div>
          </div>
        </div>

        {toastMsg && (
          <div style={{ background: '#ECFDF5', color: '#065F46', padding: '14px 20px', borderRadius: 14, fontSize: 14, marginBottom: 24, fontWeight: 800, border: '1px solid #A7F3D0', boxShadow: '0 4px 20px rgba(16,185,129,0.15)' }}>
            {toastMsg}
          </div>
        )}

        {/* METRICS GRID */}
        <div style={s.metricGrid}>
          <div style={s.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={s.metricLabel}>Total Users</div>
              <span style={{ fontSize: 22 }}>👥</span>
            </div>
            <div style={s.metricVal}>{users.length} Users</div>
            <div style={{ fontSize: 12, color: '#10B981', marginTop: 8, fontWeight: 700 }}>Buyers, Sellers, Printers & Designers</div>
          </div>

          <div style={s.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={s.metricLabel}>Pending Verifications</div>
              <span style={{ fontSize: 22 }}>📋</span>
            </div>
            <div style={{ ...s.metricVal, color: pendingVerificationsCount > 0 ? '#D97706' : '#10B981' }}>
              {pendingVerificationsCount} Pending
            </div>
            <div style={{ fontSize: 12, color: '#64748B', marginTop: 8, fontWeight: 600 }}>Click Verify below to approve</div>
          </div>

          <div style={s.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={s.metricLabel}>Platform Fee Revenue (15%)</div>
              <span style={{ fontSize: 22 }}>💰</span>
            </div>
            <div style={s.metricVal}>₹12,450</div>
            <div style={{ fontSize: 12, color: '#10B981', marginTop: 8, fontWeight: 700 }}>15% Platform Split on All Orders</div>
          </div>

          <div style={s.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={s.metricLabel}>Open Complaints</div>
              <span style={{ fontSize: 22 }}>⚠️</span>
            </div>
            <div style={{ ...s.metricVal, color: openComplaintsCount > 0 ? '#EF4444' : '#10B981' }}>
              {openComplaintsCount} Open
            </div>
            <div style={{ fontSize: 12, color: '#64748B', marginTop: 8, fontWeight: 600 }}>Dispute Escrow Resolution</div>
          </div>
        </div>

        {/* USER MANAGEMENT & VERIFICATION TABLE */}
        <div style={s.card}>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#0F172A', marginBottom: 20 }}>
            👥 User Management & Seller/Printer Verification
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Name</th>
                  <th style={s.th}>Email</th>
                  <th style={s.th}>Account Role</th>
                  <th style={s.th}>Joined Date</th>
                  <th style={s.th}>Verification Status</th>
                  <th style={s.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td style={{ ...s.td, fontWeight: 800, color: '#0F172A' }}>{u.name}</td>
                    <td style={{ ...s.td, color: '#64748B' }}>{u.email}</td>
                    <td style={s.td}>
                      <span style={{ padding: '4px 10px', borderRadius: 99, fontSize: 12, fontWeight: 800, background: '#F1F5F9', color: '#475569', textTransform: 'uppercase' }}>
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ ...s.td, color: '#64748B', fontSize: 13 }}>{u.joined}</td>
                    <td style={s.td}>
                      <span style={{ padding: '4px 10px', borderRadius: 99, fontSize: 12, fontWeight: 800, background: u.status === 'verified' || u.status === 'active' ? '#ECFDF5' : '#FEF3C7', color: u.status === 'verified' || u.status === 'active' ? '#10B981' : '#D97706' }}>
                        {u.status === 'verified' ? '🟢 Verified' : u.status === 'active' ? '🟢 Active' : '⏳ Pending Verification'}
                      </span>
                    </td>
                    <td style={s.td}>
                      {u.status === 'pending' ? (
                        <button
                          type="button"
                          onClick={() => handleVerifyUser(u.id, u.name)}
                          style={{ ...s.rowBtn, background: '#10B981' }}
                        >
                          Verify & Approve →
                        </button>
                      ) : (
                        <span style={{ fontSize: 13, color: '#10B981', fontWeight: 800 }}>Verified ✓</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* PRODUCT APPROVALS TABLE */}
        <div style={s.card}>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#0F172A', marginBottom: 20 }}>
            📦 Product & Model Approvals Queue
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Product Title</th>
                  <th style={s.th}>Seller / Designer</th>
                  <th style={s.th}>Submitted</th>
                  <th style={s.th}>Status</th>
                  <th style={s.th}>Approval Action</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td style={{ ...s.td, fontWeight: 800, color: '#0F172A' }}>{p.name}</td>
                    <td style={{ ...s.td, color: '#64748B' }}>{p.seller}</td>
                    <td style={{ ...s.td, color: '#64748B', fontSize: 13 }}>{p.submitted}</td>
                    <td style={s.td}>
                      <span style={{ padding: '4px 10px', borderRadius: 99, fontSize: 12, fontWeight: 800, background: p.status === 'approved' ? '#ECFDF5' : p.status === 'rejected' ? '#FEF2F2' : '#FEF3C7', color: p.status === 'approved' ? '#10B981' : p.status === 'rejected' ? '#EF4444' : '#D97706' }}>
                        {p.status}
                      </span>
                    </td>
                    <td style={s.td}>
                      {p.status === 'pending' ? (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            type="button"
                            onClick={() => handleApproveProduct(p.id, p.name)}
                            style={{ ...s.rowBtn, background: '#10B981' }}
                          >
                            Approve
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
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#64748B' }}>Completed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* COMPLAINTS & REPORTS */}
        <div style={s.card}>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#0F172A', marginBottom: 20 }}>
            ⚠️ Complaints & Disputes Queue
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Subject</th>
                  <th style={s.th}>From User</th>
                  <th style={s.th}>Status</th>
                  <th style={s.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c) => (
                  <tr key={c.id}>
                    <td style={{ ...s.td, fontWeight: 800, color: '#0F172A' }}>{c.subject}</td>
                    <td style={{ ...s.td, color: '#64748B' }}>{c.from}</td>
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
                          Resolve & Release Escrow →
                        </button>
                      ) : (
                        <span style={{ fontSize: 13, color: '#10B981', fontWeight: 800 }}>Resolved ✓</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}