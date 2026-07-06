import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function PrinterOwnerDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (profile?.role !== 'printer_owner') redirect('/login')

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
    badge: { background: '#EFF6FF', color: '#3B82F6', borderRadius: 99, padding: '4px 12px', fontSize: 12, fontWeight: 600 },
    body: { maxWidth: 1100, margin: '0 auto', padding: '32px 24px' },
    welcome: { fontSize: 24, fontWeight: 700, color: '#0F172A', marginBottom: 4 },
    sub: { fontSize: 14, color: '#64748B', marginBottom: 32 },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 },
    statCard: { background: '#fff', borderRadius: 12, padding: '20px 24px', border: '1px solid #E2E8F0' },
    statVal: { fontSize: 28, fontWeight: 700, color: '#0F172A' },
    statLabel: { fontSize: 13, color: '#64748B', marginTop: 2 },
    section: { background: '#fff', borderRadius: 12, padding: '24px', border: '1px solid #E2E8F0', marginBottom: 20 },
    sectionTitle: { fontSize: 16, fontWeight: 600, color: '#0F172A', marginBottom: 16 },
    emptyState: { textAlign: 'center' as const, padding: '40px 0', color: '#94A3B8', fontSize: 14 },
    btn: { background: '#FF6B35', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
    signoutBtn: { background: 'none', border: 'none', color: '#94A3B8', fontSize: 13, cursor: 'pointer' },
    toggleOn: { background: '#10B981', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  }

  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <div style={s.logo}>Print<span style={s.logoAccent}>Hive</span></div>
        <div style={s.navRight}>
          <span style={s.badge}>Printer Owner</span>
          <span style={{ color: '#94A3B8', fontSize: 13 }}>{user.email}</span>
          <form action={handleSignOut}>
            <button type="submit" style={s.signoutBtn}>Sign out</button>
          </form>
        </div>
      </nav>

      <div style={s.body}>
        <div style={s.welcome}>Printer Dashboard 🖨️</div>
        <div style={s.sub}>{user.email} · Printer Owner account</div>

        <div style={s.grid}>
          {[
            { val: '0', label: 'Orders completed' },
            { val: '0', label: 'Active orders' },
            { val: '₹0', label: 'Total earned' },
            { val: '—', label: 'Avg. rating' },
          ].map(({ val, label }) => (
            <div key={label} style={s.statCard}>
              <div style={s.statVal}>{val}</div>
              <div style={s.statLabel}>{label}</div>
            </div>
          ))}
        </div>

        <div style={s.section}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={s.sectionTitle}>Availability Status</div>
              <div style={{ fontSize: 13, color: '#64748B' }}>Toggle whether you are accepting new orders</div>
            </div>
            <button style={s.toggleOn}>● Available</button>
          </div>
        </div>

        <div style={s.section}>
          <div style={{ ...s.sectionTitle, marginBottom: 16 }}>Incoming Orders</div>
          <div style={s.emptyState}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📦</div>
            <div style={{ fontWeight: 500, color: '#475569', marginBottom: 4 }}>No orders yet</div>
            <div>Register your printer to start receiving nearby print jobs</div>
          </div>
        </div>

        <div style={s.section}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={s.sectionTitle}>My Printers</div>
            <button style={s.btn}>+ Register Printer</button>
          </div>
          <div style={s.emptyState}>No printers registered yet. Add your machine to start accepting orders.</div>
        </div>
      </div>
    </div>
  )
}