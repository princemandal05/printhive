import Link from 'next/link'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-grid">
          <div>
            <div className="navbar-logo" style={{ marginBottom: 'var(--space-3)' }}>
              Print<span className="navbar-logo-accent">Hive</span>
            </div>
            <p className="text-sm" style={{ color: 'var(--color-slate-400)', maxWidth: 280 }}>
              A three-sided marketplace connecting 3D model designers, printer
              owners, and buyers — design, discover, deliver.
            </p>
          </div>

          <div>
            <div className="footer-heading">Marketplace</div>
            <Link href="/browse" className="footer-link">Browse designs</Link>
            <Link href="/signup" className="footer-link">Become a designer</Link>
            <Link href="/signup" className="footer-link">List your printer</Link>
          </div>

          <div>
            <div className="footer-heading">Company</div>
            <Link href="/#how-it-works" className="footer-link">How it works</Link>
            <Link href="/#roles" className="footer-link">For everyone</Link>
            <Link href="/login" className="footer-link">Log in</Link>
          </div>

          <div>
            <div className="footer-heading">Get started</div>
            <Link href="/signup" className="footer-link">Create an account</Link>
            <a href="mailto:hello@printhive.app" className="footer-link">Contact</a>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {year} PrintHive. Built as a college project.</span>
          <span>Design · Discover · Deliver</span>
        </div>
      </div>
    </footer>
  )
}