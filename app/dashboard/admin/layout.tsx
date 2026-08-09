import { requireRole } from '@/utils/supabase/require-role'
import { ReactNode } from 'react'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // Server-side strict RBAC check — requires 'admin' role or redirects unauthorized users
  await requireRole('admin')

  return <>{children}</>
}
