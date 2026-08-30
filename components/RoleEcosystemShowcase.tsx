'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  ShoppingBag,
  PenTool,
  Printer,
  Store,
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
  ShoppingCart,
  BarChart3,
  FolderKanban,
  Clock,
  Activity,
  Coins,
  Cpu,
  Share2,
  Layers,
  Zap,
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
        opacity: 0.8,
        pointerEvents: 'none',
      }}
    >
      <circle cx="120" cy="120" r="96" stroke={color} strokeWidth="1" strokeDasharray="3 3" opacity="0.35" />
      <ellipse cx="120" cy="120" rx="96" ry="42" stroke={color} strokeWidth="1.2" opacity="0.45" />
      <ellipse cx="120" cy="120" rx="42" ry="96" stroke={color} strokeWidth="1.2" opacity="0.45" />
      
      {/* Polygonal Wireframe facets */}
      <polygon points="120,24 188,68 188,172 120,216 52,172 52,68" stroke={color} strokeWidth="1" opacity="0.55" />
      <polygon points="120,48 168,84 168,156 120,192 72,156 72,84" stroke={color} strokeWidth="1" opacity="0.4" />
      <line x1="120" y1="24" x2="120" y2="216" stroke={color} strokeWidth="1" opacity="0.3" />
      <line x1="52" y1="68" x2="188" y2="172" stroke={color} strokeWidth="1" opacity="0.25" />
      <line x1="52" y1="172" x2="188" y2="68" stroke={color} strokeWidth="1" opacity="0.25" />
      
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
}

interface QuickLinkItem {
  icon: React.ReactNode
  title: string
  subtitle: string
  href: string
}

interface RoleConfig {
  id: 'buyer' | 'designer' | 'printer' | 'seller'
  badgeLabel: string
  tabLabel: string
  tabIcon: React.ReactNode
  themeColor: string
  bgLight: string
  bgSoft: string
  nodeLeftColor: string
  nodeRightColor: string
  meshColor: string
  headline: string
  description: string
  primaryBtnText: string
  primaryBtnHref: string
  primaryBtnIcon: React.ReactNode
  secondaryBtnText: string
  secondaryBtnHref: string
  centerImageUrl: string
  centerAlt: string
  leftCallouts: CalloutItem[]
  rightCallouts: CalloutItem[]
  bottomLinks: QuickLinkItem[]
}

const ROLES: RoleConfig[] = [
  // 1. BUYER PORTAL
  {
    id: 'buyer',
    badgeLabel: 'BUYER PORTAL',
    tabLabel: 'Buyer Portal',
    tabIcon: <ShoppingBag size={15} />,
    themeColor: '#ea580c',
    bgLight: 'rgba(234, 88, 12, 0.1)',
    bgSoft: 'rgba(234, 88, 12, 0.04)',
    nodeLeftColor: '#059669',
    nodeRightColor: '#ea580c',
    meshColor: '#38bdf8',
    headline: 'Get Anything 3D Printed Without Owning a Printer',
    description: 'Browse ready-made products, order custom CAD briefs, or upload your own 3D file on our Slicer page. Payments are held safely in Razorpay escrow until delivery.',
    primaryBtnText: 'Browse Designs',
    primaryBtnHref: '/browse',
    primaryBtnIcon: <Box size={15} />,
    secondaryBtnText: 'Slicer & Upload',
    secondaryBtnHref: '/print-on-demand',
    centerImageUrl: '/images/roles/buyer_visual.png',
    centerAlt: 'Buyer Portal 3D Character',
    leftCallouts: [
      {
        icon: <MapPin size={16} color="#ea580c" />,
        title: '2.4 km Away',
        subtitle: 'Nearest Printer Available',
      },
      {
        icon: <Box size={16} color="#ea580c" />,
        title: '3D Preview',
        subtitle: 'Inspect model in real-time 360°',
      },
    ],
    rightCallouts: [
      {
        icon: <ShieldCheck size={16} color="#10b981" />,
        title: 'Escrow Protected',
        subtitle: '100% Secure Payments',
      },
      {
        icon: <Truck size={16} color="#f59e0b" />,
        title: 'Fast Delivery',
        subtitle: 'Track your order till delivery',
      },
    ],
    bottomLinks: [
      {
        icon: <Box size={14} color="#ea580c" />,
        title: '3D Preview',
        subtitle: 'Real-time 360°',
        href: '/browse',
      },
      {
        icon: <MapPin size={14} color="#ea580c" />,
        title: 'Nearby Printer',
        subtitle: 'Geo-Matching',
        href: '/printers',
      },
      {
        icon: <ShieldCheck size={14} color="#ea580c" />,
        title: 'Secure Payment',
        subtitle: 'Escrow Protected',
        href: '/browse',
      },
      {
        icon: <Truck size={14} color="#ea580c" />,
        title: 'Order Tracking',
        subtitle: 'Live Updates',
        href: '/orders',
      },
    ],
  },

  // 2. CREATOR STUDIO
  {
    id: 'designer',
    badgeLabel: 'CREATOR STUDIO',
    tabLabel: 'Creator Studio',
    tabIcon: <PenTool size={15} />,
    themeColor: '#8b5cf6',
    bgLight: 'rgba(139, 92, 246, 0.1)',
    bgSoft: 'rgba(139, 92, 246, 0.04)',
    nodeLeftColor: '#7c3aed',
    nodeRightColor: '#6d28d9',
    meshColor: '#38bdf8',
    headline: 'Monetize Your 3D Models & Earn Automatic Royalties',
    description: 'Upload STL/3MF files once. Every time a buyer orders a physical print, you earn a 15% royalty automatically paid out to your wallet upon delivery.',
    primaryBtnText: 'Upload 3D Model',
    primaryBtnHref: '/dashboard/designer/upload',
    primaryBtnIcon: <UploadCloud size={15} />,
    secondaryBtnText: 'Designer Dashboard',
    secondaryBtnHref: '/dashboard/designer',
    centerImageUrl: '/images/roles/creator_visual.png',
    centerAlt: 'Creator Studio 3D Designer',
    leftCallouts: [
      {
        icon: <UploadCloud size={16} color="#8b5cf6" />,
        title: 'Upload Model',
        subtitle: 'STL, 3MF, OBJ and more',
      },
      {
        icon: <MessageSquare size={16} color="#8b5cf6" />,
        title: 'Custom Requests',
        subtitle: 'Get design requests from buyers',
      },
    ],
    rightCallouts: [
      {
        icon: <Gavel size={16} color="#8b5cf6" />,
        title: 'Active Bids',
        subtitle: 'Bid on custom projects',
      },
      {
        icon: <TrendingUp size={16} color="#8b5cf6" />,
        title: 'Earn & Grow',
        subtitle: 'Earn from sales and custom projects',
      },
    ],
    bottomLinks: [
      {
        icon: <FolderKanban size={14} color="#8b5cf6" />,
        title: 'My Designs',
        subtitle: 'Manage Catalog',
        href: '/dashboard/designer',
      },
      {
        icon: <MessageSquare size={14} color="#8b5cf6" />,
        title: 'Custom Requests',
        subtitle: 'Client Briefs',
        href: '/requests',
      },
      {
        icon: <Gavel size={14} color="#8b5cf6" />,
        title: 'My Bids',
        subtitle: 'Project Proposals',
        href: '/dashboard/designer',
      },
      {
        icon: <Clock size={14} color="#8b5cf6" />,
        title: 'Earnings Overview',
        subtitle: 'Royalties & Payouts',
        href: '/dashboard/designer/earnings',
      },
    ],
  },

  // 3. PRINTER HUB
  {
    id: 'printer',
    badgeLabel: 'PRINTER HUB',
    tabLabel: 'Printer Hub',
    tabIcon: <Printer size={15} />,
    themeColor: '#10b981',
    bgLight: 'rgba(16, 185, 129, 0.1)',
    bgSoft: 'rgba(16, 185, 129, 0.04)',
    nodeLeftColor: '#059669',
    nodeRightColor: '#047857',
    meshColor: '#34d399',
    headline: 'Turn Idle Printer Hours Into High-Margin Income',
    description: 'List your Bambu Lab, Prusa, or Resin machines. Accept nearby orders matched via Leaflet GPS, print, deliver, and earn 70% per job.',
    primaryBtnText: 'View Printer Hubs Map',
    primaryBtnHref: '/printers',
    primaryBtnIcon: <MapPin size={15} />,
    secondaryBtnText: 'Printer Dashboard',
    secondaryBtnHref: '/dashboard/printer-owner',
    centerImageUrl: '/images/roles/printer_visual.png',
    centerAlt: 'Printer Hub 3D Operator',
    leftCallouts: [
      {
        icon: <MapPin size={16} color="#10b981" />,
        title: 'Printer Location',
        subtitle: 'You are visible to nearby buyers',
      },
      {
        icon: <Layers size={16} color="#10b981" />,
        title: 'Job Requests',
        subtitle: 'New print jobs near you',
      },
    ],
    rightCallouts: [
      {
        icon: <Zap size={16} color="#10b981" />,
        title: 'Printer Status',
        subtitle: 'Online Available',
      },
      {
        icon: <Box size={16} color="#10b981" />,
        title: 'Supported Materials',
        subtitle: 'PLA, PETG, ABS spools',
      },
    ],
    bottomLinks: [
      {
        icon: <MapPin size={14} color="#10b981" />,
        title: 'Nearby Jobs',
        subtitle: 'Local Matching',
        href: '/printers',
      },
      {
        icon: <Printer size={14} color="#10b981" />,
        title: 'Print Management',
        subtitle: 'Active Queues',
        href: '/dashboard/printer-owner',
      },
      {
        icon: <CheckCircle2 size={14} color="#10b981" />,
        title: 'Active Orders',
        subtitle: 'Job Tracking',
        href: '/dashboard/printer-owner',
      },
      {
        icon: <Coins size={14} color="#10b981" />,
        title: 'Earnings & Payouts',
        subtitle: 'Direct Withdrawals',
        href: '/dashboard/printer-owner',
      },
    ],
  },

  // 4. SELLER & STORE
  {
    id: 'seller',
    badgeLabel: 'SELLER & STORE',
    tabLabel: 'Seller & Store',
    tabIcon: <Store size={15} />,
    themeColor: '#2563eb',
    bgLight: 'rgba(37, 99, 235, 0.1)',
    bgSoft: 'rgba(37, 99, 235, 0.04)',
    nodeLeftColor: '#1d4ed8',
    nodeRightColor: '#2563eb',
    meshColor: '#38bdf8',
    headline: 'Sell Finished 3D Goods, Filaments & Hardware',
    description: 'Open your digital storefront to sell ready-made 3D printed products, PLA/PETG/ABS spools, UV resins, and printer accessories directly to India\'s maker community.',
    primaryBtnText: 'Explore Marketplace Store',
    primaryBtnHref: '/shop',
    primaryBtnIcon: <Store size={15} />,
    secondaryBtnText: 'Seller Dashboard',
    secondaryBtnHref: '/dashboard/seller',
    centerImageUrl: '/images/roles/seller_visual.png',
    centerAlt: 'Seller & Store 3D Merchant',
    leftCallouts: [
      {
        icon: <Package size={16} color="#2563eb" />,
        title: 'List Products',
        subtitle: 'Add 3D printed products to store',
      },
      {
        icon: <Store size={16} color="#2563eb" />,
        title: 'Store Management',
        subtitle: 'Manage your store and profile',
      },
    ],
    rightCallouts: [
      {
        icon: <ShoppingCart size={16} color="#2563eb" />,
        title: 'Incoming Orders',
        subtitle: 'New order received',
      },
      {
        icon: <TrendingUp size={16} color="#2563eb" />,
        title: 'Grow Business',
        subtitle: 'Reach more customers',
      },
    ],
    bottomLinks: [
      {
        icon: <Package size={14} color="#2563eb" />,
        title: 'Products',
        subtitle: 'Inventory Catalog',
        href: '/shop',
      },
      {
        icon: <ShoppingCart size={14} color="#2563eb" />,
        title: 'Orders',
        subtitle: 'Customer Orders',
        href: '/dashboard/seller',
      },
      {
        icon: <Store size={14} color="#2563eb" />,
        title: 'Store Management',
        subtitle: 'Profile & Settings',
        href: '/dashboard/seller',
      },
      {
        icon: <BarChart3 size={14} color="#2563eb" />,
        title: 'Sales Overview',
        subtitle: 'Analytics & Revenue',
        href: '/dashboard/seller',
      },
    ],
  },
]

export default function RoleEcosystemShowcase() {
  const [activeTab, setActiveTab] = useState<'buyer' | 'designer' | 'printer' | 'seller'>('buyer')
  const currentRole = ROLES.find((r) => r.id === activeTab) || ROLES[0]

  return (
    <div style={{ width: '100%', maxWidth: 1200, margin: '0 auto' }}>
      {/* 1. Top Pill Tab Switcher */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
        <div
          style={{
            display: 'inline-flex',
            gap: 6,
            background: 'var(--bg-card, #ffffff)',
            padding: '6px 8px',
            borderRadius: 99,
            border: '1px solid var(--border-color, rgba(0,0,0,0.08))',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {ROLES.map((role) => {
            const isActive = activeTab === role.id
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => setActiveTab(role.id)}
                style={{
                  padding: '10px 22px',
                  borderRadius: 99,
                  border: 'none',
                  background: isActive ? role.themeColor : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--text-main, #0f172a)',
                  fontWeight: isActive ? 800 : 600,
                  fontSize: 13.5,
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: isActive ? `0 4px 14px ${role.themeColor}40` : 'none',
                }}
              >
                {role.tabIcon}
                <span>{role.tabLabel}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 2. Main Role Card: Left Content + Right 3D Diagram */}
      <div className="role-showcase-card">
        {/* Main Grid: Left Details | Right 3D Interactive Diagram */}
        <div className="role-showcase-main-grid">
          {/* Left Column: Heading, Description, Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ marginBottom: 12 }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 12px',
                  borderRadius: 99,
                  background: currentRole.bgLight,
                  color: currentRole.themeColor,
                  fontSize: 11.5,
                  fontWeight: 800,
                  letterSpacing: '0.03em',
                  border: `1px solid ${currentRole.themeColor}33`,
                }}
              >
                <Box size={13} color={currentRole.themeColor} />
                {currentRole.badgeLabel}
              </span>
            </div>

            <h3
              style={{
                fontSize: 26,
                fontWeight: 800,
                color: 'var(--text-main)',
                lineHeight: 1.25,
                marginBottom: 14,
              }}
            >
              {currentRole.headline}
            </h3>

            <p
              style={{
                color: 'var(--text-sub)',
                fontSize: 14,
                lineHeight: 1.7,
                marginBottom: 24,
              }}
            >
              {currentRole.description}
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link
                href={currentRole.primaryBtnHref}
                style={{
                  background: currentRole.themeColor,
                  color: '#ffffff',
                  padding: '12px 22px',
                  borderRadius: 99,
                  fontWeight: 700,
                  fontSize: 13.5,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: `0 4px 14px ${currentRole.themeColor}33`,
                }}
              >
                {currentRole.primaryBtnIcon}
                <span>{currentRole.primaryBtnText}</span>
              </Link>
              <Link
                href={currentRole.secondaryBtnHref}
                style={{
                  background: 'transparent',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-color)',
                  padding: '12px 20px',
                  borderRadius: 99,
                  fontWeight: 600,
                  fontSize: 13.5,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span>{currentRole.secondaryBtnText}</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Interactive 3D Diagram with Left Callouts, Wireframe Sphere, and Right Callouts */}
          <div className="role-showcase-viewer-grid">
            {/* Left Sub-Column Callouts */}
            <div className="role-showcase-callouts-col">
              {currentRole.leftCallouts.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 14,
                    padding: '10px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 9,
                      background: currentRole.bgLight,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {item.icon}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.2 }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-sub)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.subtitle}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Center Live Visual Scene Viewport */}
            <div
              style={{
                width: 220,
                height: 220,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {/* Wireframe Geodesic Geometric Sphere SVG */}
              <WireframeSphere color={currentRole.themeColor} />

              {/* Left Connector Node Indicator */}
              <div
                style={{
                  position: 'absolute',
                  left: 4,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  background: currentRole.nodeLeftColor,
                  border: '2.5px solid var(--bg-card)',
                  boxShadow: `0 0 12px ${currentRole.nodeLeftColor}`,
                  zIndex: 4,
                }}
              />

              {/* Right Connector Node Indicator */}
              <div
                style={{
                  position: 'absolute',
                  right: 4,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  background: currentRole.nodeRightColor,
                  border: '2.5px solid var(--bg-card)',
                  boxShadow: `0 0 12px ${currentRole.nodeRightColor}`,
                  zIndex: 4,
                }}
              />

              {/* 3D Character Illustration Scene */}
              <img
                src={currentRole.centerImageUrl}
                alt={currentRole.centerAlt}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  position: 'relative',
                  zIndex: 2,
                  filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.12))',
                }}
              />
            </div>

            {/* Right Sub-Column Callouts */}
            <div className="role-showcase-callouts-col">
              {currentRole.rightCallouts.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 14,
                    padding: '10px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 9,
                      background: currentRole.bgLight,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {item.icon}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.2 }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-sub)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.subtitle}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom 4-Column Capability Bar */}
        <div
          style={{
            background: 'var(--bg-card-sub)',
            border: '1px solid var(--border-color)',
            borderRadius: 16,
            padding: '12px 18px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 12,
            alignItems: 'center',
          }}
        >
          {currentRole.bottomLinks.map((link, idx) => (
            <Link
              key={idx}
              href={link.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 9,
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: currentRole.bgLight,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {link.icon}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {link.title}
                </div>
                <div style={{ fontSize: 10, color: currentRole.themeColor, fontWeight: 700, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {link.subtitle}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

