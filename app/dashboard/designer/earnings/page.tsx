import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

// Mock earnings — replace with a Supabase query against an `earnings` /
// `order_line_items` table filtered by designer_id, summed by month.
const MOCK_TRANSACTIONS = [
  { date: '8 Jul 2026', design: 'Articulated Dragon', order: '#PH-2291', buyer: 'Priya S.', amount: 68 },
  { date: '5 Jul 2026', design: 'Desk Organizer', order: '#PH-2277', buyer: 'Rohan K.', amount: 45 },
  { date: '2 Jul 2026', design: 'Articulated Dragon', order: '#PH-2260', buyer: 'Meera J.', amount: 68 },
  { date: '28 Jun 2026', design: 'Phone Stand', order: '#PH-2231', buyer: 'Aditya R.', amount: 30 },
]

export default async function DesignerEarningsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (profile?.role !== 'designer') redirect('/login')

  const totalEarnings = MOCK_TRANSACTIONS.reduce((sum, t) => sum + t.amount, 0)

  const s: Record<string, React.CSSProperties> = {
    page: { minHeight: '100vh', background: '#F1F5F9' },
    nav: { background: '#0F172A', padding: '0 32px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    logo: { fontSize: 18, fontWeight: 700, color: '#fff' },
    logoAccent: { color: '#FF6B35' },
    body: { maxWidth: 1100, margin: '0 auto', padding: '32px 24px' },
    title: { fontSize: 24, fontWeight: 700, color: '#0F172A', marginBottom: 4 },
    sub: { fontSize: 14, color: '#64748B', marginBottom: 32 },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 },
    statCard: { background: '#fff', borderRadius: 12, padding: '20px 24px', border: '1px solid #E2E8F0' },
    statVal: { fontSize: 28, fontWeight: 700, color: '#0F172A' },
    statLabel: { fontSize: 13, color: '#64748B', marginTop: 2 },
    section: { background: '#fff', borderRadius: 12, padding: '24px', border: '1px solid #E2E8F0' },
    sectionTitle: { fontSize: 16, fontWeight: 600, color: '#0F172A', marginBottom: 16 },
  }

  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <div style={s.logo}>Print<span style={s.logoAccent}>Hive</span></div>
        <a href="/dashboard/designer" style={{ color: '#94A3B8', fontSize: 13 }}>← Back to dashboard</a>
      </nav>

      <div style={s.body}>
        <div style={s.title}>Earnings</div>
        <div style={s.sub}>Royalties from every order across your published designs</div>

        <div style={s.grid}>
          {[
            { val: `₹${totalEarnings}`, label: 'Total earnings' },
            { val: `₹${MOCK_TRANSACTIONS.filter((t) => t.date.includes('Jul')).reduce((s2, t) => s2 + t.amount, 0)}`, label: 'This month' },
            { val: String(MOCK_TRANSACTIONS.length), label: 'Paid orders' },
            { val: '15%', label: 'Royalty rate' },
          ].map(({ val, label }) => (
            <div key={label} style={s.statCard}>
              <div style={s.statVal}>{val}</div>
              <div style={s.statLabel}>{label}</div>
            </div>
          ))}
        </div>

        <div style={s.section}>
          <div style={s.sectionTitle}>Transaction history</div>
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Design</th>
                <th>Order</th>
                <th>Buyer</th>
                <th>Royalty</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_TRANSACTIONS.map((t) => (
                <tr key={t.order}>
                  <td>{t.date}</td>
                  <td>{t.design}</td>
                  <td className="text-muted">{t.order}</td>
                  <td>{t.buyer}</td>
                  <td style={{ fontWeight: 600 }}>+₹{t.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}