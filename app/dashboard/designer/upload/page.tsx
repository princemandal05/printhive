import { requireRole } from '@/utils/supabase/require-role'
import UploadDesignForm from './UploadDesignForm'

export default async function UploadDesignPage() {
  await requireRole('designer')
  return <UploadDesignForm />
}