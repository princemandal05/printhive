'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { createClient } from '@/utils/supabase/client'

export default function RequestsListPage() {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [userRole, setUserRole] = useState<string>('buyer')

  useEffect(() => {
    const supabase = createClient()
    let isMounted = true

    async function fetchRequests() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
          if (profile?.role && isMounted) setUserRole(profile.role)
        }

        const { data, error } = await supabase.from('design_requests').select('*').order('created_at', { ascending: false })
        if (!error && data && data.length > 0) {
          const mapped = data.map((r: any) => ({
            id: r.id,
            purpose: r.purpose || r.title || 'Custom 3D Brief',
            dimensions: r.dimensions || 'Custom Size',
            material: r.material || 'PLA',
            budgetMin: r.budget_min ?? r.budget_min_inr ?? 300,
            budgetMax: r.budget_max ?? r.budget_max_inr ?? 1000,
            buyer: r.buyer_name || 'Verified Buyer',
            postedAt: r.created_at ? new Date(r.created_at).toLocaleDateString() : 'Recently',
            urgency: r.urgency || 'Standard',
            bidCount: r.bids_count || 0,
          }))
          if (isMounted) setRequests(mapped)
        }
      } catch (err) {
        console.error('Error querying design_requests:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchRequests()
    return () => { isMounted = false }
  }, [])

  const filtered = requests.filter((r) =>
    (r.purpose || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.material || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.buyer || '').toLowerCase().includes(search.toLowerCase())
  )

  const isFreelancerOrHub = userRole === 'designer' || userRole === 'printer_owner' || userRole === 'admin'

  return (
    <main style={{ minHeight: '100vh' }}>
      <Navbar />

      <section className="container section" style={{ maxWidth: 1240, margin: '0 auto', padding: '40px 20px' }}>
        {/* HERO HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20, marginBottom: 36 }}>
          <div>
            <div className="ateion-pill" style={{ marginBottom: 12 }}>
              {isFreelancerOrHub ? '💼 Freelance Bidding Engine' : '✨ Custom Design & Print Briefs'}
            </div>
            <h1 style={{ fontSize: 36, fontWeight: 900, color: 'var(--text-main)', marginBottom: 8, letterSpacing: '-0.5px' }}>
              {isFreelancerOrHub ? 'Client Briefs & Print Job Board' : 'Custom Design & Manufacturing Briefs'}
            </h1>
            <p style={{ color: 'var(--text-sub)', fontSize: 16, maxWidth: 720, lineHeight: 1.6 }}>
              {isFreelancerOrHub
                ? 'Browse custom 3D modeling and manufacturing briefs posted by buyers. Submit competitive bids to win paid print jobs.'
                : 'Need a custom 3D model designed or manufactured from scratch? Post a brief to get competitive quotes from top designers and 3D print hubs.'}
            </p>
          </div>

          {!isFreelancerOrHub && (
            <Link
              href="/requests/new"
              style={{
                background: '#FF6B35',
                color: '#fff',
                padding: '14px 28px',
                borderRadius: 99,
                fontSize: 14,
                fontWeight: 800,
                textDecoration: 'none',
                boxShadow: '0 6px 20px rgba(255,107,53,0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              + Post New Custom Brief
            </Link>
          )}
        </div>

        {/* SEARCH BAR */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 24, padding: 24, marginBottom: 40, boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
          <div style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', borderRadius: 99, padding: '6px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 16 }}>🔍</span>
            <input
              type="text"
              placeholder="Search by brief title, material requirement, or buyer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text-main)', fontSize: 14, outline: 'none' }}
            />
          </div>
        </div>

        {/* REQUESTS LIST GRID */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-sub)' }}>
            Loading active briefs...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', background: 'var(--bg-card)', borderRadius: 24, border: '2px dashed var(--border-color)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✏️</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-main)', marginBottom: 6 }}>No Custom Design Briefs Active</div>
            <div style={{ fontSize: 14, color: 'var(--text-sub)', marginBottom: 20 }}>
              {isFreelancerOrHub
                ? 'As soon as buyers submit custom 3D modeling or print requests, they will appear here for you to bid on.'
                : 'Post your custom 3D printing brief to receive competitive quotes and proposals from verified creators!'}
            </div>
            {!isFreelancerOrHub && (
              <Link href="/requests/new" style={{ background: '#FF6B35', color: '#fff', padding: '12px 24px', borderRadius: 12, fontWeight: 800, textDecoration: 'none', display: 'inline-block' }}>
                + Post Custom Brief
              </Link>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 20 }}>
            {filtered.map((r) => (
              <Link
                key={r.id}
                href={`/requests/${r.id}`}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 20,
                  padding: 24,
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                  transition: 'all 0.2s',
                  boxShadow: '0 6px 24px rgba(0,0,0,0.03)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ background: r.urgency === 'High Urgency' ? '#FEF2F2' : '#ECFDF5', color: r.urgency === 'High Urgency' ? '#EF4444' : '#10B981', border: `1px solid ${r.urgency === 'High Urgency' ? '#FCA5A5' : '#A7F3D0'}`, borderRadius: 99, padding: '4px 12px', fontSize: 11, fontWeight: 800 }}>
                      ⚡ {r.urgency}
                    </span>
                    <span style={{ fontSize: 13, color: 'var(--text-sub)', fontWeight: 600 }}>Posted by {r.buyer} • {r.postedAt}</span>
                  </div>

                  <div style={{ fontSize: 22, fontWeight: 900, color: '#FF6B35' }}>
                    ₹{r.budgetMin} – ₹{r.budgetMax}
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-main)', marginBottom: 8, letterSpacing: '-0.3px' }}>
                    {r.purpose}
                  </h3>

                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
                    <span style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 700, color: 'var(--text-sub)' }}>
                      📏 {r.dimensions}
                    </span>
                    <span style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 700, color: 'var(--text-sub)' }}>
                      🧪 {r.material}
                    </span>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#8B5CF6' }}>
                    💬 {r.bidCount === 0 ? 'No bids submitted — Be first to bid!' : `${r.bidCount} Designer Bids Received`}
                  </div>
                  <div style={{ background: '#0F172A', color: '#fff', padding: '8px 20px', borderRadius: 99, fontSize: 13, fontWeight: 800 }}>
                    {isFreelancerOrHub ? 'Submit Bid →' : 'View Brief Details'}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  )
}