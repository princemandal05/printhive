'use client'

import dynamic from 'next/dynamic'
import ScrollReveal from '@/components/ScrollReveal'

const Hero3D = dynamic(() => import('@/components/Hero3D'), { ssr: false })

export default function Home() {
  return (
    <main>
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="navbar-inner">
          <div className="navbar-logo">
            Print<span className="navbar-logo-accent">Hive</span>
          </div>
          <div className="navbar-links">
            <a className="navbar-link" href="#roles">How it works</a>
            <a className="navbar-link" href="#journey">Order journey</a>
            <a href="/signup" className="btn btn-primary btn-sm">Get Started</a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-inner">
          <div>
            <div className="hero-eyebrow">● Live marketplace beta</div>
            <h1 className="hero-title">
              From <span>digital design</span> to your doorstep.
            </h1>
            <p className="hero-subtitle">
              PrintHive connects designers, idle 3D printer owners, and buyers
              in one trusted flow — with escrow payments and AI-verified
              quality on every order.
            </p>
            <div className="hero-actions">
              <a href="/signup" className="btn btn-primary btn-lg">Browse Designs</a>
              <a href="/signup" className="btn btn-outline btn-lg" style={{ borderColor: 'rgba(148,163,184,0.4)', color: '#fff' }}>
                Become a Printer Owner
              </a>
            </div>

            <div className="hero-stats">
              <div>
                <div className="hero-stat-value">70%</div>
                <div className="hero-stat-label">Goes to printer owners</div>
              </div>
              <div>
                <div className="hero-stat-value">15%</div>
                <div className="hero-stat-label">Designer royalty</div>
              </div>
              <div>
                <div className="hero-stat-value">100%</div>
                <div className="hero-stat-label">Escrow protected</div>
              </div>
            </div>
          </div>

          <Hero3D />
        </div>
      </section>

      {/* ROLES */}
      <section id="roles" className="section container">
        <ScrollReveal>
          <div className="section-eyebrow">Three sides, one platform</div>
          <h2 className="section-heading">Everyone brings something different</h2>
          <p className="section-subheading">
            No platform today connects all three sides of 3D printing in one
            trusted flow. That gap is what PrintHive fills.
          </p>
        </ScrollReveal>

        <div className="roles-grid">
          <ScrollReveal delay={0}>
            <div className="role-card">
              <div className="role-icon" style={{ backgroundColor: 'var(--color-primary-tint)' }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2">
                  <path d="M12 19l7-7 3 3-7 7-3-3z" />
                  <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                  <path d="M2 2l7.586 7.586" />
                </svg>
              </div>
              <div className="role-card-title">Designer</div>
              <p className="role-card-text">
                Upload STL/3MF files, set your price, and earn a 15% royalty
                every time someone orders a print of your design. Never touch
                a printer.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={120}>
            <div className="role-card">
              <div className="role-icon" style={{ backgroundColor: 'var(--color-info-bg)' }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--color-info)" strokeWidth="2">
                  <rect x="6" y="2" width="12" height="8" rx="1" />
                  <path d="M6 18h12a2 2 0 002-2v-4a2 2 0 00-2-2H6a2 2 0 00-2 2v4a2 2 0 002 2z" />
                  <rect x="8" y="18" width="8" height="4" />
                </svg>
              </div>
              <div className="role-card-title">Printer Owner</div>
              <p className="role-card-text">
                Turn your idle printer into income. List your specs and
                location, accept nearby jobs, and get paid 70% per completed
                order.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={240}>
            <div className="role-card">
              <div className="role-icon" style={{ backgroundColor: 'var(--color-success-bg)' }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <path d="M3 6h18" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
              </div>
              <div className="role-card-title">Buyer</div>
              <p className="role-card-text">
                No printer, no CAD skills, no problem. Browse a design, pick
                material and color, and track it live until it lands on your
                doorstep.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ORDER JOURNEY */}
      <section id="journey" className="section container" style={{ paddingTop: 0 }}>
        <ScrollReveal>
          <div className="section-eyebrow">How an order works</div>
          <h2 className="section-heading">Escrow-backed, AI-verified, start to finish</h2>
          <p className="section-subheading">
            Money is held safely until the buyer confirms delivery — no one
            gets paid on trust alone.
          </p>
        </ScrollReveal>

        <div className="journey-strip">
          {[
            ['01', 'Browse & customize', 'Pick a design, material, color, and size.'],
            ['02', 'Match nearby', 'See printer owners on a live map by price and rating.'],
            ['03', 'Pay into escrow', 'Funds are held safely, not released yet.'],
            ['04', 'Print & verify', 'AI checks the finished print against the reference file.'],
            ['05', 'Deliver & release', 'Buyer confirms — payment splits 70/15/15 automatically.'],
          ].map(([num, title, text], i) => (
            <ScrollReveal key={num} delay={i * 100}>
              <div className="journey-step">
                <div className="journey-step-number">{num}</div>
                <div className="journey-step-title">{title}</div>
                <div className="journey-step-text">{text}</div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* CTA BAND */}
      <section className="container" style={{ paddingBottom: 'var(--space-16)' }}>
        <ScrollReveal>
          <div className="cta-band">
            <h2 className="cta-band-title">Ready to put your printer to work?</h2>
            <p className="cta-band-text">
              Join PrintHive today — sign up in seconds with just an email
              OTP, no password to remember.
            </p>
            <a href="/signup" className="btn btn-primary btn-lg">Create your account</a>
          </div>
        </ScrollReveal>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-grid">
            <div>
              <div className="navbar-logo" style={{ marginBottom: 'var(--space-3)' }}>
                Print<span className="navbar-logo-accent">Hive</span>
              </div>
              <p style={{ fontSize: 'var(--text-sm)', maxWidth: 260 }}>
                The trusted marketplace connecting designers, printer owners,
                and buyers.
              </p>
            </div>
            <div>
              <div className="footer-heading">Platform</div>
              <a className="footer-link" href="#roles">How it works</a>
              <a className="footer-link" href="/signup">Sign up</a>
            </div>
            <div>
              <div className="footer-heading">For</div>
              <a className="footer-link" href="/signup">Designers</a>
              <a className="footer-link" href="/signup">Printer Owners</a>
              <a className="footer-link" href="/signup">Buyers</a>
            </div>
            <div>
              <div className="footer-heading">Project</div>
              <a className="footer-link" href="#">B.Sc. IT Final Year</a>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2026 PrintHive. Built as a final year project.</span>
            <span>Made with Next.js + Supabase</span>
          </div>
        </div>
      </footer>
    </main>
  )
}