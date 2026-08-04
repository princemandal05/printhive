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

export async function requireRole(expectedRole: Role) {
  const cookieStore = await cookies()
  const guestDemoRole = cookieStore.get('printhive_guest_role')?.value

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Real, authenticated session always wins
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    const userRole: Role = (profile?.role as Role) || (user.user_metadata?.role as Role) || 'buyer'

    // Strict Role Access Control:
    // If the authenticated user's actual registered role does NOT match the page required role (and user is not Admin),
    // redirect them to their authorized role dashboard!
    if (userRole !== expectedRole && userRole !== 'admin' && expectedRole !== 'buyer') {
      redirect(DASHBOARD_PATH[userRole] || '/dashboard/buyer')
    }

    return {
      supabase,
      user,
      profile: profile || {
        id: user.id,
        email: user.email,
        role: userRole,
        full_name: user.email?.split('@')[0] || 'User',
      },
      isGuest: false as const,
    }
  }

  // Guest demo mode — strictly enforce role matching
  if (guestDemoRole) {
    const activeGuestRole = guestDemoRole as Role
    if (activeGuestRole !== expectedRole && activeGuestRole !== 'admin' && expectedRole !== 'buyer') {
      redirect(DASHBOARD_PATH[activeGuestRole] || '/dashboard/buyer')
    }

    const guestUser = {
      id: `guest-${activeGuestRole}`,
      email: `guest_${activeGuestRole}@printhive.demo`,
    }
    const guestProfile = {
      id: guestUser.id,
      email: guestUser.email,
      role: activeGuestRole,
      full_name: `Guest ${activeGuestRole.replace('_', ' ').toUpperCase()}`,
    }

    return {
      supabase: null as any,
      user: guestUser as any,
      profile: guestProfile,
      isGuest: true as const,
    }
  }

  // Unauthenticated users attempting to access protected routes redirect to login
  redirect('/login')
}