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
        const signupRoleParam = searchParams.get('signup_role')
        const cookieSignupRole = cookieStore.get('printhive_signup_role')?.value
        const requestedRole = signupRoleParam || cookieSignupRole
        const validRequestedRole = (requestedRole && ['seller', 'designer', 'printer_owner', 'buyer'].includes(requestedRole))
          ? requestedRole
          : null

        let { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
        let userRole = profile?.role || user.user_metadata?.role || validRequestedRole || 'buyer'

        if (validRequestedRole && (!profile || profile.role === 'buyer')) {
          userRole = validRequestedRole
          const userFullName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User'
          const userAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture || ''

          try {
            const { createAdminClient } = await import('@/utils/supabase/server')
            const adminSupabase = await createAdminClient()
            await adminSupabase.auth.admin.updateUserById(user.id, {
              user_metadata: { role: validRequestedRole, full_name: userFullName }
            })
            await adminSupabase.from('profiles').upsert({
              id: user.id,
              email: user.email,
              full_name: userFullName,
              avatar_url: userAvatar,
              role: validRequestedRole,
            }, { onConflict: 'id' })
          } catch (e) {
            console.error('Failed to update Google OAuth signup role:', e)
          }
        } else if (!profile) {
          const userFullName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User'
          const userAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture || ''
          await supabase.from('profiles').insert({
            id: user.id,
            email: user.email,
            full_name: userFullName,
            avatar_url: userAvatar,
            role: userRole,
          })
        }

        // Read and clear temporary redirect cookies
        const cookieNext = cookieStore.get('printhive_next_redirect')?.value
        const decodedNext = cookieNext ? decodeURIComponent(cookieNext) : null
        cookieStore.set('printhive_signup_role', '', { maxAge: 0, path: '/' })
        cookieStore.set('printhive_next_redirect', '', { maxAge: 0, path: '/' })

        // Set active role cookies
        cookieStore.set('printhive_auth_role', userRole, { maxAge: 604800, path: '/' })
        cookieStore.set('printhive_guest_role', userRole, { maxAge: 604800, path: '/' })

        const rawTarget = next || decodedNext
        const targetPath = (rawTarget && rawTarget.startsWith('/') && !rawTarget.startsWith('//') && !rawTarget.includes(':'))
          ? rawTarget
          : (DASHBOARD_PATH[userRole] ?? '/')

        return NextResponse.redirect(`${origin}${targetPath}`)
      }

      return NextResponse.redirect(`${origin}/`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}