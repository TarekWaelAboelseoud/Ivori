/** Editorial observations — not a blog, not SEO spam */

export interface StudioNote {
  slug: string
  title: string
  date: string
  excerpt: string
  body: string[]
}

export const studioNotes: StudioNote[] = [
  {
    slug: 'luxury-perception-online',
    title: 'Luxury perception is spacing, not decoration',
    date: '2025',
    excerpt: 'Premium ecommerce fails when it explains. Restraint signals confidence.',
    body: [
      'Luxury online is not louder typography or more motion. It is fewer decisions per screen, longer breath between sections, and proof placed with intention.',
      'Fashion and lifestyle brands lose authority when every module competes. Hierarchy is editorial: one hero claim, one path, one payment story.',
      'In MENA, trust is often the product. Shipping, COD, and returns belong in the narrative early — not buried below lifestyle imagery.',
    ],
  },
  {
    slug: 'mobile-checkout-psychology',
    title: 'Mobile checkout is a confidence sequence',
    date: '2025',
    excerpt: 'Drop-off is rarely a single bug. It is accumulated hesitation.',
    body: [
      'Mobile buyers decide in steps: offer clarity, product belief, shipping reality, payment familiarity, final commit.',
      'CRO work that only optimizes button color misses the sequence. Map hesitation, then rebuild the line from ad to confirmation.',
      'Selective measurement beats vanity metrics. Track steps, not impressions.',
    ],
  },
]

export function getStudioNote(slug: string) {
  return studioNotes.find((n) => n.slug === slug)
}
