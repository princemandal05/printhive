/**
 * PrintHive Centralized Real-Time Notification Dispatcher
 * Dispatches authoritative notifications for order lifecycle events, payments, and payouts.
 */

export type NotificationType = 'info' | 'order' | 'bid' | 'payment' | 'payout' | 'system'

export interface CreateNotificationParams {
  userId: string
  title: string
  message: string
  type?: NotificationType
  link?: string
}

export async function sendNotification(
  supabaseAdmin: any,
  params: CreateNotificationParams
): Promise<{ success: boolean; error?: string }> {
  try {
    const { userId, title, message, type = 'info', link } = params

    if (!userId || !title || !message) {
      return { success: false, error: 'Missing required notification fields' }
    }

    const { error } = await supabaseAdmin.from('notifications').insert({
      user_id: userId,
      title,
      message,
      type,
      link: link || null,
      is_read: false,
      created_at: new Date().toISOString(),
    })

    if (error) {
      console.warn('Notification dispatch failed to insert:', error.message)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err: unknown) {
    const error = err as Error
    console.warn('Notification dispatch exception:', error.message)
    return { success: false, error: error.message }
  }
}
