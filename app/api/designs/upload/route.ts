import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized: You must be logged in as an authenticated creator/designer to upload 3D models.' },
        { status: 401 }
      )
    }

    const designerId = user.id

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
    const pricing_type = typeof payload.pricing_type === 'string' ? payload.pricing_type : ''
    const price = payload.price
    const file_url = typeof payload.file_url === 'string' ? payload.file_url : ''
    const file_name = typeof payload.file_name === 'string' ? payload.file_name : ''
    const file_format = typeof payload.file_format === 'string' ? payload.file_format : ''
    const preview_url = typeof payload.preview_url === 'string' ? payload.preview_url : ''

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Valid model title is required' }, { status: 400 })
    }

    if (!file_url || !file_url.trim()) {
      return NextResponse.json({ error: 'A valid 3D model file URL is required to publish a design.' }, { status: 400 })
    }

    const numPrice = Number(price)
    const safePrice = pricing_type === 'free' ? 0 : (Number.isFinite(numPrice) ? Math.max(0, numPrice) : 0)

    // Build payload matching exact Supabase designs table columns
    const newDesignData = {
      designer_id: designerId,
      title: title.trim(),
      description: description.trim()
        ? description.trim()
        : `Original 3D model ${title} designed for precision printing.`,
      file_url: file_url.trim(),
      thumbnail_url: preview_url || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
      price: safePrice,
      tags: [category.trim() || '3D Printing', file_format.trim() || 'stl', file_name.trim() || 'model.stl'],
      is_public: true,
    }

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

    console.log('CREATED DESIGN ID:', insertedDesign.id)
    console.log('CREATED DESIGN FILE URL:', insertedDesign.file_url)

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
