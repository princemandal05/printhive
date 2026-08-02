import { createClient } from './server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export type Role = 'buyer' | 'seller' | 'designer' | 'printer_owner' | 'admin'

export const DASHBOARD_PATH: Record<Role, string> = {
  buyer: '/dashboard/buyer',
  seller: '/dashboard/seller',
  designer: '/dashboard/designer',
  printer_owner: '/dashboard/printer-owner',
  admin: '/dashboard/admin',
}

export async function requireRole(role: Role) {
  const cookieStore = await cookies()
  const guestDemoRole = cookieStore.get('printhive_guest_role')?.value

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Real, authenticated session always wins — check this first regardless
  // of any cookies present.
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    return {
      supabase,
      user,
      profile: profile || {
        id: user.id,
        email: user.email,
        role,
        full_name: user.email?.split('@')[0] || 'User',
      },
      isGuest: false as const,
    }
  }

  // Explicit "browse as guest" demo mode — only reached when the user
  // deliberately chose it (sets printhive_guest_role), never as a silent
  // stand-in for a real login that failed.
  if (guestDemoRole) {
    const guestUser = {
      id: `guest-${guestDemoRole}`,
      email: `guest_${guestDemoRole}@printhive.demo`,
    }
    const guestProfile = {
      id: guestUser.id,
      email: guestUser.email,
      role: guestDemoRole,
      full_name: `Guest ${guestDemoRole.replace('_', ' ').toUpperCase()}`,
    }

    return {
      supabase: null as any,
      user: guestUser as any,
      profile: guestProfile,
      isGuest: true as const,
    }
  }

  // No real session and no explicit guest mode. The previous version
  // fabricated a fake logged-in user here (`account_${role}@printhive.com`)
  // — that's exactly what hid the broken-signup bug: a failed signup or an
  // expired/missing session looked identical to a working dashboard. Send
  // people to login instead of pretending they're authenticated.
  redirect('/login')
}