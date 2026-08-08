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
      if (next === '/reset-password') {
        return NextResponse.redirect(`${origin}/reset-password`)
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        let { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
        let userRole = profile?.role || 'buyer'

        // Auto-provision profile for first-time Google OAuth sign-in
        if (!profile) {
          const userFullName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User'
          const userAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture || ''
          
          await supabase.from('profiles').insert({
            id: user.id,
            email: user.email,
            full_name: userFullName,
            avatar_url: userAvatar,
            role: 'buyer',
          })
          userRole = 'buyer'
        }

        // Set role cookie
        cookieStore.set('printhive_auth_role', userRole, { maxAge: 604800, path: '/' })

        const targetPath = next || (DASHBOARD_PATH[userRole] ?? '/')
        return NextResponse.redirect(`${origin}${targetPath}`)
      }

      return NextResponse.redirect(`${origin}/`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}