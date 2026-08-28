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

  const rawMetaFullName = user.user_metadata?.full_name
  const metaFullName = typeof rawMetaFullName === 'string' && rawMetaFullName.trim() ? rawMetaFullName.trim() : undefined
  const profileFullName = typeof profile?.full_name === 'string' && profile.full_name.trim() ? profile.full_name.trim() : undefined
  const emailName = user.email && typeof user.email === 'string' ? user.email.split('@')[0] : 'Maker'

  const userData = {
    id: user.id,
    email: user.email,
    name: metaFullName || profileFullName || emailName,
    avatar_url: profile?.avatar_url,
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-canvas)', color: 'var(--text-main)', transition: 'background 0.3s ease' }}>
      <Navbar />
      <BuyerDashboardClient user={userData} myRequests={myRequests} myOrders={myOrders} />
      <Footer />
    </main>
  )
}