import Nav from '@/components/Nav'
import Footer from '@/components/studio/Footer'
import MotionHeading from '@/components/studio/MotionHeading'
import SectionShell, { SectionContainer } from '@/components/studio/SectionShell'
import ChapterLabel from '@/components/studio/ChapterLabel'
import StudioProcess from '@/components/studio/StudioProcess'
import StudioCTA from '@/components/studio/StudioCTA'
import ImmersiveQuote from '@/components/studio/ImmersiveQuote'
import { studioProcess } from '@/lib/content/process'
import { breadcrumbJsonLd, jsonLd, pageMetadata, webPageJsonLd } from '@/lib/seo/site'
import type { Metadata } from 'next'

export const metadata: Metadata = pageMetadata(
  'Ecommerce Growth Process Egypt & MENA',
  'Ivori Digitals process for ecommerce growth, Shopify CRO, Meta Ads, creative production, and implementation across Egypt and MENA.',
  '/process'
)

export default function ProcessPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            webPageJsonLd({
              name: 'Ivori Digitals ecommerce growth process',
              description: 'Brief, diagnosis, commerce system design, implementation, and measurement for Egypt and MENA ecommerce brands.',
              path: '/process',
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
              { name: 'Process', path: '/process' },
            ])
          ),
        }}
      />
      <Nav />
      <main className="bg-[var(--background)]">
        <SectionShell size="lg" border="bottom">
          <SectionContainer narrow>
            <ChapterLabel>Process</ChapterLabel>
            <MotionHeading as="h1" size="lg" className="mt-8">
              How Ivori
              <br />
              <em>operates.</em>
            </MotionHeading>
            <p className="lead-strong mt-8 max-w-2xl text-lg leading-8">
              A practical growth process for ecommerce brands: diagnose buyer friction, align creative and media, improve Shopify systems, then measure what changed.
            </p>
            <div className="mt-10">
              <StudioCTA href="/work">Selected work</StudioCTA>
            </div>
          </SectionContainer>
        </SectionShell>

        <SectionShell size="lg">
          <SectionContainer narrow>
            <StudioProcess steps={studioProcess} />
          </SectionContainer>
        </SectionShell>

        <SectionShell size="md" border="top">
          <SectionContainer narrow>
            <ImmersiveQuote
              quote={
                <>
                  Cairo.
                  <br />
                  <em>MENA commerce.</em>
                </>
              }
              body="The process stays grounded in real assets, real stores, and practical implementation. No fake case-study numbers are used unless a client supplies verified data."
              cta={{ href: '/contact', label: 'Start a brief' }}
            />
          </SectionContainer>
        </SectionShell>
      </main>
      <Footer />
    </>
  )
}
