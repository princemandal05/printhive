import { createClient } from './server'
import { redirect } from 'next/navigation'

export type Role = 'buyer' | 'seller' | 'designer' | 'printer_owner' | 'admin'

export async function requireRole(expectedRole: Role) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Strict Admin Authorization: Exclusive to the platform owner only
  if (expectedRole === 'admin') {
    if (!user) {
      redirect('/login?next=/dashboard/admin')
    }

    // EXCLUSIVE OWNER ACCESS: Only princemayamandal@gmail.com can enter the admin dashboard
    const isOwner = user.email?.toLowerCase() === 'princemayamandal@gmail.com'

    if (!isOwner) {
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
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, role, full_name, is_verified')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError) {
      console.error('requireRole profile lookup error:', profileError)
    }

    // Only the owner can ever have the 'admin' role; all others are demoted if they attempt admin
    const isOwner = user.email?.toLowerCase() === 'princemayamandal@gmail.com'
    const userRole: Role = isOwner
      ? 'admin'
      : profile?.role === 'admin'
      ? 'buyer'
      : (profile?.role as Role) || 'buyer'

    // Strict Role Access Control: Non-owners cannot access admin routes or unauthorized dashboards
    if (userRole !== expectedRole && !isOwner && expectedRole !== 'buyer') {
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