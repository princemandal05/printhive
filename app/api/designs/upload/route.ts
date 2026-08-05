import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Enforce strict authentication requirement for 3D model uploads
    if (!user) {
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
    const preview_url = typeof payload.preview_url === 'string' ? payload.preview_url : ''

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Valid model title is required' }, { status: 400 })
    }

    // Validate 3D model file extension & URL format safely via URL parser
    const validExtensions = ['.stl', '.3mf', '.obj', '.gcode']
    let isValidFileUrl = false

    if (file_url.trim()) {
      const trimmedUrl = file_url.trim()
      if (trimmedUrl.startsWith('/models/')) {
        const ext = trimmedUrl.toLowerCase().slice(trimmedUrl.lastIndexOf('.'))
        if (validExtensions.includes(ext)) {
          isValidFileUrl = true
        }
      } else {
        try {
          const parsedUrl = new URL(trimmedUrl)
          const isHttps = parsedUrl.protocol === 'https:'
          const isAllowedHost = (
            parsedUrl.hostname === 'cloudinary.com' || parsedUrl.hostname.endsWith('.cloudinary.com') ||
            parsedUrl.hostname === 'supabase.co' || parsedUrl.hostname.endsWith('.supabase.co')
          )
          const ext = parsedUrl.pathname.toLowerCase().slice(parsedUrl.pathname.lastIndexOf('.'))
          const hasValidExt = validExtensions.includes(ext)

          if (isHttps && isAllowedHost && hasValidExt) {
            isValidFileUrl = true
          }
        } catch {
          isValidFileUrl = false
        }
      }
    }

    if (file_url && !isValidFileUrl) {
      return NextResponse.json(
        { error: 'Invalid file format or unauthorized storage host. Only STL, 3MF, OBJ, or GCODE files from approved hosts are supported.' },
        { status: 400 }
      )
    }

    const designerId = user.id
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
      file_url: file_url || '/models/demo.stl',
      preview_url: preview_url || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
      status: 'published',
      is_public: true,
      created_at: new Date().toISOString(),
    }

    const { data: insertedDesign, error: dbError } = await supabase
      .from('designs')
      .insert(newDesignData)
      .select()
      .single()

    if (dbError) {
      console.error('Supabase DB designs insert failure:', dbError.message)
      return NextResponse.json({ error: 'Failed to save design to database' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      design: insertedDesign,
    })
  } catch (err: unknown) {
    const error = err as Error
    console.error('Design upload API error:', error)
    return NextResponse.json({ error: error.message || 'Failed to publish design' }, { status: 500 })
  }
}
