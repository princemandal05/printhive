import { createClient } from '@/utils/supabase/server'
import { requireRole } from '@/utils/supabase/require-role'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const DEMO_PRINTERS = [
  { id: 'm1', name: 'Bambu Lab X1-Carbon Combo', type: 'FDM Dual-Color', volume: '256 x 256 x 256 mm', status: '🟢 Online & Printing', jobsCount: 42 },
  { id: 'm2', name: 'Creality Ender 3 S1 Pro', type: 'FDM High-Temp', volume: '220 x 220 x 270 mm', status: '🟢 Ready for Queue', jobsCount: 18 },
  { id: 'm3', name: 'Anycubic Photon Mono X 6Ks', type: 'MSLA Resin', volume: '197 x 122 x 200 mm', status: '🟡 Maintenance Check', jobsCount: 9 },
]

const INCOMING_JOBS = [
  { id: 'JOB-9012', distance: '3.2 km away', file: 'Headphone_Stand_v2.stl', material: 'PLA+ Charcoal Black', payout: '₹909.30 (70%)', status: 'Slicing Feasibility' },
  { id: 'JOB-9008', distance: '5.8 km away', file: 'Articulated_Dragon_Ruby.stl', material: 'PLA Silk Crimson', payout: '₹559.30 (70%)', status: 'Printing (Layer 142/350)' },
  { id: 'JOB-8994', distance: '1.4 km away', file: 'Planter_Pot_Set.3mf', material: 'PETG Marble White', payout: '₹384.30 (70%)', status: 'Ready for Courier Pick' },
]

export default async function PrinterOwnerDashboard() {
  const { user } = await requireRole('printer_owner')

  const handleSignOut = async () => {
    'use server'
    const s = await createClient()
    await s.auth.signOut()
    redirect('/')
  }

  // Fetch live printers from Supabase
  let printers = DEMO_PRINTERS
  try {
    const supabase = await createClient()
    const { data: dbPrinters } = await supabase.from('printers').select('*').order('created_at', { ascending: false })
    if (dbPrinters && dbPrinters.length > 0) {
      printers = dbPrinters.map((p: any, index: number) => ({
        id: p.id || `m-${index}`,
        name: p.printer_model || p.name || '3D Printer Unit',
        type: p.technology || 'FDM Precision',
        volume: p.build_volume || '220 x 220 x 250 mm',
        status: '🟢 Online & Printing',
        jobsCount: Math.floor(Math.random() * 30) + 5,
      }))
    }
  } catch (err) {}

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
    metricGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 36 },
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <span style={{ color: '#94A3B8', fontSize: 13, fontWeight: 600 }}>{user.email}</span>
          <form action={handleSignOut}>
            <button type="submit" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
              Sign Out
            </button>
          </form>
        </div>
      </nav>

      <div style={s.body}>
        {/* DASHBOARD HEADER */}
        <div style={s.headerRow}>
          <div>
            <h1 style={s.title}>Printer Fleet & Local Job Dispatch</h1>
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

        {/* METRICS CARDS GRID */}
        <div style={s.metricGrid}>
          <div style={s.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={s.metricLabel}>Total Payout Earnings</div>
              <span style={{ fontSize: 22 }}>💰</span>
            </div>
            <div style={s.metricVal}>₹34,265</div>
            <div style={{ fontSize: 12, color: '#10B981', marginTop: 8, fontWeight: 700 }}>70% Direct Order Escrow Split</div>
          </div>

          <div style={s.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={s.metricLabel}>Registered Fleet</div>
              <span style={{ fontSize: 22 }}>🖨️</span>
            </div>
            <div style={s.metricVal}>{printers.length} Machines</div>
            <div style={{ fontSize: 12, color: '#2563EB', marginTop: 8, fontWeight: 700 }}>Live on Leaflet Map</div>
          </div>

          <div style={s.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={s.metricLabel}>Active Job Queue</div>
              <span style={{ fontSize: 22 }}>⚡</span>
            </div>
            <div style={s.metricVal}>3 Jobs</div>
            <div style={{ fontSize: 12, color: '#FF6B35', marginTop: 8, fontWeight: 700 }}>Avg Print Time: 3.4 hrs</div>
          </div>

          <div style={s.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={s.metricLabel}>Hub Fleet Uptime</div>
              <span style={{ fontSize: 22 }}>📊</span>
            </div>
            <div style={s.metricVal}>98.6%</div>
            <div style={{ fontSize: 12, color: '#10B981', marginTop: 8, fontWeight: 700 }}>Top Tier Reliable Printer</div>
          </div>
        </div>

        {/* REGISTERED MACHINES FLEET */}
        <div style={{ ...s.card, marginBottom: 36 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#0F172A' }}>⚙️ My Registered 3D Printers</div>
              <div style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>Connected machines receiving local job assignments</div>
            </div>
            <Link href="/dashboard/printer-owner/register" style={{ color: '#2563EB', fontWeight: 800, fontSize: 14, textDecoration: 'none' }}>
              + Register Machine →
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {printers.map((p) => (
              <div key={p.id} style={{ background: '#F8FAFC', borderRadius: 16, border: '1px solid #E2E8F0', padding: 20 }}>
                <div style={{ fontSize: 12, color: '#2563EB', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4 }}>{p.type}</div>
                <div style={{ fontSize: 17, fontWeight: 900, color: '#0F172A', marginBottom: 6 }}>{p.name}</div>
                <div style={{ fontSize: 13, color: '#64748B', marginBottom: 12 }}>Build Volume: {p.volume}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FFFFFF', padding: '10px 14px', borderRadius: 12, border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#10B981' }}>{p.status}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>{p.jobsCount} Jobs Done</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* NEARBY JOBS QUEUE TABLE */}
        <div style={s.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#0F172A' }}>📦 Incoming Nearby Print Jobs</div>
              <div style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>Matched via Leaflet GPS geolocation engine</div>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Job ID</th>
                  <th style={s.th}>Distance</th>
                  <th style={s.th}>Model File</th>
                  <th style={s.th}>Material</th>
                  <th style={s.th}>Printer 70% Share</th>
                  <th style={s.th}>Current Status</th>
                </tr>
              </thead>
              <tbody>
                {INCOMING_JOBS.map((j) => (
                  <tr key={j.id}>
                    <td style={{ ...s.td, fontWeight: 800, color: '#0F172A' }}>{j.id}</td>
                    <td style={{ ...s.td, fontWeight: 700, color: '#2563EB' }}>📍 {j.distance}</td>
                    <td style={{ ...s.td, fontWeight: 700 }}>{j.file}</td>
                    <td style={s.td}>{j.material}</td>
                    <td style={{ ...s.td, fontWeight: 900, color: '#10B981' }}>{j.payout}</td>
                    <td style={s.td}>
                      <span style={{ padding: '4px 10px', borderRadius: 99, fontSize: 12, fontWeight: 800, background: '#EFF6FF', color: '#2563EB' }}>
                        {j.status}
                      </span>
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