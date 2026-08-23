import { createAdminClient } from '@/utils/supabase/server'
import BrowseClient, { type DesignRow } from './BrowseClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function BrowsePage() {
  let loadedDesigns: DesignRow[] = []

  try {
    const adminSupabase = await createAdminClient()
    const { data, error } = await adminSupabase
      .from('designs')
      .select('id, title, price, rating, rating_count, thumbnail_url, preview_url, file_url, category, tags, is_public, designer_id')
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('Error fetching designs from Supabase:', error.message)
    } else if (data && data.length > 0) {
      // Fetch designer profiles for all unique designer_ids
      const designerIds = Array.from(new Set(data.map((d: any) => d.designer_id).filter(Boolean)))
      const profileMap: Record<string, string> = {}

      if (designerIds.length > 0) {
        const { data: profiles } = await adminSupabase
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
          title: d.title,
          price: Number(d.price ?? 0),
          category: d.category || tags[0] || 'Toys & Games',
          rating: d.rating != null ? Number(d.rating) : 5,
          rating_count: d.rating_count != null ? Number(d.rating_count) : 0,
          thumbnail_url: d.thumbnail_url || d.preview_url || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
          file_url: d.file_url || '',
          designer: { full_name: profileMap[d.designer_id] || 'PrintHive Creator' },
        }
      })
    }
  } catch (err) {
    console.warn('Error fetching designs from Supabase:', err)
  }

  return <BrowseClient designs={loadedDesigns} />
}