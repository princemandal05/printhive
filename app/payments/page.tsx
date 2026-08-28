import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ROUTES } from '@/lib/routes'

export default function PaymentsPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-canvas)', color: 'var(--text-main)' }}>
      <Navbar />

      <section className="container section-sm" style={{ maxWidth: 900, margin: '0 auto', padding: '60px 20px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(234, 88, 12, 0.1)', color: '#ea580c', border: '1px solid rgba(234, 88, 12, 0.3)', padding: '4px 14px', borderRadius: 99, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', marginBottom: 16 }}>
            💰 Transparent Economics
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 900, letterSpacing: '-0.8px', margin: '0 0 16px 0' }}>
            70 / 15 / 15 Payout Model &amp; Settlement Ledger
          </h1>
          <p style={{ color: 'var(--text-sub)', fontSize: 16, lineHeight: 1.6, maxWidth: 640, margin: '0 auto' }}>
            PrintHive powers sustainable distributed manufacturing with guaranteed creator royalties, fair operator payouts, and protected buyer escrow.
          </p>
        </div>

        {/* 3-WAY SPLIT CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24, marginBottom: 48 }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 20, padding: 28, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: 32, fontWeight: 900, color: '#ea580c', marginBottom: 8 }}>70%</div>
            <h3 style={{ fontSize: 17, fontWeight: 800, margin: '0 0 8px 0' }}>🖨️ Printer Hub Share</h3>
            <p style={{ color: 'var(--text-sub)', fontSize: 13.5, lineHeight: 1.6, margin: 0 }}>
              Directly compensates local printer operators for filament materials, electrical machine runtime, slicing preparation, and physical packaging.
            </p>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 20, padding: 28, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: 32, fontWeight: 900, color: '#8b5cf6', marginBottom: 8 }}>15%</div>
            <h3 style={{ fontSize: 17, fontWeight: 800, margin: '0 0 8px 0' }}>🎨 3D Designer Royalty</h3>
            <p style={{ color: 'var(--text-sub)', fontSize: 13.5, lineHeight: 1.6, margin: 0 }}>
              Perpetual royalty earned by original CAD creators every time their digital model is fabricated and shipped to a physical buyer.
            </p>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 20, padding: 28, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: 32, fontWeight: 900, color: '#3b82f6', marginBottom: 8 }}>15%</div>
            <h3 style={{ fontSize: 17, fontWeight: 800, margin: '0 0 8px 0' }}>🌐 Platform &amp; SafeGuard</h3>
            <p style={{ color: 'var(--text-sub)', fontSize: 13.5, lineHeight: 1.6, margin: 0 }}>
              Funds automated mesh repair algorithms, Razorpay escrow infrastructure, free defect reprint guarantees, and 24/7 dispute arbitration.
            </p>
          </div>
        </div>

        {/* PAYMENT METHODS & SETTLEMENT */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 24, padding: 36, marginBottom: 48 }}>
          <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 16 }}>Supported Payment &amp; Payout Channels</h2>
          <p style={{ color: 'var(--text-sub)', fontSize: 14.5, lineHeight: 1.6, margin: '0 0 24px 0' }}>
            Buyers can pay using UPI, Credit/Debit Cards, Net Banking, or verified Pay-on-Delivery. Hub payouts and designer royalties are disbursed automatically via direct bank transfers.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ background: 'var(--bg-card-hover)', padding: 18, borderRadius: 14, border: '1px solid var(--border-color)' }}>
              <strong style={{ fontSize: 14, color: 'var(--text-main)' }}>💳 Buyer Checkout</strong>
              <div style={{ fontSize: 13, color: 'var(--text-sub)', marginTop: 4 }}>
                Instant UPI (GPay, PhonePe, Paytm), Visa, Mastercard, RuPay, and Verified COD.
              </div>
            </div>

            <div style={{ background: 'var(--bg-card-hover)', padding: 18, borderRadius: 14, border: '1px solid var(--border-color)' }}>
              <strong style={{ fontSize: 14, color: 'var(--text-main)' }}>⚡ Creator &amp; Hub Payouts</strong>
              <div style={{ fontSize: 13, color: 'var(--text-sub)', marginTop: 4 }}>
                Automated weekly payout cycles to Indian bank accounts (NEFT/IMPS) with zero withdrawal fees.
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
            Start Manufacturing Today →
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  )
}
