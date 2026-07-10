import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Hero3D from '@/components/Hero3D'
import ScrollReveal from '@/components/ScrollReveal'

const PROBLEMS = [
  {
    icon: '🛒',
    iconClass: 'feature-icon-success',
    title: 'Buyers',
    text: "Can't access custom 3D printed products without owning a ₹15,000–₹80,000 printer or learning CAD. Existing services are expensive and unverified.",
  },
  {
    icon: '🎨',
    iconClass: 'feature-icon-primary',
    title: 'Designers',
    text: 'Publish high-quality models on platforms like Thingiverse for free, with no monetisation and no marketplace connecting designs to paying customers.',
  },
  {
    icon: '🖨️',
    iconClass: 'feature-icon-info',
    title: 'Printer Owners',
    text: 'Own machines that sit idle 18–20 hours a day, with no organised way to find print jobs, manage orders, or earn consistent income.',
  },
]

const STEPS = [
  {
    title: 'Designers upload',
    text: 'Designers upload STL/3MF files with reference photos and pricing, and earn royalties automatically on every print.',
  },
  {
    title: 'Buyers discover & order',
    text: 'Buyers browse a visual discovery feed, preview designs in 3D, and place an order — payment held safely in escrow.',
  },
  {
    title: 'Nearby printers deliver',
    text: 'Leaflet map matching connects the order to a nearby printer owner, who prints, verifies, and ships it home.',
  },
  {
    title: 'Everyone gets paid',
    text: 'Once delivery is confirmed, escrow releases funds automatically — 70% printer owner, 15% designer, 15% platform.',
  },
]

const FEATURES = [
  { icon: '🔍', iconClass: 'feature-icon-primary', title: 'AI-Powered Discovery', text: 'Semantic search, auto-tagging, and price estimation powered by Google Gemini.' },
  { icon: '🧊', iconClass: 'feature-icon-info', title: 'In-Browser 3D Preview', text: 'Interactive Three.js viewer lets buyers inspect every design before ordering.' },
  { icon: '📍', iconClass: 'feature-icon-success', title: 'Nearby Printer Matching', text: 'Leaflet.js + OpenStreetMap shows verified printer owners near you — no API key needed.' },
  { icon: '🔒', iconClass: 'feature-icon-warning', title: 'Escrow-Protected Payments', text: 'Razorpay-backed escrow holds funds until you confirm delivery, protecting every side.' },
  { icon: '⚡', iconClass: 'feature-icon-primary', title: 'Live Order Tracking', text: 'Supabase Realtime pushes live status updates from print to doorstep.' },
  { icon: '⭐', iconClass: 'feature-icon-success', title: 'Community Trust', text: 'Real buyer print photos and ratings build an authentic reputation for every seller.' },
]

export default function Home() {
  return (
    <main>
      <Navbar />

      {/* HERO */}
      <section className="hero">
        <div className="container">
          <div className="hero-grid">
            <div>
              <div className="hero-eyebrow">Design · Discover · Deliver</div>
              <h1 className="hero-title">
                Custom 3D prints,{' '}
                <span className="hero-title-accent">delivered to your door</span>
              </h1>
              <p className="hero-subtitle">
                PrintHive connects designers, printer owners, and buyers on
                one trusted marketplace — order a custom 3D print without
                owning a printer or learning CAD.
              </p>
              <div className="hero-actions">
                <Link href="/browse" className="btn btn-primary btn-lg">
                  Browse designs
                </Link>
                <Link href="/signup" className="btn btn-outline btn-lg" style={{ borderColor: '#334155', color: '#fff' }}>
                  Join PrintHive
                </Link>
              </div>
              <div className="hero-stats">
                <div>
                  <div className="hero-stat-value">3-sided</div>
                  <div className="hero-stat-label">Marketplace</div>
                </div>
                <div>
                  <div className="hero-stat-value">70/15/15</div>
                  <div className="hero-stat-label">Fair revenue split</div>
                </div>
                <div>
                  <div className="hero-stat-value">Escrow</div>
                  <div className="hero-stat-label">Protected payments</div>
                </div>
              </div>
            </div>
            <Hero3D />
          </div>
        </div>
      </section>

      {/* PROBLEM STATEMENT */}
      <section className="container section">
        <ScrollReveal>
          <div className="section-eyebrow section-center">The problem</div>
          <h2 className="section-heading section-center" style={{ marginBottom: 'var(--space-3)' }}>
            Three gaps. One missing platform.
          </h2>
          <p className="section-subheading section-center" style={{ marginBottom: 'var(--space-10)' }}>
            No existing service solves all three sides of the 3D printing
            ecosystem together — so PrintHive was built to close all three
            gaps at once.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-3 gap-6">
          {PROBLEMS.map((p, i) => (
            <ScrollReveal key={p.title} delay={i * 100}>
              <div className="feature-card">
                <div className={`feature-icon ${p.iconClass}`}>{p.icon}</div>
                <div className="feature-title">{p.title}</div>
                <div className="feature-text">{p.text}</div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="container section" style={{ background: 'var(--color-slate-100)', maxWidth: 'none', borderRadius: 'var(--radius-xl)' }}>
        <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: '0 var(--space-6)' }}>
          <ScrollReveal>
            <div className="section-eyebrow section-center">How it works</div>
            <h2 className="section-heading section-center" style={{ marginBottom: 'var(--space-10)' }}>
              From idea to doorstep, in four steps
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-4 gap-6">
            {STEPS.map((step, i) => (
              <ScrollReveal key={step.title} delay={i * 100}>
                <div className="step-card">
                  <div className="step-number">{i + 1}</div>
                  <div className="feature-title">{step.title}</div>
                  <div className="feature-text">{step.text}</div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="container section">
        <ScrollReveal>
          <div className="section-eyebrow section-center">What&apos;s inside</div>
          <h2 className="section-heading section-center" style={{ marginBottom: 'var(--space-10)' }}>
            Built for trust, speed, and fair pay
          </h2>
        </ScrollReveal>

        <div className="grid grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <ScrollReveal key={f.title} delay={(i % 3) * 100}>
              <div className="feature-card">
                <div className={`feature-icon ${f.iconClass}`}>{f.icon}</div>
                <div className="feature-title">{f.title}</div>
                <div className="feature-text">{f.text}</div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ROLES CTA */}
      <section id="roles" className="container section">
        <div className="grid grid-cols-3 gap-6">
          <div className="feature-card" style={{ borderTop: '3px solid var(--color-success)' }}>
            <div className="feature-title">I want to buy</div>
            <p className="feature-text" style={{ marginBottom: 'var(--space-4)' }}>
              Browse designs, preview in 3D, and get a custom print delivered
              home.
            </p>
            <Link href="/signup" className="btn btn-secondary btn-sm">Sign up as a buyer</Link>
          </div>
          <div className="feature-card" style={{ borderTop: '3px solid var(--color-primary)' }}>
            <div className="feature-title">I want to design</div>
            <p className="feature-text" style={{ marginBottom: 'var(--space-4)' }}>
              Upload STL/3MF files and earn royalties automatically on every
              print sold.
            </p>
            <Link href="/signup" className="btn btn-secondary btn-sm">Sign up as a designer</Link>
          </div>
          <div className="feature-card" style={{ borderTop: '3px solid var(--color-info)' }}>
            <div className="feature-title">I own a printer</div>
            <p className="feature-text" style={{ marginBottom: 'var(--space-4)' }}>
              List your machine, accept nearby orders, and earn from idle
              print time.
            </p>
            <Link href="/signup" className="btn btn-secondary btn-sm">Sign up as a printer owner</Link>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="container section-sm">
        <ScrollReveal>
          <div className="cta-band">
            <h2 className="section-heading" style={{ marginBottom: 'var(--space-3)' }}>
              Ready to print something real?
            </h2>
            <p className="section-subheading" style={{ marginBottom: 'var(--space-8)' }}>
              Join PrintHive today — no printer, no CAD software, no
              hassle.
            </p>
            <Link href="/signup" className="btn btn-primary btn-lg">
              Create your free account
            </Link>
          </div>
        </ScrollReveal>
      </section>

      <Footer />
    </main>
  )
}