import Link from 'next/link'

const NAV_LINKS = [
  { href: '/browse', label: 'Browse' },
  { href: '/requests', label: 'Custom requests' },
  { href: '/#how-it-works', label: 'How it works' },
]

export default function Navbar() {
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