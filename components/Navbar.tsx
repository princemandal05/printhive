'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useStore } from '@/lib/cart-context'
import { createClient } from '@/utils/supabase/client'

const DASHBOARD_PATH: Record<string, string> = {
  buyer: '/dashboard/buyer',
  seller: '/dashboard/seller',
  designer: '/dashboard/designer',
  printer_owner: '/dashboard/printer-owner',
  admin: '/dashboard/admin',
}

const ROLE_LABELS: Record<string, string> = {
  buyer: '🛍️ Buyer',
  seller: '🏬 Seller',
  designer: '🎨 Designer',
  printer_owner: '🖨️ Printer Owner',
  admin: '🛡️ Admin',
}

// Role-based Navigation Links
const ROLE_NAV_LINKS: Record<string, { href: string; label: string }[]> = {
  // Public / Logged out: Full Guest Access across all pages
  public: [
    { href: '/', label: 'Home' },
    { href: '/shop', label: 'Shop' },
    { href: '/browse', label: '3D Models' },
    { href: '/printers', label: 'Nearby Hubs' },
    { href: '/print-on-demand', label: 'Print File' },
    { href: '/requests', label: 'Custom Briefs' },
    { href: '/designers', label: 'Designers' },
  ],
  buyer: [
    { href: '/', label: 'Home' },
    { href: '/shop', label: 'Shop' },
    { href: '/print-on-demand', label: 'Print File' },
    { href: '/requests', label: 'Custom Briefs' },
    { href: '/orders', label: 'My Orders' },
  ],
  seller: [
    { href: '/', label: 'Home' },
    { href: '/shop', label: 'Shop' },
    { href: '/dashboard/seller', label: 'My Products' },
    { href: '/dashboard/seller/products/new', label: '+ Add Product' },
  ],
  designer: [
    { href: '/', label: 'Home' },
    { href: '/shop', label: 'Shop' },
    { href: '/browse', label: '3D Models' },
    { href: '/dashboard/designer/upload', label: 'Upload Model' },
    { href: '/dashboard/designer/earnings', label: 'Earnings' },
  ],
  printer_owner: [
    { href: '/', label: 'Home' },
    { href: '/shop', label: 'Shop' },
    { href: '/printers', label: 'Nearby Hubs' },
    { href: '/dashboard/printer-owner/register', label: 'Register Hub' },
  ],
  admin: [
    { href: '/', label: 'Home' },
    { href: '/shop', label: 'Shop' },
    { href: '/printers', label: 'Hubs Directory' },
    { href: '/dashboard/admin', label: 'Admin Overview' },
  ],
}

export default function Navbar() {
  const { cartCount } = useStore()
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  const [userRole, setUserRole] = useState<string | null>(null)
  const [dashboardHref, setDashboardHref] = useState<string | null>(null)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    let active = true

    const savedTheme = (localStorage.getItem('ateion-theme') as 'light' | 'dark') || 'light'
    setTheme(savedTheme)
    document.documentElement.setAttribute('data-theme', savedTheme)

    async function loadSession() {
      const { data: { user } } = await supabase.auth.getUser()
      let role: string | null = null

      if (user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        role = profile?.role || 'buyer'
      } else if (typeof document !== 'undefined') {
        const guestMatch = document.cookie.match(/printhive_guest_role=([^;]+)/) || document.cookie.match(/printhive_auth_role=([^;]+)/)
        role = guestMatch ? guestMatch[1] : null
      }

      if (!active) return

      if (role && DASHBOARD_PATH[role]) {
        setUserRole(role)
        setDashboardHref(DASHBOARD_PATH[role])
      } else {
        setUserRole(null)
        setDashboardHref(null)
      }
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
    document.cookie = 'printhive_auth_role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
    await supabase.auth.signOut()
    setUserRole(null)
    setDashboardHref(null)
    window.location.href = '/'
  }

  // Determine navigation links based on user authentication and role
  const activeNavLinks = userRole && ROLE_NAV_LINKS[userRole] ? ROLE_NAV_LINKS[userRole] : ROLE_NAV_LINKS.public

  return (
    <header className="navbar" style={{ background: 'var(--bg-card)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border-color)', position: 'sticky', top: 0, zIndex: 100, transition: 'all 0.3s ease' }}>
      <div className="navbar-inner" style={{ maxWidth: 1240, margin: '0 auto', padding: '0 20px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Left Side: Navigation Arrows + Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Google Chrome Browser Control Arrows */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--bg-card-hover)', padding: '4px 8px', borderRadius: 99, border: '1px solid var(--border-color)' }}>
            <button
              type="button"
              onClick={() => router.back()}
              title="Go Back"
              style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', fontSize: 14, fontWeight: 800, cursor: 'pointer', padding: '2px 6px', borderRadius: '50%' }}
              suppressHydrationWarning
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => router.forward()}
              title="Go Forward"
              style={{ background: 'transparent', border: 'none', color: 'var(--text-sub)', fontSize: 14, fontWeight: 800, cursor: 'pointer', padding: '2px 6px', borderRadius: '50%' }}
              suppressHydrationWarning
            >
              →
            </button>
          </div>

          {/* Logo */}
          <Link href="/" style={{ fontSize: 22, fontWeight: 900, textDecoration: 'none', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
            Print<span style={{ color: '#ea580c' }}>Hive</span>
          </Link>
        </div>

        {/* Dynamic Role-Based Navigation Pill Menu */}
        <nav style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', borderRadius: 99, padding: '3px 4px', display: 'flex', alignItems: 'center', gap: 2 }}>
          {activeNavLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  padding: isActive ? '5px 14px' : '5px 12px',
                  borderRadius: 99,
                  fontSize: 12,
                  fontWeight: isActive ? 800 : 600,
                  color: isActive ? '#fff' : 'var(--text-main)',
                  background: isActive ? '#ea580c' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Right Side Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 16 }}
            title="Toggle Light/Dark Theme"
            suppressHydrationWarning
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {/* Cart Icon */}
          <Link
            href="/cart"
            style={{ position: 'relative', background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', color: 'var(--text-main)', fontSize: 15 }}
          >
            🛒
            {cartCount > 0 && (
              <span style={{ position: 'absolute', top: -4, right: -4, background: '#ea580c', color: '#fff', fontSize: 10, fontWeight: 900, borderRadius: 99, padding: '2px 6px', border: '2px solid var(--bg-card)' }}>
                {cartCount}
              </span>
            )}
          </Link>

          {/* User Auth Buttons / Dashboard Role Switcher Badge */}
          {userRole && dashboardHref ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* 1-Click Role Switcher Selector */}
              <select
                value={userRole}
                onChange={(e) => {
                  const newRole = e.target.value
                  document.cookie = `printhive_guest_role=${newRole}; path=/; max-age=604800`
                  document.cookie = `printhive_auth_role=${newRole}; path=/; max-age=604800`
                  setUserRole(newRole)
                  const targetHref = DASHBOARD_PATH[newRole] || '/dashboard/buyer'
                  setDashboardHref(targetHref)
                  router.push(targetHref)
                }}
                style={{ background: 'var(--bg-card-hover)', color: 'var(--text-main)', border: '1px solid var(--border-color)', padding: '6px 12px', borderRadius: 99, fontSize: 12, fontWeight: 800, cursor: 'pointer', outline: 'none' }}
                title="Switch Active Role Experience"
              >
                <option value="buyer">🛍️ Buyer Mode</option>
                <option value="seller">🏬 Seller Mode</option>
                <option value="designer">🎨 Designer Mode</option>
                <option value="printer_owner">🖨️ Printer Owner Mode</option>
                <option value="admin">🛡️ Admin Mode</option>
              </select>

              <Link
                href={dashboardHref}
                style={{ background: '#ea580c', color: '#fff', padding: '8px 16px', borderRadius: 99, fontSize: 13, fontWeight: 800, textDecoration: 'none', boxShadow: '0 4px 14px rgba(234, 88, 12, 0.3)' }}
              >
                Dashboard →
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                style={{ background: 'var(--bg-card-hover)', color: 'var(--text-sub)', border: '1px solid var(--border-color)', padding: '8px 14px', borderRadius: 99, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
              >
                Log out
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Link href="/login" style={{ color: 'var(--text-main)', fontSize: 14, fontWeight: 700, textDecoration: 'none', padding: '8px 14px' }}>
                Log in
              </Link>
              <Link
                href="/signup"
                style={{ background: '#ea580c', color: '#fff', padding: '8px 18px', borderRadius: 99, fontSize: 14, fontWeight: 800, textDecoration: 'none', boxShadow: '0 4px 14px rgba(234, 88, 12, 0.3)' }}
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}