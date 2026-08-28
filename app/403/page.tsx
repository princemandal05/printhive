import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { createClient } from '@/utils/supabase/server'
import { resolveRoleDashboard, getRoleDisplayName, ROUTES } from '@/lib/routes'

export default async function ForbiddenPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let role = 'buyer'
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
    if (profile?.role) {
      role = profile.role
    }
  }

  const roleDisplayName = getRoleDisplayName(role)
  const dashboardRoute = resolveRoleDashboard(role)

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-canvas)', color: 'var(--text-main)' }}>
      <Navbar />

      <section style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: 520, width: '100%' }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 24,
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 36,
              marginBottom: 24,
            }}
          >
            🚫
          </div>

          <div style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: '#ef4444', marginBottom: 8 }}>
            403 • Restricted Zone
          </div>

          <h1 style={{ fontSize: 30, fontWeight: 900, color: 'var(--text-main)', margin: '0 0 12px 0', letterSpacing: '-0.5px' }}>
            Access Restricted for this Account
          </h1>

          <p style={{ color: 'var(--text-sub)', fontSize: 15, lineHeight: 1.6, margin: '0 0 20px 0' }}>
            This workspace requires administrative or specialized role permissions that are not assigned to your active session.
          </p>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 16, padding: '12px 20px', display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 32 }}>
            <span style={{ fontSize: 13, color: 'var(--text-sub)' }}>Signed in as:</span>
            <strong style={{ fontSize: 13, color: 'var(--text-main)' }}>{roleDisplayName}</strong>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href={dashboardRoute}
              style={{
                background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
                color: '#fff',
                padding: '12px 24px',
                borderRadius: 99,
                fontWeight: 800,
                fontSize: 14,
                textDecoration: 'none',
                boxShadow: '0 4px 16px rgba(234, 88, 12, 0.35)',
              }}
            >
              Go to Your Dashboard →
            </Link>
            <Link
              href={ROUTES.home}
              style={{
                background: 'var(--bg-card)',
                color: 'var(--text-main)',
                border: '1px solid var(--border-color)',
                padding: '12px 24px',
                borderRadius: 99,
                fontWeight: 800,
                fontSize: 14,
                textDecoration: 'none',
              }}
            >
              Back to Home
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
