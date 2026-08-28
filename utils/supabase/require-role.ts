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

  // Real, authenticated session always wins
  if (user) {
    let { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError) {
      console.error('requireRole profile lookup error:', profileError)
    }

    const dbRole = profile?.role as Role | undefined
    const metaRole = user.user_metadata?.role as Role | undefined

    let userRole: Role = dbRole || metaRole || 'buyer'

    // If DB profile is missing or recorded as buyer, but metadata specifies seller/designer/printer_owner, auto-heal DB profile
    if (metaRole && ['seller', 'designer', 'printer_owner'].includes(metaRole) && (!dbRole || dbRole === 'buyer')) {
      userRole = metaRole
      try {
        const { createAdminClient } = await import('./server')
        const adminSupabase = await createAdminClient()
        await adminSupabase.from('profiles').upsert({
          id: user.id,
          email: user.email,
          role: userRole,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0]
        }, { onConflict: 'id' })
        if (profile) profile.role = userRole
      } catch (e) {
        console.error('Failed to auto-heal profile role in requireRole:', e)
      }
    }

    // Strict Role Access Control:
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