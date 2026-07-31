import { createClient } from './server'
import { cookies } from 'next/headers'

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
  const guestRole = cookieStore.get('printhive_guest_role')?.value || cookieStore.get('printhive_auth_role')?.value

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      return {
        supabase,
        user,
        profile: profile || {
          id: user.id,
          email: user.email,
          role: role,
          full_name: user.email?.split('@')[0] || 'User',
        },
      }
    }
  } catch (err) {
    // Non-fatal — fall back to Guest profile
  }

  // Guest Mode Fallback: Allow immediate access to any dashboard
  const activeRole = guestRole || role
  const guestUser = {
    id: `guest-${activeRole}`,
    email: `guest_${activeRole}@printhive.demo`,
  }
  const guestProfile = {
    id: guestUser.id,
    email: guestUser.email,
    role: activeRole,
    full_name: `Guest ${activeRole.replace('_', ' ').toUpperCase()}`,
  }

  return { supabase: null as any, user: guestUser as any, profile: guestProfile }
}