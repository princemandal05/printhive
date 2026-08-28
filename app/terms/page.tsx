import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function TermsPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-canvas)', color: 'var(--text-main)' }}>
      <Navbar />

      <section className="container section-sm" style={{ maxWidth: 840, margin: '0 auto', padding: '60px 20px 80px' }}>
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: '#ea580c', letterSpacing: 1, marginBottom: 8 }}>
            Legal Framework
          </div>
          <h1 style={{ fontSize: 34, fontWeight: 900, letterSpacing: '-0.5px', margin: '0 0 12px 0' }}>
            Terms of Service &amp; Community Guidelines
          </h1>
          <div style={{ fontSize: 13, color: 'var(--text-sub)' }}>
            Last Updated: August 2026 • PrintHive Inc.
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 24, padding: 36, display: 'flex', flexDirection: 'column', gap: 28 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 10px 0' }}>1. Marketplace Agreement</h2>
            <p style={{ color: 'var(--text-sub)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
              By accessing PrintHive, buyers, designers, printer operators, and vendors agree to participate in our decentralized additive manufacturing network in accordance with intellectual property laws and quality benchmarks.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 10px 0' }}>2. Escrow Protection &amp; Settlement</h2>
            <p style={{ color: 'var(--text-sub)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
              All transactions are secured via Razorpay Escrow. Funds remain protected in escrow until physical package receipt is confirmed by the buyer or tracking confirms delivery. Printer payouts (70%) and designer royalties (15%) are released automatically upon delivery.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 10px 0' }}>3. CAD Intellectual Property Rights</h2>
            <p style={{ color: 'var(--text-sub)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
              Designers retain 100% copyright ownership of uploaded 3D geometries. By listing a model for on-demand fabrication, creators grant PrintHive a limited manufacturing license to produce physical prints upon buyer order.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 10px 0' }}>4. Printer Hub Calibration &amp; Standards</h2>
            <p style={{ color: 'var(--text-sub)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
              Printer Hub operators agree to fabricate models according to buyer-selected slicing specifications (infill %, material type, layer height) and submit photo verification before dispatch.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 10px 0' }}>5. Dispute Resolution &amp; Reprints</h2>
            <p style={{ color: 'var(--text-sub)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
              Defective or broken prints reported within 48 hours with photographic evidence qualify for a free reprint or full escrow refund under the PrintHive SafeGuard program.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
