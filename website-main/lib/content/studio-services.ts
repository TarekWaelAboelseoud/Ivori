/** Editorial service system — full ecommerce creative stack */

export type ServiceGroupId =
  | 'creative'
  | 'performance'
  | 'commerce'
  | 'intelligence'

export interface StudioService {
  id: string
  title: string
  desc: string
  href?: string
}

export interface ServiceGroup {
  id: ServiceGroupId
  label: string
  chapter: string
  services: StudioService[]
}

export const serviceGroups: ServiceGroup[] = [
  {
    id: 'creative',
    label: 'Creative production',
    chapter: 'I',
    services: [
      { id: 'ai-product', title: 'AI Product Photography', desc: 'SKU-ready scenes, variants, catalog systems', href: '/ai-production' },
      { id: 'ai-fashion', title: 'AI Fashion Campaigns', desc: 'Seasonal drops, lookbooks, paid social suites', href: '/ai-production' },
      { id: 'ai-ugc', title: 'AI UGC Systems', desc: 'Platform-native UGC at production scale', href: '/ai-production' },
      { id: 'motion', title: 'Motion Creative', desc: 'Reels, product motion, launch films', href: '/ai-production' },
      { id: 'editorial', title: 'Editorial Creative', desc: 'Campaign narratives, launch storytelling', href: '/ai-production' },
      { id: 'brand', title: 'Brand Systems', desc: 'Visual language across ads, store, retention', href: '/contact' },
    ],
  },
  {
    id: 'performance',
    label: 'Performance & media',
    chapter: 'II',
    services: [
      { id: 'ad-systems', title: 'Ecommerce Ad Systems', desc: 'Meta creative structure aligned to SKU and offer', href: '/media-buying' },
      { id: 'perf-creative', title: 'Performance Creative', desc: 'Test matrices, hooks, angles, fatigue refresh', href: '/media-buying' },
      { id: 'media', title: 'Media Buying', desc: 'Spend systems tied to landing and checkout reality', href: '/media-buying' },
      { id: 'launch', title: 'Launch Campaigns', desc: 'Coordinated creative + page + offer launches', href: '/contact' },
      { id: 'offer', title: 'Offer Engineering', desc: 'Bundles, urgency, clarity without discount noise', href: '/cro' },
    ],
  },
  {
    id: 'commerce',
    label: 'Commerce stack',
    chapter: 'III',
    services: [
      { id: 'cro', title: 'CRO Systems', desc: 'Friction maps, flows, mobile purchase confidence', href: '/cro' },
      { id: 'shopify', title: 'Shopify Engineering', desc: 'Theme, speed, trust, implementation', href: '/shopify' },
      { id: 'landing', title: 'Landing Systems', desc: 'Message match from ad click to first scroll', href: '/cro' },
      { id: 'retention', title: 'Retention Systems', desc: 'Post-purchase, WhatsApp, repeat purchase paths', href: '/contact' },
      { id: 'automation', title: 'Creative Automation', desc: 'Brief-to-asset pipelines, refresh cadence', href: '/ai-production' },
    ],
  },
  {
    id: 'intelligence',
    label: 'Intelligence',
    chapter: 'IV',
    services: [
      { id: 'analytics', title: 'Analytics Systems', desc: 'Funnel truth, step-level measurement', href: '/cro' },
      { id: 'ecom-intel', title: 'Ecommerce Intelligence', desc: 'Category patterns, buyer hesitation signals', href: '/contact' },
      { id: 'conversion', title: 'Conversion Strategy', desc: 'Prioritized roadmap across store and ads', href: '/cro' },
      { id: 'story', title: 'Visual Storytelling', desc: 'Narrative systems from ad to PDP to checkout', href: '/process' },
      { id: 'pipeline', title: 'Production Pipelines', desc: 'Operator workflows, handoffs, delivery rhythm', href: '/ai-production' },
    ],
  },
]

export const serviceGroupsAr: ServiceGroup[] = [
  {
    id: 'creative',
    label: 'الإنتاج الإبداعي',
    chapter: 'I',
    services: [
      { id: 'ai-product', title: 'تصوير منتجات بالذكاء الاصطناعي', desc: 'مشاهد SKU وكتالوج', href: '/ai-production' },
      { id: 'ai-fashion', title: 'حملات أزياء', desc: 'إطلاقات ومكتبات lookbook', href: '/ai-production' },
      { id: 'ai-ugc', title: 'أنظمة UGC', desc: 'محتوى اجتماعي قابل للتوسع', href: '/ai-production' },
      { id: 'motion', title: 'موشن وإعلانات فيديو', desc: 'Reels وإطلاقات', href: '/ai-production' },
    ],
  },
  {
    id: 'performance',
    label: 'الأداء والإعلانات',
    chapter: 'II',
    services: [
      { id: 'ad-systems', title: 'أنظمة إعلانات المتجر', desc: 'Meta مرتبطة بالعرض والصفحة', href: '/media-buying' },
      { id: 'cro', title: 'تحسين التحويل', desc: 'مسار الشراء والثقة', href: '/cro' },
      { id: 'shopify', title: 'هندسة Shopify', desc: 'سرعة وتنفيذ', href: '/shopify' },
    ],
  },
  {
    id: 'commerce',
    label: 'أنظمة التجارة',
    chapter: 'III',
    services: [
      { id: 'landing', title: 'صفحات الهبوط', desc: 'تطابق الإعلان مع الصفحة', href: '/cro' },
      { id: 'retention', title: 'الاحتفاظ بالعملاء', desc: 'واتساب وما بعد الشراء', href: '/contact' },
    ],
  },
  {
    id: 'intelligence',
    label: 'الذكاء التشغيلي',
    chapter: 'IV',
    services: [
      { id: 'analytics', title: 'التحليلات', desc: 'قياس خطوة بخطوة', href: '/cro' },
      { id: 'conversion', title: 'استراتيجية التحويل', desc: 'أولويات المتجر والإعلان', href: '/cro' },
    ],
  },
]
