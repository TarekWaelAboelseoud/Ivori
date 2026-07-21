/**
 * CMS-ready media registry for real portfolio assets.
 * Future: Supabase storage + admin upload UI pointing at this shape.
 */

export type MediaKind = 'image' | 'video' | 'reel'

export interface MediaAsset {
  id: string
  kind: MediaKind
  src?: string
  videoSrc?: string
  poster?: string
  alt: string
  caption?: string
  aspect?: '16/9' | '4/5' | '3/4' | '1/1' | '21/9'
  priority?: boolean
}

export interface WorkMediaBundle {
  slug: string
  cover: MediaAsset
  gallery: MediaAsset[]
  heroReel?: MediaAsset
}

export const mediaSlots = {
  heroReel: {
    id: 'hero-reel',
    kind: 'reel' as const,
    poster: '/portfolio/ark-production-01.jpg',
    videoSrc: undefined,
    alt: 'ARK production still',
    aspect: '21/9' as const,
  },
  productionFrame: {
    id: 'production-frame',
    kind: 'video' as const,
    poster: '/portfolio/kvl-commerce-01.jpg',
    videoSrc: undefined,
    alt: 'KVL commerce still',
    aspect: '16/9' as const,
  },
} as const
