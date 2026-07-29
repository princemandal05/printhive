import { notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import DesignDetailClient from './DesignDetailClient'

export default async function DesignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: design, error } = await supabase
    .from('designs')
    .select('*, designer:profiles!designs_designer_id_fkey(id, full_name)')
    .eq('id', id)
    .single()

  if (error || !design) notFound()

  const { data: rawReviews } = await supabase
    .from('reviews')
    .select('rating, review_text, buyer:profiles(full_name), order:orders!inner(design_id)')
    .eq('order.design_id', id)
    .order('created_at', { ascending: false })

  const reviews = (rawReviews ?? []).map((r: any) => ({
    rating: r.rating,
    review_text: r.review_text,
    buyer: Array.isArray(r.buyer) ? r.buyer[0] ?? null : r.buyer,
  }))

  return (
    <main>
      <Navbar />
      <DesignDetailClient design={design} reviews={reviews} />
      <Footer />
    </main>
  )
}