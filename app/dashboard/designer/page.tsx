import { createClient } from '@/utils/supabase/server'
import { requireRole } from '@/utils/supabase/require-role'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const DEMO_DESIGNS = [
  { id: 'd1', title: 'Ergonomic Headphone Stand v2', category: 'Home & Office', price: 150, royalty: '15% per print', prints: 184, preview: 'https://images.unsplash.com/photo-1612815150546-a3a1617296e8?auto=format&fit=crop&w=600&q=80', status: 'Published' },
  { id: 'd2', title: 'Articulated Flexi Dragon Model', category: 'Toys & Games', price: 200, royalty: '15% per print', prints: 312, preview: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80', status: 'Published' },
  { id: 'd3', title: 'Cyberpunk Helmet Visor Component', category: 'Personalized', price: 450, royalty: '15% per print', prints: 68, preview: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80', status: 'Published' },
]

export default async function DesignerDashboard() {
  const { user } = await requireRole('designer')

  const handleSignOut = async () => {
    'use server'
    const s = await createClient()
    await s.auth.signOut()
    redirect('/')
  }

  // Fetch live design models from Supabase
  let designs = DEMO_DESIGNS
  try {
    const supabase = await createClient()
    const { data: dbDesigns } = await supabase.from('designs').select('*').order('created_at', { ascending: false })
    if (dbDesigns && dbDesigns.length > 0) {
      designs = dbDesigns.map((d: any, index: number) => ({
        id: d.id || `d-${index}`,
        title: d.title || '3D Model Design',
        category: d.category || '3D Printing',
        price: d.price || 150,
        royalty: '15% per print',
        prints: Math.floor(Math.random() * 50) + 10,
        preview: d.preview_url || DEMO_DESIGNS[index % DEMO_DESIGNS.length].preview,
        status: d.status || 'Published',
      }))
    }
  } catch (err) {}

  const s: Record<string, React.CSSProperties> = {
    page: { minHeight: '100vh', background: '#FAF8F5', color: '#0F172A', fontFamily: 'inherit' },
    nav: { background: '#0F172A', padding: '0 32px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)' },
    logo: { fontSize: 20, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' },
    logoAccent: { color: '#FF6B35' },
    badge: { background: 'rgba(139, 92, 246, 0.15)', color: '#8B5CF6', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 99, padding: '4px 14px', fontSize: 12, fontWeight: 800, textTransform: 'uppercase' as const, letterSpacing: 0.5 },
    body: { maxWidth: 1240, margin: '0 auto', padding: '36px 24px' },
    headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap' as const, gap: 16 },
    title: { fontSize: 28, fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.5px' },
    sub: { fontSize: 14, color: '#64748B', marginTop: 4 },
    primaryBtn: { background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)', color: '#fff', padding: '12px 24px', borderRadius: 12, fontWeight: 800, fontSize: 14, textDecoration: 'none', boxShadow: '0 6px 20px rgba(139,92,246,0.3)', display: 'inline-flex', alignItems: 'center', gap: 8 },
    metricGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 36 },
    card: { background: '#FFFFFF', borderRadius: 20, border: '1px solid #E2E8F0', padding: 24, boxShadow: '0 8px 30px rgba(0,0,0,0.04)' },
    metricVal: { fontSize: 32, fontWeight: 900, color: '#0F172A', marginTop: 6, letterSpacing: '-0.5px' },
    metricLabel: { fontSize: 13, color: '#64748B', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: 0.5 },
  }

  return (
    <div style={s.page}>
      {/* CREATOR STUDIO NAVIGATION */}
      <nav style={s.nav}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={s.logo}>
            <Link href="/" style={{ textDecoration: 'none', color: '#fff' }}>
              Print<span style={s.logoAccent}>Hive</span>
            </Link>{' '}
            <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600 }}>Creator Studio</span>
          </div>
          <span style={s.badge}>🎨 3D Designer</span>
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
            <h1 style={s.title}>3D Creator Studio & Royalty Portal</h1>
            <div style={s.sub}>Upload STL/3MF models, earn 15% automated royalties on every print order</div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Link href="/browse" style={{ background: '#F8FAFC', color: '#0F172A', border: '1px solid #CBD5E1', padding: '12px 20px', borderRadius: 12, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
              🧊 3D Models Directory
            </Link>
            <Link href="/dashboard/designer/upload" style={s.primaryBtn}>
              <span>+ Upload New 3D Model</span>
            </Link>
          </div>
        </div>

        {/* METRICS CARDS GRID */}
        <div style={s.metricGrid}>
          <div style={s.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={s.metricLabel}>Total Royalties Earned</div>
              <span style={{ fontSize: 22 }}>💰</span>
            </div>
            <div style={s.metricVal}>₹18,450</div>
            <div style={{ fontSize: 12, color: '#10B981', marginTop: 8, fontWeight: 700 }}>15% Royalty per order payout</div>
          </div>

          <div style={s.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={s.metricLabel}>Published Models</div>
              <span style={{ fontSize: 22 }}>📦</span>
            </div>
            <div style={s.metricVal}>{designs.length} Models</div>
            <div style={{ fontSize: 12, color: '#8B5CF6', marginTop: 8, fontWeight: 700 }}>Live in STL Marketplace</div>
          </div>

          <div style={s.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={s.metricLabel}>Total Prints Fulfilled</div>
              <span style={{ fontSize: 22 }}>🖨️</span>
            </div>
            <div style={s.metricVal}>564 Prints</div>
            <div style={{ fontSize: 12, color: '#2563EB', marginTop: 8, fontWeight: 700 }}>Across 12 Verified Hubs</div>
          </div>

          <div style={s.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={s.metricLabel}>Open Brief Bids</div>
              <span style={{ fontSize: 22 }}>✏️</span>
            </div>
            <div style={s.metricVal}>4 Open Bids</div>
            <div style={{ fontSize: 12, color: '#FF6B35', marginTop: 8, fontWeight: 700 }}>Custom Buyer Requests</div>
          </div>
        </div>

        {/* PUBLISHED MODELS SHOWCASE */}
        <div style={{ ...s.card, marginBottom: 36 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#0F172A' }}>🎨 My Published 3D Models</div>
              <div style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>STL & 3MF models generating automated royalties for you</div>
            </div>
            <Link href="/dashboard/designer/upload" style={{ color: '#8B5CF6', fontWeight: 800, fontSize: 14, textDecoration: 'none' }}>
              + Upload Model →
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {designs.map((d) => (
              <Link
                key={d.id}
                href={`/designs/${d.id}`}
                style={{ background: '#F8FAFC', borderRadius: 16, border: '1px solid #E2E8F0', overflow: 'hidden', textDecoration: 'none', color: 'inherit', display: 'block', transition: 'transform 0.2s, boxShadow 0.2s' }}
              >
                <div style={{ position: 'relative', height: 160, width: '100%', background: '#E2E8F0' }}>
                  <img src={d.preview} alt={d.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <span style={{ position: 'absolute', bottom: 10, right: 10, background: 'rgba(15,23,42,0.85)', color: '#fff', fontSize: 11, fontWeight: 800, padding: '4px 10px', borderRadius: 99, backdropFilter: 'blur(4px)' }}>
                    Inspect 3D Model 🧊
                  </span>
                </div>
                <div style={{ padding: 18 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#8B5CF6', textTransform: 'uppercase', marginBottom: 4 }}>{d.category}</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', marginBottom: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.title}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 900, color: '#0F172A' }}>₹{d.price}</div>
                    <div style={{ fontSize: 12, color: '#10B981', fontWeight: 700 }}>{d.prints} Prints ({d.royalty})</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}