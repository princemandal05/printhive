import { createClient } from '@/utils/supabase/server'
import { requireRole } from '@/utils/supabase/require-role'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'

interface PrinterCard {
  id: string
  name: string
  type: string
  volume: string
  status: string
  jobsCount: number
}

interface DbPrinterRow {
  id?: string
  name?: string
  printer_model?: string
  technology?: string
  build_volume?: string
  status?: string
}

export default async function PrinterOwnerDashboard() {
  const { user } = await requireRole('printer_owner')

  const handleSignOut = async () => {
    'use server'
    const cookieStore = await cookies()
    cookieStore.set('printhive_guest_role', '', { maxAge: 0, path: '/' })
    cookieStore.set('printhive_auth_role', '', { maxAge: 0, path: '/' })
    const s = await createClient()
    await s.auth.signOut()
    redirect('/')
  }

  // Fetch live printers from Supabase with error tracking
  let printers: PrinterCard[] = []
  let loadError: string | null = null

  try {
    const supabase = await createClient()
    const { data: dbPrinters, error } = await supabase.from('printers').select('*').order('created_at', { ascending: false })
    if (error) {
      loadError = error.message
    } else if (dbPrinters && dbPrinters.length > 0) {
      printers = dbPrinters.map((p: DbPrinterRow, index: number) => ({
        id: p.id || `m-${index}`,
        name: p.printer_model || p.name || '3D Printer Unit',
        type: p.technology || 'FDM Precision',
        volume: p.build_volume || '220 x 220 x 250 mm',
        status: p.status || '🟢 Online & Printing',
        jobsCount: 0,
      }))
    }
  } catch (err: unknown) {
    const error = err as Error
    loadError = error.message || 'Failed to query printer fleet.'
  }

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

        {/* ERROR ALERT BANNER */}
        {loadError && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#B91C1C', padding: '16px 20px', borderRadius: 16, marginBottom: 28, fontSize: 14, fontWeight: 700 }}>
            ⚠️ Error loading printer fleet: {loadError}
          </div>
        )}

        {/* METRICS CARDS GRID */}
        <div style={s.metricGrid}>
          <div style={s.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={s.metricLabel}>Total Payout Earnings</div>
              <span style={{ fontSize: 22 }}>💰</span>
            </div>
            <div style={s.metricVal}>₹0</div>
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
            <div style={s.metricVal}>0 Jobs</div>
            <div style={{ fontSize: 12, color: '#64748B', marginTop: 8, fontWeight: 600 }}>Nearby Order Assignments</div>
          </div>

          <div style={s.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={s.metricLabel}>Hub Fleet Status</div>
              <span style={{ fontSize: 22 }}>📊</span>
            </div>
            <div style={s.metricVal}>{printers.length > 0 ? `${printers.length} Online` : 'No Machines'}</div>
            <div style={{ fontSize: 12, color: '#10B981', marginTop: 8, fontWeight: 700 }}>Verified PrintHub Partner</div>
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
              + Register Machine
            </Link>
          </div>

          {printers.length === 0 && !loadError ? (
            <div style={{ textAlign: 'center', padding: '48px 24px', background: '#F8FAFC', borderRadius: 16, border: '2px dashed #CBD5E1' }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🖨️</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#0F172A', marginBottom: 4 }}>No 3D Printers Registered Yet</div>
              <div style={{ fontSize: 13, color: '#64748B', marginBottom: 16 }}>Register your 3D printing equipment to start fulfilling nearby print jobs and earning 70% payouts.</div>
              <Link href="/dashboard/printer-owner/register" style={s.primaryBtn}>
                + Register Your First 3D Printer
              </Link>
            </div>
          ) : (
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
          )}
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
                  <th style={s.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '32px 16px', color: '#64748B', fontSize: 13, fontWeight: 600 }}>
                    No active print jobs in your queue yet. When buyers upload STL files for printing in your city, jobs will route to your hub.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* CUSTOMER SUPPORT TICKETS DESK FOR PRINTER OWNERS */}
        <div style={{ ...s.card, marginTop: 36 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#0F172A' }}>🎧 Printer Owner Support Desk</div>
              <div style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>Questions about print job dispatches, escrow payouts, or machine registration? Contact Support.</div>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href="/support-tickets" style={{ background: '#0F172A', color: '#fff', padding: '10px 18px', borderRadius: 12, fontWeight: 800, fontSize: 13, textDecoration: 'none' }}>
                📋 My Support Tickets
              </Link>
              <Link href="/contact" style={{ background: '#1d4ed8', color: '#ffffff', padding: '10px 18px', borderRadius: 12, fontWeight: 800, fontSize: 13, textDecoration: 'none' }}>
                ✉️ Send Message to Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}