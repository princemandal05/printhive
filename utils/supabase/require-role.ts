import { createClient } from './server'
import { redirect } from 'next/navigation'
import { resolveRoleDashboard } from '@/lib/routes'

export type Role = 'buyer' | 'seller' | 'designer' | 'printer_owner' | 'admin'

export async function requireRole(expectedRole: Role) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Strict Admin Authorization: Requires real authenticated session & database role === 'admin'
  if (expectedRole === 'admin') {
    if (!user) {
      redirect('/login?next=/dashboard/admin')
    }
    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    if (adminProfile?.role !== 'admin') {
      redirect('/403')
    }

    return {
      supabase,
      user,
      profile: { id: user.id, email: user.email, role: 'admin' as Role },
      isGuest: false as const,
    }
  }

  // Real, authenticated session
  if (user) {
    let { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, role, full_name, is_verified')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError) {
      console.error('requireRole profile lookup error:', profileError)
    }

    // Authoritative Single Source of Truth: profiles.role in PostgreSQL
    const userRole: Role = (profile?.role as Role) || 'buyer'

    // Strict Role Access Control: Users can only access their authorized role or admin overrides
    if (userRole !== expectedRole && userRole !== 'admin' && expectedRole !== 'buyer') {
      redirect('/403')
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

  // Unauthenticated users attempting to access protected routes redirect to login
  redirect('/login')
}