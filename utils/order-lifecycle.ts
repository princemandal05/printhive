export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAYMENT_CONFIRMED'
  | 'FINDING_PRINTER'
  | 'PRINTER_ASSIGNED'
  | 'PRINTER_ACCEPTED'
  | 'PRINTING'
  | 'QUALITY_CHECK'
  | 'READY'
  | 'DISPATCHED'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REFUNDED'

export interface OrderStatusStep {
  key: OrderStatus
  label: string
  icon: string
  description: string
}

export const ORDER_LIFECYCLE_STEPS: OrderStatusStep[] = [
  { key: 'PENDING_PAYMENT', label: 'Payment Pending', icon: '💳', description: 'Order created, awaiting Razorpay payment confirmation.' },
  { key: 'PAYMENT_CONFIRMED', label: 'Payment Confirmed', icon: '📝', description: 'Payment verified and held safely in Escrow protection.' },
  { key: 'FINDING_PRINTER', label: 'Finding Nearby Printer', icon: '📍', description: 'Searching Leaflet OpenStreetMap for optimal printer hub.' },
  { key: 'PRINTER_ASSIGNED', label: 'Printer Hub Assigned', icon: '🖨️', description: 'Matched with verified nearby PrintHive partner hub.' },
  { key: 'PRINTER_ACCEPTED', label: 'Job Accepted by Printer', icon: '✅', description: 'Printer owner accepted slicing specs & job queue.' },
  { key: 'PRINTING', label: 'Manufacturing / Printing', icon: '⚡', description: 'Active 3D printing in progress on FDM / Resin machine.' },
  { key: 'QUALITY_CHECK', label: 'Quality Verification', icon: '🔍', description: 'Dimensional tolerance & surface finish inspection.' },
  { key: 'READY', label: 'Ready for Dispatch', icon: '📦', description: 'Packaged & prepared for courier dispatch.' },
  { key: 'DISPATCHED', label: 'Out for Delivery', icon: '🚚', description: 'Courier dispatched with live location tracking.' },
  { key: 'DELIVERED', label: 'Package Delivered', icon: '📬', description: 'Delivered to recipient address.' },
  { key: 'COMPLETED', label: 'Order Completed', icon: '🎉', description: 'Delivery confirmed & Escrow funds released (70% Printer / 15% Designer).' },
  { key: 'CANCELLED', label: 'Order Cancelled', icon: '🚫', description: 'Order cancelled by buyer or printer hub.' },
  { key: 'REFUNDED', label: 'Payment Refunded', icon: '💸', description: 'Full payment refunded to original payment method.' },
]

/**
 * Updates order status in Supabase database and records an audit log entry in order_status_history.
 */
export async function updateOrderStatus(
  supabase: any,
  orderId: string,
  newStatus: OrderStatus,
  notes?: string,
  updatedByUserId?: string
) {
  const stepInfo = ORDER_LIFECYCLE_STEPS.find((s) => s.key === newStatus)
  const defaultNotes = stepInfo ? stepInfo.description : `Status updated to ${newStatus}`

  // 1. Update status in orders table
  const { error: orderError } = await supabase
    .from('orders')
    .update({ status: newStatus })
    .eq('id', orderId)

  if (orderError) {
    console.warn('Orders status update error:', orderError)
  }

  // 2. Insert audit entry into order_status_history
  try {
    await supabase.from('order_status_history').insert({
      order_id: orderId,
      status: newStatus,
      notes: notes || defaultNotes,
      updated_by: updatedByUserId || null,
      created_at: new Date().toISOString(),
    })
  } catch (err) {
    console.warn('Order status history insertion note:', err)
  }

  return { success: !orderError, status: newStatus }
}
