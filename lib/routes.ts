/**
 * PrintHive Centralized Route Architecture
 * Authoritative Single Source of Truth for all canonical and protected routes.
 */

export const ROUTES = {
  home: '/',
  shop: '/shop',
  browse: '/browse',
  models: '/browse',
  printOnDemand: '/print-on-demand',
  print: '/print-on-demand',
  requests: '/requests',
  design: '/requests',
  cart: '/cart',
  checkout: '/checkout',
  orders: '/orders',
  printers: '/printers',
  designers: '/designers',
  community: '/community',
  wishlist: '/wishlist',
  profile: '/profile',

  // Informational & Trust Destinations
  trust: '/trust',
  payments: '/payments',
  faq: '/faq',
  support: '/support',
  terms: '/terms',
  privacy: '/privacy',
  about: '/about',
  contact: '/contact',

  // Authentication Routes
  auth: {
    login: '/login',
    signup: '/signup',
    forgotPassword: '/forgot-password',
    resetPassword: '/reset-password',
    otpVerification: '/otp-verification',
    callback: '/auth/callback',
  },

  // Role-Specific Dashboards
  buyer: {
    dashboard: '/dashboard/buyer',
    orders: '/orders',
    wishlist: '/wishlist',
    requests: '/requests',
  },
  designer: {
    dashboard: '/dashboard/designer',
    upload: '/dashboard/designer/upload',
    earnings: '/dashboard/designer/earnings',
  },
  printer: {
    dashboard: '/dashboard/printer-owner',
    register: '/dashboard/printer-owner/register',
  },
  seller: {
    dashboard: '/dashboard/seller',
    newProduct: '/dashboard/seller/products/new',
  },
  vendor: {
    dashboard: '/dashboard/seller',
    newProduct: '/dashboard/seller/products/new',
  },
  admin: {
    dashboard: '/dashboard/admin',
  },
} as const

export type UserRole = 'buyer' | 'designer' | 'printer_owner' | 'seller' | 'admin' | string

/**
 * Resolves the authoritative dashboard route based on the verified database profile role.
 */
export function resolveRoleDashboard(role?: string | null): string {
  switch (role) {
    case 'designer':
      return ROUTES.designer.dashboard
    case 'printer_owner':
    case 'printer':
      return ROUTES.printer.dashboard
    case 'seller':
    case 'vendor':
      return ROUTES.seller.dashboard
    case 'admin':
      return ROUTES.admin.dashboard
    case 'buyer':
    default:
      return ROUTES.buyer.dashboard
  }
}

/**
 * Returns a human-friendly role badge title for navigation bars.
 */
export function getRoleDisplayName(role?: string | null): string {
  switch (role) {
    case 'designer':
      return '🎨 Creator Studio'
    case 'printer_owner':
    case 'printer':
      return '🖨️ Printer Hub'
    case 'seller':
    case 'vendor':
      return '🏪 Seller Portal'
    case 'admin':
      return '⚡ Admin Console'
    case 'buyer':
    default:
      return '👤 Buyer Dashboard'
  }
}
