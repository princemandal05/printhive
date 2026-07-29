import Link from 'next/link'

export default function Footer() {
  return (
    <footer style={{ background: '#070a12', borderTop: '1px solid #1e293b', color: '#94a3b8', padding: '60px 20px 40px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40, marginBottom: 40 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', marginBottom: 12 }}>
            Print<span style={{ color: '#ff6b35' }}>Hive</span>
          </div>
          <p style={{ fontSize: 13, lineHeight: 1.6, color: '#64748b' }}>
            Where Ideas Become Products. AI-Powered Hybrid 3D Commerce & Distributed Manufacturing Network.
          </p>
        </div>

        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 14 }}>Marketplace</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
            <Link href="/shop" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Ready-Made Shop</Link>
            <Link href="/browse" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Digital 3D Models</Link>
            <Link href="/print-on-demand" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Print-on-Demand</Link>
            <Link href="/requests" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Custom Design Briefs</Link>
          </div>
        </div>

        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 14 }}>Ecosystem</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
            <Link href="/printers" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Printer Owners Hubs</Link>
            <Link href="/designers" style={{ color: '#cbd5e1', textDecoration: 'none' }}>3D Designers Directory</Link>
            <Link href="/community" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Community Gallery</Link>
            <Link href="/otp-verification" style={{ color: '#cbd5e1', textDecoration: 'none' }}>OTP Verification</Link>
          </div>
        </div>

        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 14 }}>Company & Help</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
            <Link href="/about" style={{ color: '#cbd5e1', textDecoration: 'none' }}>About Us</Link>
            <Link href="/contact" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Support & Contact</Link>
            <Link href="/faq" style={{ color: '#cbd5e1', textDecoration: 'none' }}>FAQ</Link>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', borderTop: '1px solid #1e293b', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, fontSize: 12, color: '#64748b' }}>
        <div>© 2026 PrintHive Inc. All rights reserved. Escrow payments powered by Razorpay.</div>
        <div style={{ display: 'flex', gap: 16 }}>
          <span>Privacy Policy</span>
          <span>Terms & Conditions</span>
        </div>
      </div>
    </footer>
  )
}