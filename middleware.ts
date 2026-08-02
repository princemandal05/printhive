import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Public routes accessible without login (Home, Shop, Auth & Help pages)
const PUBLIC_ROUTES = [
  '/',
  '/shop',
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

  // Allow static files, next internals, images, and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/auth') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Allow exact public routes and /shop product detail pages (/shop/[id])
  const isPublicRoute =
    PUBLIC_ROUTES.includes(pathname) ||
    pathname.startsWith('/shop/')

  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Check authentication tokens & role cookies
  const authRole = request.cookies.get('printhive_auth_role')?.value
  const guestRole = request.cookies.get('printhive_guest_role')?.value
  const hasSupabaseToken = request.cookies.getAll().some((c) => c.name.includes('auth-token'))

  const isAuthenticated = Boolean(authRole || guestRole || hasSupabaseToken)

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
