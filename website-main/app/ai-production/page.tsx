import Nav from '@/components/Nav'
import Footer from '@/components/studio/Footer'
import CinematicHero from '@/components/studio/CinematicHero'
import MotionHeading from '@/components/studio/MotionHeading'
import SectionShell, { SectionContainer } from '@/components/studio/SectionShell'
import ChapterLabel from '@/components/studio/ChapterLabel'
import StatRow from '@/components/studio/StatRow'
import ImmersiveQuote from '@/components/studio/ImmersiveQuote'
import Reveal from '@/components/studio/Reveal'
import CinematicDivider from '@/components/studio/CinematicDivider'
import EditorialContrast from '@/components/studio/EditorialContrast'
import EditorialAtmosphere from '@/components/studio/EditorialAtmosphere'
import { aiCapabilities } from '@/lib/content/ai-gallery'
import { jsonLd, pageMetadata, serviceJsonLd } from '@/lib/seo/site'
import type { Metadata } from 'next'

export const metadata: Metadata = pageMetadata(
  'Performance Creative & AI Production MENA',
  'Production and AI-assisted creative infrastructure for commerce brands, built around real assets and clear briefs.',
  '/ai-production'
)

const stats = [
  { value: 'Brief-led', label: 'Scope defined before production' },
  { value: 'Multi-format', label: 'Static, carousel, story, UGC' },
  { value: 'On-brand', label: 'Visual language per SKU or campaign' },
  { value: 'MENA', label: 'Market-native output' },
]

export default function AIProductionPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            serviceJsonLd({
              name: 'Production Systems for Ecommerce',
              description:
                'Production and AI-assisted creative infrastructure for commerce brands, built around real assets and clear briefs.',
              path: '/ai-production',
              serviceType: ['Production asset systems', 'Commerce creative direction', 'AI-assisted production'],
            })
          ),
        }}
      />
      <Nav />
      <main className="bg-[var(--background)]">
        <CinematicHero
          chapter="AI"
          label="AI Production"
          visual="abstract"
          lead="Production direction, commerce-ready assets, and AI-assisted workflows when they genuinely help."
          title={
            <MotionHeading as="h1" size="hero" animate measure="hero">
              Production
              <br />
              infrastructure
              <br />
              <em className="text-[var(--gold)]">for brands.</em>
            </MotionHeading>
          }
          cta={{ href: '/contact', label: 'Start a project' }}
          footer={
            <div className="flex flex-wrap gap-x-8 gap-y-2">
              {['Product', 'Fashion', 'UGC', 'Motion', 'Scale'].map((item) => (
                <span key={item} className="text-[10px] font-medium uppercase tracking-[0.3em] text-white/40">
                  {item}
                </span>
              ))}
            </div>
          }
        />

        <EditorialAtmosphere
          kicker="Infrastructure"
          title={
            <>
              Built for
              <br />
              <em className="text-[var(--gold)]">volume and clarity.</em>
            </>
          }
          body="We treat production as infrastructure — brief in, on-brand assets out, structured for ads and store without pretending to be a legacy campaign house."
        />

        <SectionShell size="sm" border="top">
          <SectionContainer>
            <div className="overflow-hidden border border-[var(--border)] bg-[var(--surface)]">
              <video
                className="aspect-video h-full w-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                poster="/portfolio/ark-studio-01.jpg"
                aria-label="Ivori Digitals production workflow reel"
              >
                <source src="/portfolio/ivori-production-reel.mp4" type="video/mp4" />
              </video>
            </div>
          </SectionContainer>
        </SectionShell>

        <SectionShell size="sm" border="top" reveal={false}>
          <SectionContainer narrow>
            <StatRow stats={stats} className="gap-y-8" />
          </SectionContainer>
        </SectionShell>

        <SectionShell size="md">
          <SectionContainer narrow>
            <ChapterLabel className="mb-10">The shift</ChapterLabel>
            <EditorialContrast />
            <p className="prose-body mt-10 max-w-2xl">
              One brief. On-brand output at scale. Built for teams that outpace traditional production cycles.
            </p>
          </SectionContainer>
        </SectionShell>

        <SectionShell size="lg" border="top">
          <SectionContainer>
            <ChapterLabel className="mb-10">Capabilities</ChapterLabel>
            <MotionHeading size="display" measure="display" className="mb-[var(--stack-lg)]">
              Production
              <br />
              <em>production.</em>
            </MotionHeading>
            <div className="divide-y divide-[var(--border)]">
              {aiCapabilities.map((cap, i) => (
                <Reveal key={cap.title} delay={i * 70}>
                  <article className="grid gap-6 py-12 lg:grid-cols-[1fr_minmax(0,22rem)] lg:gap-14 lg:py-16">
                    <div>
                      <div className="mb-3 flex items-center gap-4">
                        <span className="text-[10px] font-semibold text-[var(--text-dim)]">0{i + 1}</span>
                        <span className="h-px w-10" style={{ background: cap.accent }} />
                      </div>
                      <h2 className="font-display text-[clamp(1.5rem,4vw,2.75rem)] font-light leading-[1.08] text-[var(--foreground)]">
                        {cap.title}
                      </h2>
                    </div>
                    <div className="lg:pt-6">
                      <p className="prose-body">{cap.desc}</p>
                      <p className="mt-3 text-sm text-[var(--text-secondary)]">{cap.detail}</p>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </SectionContainer>
        </SectionShell>

        <CinematicDivider className="mx-auto max-w-[var(--container-narrow)] px-[var(--gutter)]" />

        <SectionShell size="lg">
          <SectionContainer narrow>
            <ImmersiveQuote
              quote={
                <>
                  Production
                  <br />
                  should be useful
                  <br />
                  <em>before it is loud.</em>
                </>
              }
              body="We use real assets, clear briefs, and practical production systems so brand content can support store pages, ads, and launch workflows."
              cta={{ href: '/contact', label: 'Reshape your production' }}
            />
          </SectionContainer>
        </SectionShell>
      </main>
      <Footer />
    </>
  )
}
