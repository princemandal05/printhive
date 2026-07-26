import { createClient } from './server'
import { redirect } from 'next/navigation'

export type Role = 'buyer' | 'seller' | 'designer' | 'printer_owner' | 'admin'

export const DASHBOARD_PATH: Record<Role, string> = {
  buyer: '/dashboard/buyer',
  seller: '/dashboard/seller',
  designer: '/dashboard/designer',
  printer_owner: '/dashboard/printer-owner',
  admin: '/dashboard/admin',
}

/**
 * Server-side guard for dashboard pages. Use at the top of every
 * dashboard page (and every sub-page under it) — do not rely on
 * middleware alone, since middleware only checks "is anyone logged
 * in", not "is this the right role for this page".
 *
 *   const { user, profile } = await requireRole('seller')
 *
 * - Not logged in           -> redirected to /login
 * - Logged in, wrong role   -> redirected to THEIR OWN dashboard
 *   (never back to /login — they're already authenticated, sending
 *   them to login again is confusing)
 * - Logged in, no role yet  -> redirected to /signup to finish setup
 */
export async function requireRole(role: Role) {
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