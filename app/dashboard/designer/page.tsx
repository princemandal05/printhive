import { createClient, createAdminClient } from '@/utils/supabase/server'
import { requireRole } from '@/utils/supabase/require-role'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import DesignerDashboardClient from './DesignerDashboardClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DesignerDashboard() {
  const { user } = await requireRole('designer')

  const handleSignOut = async () => {
    'use server'
    const cookieStore = await cookies()
    cookieStore.set('printhive_guest_role', '', { maxAge: 0, path: '/' })
    cookieStore.set('printhive_auth_role', '', { maxAge: 0, path: '/' })
    const s = await createClient()
    await s.auth.signOut()
    redirect('/')
  }

  // Fetch live design models and real escrow royalties from Supabase
  let designs: any[] = []
  let totalRoyalties = 0
  let totalPrints = 0

  try {
    const adminSupabase = await createAdminClient()
    
    // Fetch designs owned by this designer (or public designs if initial profile)
    const { data: dbDesigns } = await adminSupabase
      .from('designs')
      .select('*')
      .or(`designer_id.eq.${user.id},designer_id.is.null`)
      .order('created_at', { ascending: false })

    if (dbDesigns && dbDesigns.length > 0) {
      designs = dbDesigns.map((d: any, index: number) => ({
        id: d.id || `d-${index}`,
        title: d.title || '3D Model Design',
        category: d.category || (Array.isArray(d.tags) ? d.tags[0] : null) || '3D Printing',
        price: d.price || 0,
        royalty: d.pricing_type === 'free' || d.price === 0 ? 'Open Source' : '15% per print',
        prints: Number(d.prints_count || d.downloads_count || 0),
        preview: d.thumbnail_url || d.preview_url || d.image_url || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
        status: d.status || 'Published',
      }))
    }

    // Fetch real designer escrow payouts
    const { data: payouts } = await adminSupabase
      .from('escrow_payouts')
      .select('amount, status')
      .eq('role', 'designer')

    if (payouts && payouts.length > 0) {
      totalRoyalties = payouts.reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0)
      totalPrints = payouts.length
    }
  } catch (err) {
    console.warn('Designer dashboard query error:', err)
  }

  return (
    <DesignerDashboardClient
      userEmail={user?.email || 'designer@printhive.com'}
      initialDesigns={designs}
      totalRoyalties={totalRoyalties}
      totalPrints={totalPrints}
      signOutAction={handleSignOut}
    />
  )
}