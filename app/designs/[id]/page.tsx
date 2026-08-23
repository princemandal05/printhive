import { createAdminClient } from '@/utils/supabase/server'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import DesignDetailClient from './DesignDetailClient'
import Link from 'next/link'

export default async function DesignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  console.log('REQUESTED DESIGN ID:', id)

  let design: any = null

  try {
    const adminSupabase = await createAdminClient()

    // Query design record directly from Supabase database without foreign key join dependency
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

      // Fetch creator profile separately if designer_id exists
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

      design = {
        ...dbDesign,
        designer: designer || { id: dbDesign.designer_id || 'designer-creator', full_name: 'PrintHive Creator' },
        category,
        file_format,
        file_name,
      }
    }
  } catch (err) {
    console.error('Design fetch error:', err)
  }

  // If design not found in DB, display clean 404 page (NO fake demo fallback model)
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

  return (
    <main>
      <Navbar />
      <DesignDetailClient design={design} reviews={[]} />
      <Footer />
    </main>
  )
}