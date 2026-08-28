import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ROUTES } from '@/lib/routes'

export default function TrustPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-canvas)', color: 'var(--text-main)' }}>
      <Navbar />

      <section className="container section-sm" style={{ maxWidth: 900, margin: '0 auto', padding: '60px 20px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(234, 88, 12, 0.1)', color: '#ea580c', border: '1px solid rgba(234, 88, 12, 0.3)', padding: '4px 14px', borderRadius: 99, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', marginBottom: 16 }}>
            🛡️ SafeGuard Architecture
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 900, letterSpacing: '-0.8px', margin: '0 0 16px 0' }}>
            Trust, Security &amp; Escrow Guarantee
          </h1>
          <p style={{ color: 'var(--text-sub)', fontSize: 16, lineHeight: 1.6, maxWidth: 640, margin: '0 auto' }}>
            How PrintHive protects buyers, creators, and printer hub operators through smart escrow milestone protection and quality verification.
          </p>
        </div>

        {/* 3 CORE PILLARS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24, marginBottom: 48 }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 20, padding: 28, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(16,185,129,0.1)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 16 }}>
              🔒
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 800, margin: '0 0 8px 0' }}>100% Escrow Protection</h3>
            <p style={{ color: 'var(--text-sub)', fontSize: 13.5, lineHeight: 1.6, margin: 0 }}>
              Payment is held securely in escrow upon order placement and released only when the physical part passes quality inspection and is delivered.
            </p>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 20, padding: 28, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(234,88,12,0.1)', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 16 }}>
              📐
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 800, margin: '0 0 8px 0' }}>CAD Geometry Validation</h3>
            <p style={{ color: 'var(--text-sub)', fontSize: 13.5, lineHeight: 1.6, margin: 0 }}>
              Automated mesh topology diagnostics inspect manifold watertightness, volume calculation, and support structures prior to physical fabrication.
            </p>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 20, padding: 28, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(139,92,246,0.1)', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 16 }}>
              ✨
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 800, margin: '0 0 8px 0' }}>Reprint Guarantee</h3>
            <p style={{ color: 'var(--text-sub)', fontSize: 13.5, lineHeight: 1.6, margin: 0 }}>
              If a physical print has manufacturing defects or dimensional out-of-spec tolerances, PrintHive covers an instant free re-route and reprint.
            </p>
          </div>
        </div>

        {/* WORKFLOW SUMMARY */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 24, padding: 36, marginBottom: 48 }}>
          <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 20 }}>How the Escrow Lifecycle Works</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#ea580c', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 12, flexShrink: 0 }}>1</div>
              <div>
                <strong style={{ fontSize: 14.5 }}>Quote &amp; Hub Assignment</strong>
                <p style={{ color: 'var(--text-sub)', fontSize: 13.5, margin: '4px 0 0 0', lineHeight: 1.5 }}>
                  The buyer configures material, infill, and destination. The nearby hub accepts the build request.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#ea580c', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 12, flexShrink: 0 }}>2</div>
              <div>
                <strong style={{ fontSize: 14.5 }}>Escrow Deposit Authorization</strong>
                <p style={{ color: 'var(--text-sub)', fontSize: 13.5, margin: '4px 0 0 0', lineHeight: 1.5 }}>
                  Funds are secured via Razorpay Escrow. Neither party can prematurely withdraw or tamper with funds.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#ea580c', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 12, flexShrink: 0 }}>3</div>
              <div>
                <strong style={{ fontSize: 14.5 }}>Fabrication &amp; Quality Check</strong>
                <p style={{ color: 'var(--text-sub)', fontSize: 13.5, margin: '4px 0 0 0', lineHeight: 1.5 }}>
                  The printer owner executes the G-code slice and submits photo verification before package dispatch.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#ea580c', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 12, flexShrink: 0 }}>4</div>
              <div>
                <strong style={{ fontSize: 14.5 }}>Delivery Confirmation &amp; Split Release</strong>
                <p style={{ color: 'var(--text-sub)', fontSize: 13.5, margin: '4px 0 0 0', lineHeight: 1.5 }}>
                  Upon physical delivery confirmation, the platform automatically disburses 70% to the printer and 15% to the CAD designer.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <Link
            href={ROUTES.models}
            style={{
              background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
              color: '#fff',
              padding: '14px 28px',
              borderRadius: 99,
              fontWeight: 800,
              fontSize: 15,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 4px 16px rgba(234, 88, 12, 0.35)',
            }}
          >
            Explore Protected Marketplace →
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  )
}
