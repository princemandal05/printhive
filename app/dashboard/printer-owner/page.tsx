import { createClient } from '@/utils/supabase/server'
import { requireRole } from '@/utils/supabase/require-role'
import PrinterOwnerClient, { type PrinterHub, type OrderJob } from './PrinterOwnerClient'

export default async function PrinterOwnerDashboardPage() {
  const { user } = await requireRole('printer_owner')

  let initialPrinters: PrinterHub[] = []
  let initialOrders: OrderJob[] = []

  try {
    const supabase = await createClient()

    // 1. Query real registered printers for authenticated user
    const { data: dbPrinters } = await supabase
      .from('printers')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })

    if (dbPrinters && dbPrinters.length > 0) {
      initialPrinters = dbPrinters.map((p) => ({
        id: p.id,
        name: p.printer_model || p.name || '3D Printer Unit',
        model: p.printer_model || 'FDM Precision',
        technology: p.technology || 'FDM Precision',
        volume: p.build_volume || '220 x 220 x 250 mm',
        resolution: p.max_resolution || '0.05 mm',
        working_hours: p.working_hours || '09:00 AM - 09:00 PM',
        base_price: p.base_price || 350,
        status: p.status || 'online',
        is_active: p.is_active ?? true,
        rating: typeof p.rating === 'number' ? p.rating : 0.0,
        address: p.address || 'India GPS Location',
        image_url: p.image_url || '',
      }))
    }

    // 2. Query real print jobs assigned to user's printers or profile with latest canonical status history
    const { data: dbOrders } = await supabase
      .from('orders')
      .select('*, order_status_history(status, created_at)')
      .eq('printer_owner_id', user.id)
      .order('created_at', { ascending: false })

    if (dbOrders && dbOrders.length > 0) {
      initialOrders = dbOrders.map((o: any) => {
        let canonicalStatus = o.status || 'pending'
        if (Array.isArray(o.order_status_history) && o.order_status_history.length > 0) {
          const sorted = [...o.order_status_history].sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
          if (sorted[0]?.status) {
            canonicalStatus = sorted[0].status
          }
        }

        return {
          id: o.id,
          created_at: o.created_at,
          status: canonicalStatus,
          material: o.material || 'PLA',
          color: o.color || 'Default',
          quantity: o.quantity || 1,
          total: o.total_amount || o.total_price || o.total || 0,
          payout: typeof o.printer_share === 'number' && o.printer_share > 0 ? o.printer_share : Math.round((o.total_amount || 0) * 0.7),
        }
      })
    }
  } catch (err) {
    console.warn('Printer dashboard fetch note:', err)
  }

  const userProfile = {
    id: user.id,
    email: user.email,
    full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0],
    avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
  }

  return (
    <PrinterOwnerClient
      user={userProfile}
      initialPrinters={initialPrinters}
      initialOrders={initialOrders}
    />
  )
}