'use client'

import React from 'react'
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
  Package,
  ShoppingCart,
  BarChart3,
  FolderKanban,
  Clock,
  Coins,
  Layers,
  Zap,
  CheckCircle2,
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
  extraTag?: React.ReactNode
}

interface QuickLinkItem {
  icon: React.ReactNode
  title: string
  href: string
}

interface RoleCardData {
  id: 'buyer' | 'designer' | 'printer' | 'seller'
  badgeLabel: string
  badgeIcon: React.ReactNode
  themeColor: string
  bgLight: string
  bgSoft: string
  nodeLeftColor: string
  nodeRightColor: string
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
    badgeIcon: <Box size={14} />,
    themeColor: '#ea580c',
    bgLight: 'rgba(234, 88, 12, 0.1)',
    bgSoft: 'rgba(234, 88, 12, 0.04)',
    nodeLeftColor: '#059669',
    nodeRightColor: '#ea580c',
    centerImageUrl: '/images/roles/buyer_visual.png',
    centerAlt: 'Buyer Portal 3D Character',
    leftCallouts: [
      {
        icon: <MapPin size={15} color="#ea580c" />,
        title: '2.4 km Away',
        subtitle: 'Nearest Printer',
        extraTag: (
          <span style={{ fontSize: 9.5, fontWeight: 700, color: '#10b981', background: 'rgba(16, 185, 129, 0.12)', padding: '1px 6px', borderRadius: 99 }}>
            Available
          </span>
        ),
      },
      {
        icon: <Box size={15} color="#ea580c" />,
        title: '3D Preview',
        subtitle: 'Inspect model in real-time',
        extraTag: (
          <span style={{ fontSize: 9.5, fontWeight: 700, color: '#ea580c', background: 'rgba(234, 88, 12, 0.12)', padding: '1px 6px', borderRadius: 99 }}>
            360°
          </span>
        ),
      },
    ],
    rightCallouts: [
      {
        icon: <ShieldCheck size={15} color="#10b981" />,
        title: 'Escrow Protected',
        subtitle: '100% Secure Payments',
      },
      {
        icon: <Truck size={15} color="#ea580c" />,
        title: 'Fast Delivery',
        subtitle: 'Track your order till delivery',
        extraTag: (
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 2 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ea580c' }} />
            <span style={{ width: 14, height: 2, background: '#ea580c' }} />
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ea580c' }} />
            <span style={{ width: 14, height: 2, background: 'rgba(234,88,12,0.3)' }} />
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(234,88,12,0.3)' }} />
          </div>
        ),
      },
    ],
    bottomLinks: [
      { icon: <Box size={13} color="#ea580c" />, title: '3D Preview', href: '/browse' },
      { icon: <MapPin size={13} color="#ea580c" />, title: 'Nearby Printer', href: '/printers' },
      { icon: <ShieldCheck size={13} color="#ea580c" />, title: 'Secure Payment', href: '/browse' },
      { icon: <Truck size={13} color="#ea580c" />, title: 'Order Tracking', href: '/orders' },
    ],
  },

  // 2. CREATOR STUDIO
  {
    id: 'designer',
    badgeLabel: 'CREATOR STUDIO',
    badgeIcon: <PenTool size={14} />,
    themeColor: '#8b5cf6',
    bgLight: 'rgba(139, 92, 246, 0.1)',
    bgSoft: 'rgba(139, 92, 246, 0.04)',
    nodeLeftColor: '#7c3aed',
    nodeRightColor: '#6d28d9',
    centerImageUrl: '/images/roles/creator_visual.png',
    centerAlt: 'Creator Studio 3D Designer',
    leftCallouts: [
      {
        icon: <UploadCloud size={15} color="#8b5cf6" />,
        title: 'Upload Model',
        subtitle: 'STL, 3MF, OBJ and more',
      },
      {
        icon: <MessageSquare size={15} color="#8b5cf6" />,
        title: 'Custom Requests',
        subtitle: 'Get design requests from buyers',
        extraTag: (
          <span style={{ width: 16, height: 16, borderRadius: '50%', background: '#8b5cf6', color: '#fff', fontSize: 10, fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            3
          </span>
        ),
      },
    ],
    rightCallouts: [
      {
        icon: <Gavel size={15} color="#8b5cf6" />,
        title: 'Active Bids',
        subtitle: 'Bid on custom projects',
      },
      {
        icon: <TrendingUp size={15} color="#8b5cf6" />,
        title: 'Earn & Grow',
        subtitle: 'Earn from sales and custom projects',
      },
    ],
    bottomLinks: [
      { icon: <FolderKanban size={13} color="#8b5cf6" />, title: 'My Designs', href: '/dashboard/designer' },
      { icon: <MessageSquare size={13} color="#8b5cf6" />, title: 'Custom Requests', href: '/requests' },
      { icon: <Gavel size={13} color="#8b5cf6" />, title: 'My Bids', href: '/dashboard/designer' },
      { icon: <Clock size={13} color="#8b5cf6" />, title: 'Earnings Overview', href: '/dashboard/designer/earnings' },
    ],
  },

  // 3. PRINTER HUB
  {
    id: 'printer',
    badgeLabel: 'PRINTER HUB',
    badgeIcon: <Printer size={14} />,
    themeColor: '#10b981',
    bgLight: 'rgba(16, 185, 129, 0.1)',
    bgSoft: 'rgba(16, 185, 129, 0.04)',
    nodeLeftColor: '#059669',
    nodeRightColor: '#047857',
    centerImageUrl: '/images/roles/printer_visual.png',
    centerAlt: 'Printer Hub 3D Operator',
    leftCallouts: [
      {
        icon: <MapPin size={15} color="#10b981" />,
        title: 'Printer Location',
        subtitle: 'You are visible to nearby buyers',
        extraTag: (
          <div style={{ width: 44, height: 18, borderRadius: 4, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(16,185,129,0.2)' }}>
            <MapPin size={10} color="#10b981" />
          </div>
        ),
      },
      {
        icon: <Layers size={15} color="#10b981" />,
        title: 'Job Requests',
        subtitle: 'New print jobs near you',
        extraTag: (
          <span style={{ width: 16, height: 16, borderRadius: '50%', background: '#10b981', color: '#fff', fontSize: 10, fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            2
          </span>
        ),
      },
    ],
    rightCallouts: [
      {
        icon: <Zap size={15} color="#10b981" />,
        title: 'Printer Status',
        subtitle: '● Online',
        extraTag: (
          <span style={{ fontSize: 9.5, fontWeight: 700, color: '#10b981', background: 'rgba(16, 185, 129, 0.12)', padding: '1px 6px', borderRadius: 99 }}>
            Available
          </span>
        ),
      },
      {
        icon: <Box size={15} color="#10b981" />,
        title: 'Supported Materials',
        subtitle: 'PLA   PETG   ABS',
        extraTag: (
          <div style={{ display: 'flex', gap: 4, marginTop: 2 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#0284c7' }} />
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#d97706' }} />
          </div>
        ),
      },
    ],
    bottomLinks: [
      { icon: <MapPin size={13} color="#10b981" />, title: 'Nearby Jobs', href: '/printers' },
      { icon: <Printer size={13} color="#10b981" />, title: 'Print Management', href: '/dashboard/printer-owner' },
      { icon: <CheckCircle2 size={13} color="#10b981" />, title: 'Active Orders', href: '/dashboard/printer-owner' },
      { icon: <Coins size={13} color="#10b981" />, title: 'Earnings & Payouts', href: '/dashboard/printer-owner' },
    ],
  },

  // 4. SELLER & STORE
  {
    id: 'seller',
    badgeLabel: 'SELLER & STORE',
    badgeIcon: <Store size={14} />,
    themeColor: '#2563eb',
    bgLight: 'rgba(37, 99, 235, 0.1)',
    bgSoft: 'rgba(37, 99, 235, 0.04)',
    nodeLeftColor: '#1d4ed8',
    nodeRightColor: '#2563eb',
    centerImageUrl: '/images/roles/seller_visual.png',
    centerAlt: 'Seller & Store 3D Merchant',
    leftCallouts: [
      {
        icon: <Package size={15} color="#2563eb" />,
        title: 'List Products',
        subtitle: 'Add 3D printed products to your store',
      },
      {
        icon: <Store size={15} color="#2563eb" />,
        title: 'Store Management',
        subtitle: 'Manage your store and profile',
      },
    ],
    rightCallouts: [
      {
        icon: <ShoppingCart size={15} color="#2563eb" />,
        title: 'Incoming Orders',
        subtitle: 'New order received',
        extraTag: (
          <span style={{ width: 16, height: 16, borderRadius: '50%', background: '#2563eb', color: '#fff', fontSize: 10, fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            1
          </span>
        ),
      },
      {
        icon: <TrendingUp size={15} color="#2563eb" />,
        title: 'Grow Business',
        subtitle: 'Reach more customers',
      },
    ],
    bottomLinks: [
      { icon: <Package size={13} color="#2563eb" />, title: 'Products', href: '/shop' },
      { icon: <ShoppingCart size={13} color="#2563eb" />, title: 'Orders', href: '/dashboard/seller' },
      { icon: <Store size={13} color="#2563eb" />, title: 'Store Management', href: '/dashboard/seller' },
      { icon: <BarChart3 size={13} color="#2563eb" />, title: 'Sales Overview', href: '/dashboard/seller' },
    ],
  },
]

function RoleCard({ role }: { role: RoleCardData }) {
  return (
    <div
      style={{
        background: 'var(--bg-card)',
        borderRadius: 24,
        border: '1px solid var(--border-color)',
        padding: '20px 20px 16px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.03)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 14,
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Top Header: Role Pill Badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            padding: '5px 14px',
            borderRadius: 99,
            background: role.bgLight,
            color: role.themeColor,
            fontSize: 11.5,
            fontWeight: 800,
            letterSpacing: '0.04em',
            border: `1px solid ${role.themeColor}33`,
          }}
        >
          {role.badgeIcon}
          {role.badgeLabel}
        </span>
      </div>

      {/* Main Diagram Area: Left Callouts | Center 3D Character + Sphere | Right Callouts */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(110px, 1fr) auto minmax(110px, 1fr)',
          alignItems: 'center',
          gap: 8,
          position: 'relative',
        }}
      >
        {/* Left Sub-Column Callouts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, zIndex: 3 }}>
          {role.leftCallouts.map((item, idx) => (
            <div
              key={idx}
              style={{
                background: 'var(--bg-card-sub)',
                border: '1px solid var(--border-color)',
                borderRadius: 14,
                padding: '8px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: role.bgLight,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {item.icon}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.2 }}>
                  {item.title}
                </div>
                <div style={{ fontSize: 9.5, color: 'var(--text-sub)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.subtitle}
                </div>
                {item.extraTag && <div style={{ marginTop: 3 }}>{item.extraTag}</div>}
              </div>
            </div>
          ))}
        </div>

        {/* Center Visual + Wireframe Geodesic Sphere */}
        <div
          style={{
            width: 175,
            height: 175,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {/* Wireframe Geodesic Geometric Sphere SVG */}
          <WireframeSphere color={role.themeColor} />

          {/* Left Connector Node Indicator */}
          <div
            style={{
              position: 'absolute',
              left: 4,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 11,
              height: 11,
              borderRadius: '50%',
              background: role.nodeLeftColor,
              border: '2px solid var(--bg-card)',
              boxShadow: `0 0 10px ${role.nodeLeftColor}`,
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
              width: 11,
              height: 11,
              borderRadius: '50%',
              background: role.nodeRightColor,
              border: '2px solid var(--bg-card)',
              boxShadow: `0 0 10px ${role.nodeRightColor}`,
              zIndex: 4,
            }}
          />

          {/* 3D Character Illustration Scene */}
          <img
            src={role.centerImageUrl}
            alt={role.centerAlt}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              position: 'relative',
              zIndex: 2,
              filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.12))',
            }}
          />
        </div>

        {/* Right Sub-Column Callouts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, zIndex: 3 }}>
          {role.rightCallouts.map((item, idx) => (
            <div
              key={idx}
              style={{
                background: 'var(--bg-card-sub)',
                border: '1px solid var(--border-color)',
                borderRadius: 14,
                padding: '8px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: role.bgLight,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {item.icon}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.2 }}>
                  {item.title}
                </div>
                <div style={{ fontSize: 9.5, color: 'var(--text-sub)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.subtitle}
                </div>
                {item.extraTag && <div style={{ marginTop: 3 }}>{item.extraTag}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom 4-Column Capability Bar */}
      <div
        style={{
          background: 'var(--bg-card-sub)',
          border: '1px solid var(--border-color)',
          borderRadius: 14,
          padding: '8px 12px',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 6,
          alignItems: 'center',
        }}
      >
        {role.bottomLinks.map((link, idx) => (
          <Link
            key={idx}
            href={link.href}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
              textDecoration: 'none',
              color: 'inherit',
              padding: '4px',
              borderRadius: 8,
              transition: 'opacity 0.2s ease',
            }}
          >
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: 6,
                background: role.bgLight,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {link.icon}
            </div>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {link.title}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default function RoleEcosystemShowcase() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))',
        gap: 24,
        width: '100%',
        maxWidth: 1200,
        margin: '0 auto',
      }}
    >
      {ROLES_DATA.map((role) => (
        <RoleCard key={role.id} role={role} />
      ))}
    </div>
  )
}
