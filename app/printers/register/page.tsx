import RegisterPrinterForm from '@/app/dashboard/printer-owner/register/RegisterPrinterForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Register Your 3D Printer Hub | PrintHive India',
  description: 'List your Bambu Lab, Prusa, Creality, or Resin 3D printer on PrintHive India OpenStreetMap. Connect with local print orders and earn 70% payouts.',
}

export default function PublicRegisterPrinterPage() {
  return <RegisterPrinterForm />
}
