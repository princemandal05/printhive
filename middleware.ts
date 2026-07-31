import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Full guest mode enabled: Grant unrestricted access to all pages across PrintHive
export async function middleware(request: NextRequest) {
  return NextResponse.next({ request })
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
