'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface SidebarProps {
  role: 'designer' | 'seller' | 'printer' | 'buyer' | 'admin'
  userEmail: string
  userName?: string
  avatarUrl?: string
  signOutAction: () => Promise<void> | void
}

const ROLE_CONFIGS = {
  designer: {
    badge: '🎨 3D Designer',
    badgeBg: 'rgba(139, 92, 246, 0.2)',
    badgeColor: '#A78BFA',
    portalName: 'Creator Studio',
    navs: [
      { label: 'Overview', href: '/dashboard/designer', icon: '📊' },
      { label: 'Upload 3D Model', href: '/dashboard/designer/upload', icon: '⚡' },
      { label: '3D Marketplace', href: '/browse', icon: '🧊' },
      { label: 'Royalties & Earnings', href: '/dashboard/designer/earnings', icon: '💰' },
      { label: 'Print Orders', href: '/orders', icon: '📦' },
      { label: 'Buyer Requests', href: '/requests', icon: '✏️' },
      { label: 'Support & Tickets', href: '/support-tickets', icon: '💬' },
    ],
  },
  seller: {
    badge: '🏬 Verified Seller',
    badgeBg: 'rgba(255, 107, 53, 0.2)',
    badgeColor: '#FF6B35',
    portalName: 'Seller Central',
    navs: [
      { label: 'Store Overview', href: '/dashboard/seller', icon: '📊' },
      { label: 'Add New Product', href: '/dashboard/seller/products/new', icon: '➕' },
      { label: 'Shop Marketplace', href: '/shop', icon: '🛒' },
      { label: 'Orders & Sales', href: '/orders', icon: '📦' },
      { label: 'Support & Tickets', href: '/support-tickets', icon: '💬' },
    ],
  },
  printer: {
    badge: '🖨️ Machine Owner',
    badgeBg: 'rgba(37, 99, 235, 0.2)',
    badgeColor: '#60A5FA',
    portalName: 'Printer Hub',
    navs: [
      { label: 'Fleet Overview', href: '/dashboard/printer-owner', icon: '📊' },
      { label: 'Register Machine', href: '/dashboard/printer-owner/register', icon: '🖨️' },
      { label: 'Active Print Jobs', href: '/orders', icon: '📦' },
      { label: 'Print Estimator', href: '/print-on-demand', icon: '🤖' },
      { label: 'Support & Tickets', href: '/support-tickets', icon: '💬' },
    ],
  },
  buyer: {
    badge: '🛍️ Verified Buyer',
    badgeBg: 'rgba(16, 185, 129, 0.2)',
    badgeColor: '#34D399',
    portalName: 'Buyer Account',
    navs: [
      { label: 'My Portal', href: '/dashboard/buyer', icon: '📊' },
      { label: 'My Orders & Escrow', href: '/orders', icon: '📦' },
      { label: 'Custom 3D Requests', href: '/requests', icon: '✏️' },
      { label: 'Shop Marketplace', href: '/shop', icon: '🛒' },
      { label: '3D Models', href: '/browse', icon: '🧊' },
      { label: 'Support & Tickets', href: '/support-tickets', icon: '💬' },
    ],
  },
  admin: {
    badge: '🛡️ Administrator',
    badgeBg: 'rgba(239, 68, 68, 0.2)',
    badgeColor: '#F87171',
    portalName: 'Admin Hub',
    navs: [
      { label: 'System Overview', href: '/dashboard/admin', icon: '📊' },
      { label: 'User Control', href: '/dashboard/admin#users', icon: '👥' },
      { label: 'Catalog Approvals', href: '/dashboard/admin#approvals', icon: '✅' },
      { label: 'Support Tickets', href: '/dashboard/admin#tickets', icon: '💬' },
      { label: 'Main Website', href: '/', icon: '🌐' },
    ],
  },
}

export default function DashboardSidebar({
  role,
  userEmail,
  userName,
  avatarUrl,
  signOutAction,
}: SidebarProps) {
  const pathname = usePathname()
  const config = ROLE_CONFIGS[role] || ROLE_CONFIGS.designer

  const nameToDisplay = userName || userEmail?.split('@')[0] || 'User'
  const defaultAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(nameToDisplay)}`
  const avatar = avatarUrl || defaultAvatar

  return (
    <aside
      style={{
        width: 260,
        minWidth: 260,
        background: '#0F172A',
        color: '#F8FAFC',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        minHeight: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      {/* Top Header */}
      <div>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 22, fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.5px' }}>
              Print<span style={{ color: '#FF6B35' }}>Hive</span>
            </span>
            <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>{config.portalName}</span>
          </Link>
          <div style={{ marginTop: 10 }}>
            <span
              style={{
                background: config.badgeBg,
                color: config.badgeColor,
                border: `1px solid ${config.badgeColor}40`,
                padding: '4px 10px',
                borderRadius: 99,
                fontSize: 11,
                fontWeight: 800,
                display: 'inline-block',
                letterSpacing: 0.5,
              }}
            >
              {config.badge}
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {config.navs.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 14px',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: isActive ? 800 : 600,
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  background: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                  borderLeft: isActive ? `3px solid ${config.badgeColor}` : '3px solid transparent',
                }}
              >
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Bottom Profile Footer */}
      <div
        style={{
          padding: '16px 20px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img
            src={avatar}
            alt={nameToDisplay}
            style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${config.badgeColor}` }}
          />
          <div style={{ overflow: 'hidden' }}>
            <div style={{ color: '#FFFFFF', fontSize: 13, fontWeight: 800, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {nameToDisplay}
            </div>
            <div style={{ color: '#64748B', fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {userEmail}
            </div>
          </div>
        </div>

        <form action={signOutAction} style={{ width: '100%' }}>
          <button
            type="submit"
            style={{
              width: '100%',
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#EF4444',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 8,
              padding: '8px 12px',
              fontSize: 12,
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              transition: 'background 0.2s',
            }}
          >
            <span>🚪</span> Sign Out
          </button>
        </form>
      </div>
    </aside>
  )
}
