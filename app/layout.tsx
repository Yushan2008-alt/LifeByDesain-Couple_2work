import type { Metadata, Viewport } from 'next'
import { Playfair_Display, DM_Sans } from 'next/font/google'
import './globals.css'
import Nav             from '@/components/layout/Nav'
import Footer          from '@/components/layout/Footer'
import StoreHydration  from '@/components/StoreHydration'

// ── Fonts ─────────────────────────────────────────────────
const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

// ── Metadata ──────────────────────────────────────────────
export const metadata: Metadata = {
  title: 'LifebyDesign Couple',
  description: 'Investasi intentional untuk hubunganmu — daily journaling, weekly ritual, dan AI-powered communication.',
  icons: { icon: '/favicon.ico' },
}

export const viewport: Viewport = {
  themeColor: '#FFFBF5',
  width: 'device-width',
  initialScale: 1,
}

// ── Root Layout ────────────────────────────────────────────
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${playfair.variable} ${dmSans.variable}`}>
      <body
        style={{
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          background: '#FFFBF5',
        }}
      >
        <StoreHydration />
        <Nav />
        <main style={{ flex: 1 }}>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
