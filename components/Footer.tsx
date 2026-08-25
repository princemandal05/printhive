'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'

export default function Footer() {
  const [role, setRole] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    let isMounted = true

    async function fetchUserRole() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user && isMounted) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle()

          if (profile?.role) {
            setRole(profile.role)
          }
        }
      } catch (err) {
        console.warn('Footer role resolution:', err)
      } finally {
        if (isMounted) setIsLoaded(true)
      }
    }

    fetchUserRole()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchUserRole()
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  return (
    <footer style={{ background: '#090d16', borderTop: '1px solid #1e293b', color: '#94a3b8', padding: '64px 24px 32px', fontFamily: 'inherit' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* MAIN 5-COLUMN ENTERPRISE GRID */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.8fr 1fr 1fr 1fr 1fr',
            gap: 48,
            marginBottom: 56,
          }}
          className="footer-grid"
        >
          {/* BRAND COLUMN */}
          <div style={{ maxWidth: 300 }}>
            <Link href="/" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: 16 }}>
              <span style={{ fontSize: 22, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.5px' }}>
                Print<span style={{ color: '#FF6B35' }}>Hive</span>
              </span>
            </Link>
            <p style={{ fontSize: 13.5, lineHeight: 1.65, color: '#64748b', marginBottom: 20 }}>
              The distributed additive manufacturing network connecting creators, verified 3D print hubs, and global buyers.
            </p>

            {/* PLATFORM STATUS */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid #1e293b', borderRadius: 8, fontSize: 12, color: '#cbd5e1' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981' }} />
              <span>All Systems Operational</span>
            </div>
          </div>

          {/* COLUMN 1: MARKETPLACE */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#ffffff', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 16 }}>
              Marketplace
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13.5 }}>
              <li>
                <Link href="/shop" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.15s' }}>
                  Ready-Made Products
                </Link>
              </li>
              <li>
                <Link href="/browse" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.15s' }}>
                  Digital 3D Models
                </Link>
              </li>
              <li>
                <Link href="/print-on-demand" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.15s' }}>
                  Print-on-Demand
                </Link>
              </li>
              <li>
                <Link href="/requests" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.15s' }}>
                  Custom Design Briefs
                </Link>
              </li>
              <li>
                <Link href="/cart" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.15s' }}>
                  Shopping Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUMN 2: STRICTLY ROLE-TAILORED PORTAL */}
          <div>
            {role === 'seller' && (
              <>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#FF6B35', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 16 }}>
                  Seller Portal
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13.5 }}>
                  <li>
                    <Link href="/dashboard/seller" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.15s' }}>
                      Seller Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link href="/dashboard/seller/products/new" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.15s' }}>
                      Add New Product
                    </Link>
                  </li>
                  <li>
                    <Link href="/shop" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.15s' }}>
                      My Store Catalog
                    </Link>
                  </li>
                  <li>
                    <Link href="/dashboard/seller" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.15s' }}>
                      Sales & 70% Payouts
                    </Link>
                  </li>
                </ul>
              </>
            )}

            {role === 'printer_owner' && (
              <>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#FF6B35', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 16 }}>
                  Printer Hub Portal
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13.5 }}>
                  <li>
                    <Link href="/dashboard/printer-owner" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.15s' }}>
                      Printer Hub Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link href="/dashboard/printer-owner/register" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.15s' }}>
                      Register 3D Machine
                    </Link>
                  </li>
                  <li>
                    <Link href="/printers" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.15s' }}>
                      Verified Hubs Map
                    </Link>
                  </li>
                  <li>
                    <Link href="/orders" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.15s' }}>
                      Active Print Job Queue
                    </Link>
                  </li>
                </ul>
              </>
            )}

            {role === 'designer' && (
              <>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#FF6B35', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 16 }}>
                  Designer Studio
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13.5 }}>
                  <li>
                    <Link href="/dashboard/designer" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.15s' }}>
                      Designer Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link href="/dashboard/designer/upload" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.15s' }}>
                      Upload 3D CAD Model
                    </Link>
                  </li>
                  <li>
                    <Link href="/dashboard/designer/earnings" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.15s' }}>
                      15% Royalty Wallet
                    </Link>
                  </li>
                  <li>
                    <Link href="/requests" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.15s' }}>
                      Open CAD Briefs
                    </Link>
                  </li>
                </ul>
              </>
            )}

            {role === 'admin' && (
              <>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#FF6B35', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 16 }}>
                  Admin Center
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13.5 }}>
                  <li>
                    <Link href="/dashboard/admin" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.15s' }}>
                      Admin Operations
                    </Link>
                  </li>
                  <li>
                    <Link href="/support-tickets" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.15s' }}>
                      Support Queue
                    </Link>
                  </li>
                  <li>
                    <Link href="/dashboard/admin" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.15s' }}>
                      Dispute Resolution
                    </Link>
                  </li>
                </ul>
              </>
            )}

            {(role === 'buyer' || !role) && (
              <>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#ffffff', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 16 }}>
                  Buyer Portal
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13.5 }}>
                  <li>
                    <Link href="/dashboard/buyer" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.15s' }}>
                      Buyer Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link href="/orders" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.15s' }}>
                      Track Print Orders
                    </Link>
                  </li>
                  <li>
                    <Link href="/requests/new" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.15s' }}>
                      Post Custom CAD Brief
                    </Link>
                  </li>
                  <li>
                    <Link href="/wishlist" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.15s' }}>
                      Saved Wishlist
                    </Link>
                  </li>
                </ul>
              </>
            )}
          </div>

          {/* COLUMN 3: PLATFORM & TRUST */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#ffffff', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 16 }}>
              Trust & Security
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13.5 }}>
              <li>
                <Link href="/faq" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.15s' }}>
                  Escrow Protection
                </Link>
              </li>
              <li>
                <Link href="/faq" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.15s' }}>
                  70/15/15 Payout Split
                </Link>
              </li>
              <li>
                <Link href="/support-tickets" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.15s' }}>
                  Help & Support Desk
                </Link>
              </li>
              <li>
                <Link href="/faq" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.15s' }}>
                  Knowledge Base & FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUMN 4: COMPANY & LEGAL */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#ffffff', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 16 }}>
              Account & Legal
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13.5 }}>
              <li>
                <Link href="/profile" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.15s' }}>
                  Account Settings
                </Link>
              </li>
              <li>
                <Link href="/dashboard/buyer" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.15s' }}>
                  Order History
                </Link>
              </li>
              <li>
                <Link href="/faq" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.15s' }}>
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/faq" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.15s' }}>
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* BOTTOM METADATA & COPYRIGHT BAR */}
        <div
          style={{
            borderTop: '1px solid #1e293b',
            paddingTop: 28,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
            fontSize: 12.5,
            color: '#64748b',
          }}
        >
          <div>
            © {new Date().getFullYear()} PrintHive Inc. All rights reserved. Payments secured by Razorpay Escrow.
          </div>

          {/* REFINED SVG SOCIAL ICONS */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <a
              href="https://github.com/princemandal05/printhive"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              style={{ color: '#64748b', display: 'flex', alignItems: 'center', textDecoration: 'none', transition: 'color 0.15s' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </a>
            <a
              href="https://discord.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Discord"
              style={{ color: '#64748b', display: 'flex', alignItems: 'center', textDecoration: 'none', transition: 'color 0.15s' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.893.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
            </a>
            <a
              href="https://x.com"
              target="_blank"
              rel="noreferrer"
              aria-label="X"
              style={{ color: '#64748b', display: 'flex', alignItems: 'center', textDecoration: 'none', transition: 'color 0.15s' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}