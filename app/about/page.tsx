'use client'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function AboutPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#0b0f19', color: '#f8fafc' }}>
      <Navbar />

      <section className="container section-sm" style={{ maxWidth: 900, margin: '0 auto', padding: '60px 20px' }}>
        <div style={{ color: '#ff6b35', textTransform: 'uppercase', letterSpacing: 1.5, fontSize: 12, fontWeight: 700, textAlign: 'center' }}>
          About PrintHive
        </div>
        <h1 style={{ fontSize: 42, fontWeight: 900, textAlign: 'center', marginBottom: 16, background: 'linear-gradient(135deg, #fff 0%, #cbd5e1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Where Ideas Become Products
        </h1>
        <p style={{ fontSize: 18, color: '#94a3b8', textAlign: 'center', marginBottom: 48, lineHeight: 1.6 }}>
          PrintHive is an AI-powered hybrid 3D commerce platform connecting buyers, 3D model designers, seller stores, and distributed printer owners in one trusted marketplace.
        </p>

        <div style={{ background: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 20, padding: 36, marginBottom: 40 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 16 }}>Our Mission</h2>
          <p style={{ color: '#cbd5e1', lineHeight: 1.7, fontSize: 15, marginBottom: 24 }}>
            Over 80% of desktop 3D printers sit idle 18–20 hours a day, while millions of buyers want custom, personalized physical objects without having to spend ₹50,000 on hardware or master complex CAD software.
          </p>
          <p style={{ color: '#cbd5e1', lineHeight: 1.7, fontSize: 15 }}>
            PrintHive bridges this gap with an escrow-protected micro-factory network. Designers monetize their STL files, printer owners earn income on idle machines, and buyers receive custom 3D products delivered right to their door.
          </p>
        </div>

        {/* 70/15/15 Fair Split Section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
          <div style={{ background: '#0f172a', padding: 24, borderRadius: 16, border: '1px solid #334155', textAlign: 'center' }}>
            <div style={{ fontSize: 36, fontWeight: 900, color: '#10b981' }}>70%</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginTop: 4 }}>Printer Owner</div>
            <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>Covers filament, power & wear</div>
          </div>
          <div style={{ background: '#0f172a', padding: 24, borderRadius: 16, border: '1px solid #334155', textAlign: 'center' }}>
            <div style={{ fontSize: 36, fontWeight: 900, color: '#ff6b35' }}>15%</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginTop: 4 }}>3D Designer</div>
            <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>Automatic model royalties</div>
          </div>
          <div style={{ background: '#0f172a', padding: 24, borderRadius: 16, border: '1px solid #334155', textAlign: 'center' }}>
            <div style={{ fontSize: 36, fontWeight: 900, color: '#38bdf8' }}>15%</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginTop: 4 }}>PrintHive Platform</div>
            <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>AI search, escrow & infrastructure</div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
