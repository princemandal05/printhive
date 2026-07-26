import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const DASHBOARD_PATH: Record<string, string> = {
  buyer: '/dashboard/buyer',
  seller: '/dashboard/seller',
  designer: '/dashboard/designer',
  printer_owner: '/dashboard/printer-owner',
  admin: '/dashboard/admin',
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next')

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          },
        },
      }
    )
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Password-reset links carry ?next=/reset-password — send the user
      // straight there to set a new password, skipping the dashboard lookup.
      if (next === '/reset-password') {
        return NextResponse.redirect(`${origin}/reset-password`)
      }

      // Otherwise (e.g. future Google OAuth) route to the correct
      // role-specific dashboard, or to /signup if no role has been set yet.
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        const path = profile?.role ? (DASHBOARD_PATH[profile.role] ?? '/') : '/signup'
        return NextResponse.redirect(`${origin}${path}`)
      }

      return NextResponse.redirect(`${origin}/`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}