import { requireRole } from '@/utils/supabase/require-role'
import RegisterPrinterForm from './RegisterPrinterForm'

export default async function RegisterPrinterPage() {
  await requireRole('printer_owner')
  return <RegisterPrinterForm />
}