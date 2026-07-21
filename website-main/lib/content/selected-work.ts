import { campaigns } from './visual-assets'

export type WorkDiscipline =
  | 'positioning'
  | 'ux'
  | 'cro'
  | 'brand'
  | 'shopify'
  | 'media'
  | 'ai-production'

export interface WorkSignal {
  value: string
  label: string
}

export interface WorkVisual {
  src: string
  caption: string
  layout?: 'landscape' | 'portrait' | 'compare' | 'detail'
  compareBefore?: string
  compareAfter?: string
}

export interface WorkVisualSection {
  title: string
  visuals: WorkVisual[]
}

export interface SelectedWork {
  slug: string
  label: string
  title: string
  thesis: string
  vertical: string
  year: string
  disciplines: WorkDiscipline[]
  focus: string[]
  challenge: string
  approach: string
  outcome: string
  coverImage: string
  context?: string
  signals?: WorkSignal[]
  visuals?: WorkVisual[]
  visualSections?: WorkVisualSection[]
  gallery?: string[]
  featured?: boolean
  flagship?: boolean
}

export const selectedWork: SelectedWork[] = [
  {
    slug: 'ark',
    label: 'Production · Commerce',
    title: 'ARK',
    thesis: 'Production and commerce-facing creative assets for an emerging brand presence.',
    vertical: 'Commerce / Production',
    year: '2026',
    disciplines: ['ai-production', 'media', 'brand'],
    focus: [
      'Production asset preparation',
      'Commerce-ready visual framing',
      'Social and storefront usage planning',
      'A cleaner source library for future launches',
    ],
    context:
      'ARK is presented here as current client work using real production material supplied for the launch portfolio.',
    challenge:
      'The work needed to feel usable across store, social, and campaign surfaces without inventing performance claims.',
    approach:
      'Ivori organized the production direction around clear visual hierarchy, reusable frames, and practical output that can support commerce pages and marketing content.',
    outcome:
      'A real visual base for ARK to build from: production stills, cleaner asset selection, and a more credible brand presentation path.',
    coverImage: campaigns.hero,
    signals: [
      { value: 'Real assets', label: 'Portfolio source' },
      { value: 'Production', label: 'Client visuals' },
      { value: 'Commerce', label: 'Usage direction' },
    ],
    visuals: [
      {
        src: campaigns.hero,
        caption: 'ARK production still prepared for commerce and campaign use.',
        layout: 'landscape',
      },
      {
        src: campaigns.ugc,
        caption: 'Secondary ARK frame for social and brand context.',
        layout: 'portrait',
      },
    ],
    gallery: [campaigns.hero, campaigns.ugc],
    featured: true,
    flagship: true,
  },
  {
    slug: 'kvl',
    label: 'Fashion · Commerce',
    title: 'KVL',
    thesis: 'Visual direction and ecommerce presentation support for a fashion-led brand.',
    vertical: 'Fashion / Commerce',
    year: '2026',
    disciplines: ['positioning', 'ux', 'brand', 'cro'],
    focus: [
      'Product image hierarchy',
      'Fashion-commerce presentation',
      'Mobile-first storefront framing',
      'Cleaner project language without invented metrics',
    ],
    context:
      'KVL is included as current client work using real portfolio photography. No performance numbers are claimed without supplied data.',
    challenge:
      'The brand needed a sharper commerce presentation that could carry product detail and fashion mood without relying on inflated claims.',
    approach:
      'Ivori focused the work around image selection, restrained hierarchy, service framing, and practical ecommerce surfaces that support buying confidence.',
    outcome:
      'A more credible KVL work presentation for launch: real visuals, clear services, and no invented results.',
    coverImage: campaigns.product,
    signals: [
      { value: 'Fashion', label: 'Client category' },
      { value: 'Mobile', label: 'Commerce surface' },
      { value: 'Real work', label: 'No invented metrics' },
    ],
    visuals: [
      {
        src: campaigns.product,
        caption: 'KVL commerce still prepared for product-led presentation.',
        layout: 'portrait',
      },
      {
        src: campaigns.adFashion,
        caption: 'KVL detail frame for visual texture and product context.',
        layout: 'landscape',
      },
    ],
    gallery: [campaigns.product, campaigns.adFashion],
    featured: true,
  },
]

export const legacyWorkSlugs = ['kvl-apparel', 'im-zone', 'ecommerce-cro-systems', 'premium-fashion-ecommerce']

export function getSelectedWork(slug: string) {
  return selectedWork.find((w) => w.slug === slug)
}

export function getFeaturedWork() {
  const featured = selectedWork.filter((w) => w.featured)
  const flagship = featured.find((w) => w.flagship)
  if (!flagship) return featured
  return [flagship, ...featured.filter((w) => w.slug !== flagship.slug)]
}

export function getFlagshipWork() {
  return selectedWork.find((w) => w.flagship)
}

export const disciplineLabels: Record<WorkDiscipline, string> = {
  positioning: 'Positioning',
  ux: 'UX',
  cro: 'CRO',
  brand: 'Brand system',
  shopify: 'Shopify',
  media: 'Media',
  'ai-production': 'Production',
}
