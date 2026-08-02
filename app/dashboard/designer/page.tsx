import { createClient } from '@/utils/supabase/server'
import { requireRole } from '@/utils/supabase/require-role'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import DesignerDashboardClient from './DesignerDashboardClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const DEMO_DESIGNS = [
  { id: 'd1', title: 'Ergonomic Headphone Stand v2', category: 'Home & Office', price: 150, royalty: '15% per print', prints: 184, preview: 'https://images.unsplash.com/photo-1612815150546-a3a1617296e8?auto=format&fit=crop&w=600&q=80', status: 'Published' },
  { id: 'd2', title: 'Articulated Flexi Dragon Model', category: 'Toys & Games', price: 200, royalty: '15% per print', prints: 312, preview: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80', status: 'Published' },
  { id: 'd3', title: 'Cyberpunk Helmet Visor Component', category: 'Personalized', price: 450, royalty: '15% per print', prints: 68, preview: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80', status: 'Published' },
]

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

  // Fetch live design models from Supabase
  let designs = DEMO_DESIGNS
  try {
    const supabase = await createClient()
    const { data: dbDesigns } = await supabase.from('designs').select('*').order('created_at', { ascending: false })
    if (dbDesigns && dbDesigns.length > 0) {
      designs = dbDesigns.map((d: any, index: number) => ({
        id: d.id || `d-${index}`,
        title: d.title || '3D Model Design',
        category: d.category || '3D Printing',
        price: d.price || 150,
        royalty: d.pricing_type === 'free' ? 'Open Source' : '15% per print',
        prints: Math.floor(Math.random() * 50) + 10,
        preview: d.preview_url || DEMO_DESIGNS[index % DEMO_DESIGNS.length].preview,
        status: d.status || 'Published',
      }))
    }
  } catch (err) {}

  return (
    <DesignerDashboardClient
      userEmail={user?.email || 'designer@printhive.com'}
      initialDesigns={designs}
      signOutAction={handleSignOut}
    />
  )
}