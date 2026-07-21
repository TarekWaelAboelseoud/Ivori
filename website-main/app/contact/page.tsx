import ContactClient from './ContactClient'
import { breadcrumbJsonLd, jsonLd, pageMetadata, webPageJsonLd } from '@/lib/seo/site'
import type { Metadata } from 'next'

export const metadata: Metadata = pageMetadata(
  'Contact Ivori Digitals Ecommerce Growth Studio Egypt',
  'Contact Ivori Digitals for Shopify CRO, ecommerce growth, Meta Ads, performance creative, and conversion optimization in Egypt and MENA.',
  '/contact'
)

export default function ContactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            webPageJsonLd({
              name: 'Contact Ivori Digitals',
              description: 'Contact Ivori Digitals for ecommerce growth services in Egypt and MENA.',
              path: '/contact',
            })
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            breadcrumbJsonLd([
              { name: 'Ivori Digitals', path: '/' },
              { name: 'Contact', path: '/contact' },
            ])
          ),
        }}
      />
      <ContactClient />
    </>
  )
}
