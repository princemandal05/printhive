'use client'

import React from 'react'
import Link from 'next/link'
import {
  Box,
  MapPin,
  ShieldCheck,
  Truck,
  UploadCloud,
  MessageSquare,
  Gavel,
  TrendingUp,
  Settings,
  CheckCircle2,
  Package,
  Store,
  ShoppingCart,
  BarChart3,
  FolderKanban,
  Clock,
  Activity,
  Coins,
  Cpu,
  Share2,
  Layers,
} from 'lucide-react'

// Wireframe Geodesic Geometric Sphere SVG
function WireframeSphere({ color }: { color: string }) {
  return (
    <svg
      viewBox="0 0 240 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
        opacity: 0.75,
        pointerEvents: 'none',
      }}
    >
      <circle cx="120" cy="120" r="96" stroke={color} strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
      <ellipse cx="120" cy="120" rx="96" ry="42" stroke={color} strokeWidth="1.2" opacity="0.5" />
      <ellipse cx="120" cy="120" rx="42" ry="96" stroke={color} strokeWidth="1.2" opacity="0.5" />
      
      {/* Polygonal Wireframe facets */}
      <polygon points="120,24 188,68 188,172 120,216 52,172 52,68" stroke={color} strokeWidth="1" opacity="0.6" />
      <polygon points="120,48 168,84 168,156 120,192 72,156 72,84" stroke={color} strokeWidth="1" opacity="0.45" />
      <line x1="120" y1="24" x2="120" y2="216" stroke={color} strokeWidth="1" opacity="0.35" />
      <line x1="52" y1="68" x2="188" y2="172" stroke={color} strokeWidth="1" opacity="0.3" />
      <line x1="52" y1="172" x2="188" y2="68" stroke={color} strokeWidth="1" opacity="0.3" />
      
      {/* Node Vertices */}
      <circle cx="52" cy="68" r="3.5" fill={color} opacity="0.8" />
      <circle cx="188" cy="68" r="3.5" fill={color} opacity="0.8" />
      <circle cx="188" cy="172" r="3.5" fill={color} opacity="0.8" />
      <circle cx="52" cy="172" r="3.5" fill={color} opacity="0.8" />
      <circle cx="120" cy="24" r="3.5" fill={color} opacity="0.8" />
      <circle cx="120" cy="216" r="3.5" fill={color} opacity="0.8" />
    </svg>
  )
}

interface CalloutItem {
  icon: React.ReactNode
  title: string
  subtitle: string
  color: string
}

interface QuickLinkItem {
  icon: React.ReactNode
  title: string
  subtitle: string
  href: string
  color: string
}

interface RoleCardData {
  id: string
  badgeLabel: string
  themeColor: string
  bgLight: string
  bgSoft: string
  nodeLeftColor: string
  nodeRightColor: string
  meshColor: string
  centerImageUrl: string
  centerAlt: string
  leftCallouts: CalloutItem[]
  rightCallouts: CalloutItem[]
  bottomLinks: QuickLinkItem[]
}

const ROLES_DATA: RoleCardData[] = [
  // 1. BUYER PORTAL
  {
    id: 'buyer',
    badgeLabel: 'BUYER PORTAL',
    themeColor: '#ea580c',
    bgLight: 'rgba(234, 88, 12, 0.08)',
    bgSoft: 'rgba(234, 88, 12, 0.04)',
    nodeLeftColor: '#059669',
    nodeRightColor: '#ea580c',
    meshColor: '#38bdf8',
    centerImageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=500&q=80',
    centerAlt: 'Modern 3D Printed Armchair Prototype',
    leftCallouts: [
      {
        icon: <MapPin size={18} color="#ea580c" />,
        title: '2.4 km Away',
        subtitle: 'Nearest Printer Available',
        color: '#ea580c',
      },
      {
        icon: <Box size={18} color="#ea580c" />,
        title: '3D Preview',
        subtitle: 'Inspect model in real-time',
        color: '#ea580c',
      },
    ],
    rightCallouts: [
      {
        icon: <ShieldCheck size={18} color="#10b981" />,
        title: 'Escrow Protected',
        subtitle: '100% secure payments',
        color: '#10b981',
      },
      {
        icon: <Truck size={18} color="#f59e0b" />,
        title: 'Fast Delivery',
        subtitle: 'Track your order till delivery',
        color: '#f59e0b',
      },
    ],
    bottomLinks: [
      {
        icon: <Box size={15} color="#ea580c" />,
        title: '3D WebGL',
        subtitle: 'Inspection',
        href: '/browse',
        color: '#ea580c',
      },
      {
        icon: <MapPin size={15} color="#ea580c" />,
        title: 'Nearby Printer',
        subtitle: 'Matching',
        href: '/printers',
        color: '#ea580c',
      },
      {
        icon: <ShieldCheck size={15} color="#ea580c" />,
        title: 'Secure Payment',
        subtitle: '(Escrow)',
        href: '/browse',
        color: '#ea580c',
      },
      {
        icon: <Share2 size={15} color="#ea580c" />,
        title: 'Order Tracking',
        subtitle: 'Real-time',
        href: '/orders',
        color: '#ea580c',
      },
    ],
  },

  // 2. CREATOR STUDIO
  {
    id: 'designer',
    badgeLabel: 'CREATOR STUDIO',
    themeColor: '#8b5cf6',
    bgLight: 'rgba(139, 92, 246, 0.08)',
    bgSoft: 'rgba(139, 92, 246, 0.04)',
    nodeLeftColor: '#7c3aed',
    nodeRightColor: '#6d28d9',
    meshColor: '#38bdf8',
    centerImageUrl: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=500&q=80',
    centerAlt: 'Parametric Spiral 3D Model Vase',
    leftCallouts: [
      {
        icon: <UploadCloud size={18} color="#8b5cf6" />,
        title: 'Upload & Showcase',
        subtitle: 'Upload your 3D models',
        color: '#8b5cf6',
      },
      {
        icon: <MessageSquare size={18} color="#8b5cf6" />,
        title: 'Custom Requests',
        subtitle: 'Get design requests from buyers',
        color: '#8b5cf6',
      },
    ],
    rightCallouts: [
      {
        icon: <Gavel size={18} color="#8b5cf6" />,
        title: 'Submit Bids',
        subtitle: 'Bid on custom projects',
        color: '#8b5cf6',
      },
      {
        icon: <TrendingUp size={18} color="#8b5cf6" />,
        title: 'Earn & Grow',
        subtitle: 'Earn from sales and projects',
        color: '#8b5cf6',
      },
    ],
    bottomLinks: [
      {
        icon: <FolderKanban size={15} color="#8b5cf6" />,
        title: 'My Designs',
        subtitle: 'Manage',
        href: '/dashboard/designer',
        color: '#8b5cf6',
      },
      {
        icon: <MessageSquare size={15} color="#8b5cf6" />,
        title: 'Custom Requests',
        subtitle: 'Dashboard',
        href: '/requests',
        color: '#8b5cf6',
      },
      {
        icon: <Activity size={15} color="#8b5cf6" />,
        title: 'My Bids',
        subtitle: 'Active',
        href: '/dashboard/designer',
        color: '#8b5cf6',
      },
      {
        icon: <Clock size={15} color="#8b5cf6" />,
        title: 'Earnings',
        subtitle: 'Overview',
        href: '/dashboard/designer/earnings',
        color: '#8b5cf6',
      },
    ],
  },

  // 3. PRINTER HUB
  {
    id: 'printer',
    badgeLabel: 'PRINTER HUB',
    themeColor: '#10b981',
    bgLight: 'rgba(16, 185, 129, 0.08)',
    bgSoft: 'rgba(16, 185, 129, 0.04)',
    nodeLeftColor: '#059669',
    nodeRightColor: '#047857',
    meshColor: '#34d399',
    centerImageUrl: 'https://images.unsplash.com/photo-1631541909061-71e349d1f203?auto=format&fit=crop&w=500&q=80',
    centerAlt: 'Dual-Color Precision 3D Printer Hub Unit',
    leftCallouts: [
      {
        icon: <MapPin size={18} color="#10b981" />,
        title: 'Printer Location',
        subtitle: 'You are visible to nearby buyers',
        color: '#10b981',
      },
      {
        icon: <Layers size={18} color="#10b981" />,
        title: 'Job Requests',
        subtitle: 'New print jobs near you',
        color: '#10b981',
      },
    ],
    rightCallouts: [
      {
        icon: <Settings size={18} color="#10b981" />,
        title: 'Your Printers',
        subtitle: 'Manage printers & materials',
        color: '#10b981',
      },
      {
        icon: <CheckCircle2 size={18} color="#10b981" />,
        title: 'Earn & Withdraw',
        subtitle: 'Get paid for completed jobs',
        color: '#10b981',
      },
    ],
    bottomLinks: [
      {
        icon: <Package size={15} color="#10b981" />,
        title: 'Nearby Jobs',
        subtitle: 'Matching',
        href: '/printers',
        color: '#10b981',
      },
      {
        icon: <Cpu size={15} color="#10b981" />,
        title: 'Print Management',
        subtitle: 'Dashboard',
        href: '/dashboard/printer-owner',
        color: '#10b981',
      },
      {
        icon: <Share2 size={15} color="#10b981" />,
        title: 'Active Orders',
        subtitle: 'In Progress',
        href: '/dashboard/printer-owner',
        color: '#10b981',
      },
      {
        icon: <Coins size={15} color="#10b981" />,
        title: 'Earnings',
        subtitle: '& Payouts',
        href: '/dashboard/printer-owner',
        color: '#10b981',
      },
    ],
  },

  // 4. SELLER & STORE
  {
    id: 'seller',
    badgeLabel: 'SELLER & STORE',
    themeColor: '#2563eb',
    bgLight: 'rgba(37, 99, 235, 0.08)',
    bgSoft: 'rgba(37, 99, 235, 0.04)',
    nodeLeftColor: '#1d4ed8',
    nodeRightColor: '#2563eb',
    meshColor: '#38bdf8',
    centerImageUrl: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=500&q=80',
    centerAlt: 'Voronoi Blue Honeycomb 3D Printed Vessel',
    leftCallouts: [
      {
        icon: <Package size={18} color="#2563eb" />,
        title: 'List Products',
        subtitle: 'Add 3D printed products',
        color: '#2563eb',
      },
      {
        icon: <Store size={18} color="#2563eb" />,
        title: 'Store Management',
        subtitle: 'Manage your store and profile',
        color: '#2563eb',
      },
    ],
    rightCallouts: [
      {
        icon: <ShoppingCart size={18} color="#2563eb" />,
        title: 'Incoming Orders',
        subtitle: 'Manage orders easily',
        color: '#2563eb',
      },
      {
        icon: <BarChart3 size={18} color="#2563eb" />,
        title: 'Grow Business',
        subtitle: 'Reach more customers',
        color: '#2563eb',
      },
    ],
    bottomLinks: [
      {
        icon: <Package size={15} color="#2563eb" />,
        title: 'Products',
        subtitle: 'Manage',
        href: '/shop',
        color: '#2563eb',
      },
      {
        icon: <ShoppingCart size={15} color="#2563eb" />,
        title: 'Orders',
        subtitle: 'Manage',
        href: '/dashboard/seller',
        color: '#2563eb',
      },
      {
        icon: <BarChart3 size={15} color="#2563eb" />,
        title: 'Store Analytics',
        subtitle: 'Overview',
        href: '/dashboard/seller',
        color: '#2563eb',
      },
      {
        icon: <TrendingUp size={15} color="#2563eb" />,
        title: 'Sales',
        subtitle: 'Overview',
        href: '/dashboard/seller',
        color: '#2563eb',
      },
    ],
  },
]

export default function RoleEcosystemShowcase() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: 28, width: '100%' }}>
      {ROLES_DATA.map((role) => (
        <div
          key={role.id}
          style={{
            background: 'var(--bg-card, #ffffff)',
            borderRadius: 26,
            border: '1px solid var(--border-color, rgba(0,0,0,0.08))',
            padding: '24px 24px 20px',
            boxShadow: '0 10px 36px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden',
            transition: 'transform 0.25s ease, box-shadow 0.25s ease',
          }}
        >
          {/* Top Pill Badge */}
          <div style={{ marginBottom: 20 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 14px',
                borderRadius: 99,
                background: role.bgLight,
                color: role.themeColor,
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: '0.04em',
                border: `1px solid ${role.themeColor}33`,
              }}
            >
              <Box size={14} color={role.themeColor} />
              {role.badgeLabel}
            </span>
          </div>

          {/* Central Interactive Diagram Area */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto 1fr',
              alignItems: 'center',
              gap: 14,
              position: 'relative',
              minHeight: 220,
              marginBottom: 20,
            }}
          >
            {/* Left Column Callout Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, zIndex: 3 }}>
              {role.leftCallouts.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'var(--bg-card-sub, #f8fafc)',
                    border: '1px solid var(--border-color, rgba(0,0,0,0.06))',
                    borderRadius: 14,
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 10,
                      background: 'var(--bg-card, #ffffff)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                    }}
                  >
                    {item.icon}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--text-main, #0f172a)', lineHeight: 1.2 }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: 10.5, color: 'var(--text-sub, #64748b)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.subtitle}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Center 3D Object within Wireframe Geodesic Sphere & Nodes */}
            <div
              style={{
                width: 170,
                height: 170,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {/* Wireframe Mesh */}
              <WireframeSphere color={role.meshColor} />

              {/* Left Connector Node */}
              <div
                style={{
                  position: 'absolute',
                  left: -6,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  background: role.nodeLeftColor,
                  border: '3px solid #ffffff',
                  boxShadow: `0 0 10px ${role.nodeLeftColor}`,
                  zIndex: 4,
                }}
              />

              {/* Right Connector Node */}
              <div
                style={{
                  position: 'absolute',
                  right: -6,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  background: role.nodeRightColor,
                  border: '3px solid #ffffff',
                  boxShadow: `0 0 10px ${role.nodeRightColor}`,
                  zIndex: 4,
                }}
              />

              {/* Center 3D Product Image */}
              <img
                src={role.centerImageUrl}
                alt={role.centerAlt}
                style={{
                  width: 110,
                  height: 110,
                  objectFit: 'cover',
                  borderRadius: 16,
                  boxShadow: '0 12px 28px rgba(0,0,0,0.18)',
                  zIndex: 2,
                  filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.15))',
                }}
              />
            </div>

            {/* Right Column Callout Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, zIndex: 3 }}>
              {role.rightCallouts.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'var(--bg-card-sub, #f8fafc)',
                    border: '1px solid var(--border-color, rgba(0,0,0,0.06))',
                    borderRadius: 14,
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 10,
                      background: 'var(--bg-card, #ffffff)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                    }}
                  >
                    {item.icon}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--text-main, #0f172a)', lineHeight: 1.2 }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: 10.5, color: 'var(--text-sub, #64748b)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.subtitle}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Action / Capabilities Bar */}
          <div
            style={{
              background: role.bgSoft,
              border: `1px solid ${role.themeColor}22`,
              borderRadius: 16,
              padding: '12px 14px',
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 8,
              alignItems: 'center',
              marginTop: 'auto',
            }}
          >
            {role.bottomLinks.map((link, idx) => (
              <Link
                key={idx}
                href={link.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 8,
                    background: role.bgLight,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {link.icon}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-main, #0f172a)', lineHeight: 1.15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {link.title}
                  </div>
                  <div style={{ fontSize: 9.5, color: role.themeColor, fontWeight: 700, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {link.subtitle}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
