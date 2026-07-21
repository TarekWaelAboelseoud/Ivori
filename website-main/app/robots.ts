import type { MetadataRoute } from 'next'
import { siteConfig } from '@/lib/seo/site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/order/',
        '/success/',
        '/studio-ops/',
        '/admin/',
        '/api/',
      ],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  }
}
