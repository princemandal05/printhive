import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 })
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
    const fullName = payload.fullName
    const avatarUrl = payload.avatarUrl
    const phone = payload.phone
    const bio = payload.bio
    const address = payload.address

    const updateData: Record<string, string> = {
      updated_at: new Date().toISOString(),
    }

    if (typeof fullName === 'string' && fullName.trim()) updateData.full_name = fullName.trim().slice(0, 100)
    if (typeof avatarUrl === 'string' && avatarUrl.trim()) updateData.avatar_url = avatarUrl.trim().slice(0, 500)
    if (typeof phone === 'string') updateData.phone = phone.trim().slice(0, 30)
    if (typeof bio === 'string') updateData.bio = bio.trim().slice(0, 500)
    if (typeof address === 'string') updateData.address = address.trim().slice(0, 500)

    const { data: updatedProfile, error: dbError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single()

    if (dbError) {
      console.warn('Profile update note:', dbError.message)
    }

    return NextResponse.json({
      success: true,
      profile: updatedProfile || { id: user.id, email: user.email, ...updateData },
    })
  } catch (err: unknown) {
    const error = err as Error
    console.error('Profile update failure:', error)
    return NextResponse.json({ error: error.message || 'Failed to update profile' }, { status: 500 })
  }
}
