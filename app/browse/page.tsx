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

const FALLBACK_DESIGNS: DesignRow[] = [
  {
    id: 'd1',
    title: 'Flexi Articulated Crystal Dragon',
    price: 450,
    category: 'Toys & Games',
    rating: 4.9,
    rating_count: 38,
    thumbnail_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    designer: { full_name: 'Aarav Sharma' },
  },
  {
    id: 'd2',
    title: 'Minimalist Desktop Organizer & Cable Tray',
    price: 320,
    category: 'Home & Office',
    rating: 4.8,
    rating_count: 24,
    thumbnail_url: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=600&q=80',
    designer: { full_name: 'Priya Patel' },
  },
  {
    id: 'd3',
    title: 'Geometric Low-Poly Plant Pot',
    price: 280,
    category: 'Home & Decor',
    rating: 4.95,
    rating_count: 52,
    thumbnail_url: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=600&q=80',
    designer: { full_name: 'Vikram Malhotra' },
  },
  {
    id: 'd4',
    title: 'Customized Keychain & Luggage Tag',
    price: 150,
    category: 'Personalized',
    rating: 4.7,
    rating_count: 19,
    thumbnail_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    designer: { full_name: 'Neha Gupta' },
  },
  {
    id: 'd5',
    title: 'Replacement Washing Machine Knob Gear',
    price: 190,
    category: 'Repair Parts',
    rating: 5.0,
    rating_count: 14,
    thumbnail_url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80',
    designer: { full_name: 'Rohan Verma' },
  },
]

export default async function BrowsePage() {
  let loadedDesigns: DesignRow[] = []

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('designs')
      .select('id, title, price, rating, rating_count, thumbnail_url, preview_url, category, designer:profiles!designs_designer_id_fkey(full_name)')
      .in('status', ['approved', 'published', 'active'])
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('Error fetching designs from Supabase:', error)
    } else if (data && data.length > 0) {
      loadedDesigns = data.map((d: any) => ({
        id: d.id,
        title: d.title,
        price: Number(d.price ?? 0),
        category: d.category || 'Toys & Games',
        rating: d.rating != null ? Number(d.rating) : 0,
        rating_count: d.rating_count != null ? Number(d.rating_count) : 0,
        thumbnail_url: d.thumbnail_url || d.preview_url || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
        designer: { full_name: d.designer?.full_name || 'PrintHive Creator' },
      }))
    }
  } catch (err) {
    console.warn('Error fetching designs from Supabase:', err)
  }

  // Prepend live database uploaded models to browse catalog
  const finalDesigns = loadedDesigns.length > 0 ? [...loadedDesigns, ...FALLBACK_DESIGNS] : FALLBACK_DESIGNS

  return <BrowseClient designs={finalDesigns} />
}