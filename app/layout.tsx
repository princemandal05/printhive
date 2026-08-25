import type { Metadata } from 'next'
import { Fraunces, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import './landing.css'
import { StoreProvider } from '@/lib/cart-context'

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-fraunces',
  display: 'swap',
})

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'PrintHive — Capability-Based 3D Commerce & Additive Manufacturing Platform',
  description:
    'PrintHive connects 3D model designers, printer owners, and buyers on a capability-based 3D printing marketplace.',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${fraunces.variable} ${plusJakartaSans.variable}`}>
      <body className="bg-cream text-ink min-h-screen overflow-x-hidden antialiased" style={{ fontFamily: 'var(--font-jakarta), -apple-system, sans-serif' }}>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  )
}