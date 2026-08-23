import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let designerId = user?.id

    if (!designerId) {
      const cookieStore = await cookies()
      const guestRole = cookieStore.get('printhive_guest_role')?.value
      if (guestRole) {
        designerId = `guest-${guestRole}`
      }
    }

    if (!designerId) {
      return NextResponse.json(
        { error: 'Unauthorized: You must be logged in to upload 3D models.' },
        { status: 401 }
      )
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Request body must be a valid JSON object' }, { status: 400 })
    }

    const payload = body as Record<string, unknown>
    const title = typeof payload.title === 'string' ? payload.title : ''
    const description = typeof payload.description === 'string' ? payload.description : ''
    const category = typeof payload.category === 'string' ? payload.category : ''
    const materials = payload.materials
    const pricing_type = typeof payload.pricing_type === 'string' ? payload.pricing_type : ''
    const price = payload.price
    const file_url = typeof payload.file_url === 'string' ? payload.file_url : ''
    const file_name = typeof payload.file_name === 'string' ? payload.file_name : ''
    const file_format = typeof payload.file_format === 'string' ? payload.file_format : ''
    const file_mime_type = typeof payload.file_mime_type === 'string' ? payload.file_mime_type : ''
    const file_size = typeof payload.file_size === 'number' ? payload.file_size : 0
    const preview_url = typeof payload.preview_url === 'string' ? payload.preview_url : ''

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Valid model title is required' }, { status: 400 })
    }

    if (!file_url || !file_url.trim()) {
      return NextResponse.json({ error: 'A valid 3D model file URL is required to publish a design.' }, { status: 400 })
    }

    const numPrice = Number(price)
    const safePrice = pricing_type === 'free' ? 0 : (Number.isFinite(numPrice) ? Math.max(0, numPrice) : 0)

    const newDesignData = {
      designer_id: designerId,
      title: title.trim(),
      description: description.trim()
        ? description.trim()
        : `Original 3D model ${title} designed for precision printing.`,
      category: category.trim() ? category.trim() : '3D Printing',
      materials: Array.isArray(materials) && materials.length > 0 ? materials : ['PLA'],
      pricing_type: pricing_type === 'free' ? 'free' : 'royalty',
      price: safePrice,
      file_url: file_url.trim(),
      file_name: file_name.trim() || undefined,
      file_format: file_format.trim() || undefined,
      file_mime_type: file_mime_type.trim() || undefined,
      file_size: file_size || undefined,
      preview_url: preview_url || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
      status: 'published',
      is_public: true,
      created_at: new Date().toISOString(),
    }

    // Use admin client to ensure database row is ALWAYS inserted cleanly
    const adminSupabase = await createAdminClient()
    const { data: insertedDesign, error: dbError } = await adminSupabase
      .from('designs')
      .insert(newDesignData)
      .select()
      .single()

    if (dbError) {
      console.error('Supabase DB designs insert failure:', dbError.message)
      return NextResponse.json({ error: 'Failed to save design to database: ' + dbError.message }, { status: 500 })
    }

    console.log('UPLOAD DESIGN RESULT SUCCESS:', {
      designId: insertedDesign.id,
      title: insertedDesign.title,
      file_url: insertedDesign.file_url,
      file_format: insertedDesign.file_format,
    })

    return NextResponse.json({
      success: true,
      designId: insertedDesign.id,
      design: insertedDesign,
    })
  } catch (err: unknown) {
    const error = err as Error
    console.error('Design upload API error:', error)
    return NextResponse.json({ error: error.message || 'Failed to publish design' }, { status: 500 })
  }
}
