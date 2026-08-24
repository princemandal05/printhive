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
    <main style={{ minHeight: '100vh', background: '#FAF8F5', color: '#0F172A', fontFamily: 'inherit' }}>
      <Navbar />

      <div style={{ maxWidth: 1140, margin: '0 auto', padding: '32px 20px 60px' }}>
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.3px' }}>
                {isFreelancerOrHub ? 'Client Briefs & Print Job Board' : 'Custom 3D Manufacturing Briefs'}
              </h1>
              <span style={{ background: '#F1F5F9', color: '#475569', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6, border: '1px solid #E2E8F0' }}>
                Live Grid
              </span>
            </div>
            <div style={{ fontSize: 13, color: '#64748B' }}>
              {isFreelancerOrHub
                ? 'Review custom CAD design briefs and on-demand print requests. Submit competitive bids to win jobs.'
                : 'Post requirements for custom CAD modeling or localized 3D manufacturing to receive competitive bids.'}
            </div>
          </div>

          {!isFreelancerOrHub && (
            <Link
              href="/requests/new"
              style={{
                background: '#FF6B35',
                color: '#FFFFFF',
                padding: '8px 16px',
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 13,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 1px 3px rgba(255,107,53,0.25)',
              }}
            >
              <Plus size={15} /> Post New Brief
            </Link>
          )}
        </div>

        {/* SEARCH BAR */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 10, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <Search size={15} color="#94A3B8" />
          <input
            type="text"
            placeholder="Search by brief title, polymer material, or specifications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', border: 'none', outline: 'none', fontSize: 13, color: '#0F172A', background: 'transparent' }}
          />
        </div>

        {/* REQUESTS LIST */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748B', fontSize: 13 }}>
            Loading active briefs...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 20px', background: '#FFFFFF', borderRadius: 10, border: '1px dashed #CBD5E1' }}>
            <FileText size={32} color="#94A3B8" style={{ margin: '0 auto 10px' }} />
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', marginBottom: 2 }}>No Active Briefs Found</div>
            <div style={{ fontSize: 12, color: '#64748B', maxWidth: 360, margin: '0 auto 16px' }}>
              {isFreelancerOrHub
                ? 'When buyers submit custom 3D modeling or manufacturing requests, they will appear here.'
                : 'Post your requirements to receive bids from 3D designers and print hubs.'}
            </div>
            {!isFreelancerOrHub && (
              <Link
                href="/requests/new"
                style={{
                  background: '#0F172A',
                  color: '#FFFFFF',
                  padding: '8px 16px',
                  borderRadius: 6,
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
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: 10,
                  padding: '16px 20px',
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 14,
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                }}
              >
                <div style={{ flex: 1, minWidth: 280 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                    <span
                      style={{
                        background: r.status === 'open' ? '#ECFDF5' : r.status === 'awarded' || r.status === 'in_progress' ? '#EFF6FF' : r.status === 'completed' ? '#FAF5FF' : r.status === 'cancelled' || r.status === 'closed' ? '#FEF2F2' : '#F1F5F9',
                        color: r.status === 'open' ? '#059669' : r.status === 'awarded' || r.status === 'in_progress' ? '#2563EB' : r.status === 'completed' ? '#7C3AED' : r.status === 'cancelled' || r.status === 'closed' ? '#DC2626' : '#475569',
                        border: `1px solid ${r.status === 'open' ? '#A7F3D0' : r.status === 'awarded' || r.status === 'in_progress' ? '#BFDBFE' : r.status === 'completed' ? '#E9D5FF' : r.status === 'cancelled' || r.status === 'closed' ? '#FECACA' : '#CBD5E1'}`,
                        padding: '1px 6px',
                        borderRadius: 4,
                        fontSize: 10,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                      }}
                    >
                      {r.status === 'open' ? 'Open for Bids' : r.status}
                    </span>
                    <span style={{ fontSize: 11, color: '#64748B', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                      <Clock size={11} /> Posted {r.postedAt}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#EA580C', background: '#FFF7ED', border: '1px solid #FFEDD5', padding: '1px 6px', borderRadius: 4 }}>
                      Budget: {r.budget}
                    </span>
                  </div>

                  <div style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: '4px 0' }}>
                    {r.purpose}
                  </div>

                  <div style={{ fontSize: 12, color: '#64748B', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {r.description}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span
                    style={{
                      background: '#0F172A',
                      color: '#FFFFFF',
                      padding: '8px 14px',
                      borderRadius: 6,
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