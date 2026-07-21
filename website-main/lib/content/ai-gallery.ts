import { campaigns } from './visual-assets'

export const aiGalleryItems = [
  {
    id: 'production',
    category: 'Production direction',
    detail: 'Real portfolio assets prepared for commerce use',
    imageSrc: campaigns.hero,
    accent: 'rgba(201,169,106,0.55)',
    tall: true,
  },
  {
    id: 'commerce',
    category: 'Commerce visuals',
    detail: 'Product and campaign frames for storefronts',
    imageSrc: campaigns.product,
    accent: 'rgba(190,150,80,0.5)',
  },
]

export const aiCapabilities = [
  {
    title: 'Production Asset Systems',
    desc: 'Organized image sets, campaign frames, and reusable creative directions for store and social use.',
    detail: 'Built from real supplied assets or clearly scoped AI-assisted production.',
    accent: 'var(--gold)',
  },
  {
    title: 'Commerce Creative Direction',
    desc: 'Visual hierarchy for product pages, launch sections, ads, and content modules.',
    detail: 'No placeholder reels or invented campaign results.',
    accent: 'var(--accent-amber)',
  },
  {
    title: 'AI-Assisted Production',
    desc: 'AI is used as production infrastructure when it helps the brand move faster without misrepresenting the work.',
    detail: 'Scoped per brief and reviewed against brand standards.',
    accent: 'var(--accent-blue)',
  },
]
