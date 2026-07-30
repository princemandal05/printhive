'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
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
  const pathname = usePathname()
  const supabase = createClient()

  const [dashboardHref, setDashboardHref] = useState<string | null>(null)
  const [guestRole, setGuestRole] = useState<string | null>(null)
  const [checked, setChecked] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    let active = true

    const savedTheme = (localStorage.getItem('ateion-theme') as 'light' | 'dark') || 'light'
    setTheme(savedTheme)
    document.documentElement.setAttribute('data-theme', savedTheme)

    async function loadSession() {
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

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(nextTheme)
    localStorage.setItem('ateion-theme', nextTheme)
    document.documentElement.setAttribute('data-theme', nextTheme)
  }

  const handleSignOut = async () => {
    document.cookie = 'printhive_guest_role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
    await supabase.auth.signOut()
    setDashboardHref(null)
    setGuestRole(null)
    router.push('/')
    router.refresh()
  }

  return (
    <header className="navbar" style={{ background: 'var(--bg-card)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border-color)', position: 'sticky', top: 0, zIndex: 100, transition: 'all 0.3s ease' }}>
      <div className="navbar-inner" style={{ maxWidth: 1240, margin: '0 auto', padding: '0 20px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* LEFT SECTION: GOOGLE-STYLE NAV ARROWS & LOGO */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Google Browser-Style Back & Forward Navigation Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--bg-card-hover)', padding: '4px 6px', borderRadius: 99, border: '1px solid var(--border-color)' }}>
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => router.back()}
              style={navArrowBtnStyle}
              title="Go Back (Google Navigation)"
              aria-label="Back"
            >
              ←
            </button>
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => router.forward()}
              style={navArrowBtnStyle}
              title="Go Forward (Google Navigation)"
              aria-label="Forward"
            >
              →
            </button>
          </div>

          <Link href="/" className="navbar-logo" style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-main)', textDecoration: 'none', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 4 }}>
            Print<span className="navbar-logo-accent" style={{ color: '#ea580c', textShadow: '0 0 10px rgba(234,88,12,0.3)' }}>Hive</span>
          </Link>
        </div>

        {/* MIDDLE SECTION: MODERN FLOATING PILL NAV LINKS */}
        <nav style={{ background: 'var(--bg-card-hover)', padding: '4px 8px', borderRadius: 99, border: '1px solid var(--border-color)', display: 'flex', gap: 4 }}>
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  color: isActive ? '#fff' : 'var(--text-sub)',
                  background: isActive ? '#ea580c' : 'transparent',
                  padding: '8px 16px',
                  borderRadius: 99,
                  textDecoration: 'none',
                  fontSize: 13,
                  fontWeight: 700,
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* RIGHT SECTION: ACTIONS, WISHLIST, CART & GUEST AUTH */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Theme Switcher Button */}
          <button
            type="button"
            suppressHydrationWarning
            onClick={toggleTheme}
            style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', borderRadius: 99, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 16, transition: 'all 0.2s' }}
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

          <Link href="/wishlist" style={{ position: 'relative', color: 'var(--text-main)', textDecoration: 'none', fontSize: 18 }} aria-label="Wishlist">
            ♡
            {wishlist.length > 0 && <span style={navBadgeStyle}>{wishlist.length}</span>}
          </Link>
          
          <Link href="/cart" style={{ position: 'relative', color: 'var(--text-main)', textDecoration: 'none', fontSize: 18 }} aria-label="Cart">
            🛒
            {cartCount > 0 && <span style={navBadgeStyle}>{cartCount}</span>}
          </Link>

          {!checked ? null : dashboardHref ? (
            <>
              <Link href={dashboardHref} style={{ color: '#ea580c', fontWeight: 800, textDecoration: 'none', fontSize: 13, background: 'rgba(234, 88, 12, 0.1)', padding: '6px 14px', borderRadius: 99, border: '1px solid rgba(234, 88, 12, 0.3)' }}>
                {guestRole ? `Guest (${guestRole.replace('_', ' ')})` : 'Dashboard'}
              </Link>
              <button onClick={handleSignOut} style={{ background: 'var(--bg-card-hover)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: 99, padding: '6px 14px', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
                {guestRole ? 'Exit Guest' : 'Sign out'}
              </button>
            </>
          ) : (
            <>
              <Link href="/login" style={{ color: 'var(--text-sub)', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
                Log in
              </Link>
              <Link href="/signup" style={{ background: '#ea580c', color: '#ffffff', textDecoration: 'none', padding: '8px 18px', borderRadius: 99, fontWeight: 800, fontSize: 13, boxShadow: '0 4px 14px rgba(234, 88, 12, 0.3)' }}>
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

const navArrowBtnStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  color: 'var(--text-main)',
  width: 28,
  height: 28,
  borderRadius: 99,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 14,
  fontWeight: 800,
  cursor: 'pointer',
  transition: 'background 0.2s ease',
}

const navBadgeStyle: React.CSSProperties = {
  position: 'absolute',
  top: -6,
  right: -10,
  background: '#ea580c',
  color: '#ffffff',
  fontSize: 10,
  fontWeight: 800,
  borderRadius: 99,
  minWidth: 16,
  height: 16,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0 4px',
  boxShadow: '0 0 8px rgba(234,88,12,0.5)',
}