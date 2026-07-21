import type { Metadata } from 'next'
import { fontArabic } from '@/lib/fonts'
import { pageMetadata, siteConfig } from '@/lib/seo/site'

export const metadata: Metadata = {
  ...pageMetadata(
    'إيفوري ديجيتالز - استوديو تجارة إلكترونية فاخر في مصر والمنطقة',
    'استوديو نمو للتجارة الإلكترونية وهندسة الانطباع للعلامات الحديثة في مصر والمنطقة: Shopify، تحسين التحويل، إنتاج إبداعي بالذكاء الاصطناعي، وإعلانات أداء.',
    '/ar'
  ),
  alternates: {
    canonical: `${siteConfig.url}/ar`,
    languages: { 'en-EG': siteConfig.url, 'ar-EG': `${siteConfig.url}/ar`, 'x-default': siteConfig.url },
  },
  openGraph: {
    type: 'website',
    locale: siteConfig.localeAr,
    alternateLocale: [siteConfig.locale],
    url: `${siteConfig.url}/ar`,
    siteName: siteConfig.name,
    title: 'إيفوري ديجيتالز - استوديو تجارة إلكترونية فاخر',
    description:
      'استوديو نمو للتجارة الإلكترونية وهندسة الانطباع للعلامات الحديثة في مصر والمنطقة.',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Ivori Digitals Cairo ecommerce studio' }],
  },
}

export default function ArabicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div dir="rtl" lang="ar" className={fontArabic.className}>
      {children}
    </div>
  )
}
