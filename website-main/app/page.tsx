import Nav from '@/components/Nav'
import Footer from '@/components/studio/Footer'
import CinematicHero from '@/components/studio/CinematicHero'
import MotionHeading from '@/components/studio/MotionHeading'
import SectionShell, { SectionContainer } from '@/components/studio/SectionShell'
import ChapterLabel from '@/components/studio/ChapterLabel'
import StudioCTA from '@/components/studio/StudioCTA'
import EditorialSystems from '@/components/studio/EditorialSystems'
import SelectedWorkTeaser from '@/components/studio/SelectedWorkTeaser'
import StudioProcess from '@/components/studio/StudioProcess'
import { studioProcess } from '@/lib/content/process'
import { serviceGroups } from '@/lib/content/studio-services'
import { faqJsonLd, jsonLd, pageMetadata, webPageJsonLd } from '@/lib/seo/site'
import type { Metadata } from 'next'

export const metadata: Metadata = pageMetadata(
  'Ivori Digitals | Premium Ecommerce & CRO Studio · Egypt & MENA',
  'Ivori Digitals is a Cairo-based premium ecommerce growth, Shopify CRO, and perception engineering studio for fashion and commerce brands in Egypt and MENA.',
  '/'
)

export default function HomePage() {
  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            webPageJsonLd({
              name: 'Ivori Digitals premium ecommerce studio',
              description:
                'Ivori Digitals is a premium ecommerce growth and perception engineering studio in Egypt and MENA.',
              path: '/',
            })
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            faqJsonLd([
              {
                question: 'What is Ivori Digitals?',
                answer:
                  'Ivori Digitals is a Cairo-based premium ecommerce growth and perception engineering studio for modern brands in Egypt and MENA.',
              },
              {
                question: 'What does Ivori Digitals specialize in?',
                answer:
                  'The studio specializes in Shopify systems, ecommerce CRO, AI creative production, performance creative, and fashion ecommerce positioning.',
              },
              {
                question: 'Where does Ivori Digitals operate?',
                answer:
                  'Ivori Digitals operates from Cairo and serves ecommerce, fashion, and lifestyle brands across Egypt and MENA.',
              },
            ])
          ),
        }}
      />
      <Nav />
      <main className="bg-[var(--background)]">
        <CinematicHero
          chapter="01"
          label="Ivori Digitals / Egypt & MENA"
          visual="abstract"
          lead="Ivori Digitals is a Cairo-based ecommerce growth studio for Shopify CRO, performance creative, Meta Ads, and commerce operations across Egypt and MENA."
          title={
            <MotionHeading as="h1" size="hero" animate measure="hero">
              Ivori
              <br />
              Digitals
              <br />
              <em className="text-[var(--gold)]">commerce systems.</em>
            </MotionHeading>
          }
          cta={{ href: '/contact', label: 'Start a project' }}
          secondaryCta={{ href: '/work', label: 'Latest work' }}
          footer={
            <p className="max-w-[18rem] text-[10px] font-medium uppercase leading-5 tracking-[0.16em] text-[var(--text-label)] sm:max-w-none sm:tracking-[0.3em]">
              IVORI DIGITALS / SHOPIFY CRO / META ADS / CREATIVE
            </p>
          }
        />

        <SectionShell id="chapter-problem" size="sm" border="top">
          <SectionContainer>
            <div className="grid gap-10 lg:grid-cols-[minmax(0,11rem)_1fr] lg:gap-16">
              <ChapterLabel chapter="02">The fracture</ChapterLabel>
              <div>
                <MotionHeading size="display" measure="display">
                  Premium growth breaks
                  <br />
                  <em>when systems drift.</em>
                </MotionHeading>
                <ul className="mt-8 space-y-3 border-t border-[var(--border)] pt-7 sm:mt-10 sm:space-y-4 sm:pt-8">
                  {[
                    'Ad promise and product story misaligned',
                    'Mobile purchase confidence diluted',
                    'Payment clarity introduced too late',
                  ].map((line, i) => (
                    <li key={line} className="flex gap-4 text-[var(--text-body)] sm:gap-5">
                      <span className="shrink-0 text-sm font-semibold tabular-nums text-[var(--gold-mid)]">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="prose-body">{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </SectionContainer>
        </SectionShell>

        <SectionShell size="sm" border="top">
          <SectionContainer>
            <SelectedWorkTeaser />
          </SectionContainer>
        </SectionShell>

        <SectionShell size="sm" border="top">
          <SectionContainer>
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
              <div>
                <ChapterLabel chapter="04">Studio evidence</ChapterLabel>
                <MotionHeading size="section" measure="section" className="mt-6">
                  Production work,
                  <br />
                  documented clearly.
                </MotionHeading>
                <p className="prose-body mt-5">
                  Selected motion from Ivori production — used to show texture and direction, not as filler.
                </p>
              </div>
              <div className="overflow-hidden border border-[var(--border)] bg-[var(--surface)]">
                <video
                  className="aspect-video h-full w-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  poster="/portfolio/ark-studio-01.jpg"
                  aria-label="Ivori Digitals production sample"
                >
                  <source src="/portfolio/ivori-production-reel.mp4" type="video/mp4" />
                </video>
              </div>
            </div>
          </SectionContainer>
        </SectionShell>

        <SectionShell size="sm" border="y">
          <SectionContainer narrow>
            <ChapterLabel chapter="05" className="mb-8 sm:mb-10">
              Ivori systems
            </ChapterLabel>
            <EditorialSystems groups={serviceGroups} />
            <div className="mt-10 flex flex-wrap gap-6 sm:mt-12">
              <StudioCTA href="/process">Ivori process</StudioCTA>
              <StudioCTA href="/ai-production">AI production</StudioCTA>
            </div>
          </SectionContainer>
        </SectionShell>

        <SectionShell size="sm" border="top">
          <SectionContainer narrow>
            <ChapterLabel chapter="06" className="mb-8 sm:mb-10">
              Process
            </ChapterLabel>
            <StudioProcess steps={studioProcess} />
          </SectionContainer>
        </SectionShell>

        <SectionShell size="sm" border="top" reveal={false}>
          <SectionContainer>
            <div className="flex flex-col gap-10 sm:flex-row sm:items-end sm:justify-between sm:gap-12">
              <MotionHeading size="display" measure="display">
                A clear
                <br />
                <em className="text-[var(--gold)]">brief.</em>
              </MotionHeading>
              <StudioCTA href="/contact" variant="pill">
                Start a conversation
              </StudioCTA>
            </div>
          </SectionContainer>
        </SectionShell>
      </main>
      <Footer />
    </div>
  )
}
