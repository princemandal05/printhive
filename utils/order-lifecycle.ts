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

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING_PAYMENT: ['PAYMENT_CONFIRMED', 'CANCELLED'],
  PAYMENT_CONFIRMED: ['PRINTING', 'FINDING_PRINTER', 'CANCELLED', 'REFUNDED'],
  FINDING_PRINTER: ['PRINTER_ASSIGNED', 'CANCELLED', 'REFUNDED'],
  PRINTER_ASSIGNED: ['PRINTER_ACCEPTED', 'CANCELLED', 'REFUNDED'],
  PRINTER_ACCEPTED: ['PAYMENT_CONFIRMED', 'PRINTING', 'CANCELLED', 'REFUNDED'],
  PRINTING: ['QUALITY_CHECK', 'CANCELLED', 'REFUNDED'],
  QUALITY_CHECK: ['READY', 'PRINTING', 'CANCELLED', 'REFUNDED'],
  READY: ['DISPATCHED', 'CANCELLED', 'REFUNDED'],
  DISPATCHED: ['DELIVERED', 'CANCELLED', 'REFUNDED'],
  DELIVERED: ['COMPLETED', 'REFUNDED'],
  COMPLETED: [],
  CANCELLED: ['REFUNDED'],
  REFUNDED: [],
}

const LEGACY_STATUS_MAP: Record<string, OrderStatus> = {
  pending: 'PRINTER_ASSIGNED',
  confirmed: 'PAYMENT_CONFIRMED',
  finding_printer: 'FINDING_PRINTER',
  printer_assigned: 'PRINTER_ASSIGNED',
  printer_accepted: 'PRINTER_ACCEPTED',
  accepted: 'PRINTER_ACCEPTED',
  in_production: 'PRINTING',
  printing: 'PRINTING',
  quality_check: 'QUALITY_CHECK',
  ready: 'READY',
  shipped: 'DISPATCHED',
  dispatched: 'DISPATCHED',
  delivered: 'DELIVERED',
  completed: 'COMPLETED',
  cancelled: 'CANCELLED',
  refunded: 'REFUNDED',
}

export function normalizeOrderStatus(status: string): OrderStatus {
  if (!status) return 'PENDING_PAYMENT'
  const upper = status.toUpperCase() as OrderStatus
  if (ALLOWED_TRANSITIONS[upper]) return upper
  const lower = status.toLowerCase()
  return LEGACY_STATUS_MAP[lower] || upper
}

/**
 * Validates if moving from currentStatus to targetStatus is allowed by the lifecycle state machine.
 */
export function isValidStatusTransition(currentStatus: string, targetStatus: string): boolean {
  const normCurrent = normalizeOrderStatus(currentStatus)
  const normTarget = normalizeOrderStatus(targetStatus)
  if (normCurrent === normTarget) return true
  const allowed = ALLOWED_TRANSITIONS[normCurrent] || []
  return allowed.includes(normTarget)
}

interface SupabaseQueryBuilder {
  select: (columns?: string) => SupabaseQueryBuilder
  update: (values: Record<string, unknown>) => SupabaseQueryBuilder
  insert: (values: Record<string, unknown> | Array<Record<string, unknown>>) => SupabaseQueryBuilder
  eq: (column: string, value: unknown) => SupabaseQueryBuilder
  maybeSingle: () => Promise<{ data: Record<string, unknown> | null; error: { message: string } | null }>
}

interface SupabaseClientLike {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  from: (table: string) => any
}

export function toDbOrderStatus(status: string): string {
  const norm = normalizeOrderStatus(status)
  switch (norm) {
    case 'PENDING_PAYMENT':
    case 'FINDING_PRINTER':
    case 'PRINTER_ASSIGNED':
      return 'pending'
    case 'PRINTER_ACCEPTED':
    case 'PAYMENT_CONFIRMED':
      return 'accepted'
    case 'PRINTING':
    case 'QUALITY_CHECK':
    case 'READY':
      return 'printing'
    case 'DISPATCHED':
      return 'shipped'
    case 'DELIVERED':
    case 'COMPLETED':
      return 'delivered'
    case 'CANCELLED':
    case 'REFUNDED':
    default:
      return 'cancelled'
  }
}

/**
 * Fetches the canonical rich lifecycle status of an order, preferring the latest entry in order_status_history,
 * and falling back to normalizeOrderStatus(orders.status).
 */
export async function getOrderCanonicalStatus(
  supabase: SupabaseClientLike,
  orderId: string,
  fallbackDbStatus?: string
): Promise<OrderStatus> {
  const { data: latestHistory } = await supabase
    .from('order_status_history')
    .select('status')
    .eq('order_id', orderId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (latestHistory?.status) {
    return normalizeOrderStatus(latestHistory.status)
  }

  if (fallbackDbStatus) {
    return normalizeOrderStatus(fallbackDbStatus)
  }

  const { data: order } = await supabase
    .from('orders')
    .select('status')
    .eq('id', orderId)
    .maybeSingle()

  return normalizeOrderStatus(order?.status || 'PENDING_PAYMENT')
}

/**
 * Updates order status in Supabase database and records an audit log entry in order_status_history atomically.
 */
export async function updateOrderStatus(
  supabase: SupabaseClientLike,
  orderId: string,
  newStatus: OrderStatus,
  notes?: string,
  updatedByUserId?: string,
  currentStatus?: OrderStatus
) {
  let activeStatus = currentStatus
  if (!activeStatus) {
    activeStatus = await getOrderCanonicalStatus(supabase, orderId)
  }

  // Return immediately if status is unchanged
  if (activeStatus && normalizeOrderStatus(activeStatus) === normalizeOrderStatus(newStatus)) {
    return { success: true, notes: 'Status unchanged' }
  }

  // Validate state transition if activeStatus is present
  if (activeStatus && !isValidStatusTransition(activeStatus, newStatus)) {
    console.error(`Invalid order state transition: cannot transition from ${activeStatus} to ${newStatus}`)
    return { success: false, error: `Invalid transition from ${activeStatus} to ${newStatus}` }
  }

  const stepInfo = ORDER_LIFECYCLE_STEPS.find((s) => s.key === newStatus)
  const defaultNotes = stepInfo ? stepInfo.description : `Status updated to ${newStatus}`

  const dbStatus = toDbOrderStatus(newStatus)

  // 1. Update status in orders table FIRST using valid PostgreSQL enum
  const { error: orderError } = await supabase
    .from('orders')
    .update({ status: dbStatus, updated_at: new Date().toISOString() })
    .eq('id', orderId)

  if (orderError) {
    console.error('Orders status update error:', orderError)
    return { success: false, error: orderError.message || 'Failed to update order status in database' }
  }

  // 2. Insert audit entry into order_status_history
  const { error: historyError } = await supabase.from('order_status_history').insert({
    order_id: orderId,
    status: newStatus,
    notes: notes || defaultNotes,
    updated_by: updatedByUserId || null,
    created_at: new Date().toISOString(),
  })

  if (historyError) {
    console.error('Order status history insertion error:', historyError.message)
    // Compensating rollback: Revert orders table to previous status so database remains consistent
    const prevDbStatus = toDbOrderStatus(activeStatus)
    await supabase
      .from('orders')
      .update({ status: prevDbStatus, updated_at: new Date().toISOString() })
      .eq('id', orderId)

    return {
      success: false,
      error: `Failed to record status history audit log: ${historyError.message}`,
    }
  }

  return { success: true, status: newStatus }
}

