import type { Metadata } from 'next'
import { Space_Grotesk, Source_Sans_3 } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import './landing.css'
import { StoreProvider } from '@/lib/cart-context'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
})

const sourceSans3 = Source_Sans_3({
  subsets: ['latin'],
  weight: ['300', '400', '600', '700', '800'],
  variable: '--font-body',
})

export const metadata: Metadata = {
  title: 'PrintHive — Capability-Based 3D Commerce Platform',
  description:
    'PrintHive connects 3D model designers, printer owners, and buyers on a capability-based 3D printing marketplace.',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${spaceGrotesk.variable} ${sourceSans3.variable}`}>
      <body style={{ fontFamily: 'var(--font-body), sans-serif' }}>
        <Script
          id="printhive-theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                var t = localStorage.getItem("printhive-theme") || localStorage.getItem("ateion-theme");
                if (!t) t = "light";
                document.documentElement.setAttribute("data-theme", t);
              })();
            `,
          }}
        />
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  )
}