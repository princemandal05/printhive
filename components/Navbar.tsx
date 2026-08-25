'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useStore } from '@/lib/cart-context'
import { createClient } from '@/utils/supabase/client'
import NotificationBell from '@/components/NotificationBell'
import {
  Search,
  ShoppingCart,
  User,
  LayoutGrid,
  Plus,
  Package,
  Home,
  LogOut,
  Sparkles,
  Store,
  Printer,
  PenTool,
  Shield,
  Layers,
} from 'lucide-react'

const DASHBOARD_PATH: Record<string, string> = {
  buyer: '/dashboard/buyer',
  seller: '/dashboard/seller',
  designer: '/dashboard/designer',
  printer_owner: '/dashboard/printer-owner',
  admin: '/dashboard/admin',
}

const ROLE_LABELS: Record<string, string> = {
  buyer: 'Buyer Mode',
  seller: 'Seller Central',
  designer: 'Designer Studio',
  printer_owner: 'Printer Hub',
  admin: 'Admin Console',
}

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const { cartCount, cartSubtotal } = useStore()
  const supabase = createClient()

  const [user, setUser] = useState<any>(null)
  const [role, setRole] = useState<string>('buyer')
  const [profileName, setProfileName] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let isMounted = true

    async function loadUser() {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (authUser && isMounted) {
          setUser(authUser)
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, role')
            .eq('id', authUser.id)
            .maybeSingle()

          if (profile?.role) setRole(profile.role)
          if (profile?.full_name) setProfileName(profile.full_name)
        } else if (isMounted) {
          setUser(null)
          setRole('buyer')
        }
      } catch (err) {
        console.warn('Navbar auth load:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadUser()
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setMenuOpen(false)
    router.push('/')
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`)
  }

  const dashboardHref = DASHBOARD_PATH[role] || '/dashboard/buyer'

  return (
    <>
      {/* DESKTOP & TOP STICKY HEADER (printhive.org style) */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backgroundColor: 'rgba(250, 246, 241, 0.94)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
          transition: 'all 0.2s ease',
        }}
      >
        <div
          style={{
            maxWidth: 1440,
            margin: '0 auto',
            padding: '12px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          {/* BRAND LOGO */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <Link
              href="/"
              style={{
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-fraunces), Fraunces, Georgia, serif',
                  fontSize: 26,
                  fontWeight: 900,
                  color: '#1A1A2E',
                  letterSpacing: '-0.6px',
                }}
              >
                Print<span style={{ color: '#F97316' }}>Hive</span>
              </span>
            </Link>

            {/* DESKTOP NAV LINKS */}
            <nav style={{ display: 'none', alignItems: 'center', gap: 20 }} className="desktop-nav-links">
              <Link
                href="/shop"
                style={{
                  textDecoration: 'none',
                  fontSize: 14,
                  fontWeight: pathname === '/shop' ? 700 : 600,
                  color: pathname === '/shop' ? '#F97316' : '#1A1A2E',
                  transition: 'color 0.15s',
                }}
              >
                Ready-Made Shop
              </Link>
              <Link
                href="/browse"
                style={{
                  textDecoration: 'none',
                  fontSize: 14,
                  fontWeight: pathname === '/browse' ? 700 : 600,
                  color: pathname === '/browse' ? '#F97316' : '#1A1A2E',
                  transition: 'color 0.15s',
                }}
              >
                3D Models
              </Link>
              <Link
                href="/print-on-demand"
                style={{
                  textDecoration: 'none',
                  fontSize: 14,
                  fontWeight: pathname === '/print-on-demand' ? 700 : 600,
                  color: pathname === '/print-on-demand' ? '#F97316' : '#1A1A2E',
                  transition: 'color 0.15s',
                }}
              >
                Print-on-Demand
              </Link>
              <Link
                href="/requests"
                style={{
                  textDecoration: 'none',
                  fontSize: 14,
                  fontWeight: pathname === '/requests' ? 700 : 600,
                  color: pathname === '/requests' ? '#F97316' : '#1A1A2E',
                  transition: 'color 0.15s',
                }}
              >
                Custom Briefs
              </Link>
            </nav>
          </div>

          {/* SEARCH PILL (CENTER) */}
          <form
            onSubmit={handleSearchSubmit}
            style={{
              flex: 1,
              maxWidth: 480,
              margin: '0 16px',
              display: 'none',
            }}
            className="desktop-search-form"
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: '#FFFFFF',
                borderRadius: 9999,
                padding: '9px 18px',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
              }}
            >
              <Search size={16} color="#94A3B8" />
              <input
                type="text"
                placeholder="Search for creations, 3D gifts, STL models..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  fontSize: 13.5,
                  color: '#1A1A2E',
                  fontWeight: 500,
                }}
              />
            </div>
          </form>

          {/* RIGHT ACTION BUTTONS */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* NOTIFICATION BELL */}
            {user && <NotificationBell />}

            {/* ACCOUNT / SIGN IN */}
            {user ? (
              <div style={{ position: 'relative' }} ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen(!menuOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    background: '#FFFFFF',
                    border: '1px solid rgba(0,0,0,0.08)',
                    borderRadius: 9999,
                    padding: '6px 14px 6px 8px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: 12,
                    }}
                  >
                    {(profileName || user.email || 'U')[0].toUpperCase()}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#1A1A2E' }}>
                    {profileName || user.email?.split('@')[0]}
                  </span>
                </button>

                {/* DROPDOWN MENU */}
                {menuOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 'calc(100% + 8px)',
                      width: 220,
                      background: '#FFFFFF',
                      borderRadius: 18,
                      border: '1px solid rgba(0,0,0,0.08)',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                      padding: 8,
                      zIndex: 100,
                    }}
                  >
                    <div style={{ padding: '8px 12px', borderBottom: '1px solid #F0ECE6', marginBottom: 4 }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>
                        Active Role
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#F97316' }}>
                        {ROLE_LABELS[role] || 'Buyer Mode'}
                      </div>
                    </div>

                    <Link
                      href={dashboardHref}
                      onClick={() => setMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '10px 12px',
                        borderRadius: 10,
                        fontSize: 13,
                        fontWeight: 600,
                        color: '#1A1A2E',
                        textDecoration: 'none',
                      }}
                    >
                      <Store size={16} color="#F97316" /> Dashboard
                    </Link>

                    <Link
                      href="/orders"
                      onClick={() => setMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '10px 12px',
                        borderRadius: 10,
                        fontSize: 13,
                        fontWeight: 600,
                        color: '#1A1A2E',
                        textDecoration: 'none',
                      }}
                    >
                      <Package size={16} color="#7C3AED" /> My Orders
                    </Link>

                    <Link
                      href="/profile"
                      onClick={() => setMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '10px 12px',
                        borderRadius: 10,
                        fontSize: 13,
                        fontWeight: 600,
                        color: '#1A1A2E',
                        textDecoration: 'none',
                      }}
                    >
                      <User size={16} color="#0D9488" /> Profile Settings
                    </Link>

                    <button
                      type="button"
                      onClick={handleSignOut}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '10px 12px',
                        borderRadius: 10,
                        fontSize: 13,
                        fontWeight: 600,
                        color: '#EF4444',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        marginTop: 4,
                        borderTop: '1px solid #F0ECE6',
                      }}
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                style={{
                  textDecoration: 'none',
                  fontSize: 13.5,
                  fontWeight: 700,
                  color: '#1A1A2E',
                  padding: '8px 16px',
                  borderRadius: 9999,
                  background: '#FFFFFF',
                  border: '1px solid rgba(0,0,0,0.08)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}
              >
                Sign In
              </Link>
            )}

            {/* SHOPPING CART BADGE PILL */}
            <Link
              href="/cart"
              style={{
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: '#FFFFFF',
                border: '1px solid rgba(0,0,0,0.08)',
                borderRadius: 9999,
                padding: '7px 16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                transition: 'transform 0.15s',
              }}
            >
              <ShoppingCart size={18} color="#1A1A2E" />
              <div style={{ lineHeight: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1A2E' }}>
                  Cart ({cartCount})
                </div>
                <div style={{ fontSize: 10.5, fontWeight: 800, color: '#F97316', marginTop: 2 }}>
                  ₹{cartSubtotal}
                </div>
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* MOBILE BOTTOM FLOATING APP BAR (printhive.org style) */}
      <div
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          background: '#FFFFFF',
          borderTop: '1px solid #F0ECE6',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          padding: '10px 0 12px',
          zIndex: 50,
        }}
        className="mobile-bottom-bar"
      >
        <Link
          href="/"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
            fontSize: 10,
            fontWeight: 700,
            color: pathname === '/' ? '#F97316' : '#94A3B8',
            textDecoration: 'none',
          }}
        >
          <Home size={20} /> Home
        </Link>

        <Link
          href="/shop"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
            fontSize: 10,
            fontWeight: 700,
            color: pathname === '/shop' ? '#F97316' : '#94A3B8',
            textDecoration: 'none',
          }}
        >
          <Store size={20} /> Shop
        </Link>

        {/* CENTER FLOATING CREATE BUTTON */}
        <Link
          href="/print-on-demand"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textDecoration: 'none',
          }}
        >
          <span
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: -22,
              boxShadow: '0 4px 14px rgba(249,115,22,0.45)',
            }}
          >
            <Plus size={24} strokeWidth={2.5} />
          </span>
          <span style={{ fontSize: 10, fontWeight: 800, color: '#F97316', marginTop: 2 }}>
            Create
          </span>
        </Link>

        <Link
          href="/orders"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
            fontSize: 10,
            fontWeight: 700,
            color: pathname === '/orders' ? '#F97316' : '#94A3B8',
            textDecoration: 'none',
          }}
        >
          <Package size={20} /> Orders
        </Link>

        <Link
          href={user ? dashboardHref : '/login'}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
            fontSize: 10,
            fontWeight: 700,
            color: pathname?.startsWith('/dashboard') || pathname === '/login' ? '#F97316' : '#94A3B8',
            textDecoration: 'none',
          }}
        >
          <User size={20} /> Account
        </Link>
      </div>

      <style jsx global>{`
        @media (min-width: 900px) {
          .desktop-nav-links {
            display: flex !important;
          }
          .desktop-search-form {
            display: block !important;
          }
          .mobile-bottom-bar {
            display: none !important;
          }
        }
      `}</style>
    </>
  )
}