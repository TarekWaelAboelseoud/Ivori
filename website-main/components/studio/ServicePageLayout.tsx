import Footer from '@/components/studio/Footer'
import Nav from '@/components/Nav'
import EditorialHero from '@/components/studio/EditorialHero'
import MotionHeading from '@/components/studio/MotionHeading'
import SectionShell, { SectionContainer } from '@/components/studio/SectionShell'
import ChapterLabel from '@/components/studio/ChapterLabel'
import StudioCTA from '@/components/studio/StudioCTA'

export interface ServiceBlock {
  title: string
  desc: string
}

interface ServicePageLayoutProps {
  label: string
  title: React.ReactNode
  intro: string
  blocks: ServiceBlock[]
  approachTitle: React.ReactNode
  approachBody: string
}

export default function ServicePageLayout({
  label,
  title,
  intro,
  blocks,
  approachTitle,
  approachBody,
}: ServicePageLayoutProps) {
  return (
    <>
      <Nav />
      <main className="bg-[var(--background)]">
        <EditorialHero
          label={label}
          title={
            <MotionHeading as="h1" size="hero" animate measure="display">
              {title}
            </MotionHeading>
          }
          footer={<p className="prose-lead max-w-[var(--measure-lead)]">{intro}</p>}
        />

        <SectionShell size="md" border="top">
          <SectionContainer narrow>
            <ChapterLabel className="mb-10 sm:mb-12">Operator system</ChapterLabel>
            <ul className="divide-y divide-[var(--border)]">
              {blocks.map((block, i) => (
                <li key={block.title} className="py-8 first:pt-0 last:pb-0 sm:py-10">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--gold-mid)]">
                    {String(i + 1).padStart(2, '0')}
                  </p>
                  <h2 className="mt-4 font-display text-[clamp(1.35rem,3vw,2rem)] font-light leading-tight text-[var(--foreground)]">
                    {block.title}
                  </h2>
                  <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--text-body)]">{block.desc}</p>
                </li>
              ))}
            </ul>
          </SectionContainer>
        </SectionShell>

        <SectionShell size="md" border="top">
          <SectionContainer narrow>
            <div className="grid gap-12 lg:grid-cols-[1fr_minmax(0,22rem)] lg:gap-16">
              <div>
                <ChapterLabel>Approach</ChapterLabel>
                <MotionHeading size="section" className="mt-8" measure="section">
                  {approachTitle}
                </MotionHeading>
              </div>
              <div className="lg:pt-10">
                <p className="text-base leading-7 text-[var(--text-body)]">{approachBody}</p>
                <div className="mt-10">
                  <StudioCTA href="/contact">Start a conversation</StudioCTA>
                </div>
              </div>
            </div>
          </SectionContainer>
        </SectionShell>
      </main>
      <Footer />
    </>
  )
}
