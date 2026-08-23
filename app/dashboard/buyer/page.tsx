import { createClient } from '@/utils/supabase/server'
import { requireRole } from '@/utils/supabase/require-role'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import BuyerDashboardClient from './BuyerDashboardClient'

export const dynamic = 'force-dynamic'

export default async function BuyerDashboard() {
  const { user } = await requireRole('buyer')
  const supabase = await createClient()

  // Fetch buyer's custom 3D design briefs
  const { data: myRequestsData } = await supabase
    .from('design_requests')
    .select('*')
    .eq('buyer_id', user.id)
    .order('created_at', { ascending: false })

  const myRequests = myRequestsData || []

  // Fetch buyer's live orders
  const { data: myOrdersData } = await supabase
    .from('orders')
    .select('*')
    .eq('buyer_id', user.id)
    .order('created_at', { ascending: false })

  const myOrders = myOrdersData || []

  // Fetch user profile info
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('id', user.id)
    .maybeSingle()

  const userData = {
    id: user.id,
    email: user.email,
    name: profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0],
    avatar_url: profile?.avatar_url,
  }

  return (
    <main style={{ minHeight: '100vh', background: '#FAF8F5', color: '#0F172A' }}>
      <Navbar />
      <BuyerDashboardClient user={userData} myRequests={myRequests} myOrders={myOrders} />
      <Footer />
    </main>
  )
}