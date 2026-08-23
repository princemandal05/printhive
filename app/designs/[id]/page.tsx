import { createClient, createAdminClient } from '@/utils/supabase/server'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import DesignDetailClient from './DesignDetailClient'
import Link from 'next/link'

const DEMO_DESIGNS: Record<string, any> = {
  d1: {
    id: 'd1',
    title: 'Ergonomic Headphone Stand v2',
    description: 'Precision engineered desk headphone stand designed for optimal cable routing and balanced headrest support.',
    category: 'Home & Office',
    price: 150,
    materials: ['PLA', 'PETG'],
    file_url: '/models/demo.stl',
    file_format: 'stl',
    file_name: 'headphone_stand.stl',
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
    file_format: 'stl',
    file_name: 'flexi_dragon.stl',
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
    file_format: 'stl',
    file_name: 'helmet_visor.stl',
    preview_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
    designer: { id: 'designer-3', full_name: 'PropForge Labs' },
  },
}

export default async function DesignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  console.log('REQUESTED DESIGN ID:', id)

  let design = DEMO_DESIGNS[id] || null

  if (!design) {
    try {
      const adminSupabase = await createAdminClient()

      // STEP 1 — Fetch design row directly WITHOUT foreign key join
      const { data: dbDesign, error: dbError } = await adminSupabase
        .from('designs')
        .select('*')
        .eq('id', id)
        .maybeSingle()

      console.log('DESIGN FETCH RESULT:', dbDesign)
      console.log('DESIGN FETCH ERROR:', dbError?.message || null)

      if (dbDesign) {
        console.log('DATABASE DESIGN:', {
          id: dbDesign.id,
          title: dbDesign.title,
          file_url: dbDesign.file_url,
          file_format: dbDesign.file_format,
          tags: dbDesign.tags,
          designer_id: dbDesign.designer_id,
        })

        // STEP 2 — Decoupled profile lookup
        let designer = null
        if (dbDesign.designer_id) {
          const { data: designerData, error: designerError } = await adminSupabase
            .from('profiles')
            .select('id, full_name')
            .eq('id', dbDesign.designer_id)
            .maybeSingle()

          console.log('DESIGNER RESULT:', designerData)
          console.log('DESIGNER ERROR:', designerError?.message || null)

          designer = designerData
        }

        const tags = Array.isArray(dbDesign.tags) ? dbDesign.tags : []
        const category = tags[0] || '3D Printing'
        const file_format = dbDesign.file_format || tags[1] || 'stl'
        const file_name = dbDesign.file_name || tags[2] || `${dbDesign.title.toLowerCase().replace(/\s+/g, '-')}.${file_format}`

        // STEP 3 — Design is FOUND regardless of designer profile lookup outcome
        design = {
          ...dbDesign,
          designer: designer || { id: dbDesign.designer_id || 'designer-unknown', full_name: 'PrintHive Designer' },
          category,
          file_format,
          file_name,
        }
      }
    } catch (err) {
      console.error('Design fetch error:', err)
    }
  }

  // If design not found in DB or demo set, display clean 404 page (NO fake fallback model)
  if (!design) {
    console.error('DESIGN FETCH ERROR: No design found in database with id:', id)
    return (
      <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 54, marginBottom: 16 }}>📦</div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: 'var(--text-main)', marginBottom: 8 }}>3D Model Not Found</h1>
          <p style={{ color: 'var(--text-sub)', fontSize: 14, maxWidth: 420, marginBottom: 24 }}>
            The 3D design model you are looking for does not exist or may have been removed.
          </p>
          <Link
            href="/browse"
            style={{
              background: '#FF6B35',
              color: '#fff',
              padding: '10px 22px',
              borderRadius: 99,
              fontWeight: 800,
              fontSize: 13,
              textDecoration: 'none',
            }}
          >
            ← Explore 3D Models Directory
          </Link>
        </div>
        <Footer />
      </main>
    )
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