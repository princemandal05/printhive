'use client'

import Link from 'next/link'
import { useStore } from '@/lib/cart-context'

const NAV_LINKS = [
  { href: '/shop', label: 'Shop' },
  { href: '/browse', label: 'Designs' },
  { href: '/print-on-demand', label: 'Print my file' },
  { href: '/requests', label: 'Custom requests' },
]

export default function Navbar() {
  const { cartCount, wishlist } = useStore()

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
          <Link href="/login" className="navbar-link">
            Log in
          </Link>
          <Link href="/signup" className="btn btn-primary btn-sm">
            Sign up
          </Link>
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