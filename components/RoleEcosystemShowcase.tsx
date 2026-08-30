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
  Package,
  ShoppingCart,
  BarChart3,
  FolderKanban,
  Clock,
  Coins,
  CheckCircle2,
} from 'lucide-react'

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
  headline: string
  description: string
  primaryBtnText: string
  primaryBtnHref: string
  primaryBtnIcon: React.ReactNode
  secondaryBtnText: string
  secondaryBtnHref: string
  cardImageUrl: string
  cardAlt: string
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
    bgLight: 'rgba(234, 88, 12, 0.12)',
    bgSoft: 'rgba(234, 88, 12, 0.04)',
    headline: 'Get Anything 3D Printed Without Owning a Printer',
    description: 'Browse ready-made products, order custom CAD briefs, or upload your own 3D file on our Slicer page. Payments are held safely in Razorpay escrow until delivery.',
    primaryBtnText: 'Browse Designs',
    primaryBtnHref: '/browse',
    primaryBtnIcon: <Box size={15} />,
    secondaryBtnText: 'Slicer & Upload',
    secondaryBtnHref: '/print-on-demand',
    cardImageUrl: '/images/roles/buyer_card_full.png',
    cardAlt: 'Buyer Portal 3D Ecosystem Card',
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
    bgLight: 'rgba(139, 92, 246, 0.12)',
    bgSoft: 'rgba(139, 92, 246, 0.04)',
    headline: 'Monetize Your 3D Models & Earn Automatic Royalties',
    description: 'Upload STL/3MF files once. Every time a buyer orders a physical print, you earn a 15% royalty automatically paid out to your wallet upon delivery.',
    primaryBtnText: 'Upload 3D Model',
    primaryBtnHref: '/dashboard/designer/upload',
    primaryBtnIcon: <UploadCloud size={15} />,
    secondaryBtnText: 'Designer Dashboard',
    secondaryBtnHref: '/dashboard/designer',
    cardImageUrl: '/images/roles/creator_card_full.png',
    cardAlt: 'Creator Studio 3D Designer Card',
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
    bgLight: 'rgba(16, 185, 129, 0.12)',
    bgSoft: 'rgba(16, 185, 129, 0.04)',
    headline: 'Turn Idle Printer Hours Into High-Margin Income',
    description: 'List your Bambu Lab, Prusa, or Resin machines. Accept nearby orders matched via Leaflet GPS, print, deliver, and earn 70% per job.',
    primaryBtnText: 'View Printer Hubs Map',
    primaryBtnHref: '/printers',
    primaryBtnIcon: <MapPin size={15} />,
    secondaryBtnText: 'Printer Dashboard',
    secondaryBtnHref: '/dashboard/printer-owner',
    cardImageUrl: '/images/roles/printer_card_full.png',
    cardAlt: 'Printer Hub 3D Operator Card',
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
    bgLight: 'rgba(37, 99, 235, 0.12)',
    bgSoft: 'rgba(37, 99, 235, 0.04)',
    headline: 'Sell Finished 3D Goods, Filaments & Hardware',
    description: 'Open your digital storefront to sell ready-made 3D printed products, PLA/PETG/ABS spools, UV resins, and printer accessories directly to India\'s maker community.',
    primaryBtnText: 'Explore Marketplace Store',
    primaryBtnHref: '/shop',
    primaryBtnIcon: <Store size={15} />,
    secondaryBtnText: 'Seller Dashboard',
    secondaryBtnHref: '/dashboard/seller',
    cardImageUrl: '/images/roles/seller_card_full.png',
    cardAlt: 'Seller & Store 3D Merchant Card',
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
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
        <div
          style={{
            display: 'inline-flex',
            gap: 8,
            background: 'var(--bg-card)',
            padding: '6px 8px',
            borderRadius: 99,
            border: '1px solid var(--border-color)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
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
                  color: isActive ? '#ffffff' : 'var(--text-main)',
                  fontWeight: isActive ? 800 : 600,
                  fontSize: 13.5,
                  cursor: 'pointer',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
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

      {/* 2. Main Role Card: Left Details & CTAs + Right Card Visual Image */}
      <div className="role-showcase-card">
        {/* Main Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(300px, 1fr) minmax(380px, 1.2fr)',
            gap: 36,
            alignItems: 'center',
            marginBottom: 32,
          }}
        >
          {/* Left Column: Heading, Description, Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ marginBottom: 12 }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '5px 14px',
                  borderRadius: 99,
                  background: currentRole.bgLight,
                  color: currentRole.themeColor,
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  border: `1px solid ${currentRole.themeColor}33`,
                }}
              >
                <Box size={13} color={currentRole.themeColor} />
                {currentRole.badgeLabel}
              </span>
            </div>

            <h3
              style={{
                fontSize: 28,
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
                fontSize: 14.5,
                lineHeight: 1.7,
                marginBottom: 26,
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
                  padding: '12px 24px',
                  borderRadius: 99,
                  fontWeight: 700,
                  fontSize: 13.5,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: `0 4px 14px ${currentRole.themeColor}33`,
                  transition: 'opacity 0.2s ease',
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
                  transition: 'background 0.2s ease',
                }}
              >
                <span>{currentRole.secondaryBtnText}</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Full Crisp High-Resolution Role Card Graphic */}
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 22,
              overflow: 'hidden',
              border: '1px solid var(--border-color)',
              boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
              background: 'var(--bg-card-sub)',
              padding: 0,
            }}
          >
            <img
              src={currentRole.cardImageUrl}
              alt={currentRole.cardAlt}
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
                borderRadius: 20,
                objectFit: 'contain',
              }}
            />
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
