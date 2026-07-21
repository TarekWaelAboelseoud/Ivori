/**
 * Phase 8F — expansion architecture (documentation-as-code).
 * Do not implement these systems until volume demands it.
 */

export const expansionPaths = [
  {
    id: 'cms',
    title: 'Headless CMS',
    when: '10+ live case studies or weekly content updates',
    recommendation: 'Sanity or Payload with MediaAsset schema from media-registry.ts',
    integrates: ['case-studies', 'ai-gallery', 'visual-assets', '/ar'],
  },
  {
    id: 'portfolio-db',
    title: 'Portfolio in Supabase',
    when: 'Non-dev team needs to publish work',
    recommendation: 'Tables: portfolio_projects, portfolio_media, locales (en/ar)',
    integrates: ['admin/portfolio', 'work/[slug]'],
  },
  {
    id: 'media-library',
    title: 'Studio media library',
    when: 'Real shoots and reels exceed ~50 assets',
    recommendation: 'Supabase Storage + admin upload; CDN via Vercel or Cloudflare',
    integrates: ['media-registry', 'CinematicImage', 'EditorialAtmosphere'],
  },
  {
    id: 'client-portal',
    title: 'Client portal',
    when: 'Retainer clients need shared dashboards',
    recommendation: 'Separate auth (Clerk/Supabase) — never mix with cro_admin cookie',
    integrates: ['orders', 'deliverables', 'inquiries'],
  },
  {
    id: 'analytics',
    title: 'Conversion analytics layer',
    when: 'CRO retainers need before/after proof',
    recommendation: 'Shopify + server-side events; privacy-first, no pixel bloat',
    integrates: ['case study metrics', 'admin leads'],
  },
  {
    id: 'ai-pipeline',
    title: 'AI production pipeline UI',
    when: 'In-house batch generation at scale',
    recommendation: 'Queue jobs in Supabase; admin status board (separate from public site)',
    integrates: ['ai-production', 'admin'],
  },
] as const
