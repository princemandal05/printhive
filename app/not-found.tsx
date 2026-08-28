import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ROUTES } from '@/lib/routes'

export default function NotFound() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-canvas)', color: 'var(--text-main)' }}>
      <Navbar />

      <section style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: 540, width: '100%' }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 24,
              background: 'rgba(234, 88, 12, 0.1)',
              border: '1px solid rgba(234, 88, 12, 0.3)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 36,
              marginBottom: 24,
            }}
          >
            🖨️
          </div>

          <div style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: '#ea580c', marginBottom: 8 }}>
            404 • Layer Not Found
          </div>

          <h1 style={{ fontSize: 32, fontWeight: 900, color: 'var(--text-main)', margin: '0 0 12px 0', letterSpacing: '-0.5px' }}>
            Looks like this print didn't make it through
          </h1>

          <p style={{ color: 'var(--text-sub)', fontSize: 15, lineHeight: 1.6, margin: '0 0 32px 0' }}>
            The model, product, or destination you are searching for does not exist or has been relocated to another workspace.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href={ROUTES.home}
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
              Back to Home
            </Link>
            <Link
              href={ROUTES.models}
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
              Browse 3D Models
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
