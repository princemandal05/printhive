'use client'

import { useState, useEffect, useRef } from 'react'
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
  buyer: '🛍️ Buyer Mode',
  seller: '🏬 Seller Mode',
  designer: '🎨 Designer Mode',
  printer_owner: '🖨️ Printer Owner Mode',
  admin: '🛡️ Admin Mode',
}

const ROLE_NAV_LINKS: Record<string, { href: string; label: string }[]> = {
  public: [
    { href: '/', label: 'Home' },
    { href: '/shop', label: 'Shop' },
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
    { href: '/browse', label: '3D Models' },
    { href: '/dashboard/designer', label: 'Creator Studio' },
    { href: '/dashboard/designer/upload', label: '+ Upload Model' },
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
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let active = true

    const savedTheme = (localStorage.getItem('ateion-theme') as 'light' | 'dark') || 'light'
    setTheme(savedTheme)
    document.documentElement.setAttribute('data-theme', savedTheme)

    async function loadSession() {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      let role: string | null = null

      if (currentUser) {
        setUser(currentUser)
        const { data: userProfile } = await supabase.from('profiles').select('*').eq('id', currentUser.id).maybeSingle()
        if (userProfile) setProfile(userProfile)
        role = userProfile?.role || 'buyer'
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

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
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
    setUser(null)
    setDropdownOpen(false)
    window.location.href = '/'
  }

  const handleRoleSwitch = (newRole: string) => {
    document.cookie = `printhive_guest_role=${newRole}; path=/; max-age=604800`
    document.cookie = `printhive_auth_role=${newRole}; path=/; max-age=604800`
    setUserRole(newRole)
    const targetHref = DASHBOARD_PATH[newRole] || '/dashboard/buyer'
    setDashboardHref(targetHref)
    setDropdownOpen(false)
    router.push(targetHref)
  }

  const activeNavLinks = userRole && ROLE_NAV_LINKS[userRole] ? ROLE_NAV_LINKS[userRole] : ROLE_NAV_LINKS.public

  const userName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || (userRole ? `Guest ${userRole}` : 'User')
  const userEmail = user?.email || (userRole ? `${userRole}@printhive.demo` : '')
  const avatarUrl = profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=ea580c&color=ffffff&bold=true`

  return (
    <header className="navbar" style={{ background: 'var(--bg-card)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border-color)', position: 'sticky', top: 0, zIndex: 100, transition: 'all 0.3s ease' }}>
      <div className="navbar-inner" style={{ maxWidth: 1240, margin: '0 auto', padding: '0 20px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Left Side: Navigation Arrows + Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
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
                  fontSize: 13,
                  fontWeight: isActive ? 800 : 600,
                  textDecoration: 'none',
                  color: isActive ? '#fff' : 'var(--text-main)',
                  background: isActive ? '#ea580c' : 'transparent',
                  boxShadow: isActive ? '0 2px 10px rgba(234, 88, 12, 0.4)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Right Side Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 15 }}
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

          {/* Logged In Controls: Mode Dropdown, My Profile Button, Dashboard Button, Log out, + Profile Avatar Dropdown */}
          {userRole ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* 1-Click Role Switcher Selector */}
              <select
                value={userRole}
                onChange={(e) => handleRoleSwitch(e.target.value)}
                style={{ background: 'var(--bg-card-hover)', color: 'var(--text-main)', border: '1px solid var(--border-color)', padding: '6px 12px', borderRadius: 99, fontSize: 12, fontWeight: 800, cursor: 'pointer', outline: 'none' }}
                title="Switch Active Role Experience"
              >
                <option value="buyer">🛍️ Buyer Mode</option>
                <option value="seller">🏬 Seller Mode</option>
                <option value="designer">🎨 Designer Mode</option>
                <option value="printer_owner">🖨️ Printer Owner Mode</option>
                <option value="admin">🛡️ Admin Mode</option>
              </select>

              {/* My Profile Button */}
              <Link
                href="/profile"
                style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', color: 'var(--text-main)', padding: '6px 14px', borderRadius: 99, fontSize: 13, fontWeight: 800, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                title="View & Edit My Profile"
              >
                👤 My Profile
              </Link>

              {/* Dashboard Button */}
              {dashboardHref && (
                <Link
                  href={dashboardHref}
                  style={{ background: '#ea580c', color: '#fff', padding: '8px 16px', borderRadius: 99, fontSize: 13, fontWeight: 800, textDecoration: 'none', boxShadow: '0 4px 14px rgba(234, 88, 12, 0.3)' }}
                >
                  Dashboard →
                </Link>
              )}

              {/* Log Out Button */}
              <button
                type="button"
                onClick={handleSignOut}
                style={{ background: 'var(--bg-card-hover)', color: 'var(--text-sub)', border: '1px solid var(--border-color)', padding: '8px 14px', borderRadius: 99, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
              >
                Log out
              </button>

              {/* Profile Avatar Circle & Dropdown */}
              <div style={{ position: 'relative', marginLeft: 4 }} ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  title="GitHub Style Profile Menu"
                >
                  <img
                    src={avatarUrl}
                    alt={userName}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid #ea580c',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                    }}
                  />
                </button>

                {/* FLOATING DROPDOWN PANEL */}
                {dropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 48,
                      right: 0,
                      width: 280,
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 16,
                      boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                      zIndex: 1000,
                      overflow: 'hidden',
                      fontFamily: 'inherit',
                    }}
                  >
                    {/* USER INFO HEADER */}
                    <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-card-hover)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <img src={avatarUrl} alt={userName} style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover' }} />
                        <div style={{ overflow: 'hidden' }}>
                          <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {userName}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--text-sub)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {userEmail}
                          </div>
                        </div>
                      </div>
                      <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ background: 'rgba(234,88,12,0.12)', color: '#ea580c', padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 800 }}>
                          {ROLE_LABELS[userRole] || userRole}
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--text-sub)', fontWeight: 700 }}>⇄ Mode Switcher</span>
                      </div>
                    </div>

                    {/* PRIMARY NAV LINKS */}
                    <div style={{ padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                      <Link
                        href="/profile"
                        onClick={() => setDropdownOpen(false)}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px', fontSize: 13, fontWeight: 700, color: 'var(--text-main)', textDecoration: 'none', transition: 'background 0.2s' }}
                      >
                        <span>👤</span> Your Profile
                      </Link>
                      <Link
                        href={dashboardHref || '/dashboard/buyer'}
                        onClick={() => setDropdownOpen(false)}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px', fontSize: 13, fontWeight: 700, color: 'var(--text-main)', textDecoration: 'none', transition: 'background 0.2s' }}
                      >
                        <span>🚀</span> My Role Dashboard
                      </Link>
                      <Link
                        href="/orders"
                        onClick={() => setDropdownOpen(false)}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px', fontSize: 13, fontWeight: 700, color: 'var(--text-main)', textDecoration: 'none', transition: 'background 0.2s' }}
                      >
                        <span>📦</span> My Orders & Escrow
                      </Link>
                    </div>

                    {/* SETTINGS & THEME & LOGIN ACCESS */}
                    <div style={{ padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                      <Link
                        href="/login"
                        onClick={() => setDropdownOpen(false)}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px', fontSize: 13, fontWeight: 700, color: 'var(--text-main)', textDecoration: 'none', transition: 'background 0.2s' }}
                      >
                        <span>🔑</span> Log In / Switch Account
                      </Link>
                      <button
                        type="button"
                        onClick={() => { toggleTheme(); setDropdownOpen(false); }}
                        style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', padding: '10px 18px', fontSize: 13, fontWeight: 700, color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}
                      >
                        <span>{theme === 'dark' ? '☀️' : '🌙'}</span> Appearance: {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                      </button>
                    </div>

                    {/* SIGN OUT */}
                    <div style={{ padding: '8px 0' }}>
                      <button
                        type="button"
                        onClick={handleSignOut}
                        style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', padding: '10px 18px', fontSize: 13, fontWeight: 800, color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}
                      >
                        <span>🚪</span> Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
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