'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ROUTES } from '@/lib/routes'

const FAQS = [
  {
    q: 'How does PrintHive match me with a printer hub?',
    a: 'When you upload an STL or order a 3D model, PrintHive uses geolocation and machine capability indexing to locate the nearest verified hub with compatible materials (PLA, PETG, ABS, Resin) and build volume.',
  },
  {
    q: 'When does the printer operator get paid?',
    a: 'Your payment is held safely in Razorpay Escrow upon checkout. The 70% manufacturing payout is automatically disbursed to the hub operator only after the physical item is delivered and confirmed.',
  },
  {
    q: 'What file formats can I upload for instant slicing?',
    a: 'We currently support .STL, .3MF, and .OBJ files up to 200MB. Our in-browser mesh analyzer calculates precise volume in cm³ and predicts required material weight in grams.',
  },
  {
    q: 'How do 3D designers earn royalties on PrintHive?',
    a: 'Every time a buyer orders a physical 3D print of your uploaded design, 15% of the total order value is automatically allocated to your creator wallet as a CAD license royalty.',
  },
  {
    q: 'What happens if my 3D print arrives broken or defective?',
    a: 'Under our PrintHive SafeGuard guarantee, you can submit a photo within 48 hours of delivery. If the print is out of spec, we immediately issue a free reprint through an alternate hub or full escrow refund.',
  },
  {
    q: 'Can I list my own 3D printers and start accepting jobs?',
    a: 'Yes! Anyone with a calibrated FDM or Resin printer can register as a Printer Hub, configure supported materials and bed sizes, and begin receiving local fabrication orders.',
  },
]

export default function FAQPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(0)

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-canvas)', color: 'var(--text-main)' }}>
      <Navbar />

      <section className="container section-sm" style={{ maxWidth: 840, margin: '0 auto', padding: '60px 20px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(234, 88, 12, 0.1)', color: '#ea580c', border: '1px solid rgba(234, 88, 12, 0.3)', padding: '4px 14px', borderRadius: 99, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', marginBottom: 16 }}>
            ❓ Knowledge Base &amp; FAQ
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 900, letterSpacing: '-0.8px', margin: '0 0 16px 0' }}>
            Frequently Asked Questions
          </h1>
          <p style={{ color: 'var(--text-sub)', fontSize: 16, lineHeight: 1.6, maxWidth: 600, margin: '0 auto' }}>
            Everything you need to know about distributed 3D manufacturing, escrow security, creator royalties, and hub operations.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 48 }}>
          {FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx
            return (
              <div
                key={idx}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 18,
                  overflow: 'hidden',
                  transition: 'all 0.2s ease',
                }}
              >
                <div
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  style={{
                    padding: '20px 24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    userSelect: 'none',
                    background: isOpen ? 'var(--bg-card-hover)' : 'transparent',
                  }}
                >
                  <span style={{ fontSize: 15.5, fontWeight: 800, color: 'var(--text-main)', paddingRight: 16 }}>
                    {faq.q}
                  </span>
                  <span style={{ fontSize: 18, color: '#ea580c', fontWeight: 900 }}>
                    {isOpen ? '−' : '+'}
                  </span>
                </div>

                {isOpen && (
                  <div style={{ padding: '0 24px 20px 24px', color: 'var(--text-sub)', fontSize: 14.5, lineHeight: 1.6 }}>
                    {faq.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 24, padding: 32, textAlign: 'center' }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 8px 0' }}>Have a question not listed here?</h3>
          <p style={{ color: 'var(--text-sub)', fontSize: 14, margin: '0 0 20px 0' }}>
            Our maker support team is available 24/7 to assist with slicing parameters, order tracking, and dispute mediation.
          </p>
          <Link
            href={ROUTES.support}
            style={{
              background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
              color: '#fff',
              padding: '12px 24px',
              borderRadius: 99,
              fontWeight: 800,
              fontSize: 14,
              textDecoration: 'none',
              display: 'inline-flex',
            }}
          >
            Contact Support Desk →
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  )
}
