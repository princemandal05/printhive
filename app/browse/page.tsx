import { createClient } from '@/utils/supabase/server'
import BrowseClient from './BrowseClient'

export type DesignRow = {
  id: string
  title: string
  price: number
  category: string | null
  rating: number
  rating_count: number
  thumbnail_url: string | null
  designer: { full_name: string | null } | null
}

export default async function BrowsePage() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('designs')
    .select('id, title, price, category, rating, rating_count, thumbnail_url, designer:profiles!designs_designer_id_fkey(full_name)')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  if (error) {
    // Surface the real Supabase error in server logs rather than failing silently
    console.error('Error loading designs:', error.message)
  }

  return <BrowseClient designs={(data as unknown as DesignRow[]) ?? []} />
}