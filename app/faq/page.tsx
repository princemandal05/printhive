'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const FAQS = [
  {
    category: 'Buyers',
    q: 'How does Print-on-Demand work if I do not own a 3D printer?',
    a: 'Simply upload your STL/3MF file or choose a model from our Design Marketplace. PrintHive automatically matches your order with a nearby verified printer owner who prints and ships it directly to your home.',
  },
  {
    category: 'Buyers',
    q: 'What payment protection does PrintHive offer?',
    a: 'All payments are held securely in escrow via Razorpay. Money is only released to the printer owner and designer after you confirm delivery and inspect print quality.',
  },
  {
    category: 'Designers',
    q: 'How do royalties work for 3D modelers?',
    a: 'Whenever a buyer orders a physical 3D print of your uploaded design, 15% of the print revenue is automatically credited to your designer wallet as a royalty payout.',
  },
  {
    category: 'Printer Owners',
    q: 'How do printer owners get paid?',
    a: 'Printer owners earn 70% of every completed order. Payouts can be withdrawn directly to your bank account via UPI or NEFT once delivery is confirmed by the buyer.',
  },
  {
    category: 'Sellers',
    q: 'What is the difference between a Seller Store and a Designer Profile?',
    a: 'Seller Stores sell ready-made, pre-printed physical inventory, while Designer Profiles sell digital 3D models (STL/3MF) for buyers to print.',
  },
]

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <main style={{ minHeight: '100vh', background: '#0b0f19', color: '#f8fafc' }}>
      <Navbar />

      <section className="container section-sm" style={{ maxWidth: 800, margin: '0 auto', padding: '60px 20px' }}>
        <div style={{ color: '#ff6b35', textTransform: 'uppercase', letterSpacing: 1.5, fontSize: 12, fontWeight: 700, textAlign: 'center' }}>
          Frequently Asked Questions
        </div>
        <h1 style={{ fontSize: 38, fontWeight: 800, textAlign: 'center', marginBottom: 12, background: 'linear-gradient(135deg, #fff 0%, #cbd5e1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Got Questions? We Have Answers
        </h1>
        <p style={{ fontSize: 16, color: '#94a3b8', textAlign: 'center', marginBottom: 40 }}>
          Everything you need to know about PrintHive, distributed manufacturing, escrow payments, and royalties.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx
            return (
              <div
                key={idx}
                style={{
                  background: 'rgba(30, 41, 59, 0.7)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 14,
                  padding: '20px 24px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onClick={() => setOpenIndex(isOpen ? null : idx)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ background: '#0f172a', color: '#38bdf8', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6 }}>
                      {faq.category}
                    </span>
                    <h2 style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: 0 }}>{faq.q}</h2>
                  </div>
                  <span style={{ fontSize: 18, color: '#ff6b35', fontWeight: 700 }}>{isOpen ? '−' : '+'}</span>
                </div>

                {isOpen && (
                  <p style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #334155', color: '#cbd5e1', fontSize: 14, lineHeight: 1.6 }}>
                    {faq.a}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </section>

      <Footer />
    </main>
  )
}
