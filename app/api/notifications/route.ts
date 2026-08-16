import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: notifications, error: fetchErr } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(30)

    if (fetchErr) {
      console.error('Error fetching user notifications:', fetchErr)
      return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
    }

    const unreadCount = (notifications || []).filter((n) => !n.is_read).length

    return NextResponse.json({
      success: true,
      notifications: notifications || [],
      unreadCount,
    })
  } catch (error: any) {
    console.error('Unexpected error in notifications GET handler:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body: any = {}
    try {
      body = await request.json()
    } catch {
      // Empty body implies mark all as read
    }

    const { id, markAllRead } = body

    if (markAllRead) {
      const { error: updateErr } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false)

      if (updateErr) {
        console.error('Error marking all notifications as read:', updateErr)
        return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 })
      }

      return NextResponse.json({ success: true, message: 'All notifications marked as read' })
    }

    if (id) {
      const { error: updateErr } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)
        .eq('user_id', user.id)

      if (updateErr) {
        console.error('Error marking notification as read:', updateErr)
        return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 })
      }

      return NextResponse.json({ success: true, message: 'Notification marked as read' })
    }

    return NextResponse.json({ error: 'Missing notification id or markAllRead flag' }, { status: 400 })
  } catch (error: any) {
    console.error('Unexpected error in notifications PATCH handler:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
