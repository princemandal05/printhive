import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Public routes accessible without login
const PUBLIC_ROUTES = [
  '/',
  '/shop',
  '/browse',
  '/printers',
  '/designers',
  '/community',
  '/print-on-demand',
  '/login',
  '/signup',
  '/otp-verification',
  '/forgot-password',
  '/reset-password',
  '/about',
  '/faq',
  '/contact',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow static files, next internals, images, and API routes explicitly
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/auth') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Restrict public access strictly to public detail view pages (/shop/[id], /designs/[id])
  // Keep action/creation flows (/designs/[id]/order, /requests/new, /requests/[id], /support-tickets) protected
  const shopDetailMatch = /^\/shop\/[^\/]+$/.test(pathname)
  const designsDetailMatch = /^\/designs\/[^\/]+$/.test(pathname)
  const isPublicDetail = shopDetailMatch || designsDetailMatch

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname) || isPublicDetail

  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Bypasses login page loop if user is already on /login
  if (pathname === '/login' || pathname === '/signup') {
    return NextResponse.next()
  }

  // Check authentication tokens & role cookies
  const authRole = request.cookies.get('printhive_auth_role')?.value
  const hasSupabaseToken = request.cookies.getAll().some((c) => c.name.includes('auth-token'))

  const isAuthenticated = Boolean(authRole || hasSupabaseToken)

  // Redirect unauthenticated users attempting to access protected routes to /login
  if (!isAuthenticated) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
