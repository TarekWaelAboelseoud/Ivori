/** Production portfolio assets copied from the launch portfolio folder. */

export const campaigns = {
  hero: '/portfolio/ark-studio-01.jpg',
  product: '/portfolio/kvl-commerce-01.jpg',
  adFashion: '/portfolio/kvl-detail-01.jpg',
  video: '/portfolio/ivori-production-reel.mp4',
  videoPoster: '/portfolio/ark-studio-01.jpg',
  ugc: '/portfolio/ark-studio-01.jpg',
  compareBefore: '/portfolio/kvl-commerce-01.jpg',
  compareAfter: '/portfolio/kvl-detail-01.jpg',
} as const

export type CampaignKey = keyof typeof campaigns

export const gallerySequence = [
  { id: 'hero', src: campaigns.hero, label: 'Production still', detail: 'ARK/KVL portfolio asset' },
  { id: 'product', src: campaigns.product, label: 'Commerce still', detail: 'KVL visual direction' },
  { id: 'ad', src: campaigns.adFashion, label: 'Detail frame', detail: 'Product and campaign texture' },
  { id: 'video', src: campaigns.video, label: 'Studio frame', detail: 'Production environment' },
  { id: 'ugc', src: campaigns.ugc, label: 'Social-ready frame', detail: 'Real portfolio asset' },
] as const

export const portfolioAssets = [
  {
    id: 'ivori-production-reel',
    src: '/portfolio/ivori-production-reel.mp4',
    source: 'C:/Users/drbbo/Downloads/portfolio/final 4.mov',
    client: 'Ivori Digitals',
    type: 'video',
  },
  {
    id: 'ark-production-01',
    src: '/portfolio/ark-production-01.jpg',
    source: 'C:/Users/drbbo/Downloads/portfolio/DSC03101.jpg',
    client: 'ARK',
    type: 'photo',
  },
  {
    id: 'ark-studio-01',
    src: '/portfolio/ark-studio-01.jpg',
    source: 'C:/Users/drbbo/Downloads/portfolio/DSC02896-2 (1).jpg',
    client: 'ARK',
    type: 'photo',
  },
  {
    id: 'kvl-commerce-01',
    src: '/portfolio/kvl-commerce-01.jpg',
    source: 'C:/Users/drbbo/Downloads/portfolio/DSC02975 (1).jpg',
    client: 'KVL',
    type: 'photo',
  },
  {
    id: 'kvl-detail-01',
    src: '/portfolio/kvl-detail-01.jpg',
    source: 'C:/Users/drbbo/Downloads/portfolio/DSC03329 (1).jpg',
    client: 'KVL',
    type: 'photo',
  },
] as const
