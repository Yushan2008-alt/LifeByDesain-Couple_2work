import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'LifebyDesign Couple',
    short_name: 'LifebyDesign',
    description: 'Daily journaling, weekly ritual, dan insight hubungan yang intentional.',
    start_url: '/onboarding',
    display: 'standalone',
    background_color: '#FFFBF5',
    theme_color: '#FFFBF5',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
