import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DesignerDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (profile?.role !== 'designer') redirect('/login')

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
    badge: { background: '#FFF1EB', color: '#FF6B35', borderRadius: 99, padding: '4px 12px', fontSize: 12, fontWeight: 600 },
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
  }

  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <div style={s.logo}>Print<span style={s.logoAccent}>Hive</span></div>
        <div style={s.navRight}>
          <span style={s.badge}>Designer</span>
          <span style={{ color: '#94A3B8', fontSize: 13 }}>{user.email}</span>
          <form action={handleSignOut}>
            <button type="submit" style={s.signoutBtn}>Sign out</button>
          </form>
        </div>
      </nav>

      <div style={s.body}>
        <div style={s.welcome}>Welcome back 👋</div>
        <div style={s.sub}>{user.email} · Designer account</div>

        <div style={s.grid}>
          {[
            { val: '0', label: 'Designs published' },
            { val: '0', label: 'Total downloads' },
            { val: '₹0', label: 'Total earnings' },
            { val: '0', label: 'Active orders' },
          ].map(({ val, label }) => (
            <div key={label} style={s.statCard}>
              <div style={s.statVal}>{val}</div>
              <div style={s.statLabel}>{label}</div>
            </div>
          ))}
        </div>

        <div style={s.section}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={s.sectionTitle}>My Designs</div>
            <Link href="/dashboard/designer/upload" style={{ ...s.btn, display: 'inline-block', textDecoration: 'none' }}>+ Upload Design</Link>
          </div>
          <div style={s.emptyState}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🖨️</div>
            <div style={{ fontWeight: 500, color: '#475569', marginBottom: 4 }}>No designs yet</div>
            <div>Upload your first STL or 3MF file to start earning royalties</div>
          </div>
        </div>

        <div style={s.section}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={s.sectionTitle}>Recent Earnings</div>
            <Link href="/dashboard/designer/earnings" style={{ color: '#FF6B35', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>View all →</Link>
          </div>
          <div style={s.emptyState}>Royalties from orders will appear here</div>
        </div>

        <div style={s.section}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={s.sectionTitle}>Custom Design Requests</div>
            <Link href="/requests" style={{ color: '#FF6B35', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>Browse open requests →</Link>
          </div>
          <div style={s.emptyState}>Bid on buyer briefs to win custom design jobs</div>
        </div>
      </div>
    </div>
  )
}