import type { MetadataRoute } from 'next'
import { siteConfig } from '@/lib/seo/site'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteConfig.name} | Premium Ecommerce & CRO Studio`,
    short_name: siteConfig.name,
    description: siteConfig.description,
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#080807',
    theme_color: '#080807',
    categories: ['business', 'productivity', 'shopping'],
    lang: 'en-EG',
    icons: [
      {
        src: '/icon/32',
        sizes: '32x32',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon/192',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon/512',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/ivori-icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
  }
}
