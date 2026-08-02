import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { fullName, avatarUrl, phone, bio, address } = body

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 })
    }

    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }

    if (typeof fullName === 'string' && fullName.trim()) updateData.full_name = fullName.trim()
    if (typeof avatarUrl === 'string' && avatarUrl.trim()) updateData.avatar_url = avatarUrl.trim()
    if (typeof phone === 'string') updateData.phone = phone.trim()
    if (typeof bio === 'string') updateData.bio = bio.trim()
    if (typeof address === 'string') updateData.address = address.trim()

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
