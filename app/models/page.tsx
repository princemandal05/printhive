import { createAdminClient, createClient } from '@/utils/supabase/server'
import BrowseClient, { type DesignRow } from '@/app/browse/BrowseClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: 'Digital 3D CAD Models Marketplace | PrintHive',
  description: 'Explore verified watertight 3D CAD designs ready for on-demand fabrication by local printer hubs.',
}

export default async function ModelsPage() {
  let loadedDesigns: DesignRow[] = []

  try {
    let supabaseClient
    try {
      supabaseClient = await createAdminClient()
    } catch {
      supabaseClient = await createClient()
    }

    const { data, error } = await supabaseClient
      .from('designs')
      .select('id, title, description, file_url, thumbnail_url, price, tags, is_public, designer_id, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('Error fetching designs from Supabase:', error.message)
    } else if (data && data.length > 0) {
      const designerIds = Array.from(new Set(data.map((d: any) => d.designer_id).filter(Boolean)))
      const profileMap: Record<string, string> = {}

      if (designerIds.length > 0) {
        const { data: profiles } = await supabaseClient
          .from('profiles')
          .select('id, full_name')
          .in('id', designerIds)

        if (profiles) {
          profiles.forEach((p: any) => {
            profileMap[p.id] = p.full_name
          })
        }
      }

      loadedDesigns = data.map((d: any) => {
        const tags = Array.isArray(d.tags) ? d.tags : []
        return {
          id: d.id,
          title: d.title || '3D Model',
          price: Number(d.price ?? 0),
          category: tags[0] || 'Toys & Games',
          rating: d.rating !== null && d.rating !== undefined ? Number(d.rating) : 0,
          rating_count: d.rating_count !== null && d.rating_count !== undefined ? Number(d.rating_count) : 0,
          thumbnail_url: d.thumbnail_url || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
          file_url: d.file_url || '',
          designer: { full_name: profileMap[d.designer_id] || 'PrintHive Creator' },
        }
      })
    }
  } catch (err) {
    console.warn('Error fetching designs in ModelsPage:', err)
  }

  return <BrowseClient designs={loadedDesigns} />
}
