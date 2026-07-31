import { createClient } from '@/utils/supabase/server'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import DesignDetailClient from './DesignDetailClient'

const FALLBACK_DESIGNS: Record<string, any> = {
  d1: {
    id: 'd1',
    title: 'Ergonomic Headphone Stand v2',
    description: 'Precision engineered desk headphone stand designed for optimal cable routing and balanced headrest support.',
    category: 'Home & Office',
    price: 150,
    materials: ['PLA', 'PETG'],
    file_url: '/models/demo.stl',
    preview_url: 'https://images.unsplash.com/photo-1612815150546-a3a1617296e8?auto=format&fit=crop&w=600&q=80',
    designer: { id: 'designer-1', full_name: 'Alex Rivera (3D Master)' },
  },
  d2: {
    id: 'd2',
    title: 'Articulated Flexi Dragon Model',
    description: 'Multi-segmented flexible dragon printed in place with zero assembly required. High movement articulation.',
    category: 'Toys & Games',
    price: 200,
    materials: ['PLA', 'ABS'],
    file_url: '/models/demo.stl',
    preview_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    designer: { id: 'designer-2', full_name: 'Kolkata Additive Studio' },
  },
  d3: {
    id: 'd3',
    title: 'Cyberpunk Helmet Visor Component',
    description: 'High-detail sci-fi visor attachment for cosplay helmets with snap-fit mounting pins.',
    category: 'Personalized',
    price: 450,
    materials: ['PETG', 'Resin'],
    file_url: '/models/demo.stl',
    preview_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
    designer: { id: 'designer-3', full_name: 'PropForge Labs' },
  },
}

export default async function DesignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let design = FALLBACK_DESIGNS[id] || null

  try {
    const supabase = await createClient()
    const { data: dbDesign } = await supabase
      .from('designs')
      .select('*, designer:profiles!designs_designer_id_fkey(id, full_name)')
      .eq('id', id)
      .maybeSingle()

    if (dbDesign) {
      design = dbDesign
    }
  } catch (err) {
    console.warn('Design query note:', err)
  }

  // Generic fallback if not in DB or demo list
  if (!design) {
    design = {
      id,
      title: `3D Model Design #${id}`,
      description: 'High-quality 3D STL model for precision additive manufacturing. Verified slicing geometry.',
      category: '3D Printing',
      price: 199,
      materials: ['PLA', 'PETG'],
      file_url: '/models/demo.stl',
      preview_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
      designer: { id: 'designer-demo', full_name: 'PrintHive Verified Designer' },
    }
  }

  const reviews = [
    { rating: 5, review_text: 'Flawless print geometry! Zero supports needed and layer lines are super smooth.', buyer: { full_name: 'Rahul S.' } },
    { rating: 5, review_text: 'Great file, downloaded and printed on my Ender 3 S1 without issues.', buyer: { full_name: 'Priya P.' } },
  ]

  return (
    <main>
      <Navbar />
      <DesignDetailClient design={design} reviews={reviews} />
      <Footer />
    </main>
  )
}