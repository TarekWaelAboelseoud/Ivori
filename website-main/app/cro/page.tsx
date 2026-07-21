import ServicePageLayout from '@/components/studio/ServicePageLayout'
import { jsonLd, pageMetadata, serviceJsonLd } from '@/lib/seo/site'
import type { Metadata } from 'next'

const description =
  'Premium CRO for Shopify and ecommerce brands in Egypt and MENA. Offer clarity, friction reduction, and purchase flow optimization.'

export const metadata: Metadata = pageMetadata(
  'Shopify CRO Egypt & Ecommerce Conversion Optimization MENA',
  description,
  '/cro'
)

const blocks = [
  {
    title: 'Offer Clarity',
    desc: 'How buyers read your offer in the first seconds and what builds immediate purchase confidence.',
  },
  {
    title: 'Buyer Friction Mapping',
    desc: 'Every hesitation from ad click to checkout, mapped, diagnosed, and prioritized by revenue impact.',
  },
  {
    title: 'Purchase Flow Optimization',
    desc: 'Cart, checkout, and payment tuned for Egypt and MENA expectations including local payment clarity.',
  },
  {
    title: 'Social Proof Architecture',
    desc: 'Reviews, UGC, and credibility signals structured for conversion, not decoration.',
  },
  {
    title: 'Mobile Experience',
    desc: 'Real-buyer mobile review: speed, scroll, CTA visibility, and checkout ease.',
  },
  {
    title: 'Implementation & Testing',
    desc: 'Every recommendation prioritized by buyer impact with implementation support.',
  },
]

export default function CROPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            serviceJsonLd({
              name: 'Ecommerce Conversion Rate Optimization',
              description,
              path: '/cro',
              serviceType: ['Conversion rate optimization', 'Shopify CRO', 'Checkout optimization'],
            })
          ),
        }}
      />
      <ServicePageLayout
        label="Conversion Rate Optimization"
        title={
          <>
            Most stores
            <br />
            lose buyers
            <br />
            <em className="text-[var(--gold)]">before checkout.</em>
          </>
        }
        intro="Operator-led CRO for Shopify brands in Egypt and MENA. We diagnose friction, fix flows, and measure outcomes."
        blocks={blocks}
        approachTitle={
          <>
            Implementation is the work.
            <br />
            <em>Not just the audit.</em>
          </>
        }
        approachBody="Most CRO agencies hand you a list and disappear. We stay for the fix with prioritized actions and hands-on implementation when you need it."
      />
    </>
  )
}
