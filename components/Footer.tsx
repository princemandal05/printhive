'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'

export default function Footer() {
  const [role, setRole] = useState<string | null>('buyer')

  useEffect(() => {
    const supabase = createClient()
    async function resolveUserRole() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle()

          if (profile?.role) {
            setRole(profile.role)
            return
          }
        }
      } catch (e) {
        // fallback
      }

      // Check cookie for demo guest mode
      const cookies = document.cookie.split(';').reduce((acc, c) => {
        const [k, v] = c.trim().split('=')
        if (k) acc[k] = v
        return acc
      }, {} as Record<string, string>)

      const cookieRole = cookies['printhive_guest_role'] || cookies['printhive_auth_role']
      if (cookieRole) {
        setRole(cookieRole)
      }
    }

    resolveUserRole()
  }, [])

  return (
    <footer style={{ background: '#070a12', borderTop: '1px solid #1e293b', color: '#94a3b8', padding: '60px 20px 40px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* ROLE WORKSPACE QUICK SWITCHER BANNER */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(255, 107, 53, 0.25)',
            borderRadius: 20,
            padding: '18px 24px',
            marginBottom: 44,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: 'rgba(255,107,53,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <polyline points="17 11 19 13 23 9" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>
                Role Workspace: <span style={{ color: '#FF6B35', textTransform: 'capitalize' }}>{role} Mode</span>
              </div>
              <div style={{ fontSize: 12, color: '#64748b' }}>
                Customized portal navigation based on your PrintHive ecosystem role.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setRole('buyer')}
              style={{
                padding: '6px 14px',
                borderRadius: 99,
                border: 'none',
                background: role === 'buyer' ? '#FF6B35' : 'rgba(255,255,255,0.08)',
                color: role === 'buyer' ? '#fff' : '#cbd5e1',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              🛒 Buyer
            </button>
            <button
              type="button"
              onClick={() => setRole('designer')}
              style={{
                padding: '6px 14px',
                borderRadius: 99,
                border: 'none',
                background: role === 'designer' ? '#FF6B35' : 'rgba(255,255,255,0.08)',
                color: role === 'designer' ? '#fff' : '#cbd5e1',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              🎨 Designer
            </button>
            <button
              type="button"
              onClick={() => setRole('printer_owner')}
              style={{
                padding: '6px 14px',
                borderRadius: 99,
                border: 'none',
                background: role === 'printer_owner' ? '#FF6B35' : 'rgba(255,255,255,0.08)',
                color: role === 'printer_owner' ? '#fff' : '#cbd5e1',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              🖨️ Printer Hub
            </button>
            <button
              type="button"
              onClick={() => setRole('seller')}
              style={{
                padding: '6px 14px',
                borderRadius: 99,
                border: 'none',
                background: role === 'seller' ? '#FF6B35' : 'rgba(255,255,255,0.08)',
                color: role === 'seller' ? '#fff' : '#cbd5e1',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              🏬 Seller
            </button>
          </div>
        </div>

        {/* MAIN FOOTER COLUMNS */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 40,
            marginBottom: 40,
          }}
        >
          {/* BRAND COLUMN */}
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', marginBottom: 12 }}>
              Print<span style={{ color: '#FF6B35' }}>Hive</span>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.6, color: '#64748b', marginBottom: 16 }}>
              Where Ideas Become Products. AI-Powered Hybrid 3D Commerce & Distributed Manufacturing Network.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, background: 'rgba(16,185,129,0.12)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)', padding: '4px 10px', borderRadius: 99, fontWeight: 700 }}>
              <span>🟢</span> 70/15/15 Escrow Guard Active
            </div>
          </div>

          {/* DYNAMIC ROLE DASHBOARD COLUMN */}
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#FF6B35', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {role === 'designer' ? 'Designer Studio' : role === 'printer_owner' ? 'Printer Hub Operations' : role === 'seller' ? 'Seller Central' : role === 'admin' ? 'Admin Operations' : 'Buyer Hub'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
              {role === 'designer' && (
                <>
                  <Link href="/dashboard/designer" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Designer Dashboard</Link>
                  <Link href="/dashboard/designer/upload" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Upload STL / 3MF Model</Link>
                  <Link href="/dashboard/designer/earnings" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Royalty Earnings Wallet</Link>
                  <Link href="/requests" style={{ color: '#cbd5e1', textDecoration: 'none' }}>CAD Design Briefs</Link>
                </>
              )}

              {role === 'printer_owner' && (
                <>
                  <Link href="/dashboard/printer-owner" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Printer Owner Dashboard</Link>
                  <Link href="/dashboard/printer-owner/register" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Register 3D Machine</Link>
                  <Link href="/printers" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Local Printer Hubs Map</Link>
                  <Link href="/orders" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Active Print Job Queue</Link>
                </>
              )}

              {role === 'seller' && (
                <>
                  <Link href="/dashboard/seller" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Seller Dashboard</Link>
                  <Link href="/dashboard/seller/products/new" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Add Store Product</Link>
                  <Link href="/shop" style={{ color: '#cbd5e1', textDecoration: 'none' }}>My Store Items</Link>
                </>
              )}

              {role === 'admin' && (
                <>
                  <Link href="/dashboard/admin" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Admin Operations Center</Link>
                  <Link href="/support-tickets" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Support Tickets Queue</Link>
                </>
              )}

              {(role === 'buyer' || !role) && (
                <>
                  <Link href="/dashboard/buyer" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Buyer Dashboard</Link>
                  <Link href="/orders" style={{ color: '#cbd5e1', textDecoration: 'none' }}>My Print Orders</Link>
                  <Link href="/print-on-demand" style={{ color: '#cbd5e1', textDecoration: 'none' }}>AI Slicer & Upload</Link>
                  <Link href="/requests/new" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Post Custom CAD Brief</Link>
                </>
              )}
            </div>
          </div>

          {/* MARKETPLACE COLUMN */}
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 14 }}>Marketplace</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
              <Link href="/shop" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Ready-Made Shop</Link>
              <Link href="/browse" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Digital 3D Models</Link>
              <Link href="/print-on-demand" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Print-on-Demand</Link>
              <Link href="/requests" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Custom Design Briefs</Link>
            </div>
          </div>

          {/* ECOSYSTEM & HELP COLUMN */}
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 14 }}>Ecosystem & Support</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
              <Link href="/printers" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Printer Owners Hubs</Link>
              <Link href="/designers" style={{ color: '#cbd5e1', textDecoration: 'none' }}>3D Designers Directory</Link>
              <Link href="/support-tickets" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Live Support Desk</Link>
              <Link href="/faq" style={{ color: '#cbd5e1', textDecoration: 'none' }}>FAQ & Escrow Help</Link>
            </div>
          </div>
        </div>

        {/* BOTTOM COPYRIGHT & LEGAL BAR */}
        <div style={{ borderTop: '1px solid #1e293b', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, fontSize: 12, color: '#64748b' }}>
          <div>© 2026 PrintHive Inc. All rights reserved. Escrow payments guarded by Razorpay.</div>
          <div style={{ display: 'flex', gap: 16 }}>
            <Link href="/faq" style={{ color: '#64748b', textDecoration: 'none' }}>Privacy Policy</Link>
            <Link href="/faq" style={{ color: '#64748b', textDecoration: 'none' }}>Terms & Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}