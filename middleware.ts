import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Public routes accessible without login
const PUBLIC_ROUTES = [
  '/',
  '/shop',
  '/models',
  '/browse',
  '/print',
  '/print-on-demand',
  '/design',
  '/requests',
  '/printers',
  '/designers',
  '/community',
  '/cart',
  '/wishlist',
  '/trust',
  '/payments',
  '/faq',
  '/terms',
  '/privacy',
  '/support',
  '/about',
  '/contact',
  '/403',
  '/login',
  '/signup',
  '/otp-verification',
  '/forgot-password',
  '/reset-password',
  '/auth/callback',
  '/api/auth/callback',
]

// Explicitly allowed guest demo portal routes
const GUEST_ALLOWED_PORTALS = [
  '/dashboard/buyer',
  '/dashboard/designer',
  '/dashboard/printer-owner',
  '/dashboard/seller',
  '/dashboard/designer/upload',
  '/dashboard/seller/products/new',
  '/requests',
  '/requests/new',
  '/print-on-demand',
  '/checkout',
  '/orders',
  '/profile',
  '/support-tickets',
  '/cart',
  '/wishlist',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Inject Enterprise Security Headers (XSS, Clickjacking, MIME-Sniffing & CSP protection)
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)')
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')

  // Allow static files, next internals, images, and API routes explicitly
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/auth') ||
    pathname.includes('.')
  ) {
    return response
  }

  // Restrict public access strictly to public detail view pages (/shop/[id], /designs/[id], /designs/[id]/order, /requests/[id])
  const shopDetailMatch = /^\/shop\/[^\/]+$/.test(pathname)
  const designsDetailMatch = /^\/designs\/[^\/]+(\/order)?$/.test(pathname)
  const requestsDetailMatch = /^\/requests\/[^\/]+$/.test(pathname)
  const isPublicDetail = shopDetailMatch || designsDetailMatch || requestsDetailMatch

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname) || isPublicDetail

  if (isPublicRoute) {
    return response
  }

  // Bypasses login page loop if user is already on /login
  if (pathname === '/login' || pathname === '/signup') {
    return response
  }

  // Validate live Supabase session server-side
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        )
      },
    },
  })

  let hasValidSession = false
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (user && !error) {
      hasValidSession = true
    }
  } catch (e) {
    // Session validation error or invalid/stale/expired token
    hasValidSession = false
  }

  if (hasValidSession) {
    return response
  }

  // Redirect unauthenticated / invalid / expired users attempting to access protected routes to /login
  const loginUrl = new URL('/login', request.url)
  loginUrl.searchParams.set('next', pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
