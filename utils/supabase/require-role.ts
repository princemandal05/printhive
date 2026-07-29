import { createClient } from './server'
import { redirect } from 'next/navigation'
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
  const guestRole = cookieStore.get('printhive_guest_role')?.value

  if (guestRole) {
    const user = {
      id: `guest-${guestRole}`,
      email: `guest_${guestRole}@printhive.demo`,
    }
    const profile = {
      id: user.id,
      email: user.email,
      role: guestRole,
      full_name: `Guest ${guestRole.replace('_', ' ').toUpperCase()}`,
    }
    return { supabase: null as any, user: user as any, profile }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile?.role) {
    redirect('/signup')
  }

  if (profile.role !== role) {
    redirect(DASHBOARD_PATH[profile.role as Role] ?? '/')
  }

  return { supabase, user, profile }
}