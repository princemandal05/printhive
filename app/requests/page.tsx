import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

// Mock open requests — replace with a Supabase query on `design_requests`
// where status = 'open', ordered by created_at desc.
const MOCK_REQUESTS = [
  {
    id: 'r1',
    purpose: 'Replacement knob for a washing machine',
    dimensions: '5cm x 5cm x 2cm',
    material: 'ABS',
    budgetMin: 200,
    budgetMax: 500,
    bidCount: 3,
    postedAt: '2 days ago',
  },
  {
    id: 'r2',
    purpose: 'Custom desk nameplate with logo',
    dimensions: '15cm x 5cm x 1cm',
    material: 'PLA',
    budgetMin: 300,
    budgetMax: 700,
    bidCount: 1,
    postedAt: '5 hours ago',
  },
  {
    id: 'r3',
    purpose: 'Cable management clips (set of 10)',
    dimensions: '3cm x 2cm x 1cm each',
    material: 'No preference',
    budgetMin: 150,
    budgetMax: 350,
    bidCount: 0,
    postedAt: '1 day ago',
  },
]

export default function RequestsListPage() {
  return (
    <main>
      <Navbar />

      <section className="container section-sm">
        <div className="section-eyebrow">Custom design requests</div>
        <h1 className="section-heading" style={{ marginBottom: 'var(--space-2)' }}>
          Open briefs from buyers
        </h1>
        <p className="section-subheading" style={{ marginBottom: 'var(--space-8)' }}>
          Bid with your price and turnaround time to win the job.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {MOCK_REQUESTS.map((r) => (
            <Link key={r.id} href={`/requests/${r.id}`} className="card" style={{ display: 'block' }}>
              <div className="flex justify-between items-start" style={{ marginBottom: 'var(--space-3)' }}>
                <div className="feature-title" style={{ marginBottom: 0 }}>{r.purpose}</div>
                <span className="text-xs text-muted">{r.postedAt}</span>
              </div>
              <div className="flex gap-2" style={{ marginBottom: 'var(--space-3)', flexWrap: 'wrap' }}>
                <span className="badge badge-neutral">{r.dimensions}</span>
                <span className="badge badge-neutral">{r.material}</span>
                <span className="badge badge-primary">₹{r.budgetMin}–₹{r.budgetMax}</span>
              </div>
              <div className="text-sm text-muted">
                {r.bidCount === 0 ? 'No bids yet — be the first' : `${r.bidCount} bid${r.bidCount > 1 ? 's' : ''} so far`}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  )
}