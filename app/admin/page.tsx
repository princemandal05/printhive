import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { isPlatformOwner } from '@/utils/supabase/require-role'

export default async function AdminRootPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const isOwner = isPlatformOwner(user?.email)

  if (isOwner) {
    redirect('/dashboard/admin')
  }

  redirect('/admin/login')
}
