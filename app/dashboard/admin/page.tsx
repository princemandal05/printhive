import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

// Mock data — replace with Supabase queries aggregating across
// `profiles`, `products`, `designs`, `orders`, and a `reports` table.
const MOCK_USERS = [
  { name: 'Priya Sharma', email: 'priya@example.com', role: 'buyer', joined: '12 Jul 2026', status: 'active' },
  { name: 'UrbanPrint Co.', email: 'urbanprint@example.com', role: 'seller', joined: '10 Jul 2026', status: 'pending' },
  { name: 'Aarav Mehta', email: 'aarav@example.com', role: 'designer', joined: '8 Jul 2026', status: 'active' },
  { name: "Rohan's PrintLab", email: 'rohan@example.com', role: 'printer_owner', joined: '5 Jul 2026', status: 'pending' },
]

const MOCK_PRODUCTS_PENDING = [
  { name: 'Geometric Planter Set (3)', seller: 'UrbanPrint Co.', submitted: '2 days ago' },
  { name: 'Cosplay Helmet Shell', seller: 'PropForge', submitted: '5 hours ago' },
]

const MOCK_COMPLAINTS = [
  { id: 'c1', subject: 'Late delivery on order #PH-2291', from: 'Priya S.', status: 'open' },
  { id: 'c2', subject: 'Print quality did not match preview', from: 'Rohan K.', status: 'open' },
]

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/login')

  const handleSignOut = async () => {
    'use server'
    const s = await createClient()
    await s.auth.signOut()
    redirect('/')
  }

  const s: Record<string, React.CSSProperties> = {
    page: { minHeight: '100vh', background: '#F1F5F9' },
    nav: { background: '#0F172A', padding: '0 32px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    logo: { fontSize: 18, fontWeight: 700, color: '#fff' },
    logoAccent: { color: '#FF6B35' },
    navRight: { display: 'flex', alignItems: 'center', gap: 16 },
    badge: { background: '#FEF2F2', color: '#991B1B', borderRadius: 99, padding: '4px 12px', fontSize: 12, fontWeight: 600 },
    body: { maxWidth: 1100, margin: '0 auto', padding: '32px 24px' },
    welcome: { fontSize: 24, fontWeight: 700, color: '#0F172A', marginBottom: 4 },
    sub: { fontSize: 14, color: '#64748B', marginBottom: 32 },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 },
    statCard: { background: '#fff', borderRadius: 12, padding: '20px 24px', border: '1px solid #E2E8F0' },
    statVal: { fontSize: 28, fontWeight: 700, color: '#0F172A' },
    statLabel: { fontSize: 13, color: '#64748B', marginTop: 2 },
    section: { background: '#fff', borderRadius: 12, padding: '24px', border: '1px solid #E2E8F0', marginBottom: 20 },
    sectionTitle: { fontSize: 16, fontWeight: 600, color: '#0F172A', marginBottom: 16 },
    signoutBtn: { background: 'none', border: 'none', color: '#94A3B8', fontSize: 13, cursor: 'pointer' },
    rowBtn: { background: '#0F172A', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' },
    rowBtnGhost: { background: 'none', border: '1px solid #E2E8F0', borderRadius: 6, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#475569' },
  }

  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <div style={s.logo}>Print<span style={s.logoAccent}>Hive</span></div>
        <div style={s.navRight}>
          <span style={s.badge}>Administrator</span>
          <span style={{ color: '#94A3B8', fontSize: 13 }}>{user.email}</span>
          <form action={handleSignOut}>
            <button type="submit" style={s.signoutBtn}>Sign out</button>
          </form>
        </div>
      </nav>

      <div style={s.body}>
        <div style={s.welcome}>Platform overview</div>
        <div style={s.sub}>Administrator dashboard</div>

        <div style={s.grid}>
          {[
            { val: '4', label: 'Total users' },
            { val: '2', label: 'Pending verifications' },
            { val: '₹0', label: 'Platform revenue' },
            { val: '2', label: 'Open complaints' },
          ].map(({ val, label }) => (
            <div key={label} style={s.statCard}>
              <div style={s.statVal}>{val}</div>
              <div style={s.statLabel}>{label}</div>
            </div>
          ))}
        </div>

        <div style={s.section}>
          <div style={s.sectionTitle}>User Management</div>
          <table className="table">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {MOCK_USERS.map((u) => (
                <tr key={u.email}>
                  <td>{u.name}</td>
                  <td className="text-muted">{u.email}</td>
                  <td><span className="badge badge-neutral">{u.role.replace('_', ' ')}</span></td>
                  <td>{u.joined}</td>
                  <td>
                    <span className={`badge ${u.status === 'active' ? 'badge-success' : 'badge-warning'}`}>{u.status}</span>
                  </td>
                  <td>
                    {u.status === 'pending' && <button style={s.rowBtn}>Verify</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={s.section}>
          <div style={s.sectionTitle}>Product Approvals</div>
          <table className="table">
            <thead>
              <tr><th>Product</th><th>Seller</th><th>Submitted</th><th></th></tr>
            </thead>
            <tbody>
              {MOCK_PRODUCTS_PENDING.map((p) => (
                <tr key={p.name}>
                  <td>{p.name}</td>
                  <td className="text-muted">{p.seller}</td>
                  <td>{p.submitted}</td>
                  <td>
                    <div className="flex gap-2">
                      <button style={s.rowBtn}>Approve</button>
                      <button style={s.rowBtnGhost}>Reject</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={s.section}>
          <div style={s.sectionTitle}>Complaints & Reports</div>
          <table className="table">
            <thead>
              <tr><th>Subject</th><th>From</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {MOCK_COMPLAINTS.map((c) => (
                <tr key={c.id}>
                  <td>{c.subject}</td>
                  <td className="text-muted">{c.from}</td>
                  <td><span className="badge badge-warning">{c.status}</span></td>
                  <td><button style={s.rowBtnGhost}>Resolve</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={s.section}>
          <div style={s.sectionTitle}>Platform Analytics</div>
          <p className="text-sm text-muted">
            Revenue, order volume, and category trend charts render here once
            connected to aggregated order data via Supabase.
          </p>
        </div>
      </div>
    </div>
  )
}