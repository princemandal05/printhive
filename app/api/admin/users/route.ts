import { createClient, createAdminClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    if (profileErr) {
      console.error('Error querying admin authorization profile:', profileErr)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin privilege required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const pageInput = parseInt(searchParams.get('page') || '1', 10)
    const limitInput = parseInt(searchParams.get('limit') || '50', 10)

    const page = Number.isInteger(pageInput) && pageInput > 0 ? pageInput : 1
    const limit = Number.isInteger(limitInput) && limitInput > 0 ? Math.min(limitInput, 100) : 50

    const from = (page - 1) * limit
    const to = from + limit - 1

    const adminSupabase = await createAdminClient()
    const { data: profiles, count, error: fetchErr } = await adminSupabase
      .from('profiles')
      .select('id, email, full_name, avatar_url, role, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (fetchErr) {
      console.error('Error fetching admin users list:', fetchErr)
      return NextResponse.json({ error: 'Failed to retrieve user accounts' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      users: profiles || [],
      page,
      limit,
      total: count || 0,
    })
  } catch (error: any) {
    console.error('Unexpected error in admin users API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
