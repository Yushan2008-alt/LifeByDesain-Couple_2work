import type { Metadata, Viewport } from 'next'
import './globals.css'
import Nav             from '@/components/layout/Nav'
import Footer          from '@/components/layout/Footer'
import StoreHydration  from '@/components/StoreHydration'

// ── Metadata ──────────────────────────────────────────────
export const metadata: Metadata = {
  title: 'LifebyDesign Couple',
  description: 'Investasi intentional untuk hubunganmu — daily journaling, weekly ritual, dan AI-powered communication.',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: ['/favicon.ico', '/icons/icon-192.png'],
    apple: '/icons/icon-192.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#FFFBF5',
  width: 'device-width',
  initialScale: 1,
}

// ── Root Layout ────────────────────────────────────────────
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
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
