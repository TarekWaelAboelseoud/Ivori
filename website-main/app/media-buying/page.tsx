import ServicePageLayout from '@/components/studio/ServicePageLayout'
import { jsonLd, pageMetadata, serviceJsonLd } from '@/lib/seo/site'
import type { Metadata } from 'next'

const description =
  'Strategic media buying and performance creative for ecommerce and Shopify brands in Egypt and MENA.'

export const metadata: Metadata = pageMetadata(
  'Meta Ads Ecommerce Egypt & Performance Creative MENA',
  description,
  '/media-buying'
)

const blocks = [
  {
    title: 'Meta Campaign Architecture',
    desc: 'Structure, audiences, and funnel mapping built for MENA buying behavior.',
  },
  {
    title: 'Creative Direction',
    desc: 'Ad creative from concept to format, based on buyer psychology and commerce reality.',
  },
  {
    title: 'Ad-to-Page Alignment',
    desc: 'Close the disconnect between ad promise, landing message, product hierarchy, and checkout.',
  },
  {
    title: 'Performance Review',
    desc: 'What works, what wastes budget, and what to test next, with clear reasoning.',
  },
  {
    title: 'Creative Scaling Systems',
    desc: 'Produce, test, and iterate at scale, especially with AI-native production pipelines.',
  },
  {
    title: 'Budget Efficiency',
    desc: 'Structure and signals that make every pound, riyal, and dirham work harder.',
  },
]

export default function MediaBuyingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            serviceJsonLd({
              name: 'Ecommerce Media Buying and Performance Creative',
              description,
              path: '/media-buying',
              serviceType: ['Media buying', 'Performance creative', 'Meta advertising'],
            })
          ),
        }}
      />
      <ServicePageLayout
        label="Media Buying & Creative"
        title={
          <>
            Paid media that
            <br />
            converts, not just
            <br />
            <em className="text-[var(--gold)]">reaches.</em>
          </>
        }
        intro="Strategic Meta campaigns and creative systems for MENA ecommerce. Aligned from ad click to checkout."
        blocks={blocks}
        approachTitle={
          <>
            Creative and media
            <br />
            <em>as one system.</em>
          </>
        }
        approachBody="We pair media buying with CRO and AI production so post-click performance is built into the campaign architecture."
      />
    </>
  )
}
