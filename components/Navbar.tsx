'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/cart-context'
import { createClient } from '@/utils/supabase/client'

const NAV_LINKS = [
  { href: '/shop', label: 'Shop' },
  { href: '/browse', label: 'Designs' },
  { href: '/requests', label: 'Custom requests' },
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
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    let active = true

    async function loadSession() {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setDashboardHref(null)
    router.push('/')
    router.refresh()
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link href="/" className="navbar-logo">
          Print<span className="navbar-logo-accent">Hive</span>
        </Link>

        <nav className="navbar-links">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="navbar-link">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/wishlist" className="navbar-link" style={{ position: 'relative' }} aria-label="Wishlist">
            ♡
            {wishlist.length > 0 && <span style={navBadgeStyle}>{wishlist.length}</span>}
          </Link>
          <Link href="/cart" className="navbar-link" style={{ position: 'relative' }} aria-label="Cart">
            🛒
            {cartCount > 0 && <span style={navBadgeStyle}>{cartCount}</span>}
          </Link>

          {!checked ? null : dashboardHref ? (
            <>
              <Link href={dashboardHref} className="navbar-link">
                Dashboard
              </Link>
              <button onClick={handleSignOut} className="btn btn-secondary btn-sm">
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="navbar-link">
                Log in
              </Link>
              <Link href="/signup" className="btn btn-primary btn-sm">
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
  background: 'var(--color-primary)',
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