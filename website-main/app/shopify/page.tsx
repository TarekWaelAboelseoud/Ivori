import ServicePageLayout from '@/components/studio/ServicePageLayout'
import { jsonLd, pageMetadata, serviceJsonLd } from '@/lib/seo/site'
import type { Metadata } from 'next'

const description =
  'Premium Shopify systems, speed optimization, theme architecture, and implementation for ecommerce brands in Egypt and MENA.'

export const metadata: Metadata = pageMetadata('Shopify Agency Egypt for Premium Ecommerce', description, '/shopify')

const blocks = [
  {
    title: 'Theme Architecture',
    desc: 'Clean structure that supports conversion, speed, and future campaigns without theme bloat.',
  },
  {
    title: 'Speed & Core Web Vitals',
    desc: 'LCP, mobile performance, and image discipline for buyers on mid-tier devices.',
  },
  {
    title: 'Product Page Systems',
    desc: 'Hierarchy, trust, and offer clarity on the pages that actually close sales.',
  },
  {
    title: 'Checkout & Payments',
    desc: 'COD, wallets, Instapay clarity, and friction reduction at the moment of commitment.',
  },
  {
    title: 'Apps & Integrations',
    desc: 'Only what earns its place: reviews, tracking, WhatsApp, and automation that supports growth.',
  },
  {
    title: 'Implementation',
    desc: 'Theme edits, sections, launch support, and technical execution rather than audit-only advice.',
  },
]

export default function ShopifyPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            serviceJsonLd({
              name: 'Shopify Systems for Premium Ecommerce',
              description,
              path: '/shopify',
              serviceType: ['Shopify development', 'Shopify optimization', 'Ecommerce engineering'],
            })
          ),
        }}
      />
      <ServicePageLayout
        label="Shopify Systems"
        title={
          <>
            Your store is
            <br />
            the product.
            <br />
            <em className="text-[var(--gold)]">Engineer it.</em>
          </>
        }
        intro="Shopify optimization for brands that need speed, trust, and implementation, not another audit PDF."
        blocks={blocks}
        approachTitle={
          <>
            Performance is
            <br />
            <em>trust.</em>
          </>
        }
        approachBody="MENA buyers decide on mobile, fast. We rebuild the technical and experiential layer of your Shopify store so ads and creative have somewhere real to convert."
      />
    </>
  )
}
