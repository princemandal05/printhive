'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { createClient } from '@/utils/supabase/client'
import {
  FileText,
  Search,
  Plus,
  Clock,
  ArrowRight,
  ShieldCheck,
  Send,
  Sliders,
  CheckCircle2,
} from 'lucide-react'

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
            purpose: r.title || r.purpose || 'Custom 3D Brief',
            description: r.description || '',
            budget: r.budget ? `₹${r.budget}` : '₹500',
            buyer: 'Verified Buyer',
            postedAt: r.created_at ? new Date(r.created_at).toLocaleDateString() : 'Recently',
            status: r.status || 'open',
            bidCount: 0,
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
    (r.description || '').toLowerCase().includes(search.toLowerCase())
  )

  const isFreelancerOrHub = userRole === 'designer' || userRole === 'printer_owner' || userRole === 'admin'

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-canvas)', color: 'var(--text-main)', fontFamily: 'inherit' }}>
      <Navbar />

      <div style={{ maxWidth: 1140, margin: '0 auto', padding: '32px 20px 60px' }}>
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.3px' }}>
                {isFreelancerOrHub ? 'Client Briefs & Print Job Board' : 'Custom 3D Manufacturing Briefs'}
              </h1>
              <span style={{ background: 'var(--bg-card-hover)', color: 'var(--text-main)', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 9999, border: '1px solid var(--border-color)' }}>
                Live Grid
              </span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-sub)' }}>
              {isFreelancerOrHub
                ? 'Review custom CAD design briefs and on-demand print requests. Submit competitive bids to win jobs.'
                : 'Post requirements for custom CAD modeling or localized 3D manufacturing to receive competitive bids.'}
            </div>
          </div>

          {!isFreelancerOrHub && (
            <Link
              href="/requests/new"
              style={{
                background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
                color: '#FFFFFF',
                padding: '8px 18px',
                borderRadius: 9999,
                fontWeight: 700,
                fontSize: 13,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 4px 16px rgba(234,88,12,0.25)',
              }}
            >
              <Plus size={15} /> Post New Brief
            </Link>
          )}
        </div>

        {/* SEARCH BAR */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 12, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <Search size={15} color="var(--text-sub)" />
          <input
            type="text"
            placeholder="Search by brief title, polymer material, or specifications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', border: 'none', outline: 'none', fontSize: 13, color: 'var(--text-main)', background: 'transparent' }}
          />
        </div>

        {/* REQUESTS LIST */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-sub)', fontSize: 13 }}>
            Loading active briefs...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 20px', background: 'var(--bg-card)', borderRadius: 16, border: '1px dashed var(--border-color)' }}>
            <FileText size={32} color="var(--text-sub)" style={{ margin: '0 auto 10px' }} />
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)', marginBottom: 2 }}>No Active Briefs Found</div>
            <div style={{ fontSize: 12, color: 'var(--text-sub)', maxWidth: 360, margin: '0 auto 16px' }}>
              {isFreelancerOrHub
                ? 'When buyers submit custom 3D modeling or manufacturing requests, they will appear here.'
                : 'Post your requirements to receive bids from 3D designers and print hubs.'}
            </div>
            {!isFreelancerOrHub && (
              <Link
                href="/requests/new"
                style={{
                  background: 'var(--bg-card-hover)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-color)',
                  padding: '8px 18px',
                  borderRadius: 9999,
                  fontWeight: 700,
                  fontSize: 12,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Plus size={14} /> Create a Brief
              </Link>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {filtered.map((r) => (
              <Link
                key={r.id}
                href={`/requests/${r.id}`}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 16,
                  padding: '18px 22px',
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 14,
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ flex: 1, minWidth: 280 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                    <span
                      style={{
                        background: r.status === 'open' ? '#ECFDF5' : r.status === 'awarded' || r.status === 'in_progress' ? '#EFF6FF' : r.status === 'completed' ? '#FAF5FF' : r.status === 'cancelled' || r.status === 'closed' ? '#FEF2F2' : 'var(--bg-card-hover)',
                        color: r.status === 'open' ? '#059669' : r.status === 'awarded' || r.status === 'in_progress' ? '#2563EB' : r.status === 'completed' ? '#7C3AED' : r.status === 'cancelled' || r.status === 'closed' ? '#DC2626' : 'var(--text-main)',
                        border: `1px solid ${r.status === 'open' ? '#A7F3D0' : r.status === 'awarded' || r.status === 'in_progress' ? '#BFDBFE' : r.status === 'completed' ? '#E9D5FF' : r.status === 'cancelled' || r.status === 'closed' ? '#FECACA' : 'var(--border-color)'}`,
                        padding: '1px 6px',
                        borderRadius: 9999,
                        fontSize: 10,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                      }}
                    >
                      {r.status === 'open' ? 'Open for Bids' : r.status}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text-sub)', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                      <Clock size={11} /> Posted {r.postedAt}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#EA580C', background: 'rgba(234,88,12,0.12)', border: '1px solid rgba(234,88,12,0.25)', padding: '1px 8px', borderRadius: 9999 }}>
                      Budget: {r.budget}
                    </span>
                  </div>

                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-main)', margin: '4px 0' }}>
                    {r.purpose}
                  </div>

                  <div style={{ fontSize: 12, color: 'var(--text-sub)', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {r.description}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span
                    style={{
                      background: 'var(--bg-card-hover)',
                      color: 'var(--text-main)',
                      border: '1px solid var(--border-color)',
                      padding: '8px 16px',
                      borderRadius: 9999,
                      fontSize: 12,
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    {isFreelancerOrHub ? 'Submit Bid' : 'View Proposals'} <ArrowRight size={13} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </main>
  )
}