import { requireRole } from '@/utils/supabase/require-role'
import NewProductForm from './NewProductForm'

export default async function NewProductPage() {
  await requireRole('seller')
  return <NewProductForm />
}