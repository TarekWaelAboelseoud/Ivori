import type { MetadataRoute } from 'next'
import { siteConfig } from '@/lib/seo/site'
import { selectedWork } from '@/lib/content/selected-work'
import { studioNotes } from '@/lib/content/notes'

const now = new Date()

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url
  const staticRoutes = [
    '',
    '/ar',
    '/contact',
    '/process',
    '/work',
    '/ai-production',
    '/cro',
    '/media-buying',
    '/shopify',
    '/notes',
  ]

  const staticEntries = staticRoutes.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority:
      path === ''
        ? 1
        : path === '/ar'
          ? 0.9
          : path === '/work'
            ? 0.88
            : path === '/contact' || path === '/process'
              ? 0.84
              : 0.8,
    alternates:
      path === '' || path === '/ar'
        ? {
            languages: {
              'en-EG': base,
              'ar-EG': `${base}/ar`,
            },
          }
        : undefined,
  }))

  const workEntries = selectedWork.map((w) => ({
    url: `${base}/work/${w.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: w.flagship ? 0.92 : w.featured ? 0.82 : 0.72,
  }))

  const noteEntries = studioNotes.map((n) => ({
    url: `${base}/notes/${n.slug}`,
    lastModified: now,
    changeFrequency: 'yearly' as const,
    priority: 0.62,
  }))

  return [...staticEntries, ...workEntries, ...noteEntries]
}
