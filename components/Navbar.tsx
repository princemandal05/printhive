'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/cart-context'
import { createClient } from '@/utils/supabase/client'

const NAV_LINKS = [
  { href: '/shop', label: 'Shop' },
  { href: '/browse', label: 'Designs' },
  { href: '/print-on-demand', label: 'Print File' },
  { href: '/requests', label: 'Custom Briefs' },
  { href: '/printers', label: 'Hubs' },
  { href: '/designers', label: 'Creators' },
]

const DASHBOARD_PATH: Record<string, string> = {
  buyer: '/dashboard/buyer',
  seller: '/dashboard/seller',
  designer: '/dashboard/designer',
  printer_owner: '/dashboard/printer-owner',
  admin: '/dashboard/admin',
}

export default function Navbar() {
  const { cartCount, wishlist } = useStore()
  const router = useRouter()
  const supabase = createClient()
  const [dashboardHref, setDashboardHref] = useState<string | null>(null)
  const [guestRole, setGuestRole] = useState<string | null>(null)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    let active = true

    async function loadSession() {
      // Check for guest cookie
      const cookies = document.cookie.split('; ')
      const guestCookie = cookies.find((row) => row.startsWith('printhive_guest_role='))?.split('=')[1]

      if (guestCookie) {
        if (!active) return
        setGuestRole(guestCookie)
        setDashboardHref(DASHBOARD_PATH[guestCookie] ?? '/dashboard/buyer')
        setChecked(true)
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!active) return
      if (!user) {
        setDashboardHref(null)
        setChecked(true)
        return
      }
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      if (!active) return
      setDashboardHref(profile?.role ? DASHBOARD_PATH[profile.role] ?? '/' : null)
      setChecked(true)
    }

    loadSession()

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      loadSession()
    })

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const handleSignOut = async () => {
    // Clear guest cookie
    document.cookie = 'printhive_guest_role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
    await supabase.auth.signOut()
    setDashboardHref(null)
    setGuestRole(null)
    router.push('/')
    router.refresh()
  }

  return (
    <header className="navbar" style={{ background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', position: 'sticky', top: 0, zIndex: 100 }}>
      <div className="navbar-inner" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" className="navbar-logo" style={{ fontSize: 20, fontWeight: 900, color: '#fff', textDecoration: 'none' }}>
          Print<span className="navbar-logo-accent" style={{ color: '#ff6b35' }}>Hive</span>
        </Link>

        <nav className="navbar-links" style={{ display: 'flex', gap: 20 }}>
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="navbar-link" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/wishlist" className="navbar-link" style={{ position: 'relative', color: '#fff', textDecoration: 'none', fontSize: 18 }} aria-label="Wishlist">
            ♡
            {wishlist.length > 0 && <span style={navBadgeStyle}>{wishlist.length}</span>}
          </Link>
          <Link href="/cart" className="navbar-link" style={{ position: 'relative', color: '#fff', textDecoration: 'none', fontSize: 18 }} aria-label="Cart">
            🛒
            {cartCount > 0 && <span style={navBadgeStyle}>{cartCount}</span>}
          </Link>

          {!checked ? null : dashboardHref ? (
            <>
              <Link href={dashboardHref} className="navbar-link" style={{ color: '#ff6b35', fontWeight: 600, textDecoration: 'none', fontSize: 14 }}>
                {guestRole ? `Guest (${guestRole.replace('_', ' ')})` : 'Dashboard'}
              </Link>
              <button onClick={handleSignOut} className="btn btn-secondary btn-sm" style={{ background: '#334155', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 12px', fontSize: 13, cursor: 'pointer' }}>
                {guestRole ? 'Exit Guest' : 'Sign out'}
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="navbar-link" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: 14 }}>
                Log in / Guest
              </Link>
              <Link href="/signup" className="btn btn-primary btn-sm" style={{ background: '#ff6b35', color: '#fff', textDecoration: 'none', padding: '8px 16px', borderRadius: 8, fontWeight: 600, fontSize: 13 }}>
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

const navBadgeStyle: React.CSSProperties = {
  position: 'absolute',
  top: -6,
  right: -10,
  background: '#ff6b35',
  color: '#fff',
  fontSize: 10,
  fontWeight: 700,
  borderRadius: 99,
  minWidth: 16,
  height: 16,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0 4px',
}