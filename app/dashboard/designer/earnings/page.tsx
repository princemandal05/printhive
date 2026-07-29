'use client'

import { useState } from 'react'
import Link from 'next/link'

const MOCK_TRANSACTIONS = [
  { date: '8 Jul 2026', design: 'Articulated Dragon', order: '#PH-2291', buyer: 'Priya S.', amount: 68 },
  { date: '5 Jul 2026', design: 'Desk Organizer', order: '#PH-2277', buyer: 'Rohan K.', amount: 45 },
  { date: '2 Jul 2026', design: 'Articulated Dragon', order: '#PH-2260', buyer: 'Meera J.', amount: 68 },
  { date: '28 Jun 2026', design: 'Phone Stand', order: '#PH-2231', buyer: 'Aditya R.', amount: 30 },
]

export default function DesignerEarningsPage() {
  const totalEarnings = MOCK_TRANSACTIONS.reduce((sum, t) => sum + t.amount, 0)

  // Interactive Designer Royalty Calculator State
  const [printsPerMonth, setPrintsPerMonth] = useState(120)
  const [avgPrice, setAvgPrice] = useState(450)
  const monthlyRoyaltyEarnings = Math.round(printsPerMonth * avgPrice * 0.15)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-canvas)', color: 'var(--text-main)', transition: 'all 0.3s ease' }}>
      <nav style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)', padding: '0 32px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-main)' }}>
          Print<span style={{ color: '#ea580c' }}>Hive</span> Creator Studio
        </div>
        <Link href="/dashboard/designer" style={{ color: 'var(--text-sub)', fontSize: 13, textDecoration: 'none', fontWeight: 600 }}>
          ← Back to Dashboard
        </Link>
      </nav>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 4 }}>Creator Earnings & Royalties</div>
        <div style={{ fontSize: 14, color: 'var(--text-sub)', marginBottom: 32 }}>
          Royalties automatically credited to your wallet from physical 3D print orders.
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 36 }}>
          {[
            { val: `₹${totalEarnings}`, label: 'Total Earnings' },
            { val: `₹${MOCK_TRANSACTIONS.filter((t) => t.date.includes('Jul')).reduce((s2, t) => s2 + t.amount, 0)}`, label: 'This Month' },
            { val: String(MOCK_TRANSACTIONS.length), label: 'Paid Orders' },
            { val: '15%', label: 'Royalty Rate' },
          ].map(({ val, label }) => (
            <div key={label} style={{ background: 'var(--bg-card)', borderRadius: 16, padding: '20px 24px', border: '1px solid var(--border-color)', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#ea580c' }}>{val}</div>
              <div style={{ fontSize: 13, color: 'var(--text-sub)', marginTop: 2, fontWeight: 600 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* INTERACTIVE DESIGNER ROYALTY CALCULATOR */}
        <div style={{ background: 'var(--bg-card)', borderRadius: 24, border: '1px solid var(--border-color)', padding: 32, marginBottom: 36, boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8, color: 'var(--text-main)' }}>
            🧮 Interactive Royalty Earnings Estimator
          </div>
          <p style={{ color: 'var(--text-sub)', fontSize: 13, marginBottom: 24 }}>
            Simulate your passive monthly income based on order volume and model retail price.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 28, alignItems: 'center' }}>
            <div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
                  <span>Prints Ordered / Month: {printsPerMonth}</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="500"
                  step="10"
                  value={printsPerMonth}
                  onChange={(e) => setPrintsPerMonth(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#ea580c' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
                  <span>Average Model Price: ₹{avgPrice}</span>
                </div>
                <input
                  type="range"
                  min="150"
                  max="1500"
                  step="50"
                  value={avgPrice}
                  onChange={(e) => setAvgPrice(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#ea580c' }}
                />
              </div>
            </div>

            <div style={{ background: 'var(--bg-card-hover)', padding: 24, borderRadius: 20, border: '1px solid var(--border-color)', textAlign: 'center' }}>
              <div style={{ fontSize: 12, textTransform: 'uppercase', color: 'var(--text-sub)', fontWeight: 700, marginBottom: 4 }}>
                Estimated Monthly Royalty
              </div>
              <div style={{ fontSize: 36, fontWeight: 900, color: '#10B981', marginBottom: 8 }}>
                ₹{monthlyRoyaltyEarnings.toLocaleString('en-IN')} / mo
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-sub)' }}>
                15% automatic payout transferred to your bank account upon delivery.
              </div>
            </div>
          </div>
        </div>

        {/* Transaction History Table */}
        <div style={{ background: 'var(--bg-card)', borderRadius: 20, padding: 28, border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>Transaction History</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-sub)' }}>
                <th style={{ padding: '12px 8px' }}>Date</th>
                <th style={{ padding: '12px 8px' }}>Design</th>
                <th style={{ padding: '12px 8px' }}>Order ID</th>
                <th style={{ padding: '12px 8px' }}>Buyer</th>
                <th style={{ padding: '12px 8px', textAlign: 'right' }}>Royalty Payout</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_TRANSACTIONS.map((t) => (
                <tr key={t.order} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px 8px', color: 'var(--text-sub)' }}>{t.date}</td>
                  <td style={{ padding: '12px 8px', fontWeight: 700 }}>{t.design}</td>
                  <td style={{ padding: '12px 8px', color: 'var(--text-sub)' }}>{t.order}</td>
                  <td style={{ padding: '12px 8px' }}>{t.buyer}</td>
                  <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 800, color: '#10B981' }}>+₹{t.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}