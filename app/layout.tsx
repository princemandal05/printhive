import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PrintHive — 3D Printing Marketplace',
  description:
    'PrintHive connects 3D model designers, printer owners, and buyers in one trusted marketplace.',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}