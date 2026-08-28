/**
 * PrintHive Centralized Route Architecture
 * Single Source of Truth for all navigational and protected URLs
 */

export const ROUTES = {
  home: '/',
  shop: '/shop',
  models: '/models',
  print: '/print',
  design: '/design',
  cart: '/cart',
  checkout: '/checkout',
  orders: '/orders',
  designers: '/designers',
  wishlist: '/wishlist',

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
    register: '/register',
    forgotPassword: '/forgot-password',
    resetPassword: '/reset-password',
    callback: '/auth/callback',
  },

  // Role-Specific Dashboards
  buyer: {
    dashboard: '/dashboard/buyer',
    orders: '/orders',
    wishlist: '/wishlist',
    requests: '/design',
  },
  designer: {
    dashboard: '/dashboard/designer',
    models: '/dashboard/designer',
    upload: '/design/upload',
  },
  printer: {
    dashboard: '/dashboard/printer',
    jobs: '/dashboard/printer',
    inventory: '/dashboard/printer',
  },
  vendor: {
    dashboard: '/dashboard/vendor',
    products: '/dashboard/vendor',
  },
  admin: {
    dashboard: '/dashboard/admin',
  },
} as const

export type UserRole = 'buyer' | 'designer' | 'printer_owner' | 'seller' | 'admin' | string

/**
 * Resolves the primary dashboard route based on the user's verified database profile role.
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
      return ROUTES.vendor.dashboard
    case 'admin':
      return ROUTES.admin.dashboard
    case 'buyer':
    default:
      return ROUTES.buyer.dashboard
  }
}

/**
 * Returns a human-friendly role badge title for the navigation bar.
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
      return '🏪 Vendor Dashboard'
    case 'admin':
      return '⚡ Admin Console'
    case 'buyer':
    default:
      return '👤 Buyer Dashboard'
  }
}
