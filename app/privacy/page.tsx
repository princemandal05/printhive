import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function PrivacyPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-canvas)', color: 'var(--text-main)' }}>
      <Navbar />

      <section className="container section-sm" style={{ maxWidth: 840, margin: '0 auto', padding: '60px 20px 80px' }}>
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: '#ea580c', letterSpacing: 1, marginBottom: 8 }}>
            Data Protection
          </div>
          <h1 style={{ fontSize: 34, fontWeight: 900, letterSpacing: '-0.5px', margin: '0 0 12px 0' }}>
            Privacy Policy &amp; Security Standards
          </h1>
          <div style={{ fontSize: 13, color: 'var(--text-sub)' }}>
            Effective: August 2026 • PrintHive Global Infrastructure
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 24, padding: 36, display: 'flex', flexDirection: 'column', gap: 28 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 10px 0' }}>1. Information We Collect</h2>
            <p style={{ color: 'var(--text-sub)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
              We collect user profile metadata, physical delivery addresses for fulfillment, and CAD files uploaded for slicing. We never share proprietary 3D CAD files with third parties outside of assigned fabrication hubs.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 10px 0' }}>2. CAD Model Security &amp; DRM</h2>
            <p style={{ color: 'var(--text-sub)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
              Uploaded 3D files are encrypted and processed through isolated slicing sandboxes. Once physical manufacturing and quality inspection are completed, temporary G-code cached slices are securely purged.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 10px 0' }}>3. Payment &amp; Escrow Encryption</h2>
            <p style={{ color: 'var(--text-sub)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
              Payment details, UPI handles, and banking credentials are tokenized directly through PCI-DSS Level 1 compliant Razorpay gateways. PrintHive never stores raw card or banking credentials.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 10px 0' }}>4. Your Data Rights</h2>
            <p style={{ color: 'var(--text-sub)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
              Users can export their complete order history, delete uploaded CAD models, or request account data removal at any time through their account settings.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
