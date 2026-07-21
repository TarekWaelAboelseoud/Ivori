import MotionHeading from './MotionHeading'
import ChapterLabel from './ChapterLabel'
import HeroAtmosphere from './HeroAtmosphere'
import StudioCTA from './StudioCTA'

const pillars = [
  {
    index: '01',
    title: 'AI-native production',
    body: 'Product, fashion, UGC, and motion — built for modern ecommerce cadence without studio overhead.',
  },
  {
    index: '02',
    title: 'Performance media',
    body: 'Creative with editorial standards. Paid social structured for message match and mobile buyers.',
  },
  {
    index: '03',
    title: 'Commerce experiences',
    body: 'Shopify, CRO, and landing craft engineered for conversion — especially across Egypt and MENA.',
  },
] as const

export default function ProductionNarrative() {
  return (
    <section className="relative overflow-hidden">
      <HeroAtmosphere className="opacity-50" />
      <div className="relative">
        <ChapterLabel chapter="04" tone="gold">
          Production
        </ChapterLabel>
        <MotionHeading size="display" measure="display" className="mt-[var(--stack-sm)]">
          Creative built
          <br />
          <em className="text-[var(--gold)]">for conversion.</em>
        </MotionHeading>
        <p className="prose-lead mt-6">
          Production infrastructure for modern brands — AI-native, performance-ready, commerce-aware.
        </p>
        <ul className="mt-16 space-y-12 sm:space-y-14">
          {pillars.map((pillar) => (
            <li key={pillar.index} className="grid gap-4 sm:grid-cols-[3.5rem_1fr] sm:gap-8">
              <span className="font-display text-2xl font-light tabular-nums text-[var(--gold-mid)] sm:text-3xl">
                {pillar.index}
              </span>
              <div>
                <h3 className="font-display text-[clamp(1.35rem,3.5vw,2.25rem)] font-light leading-tight text-[var(--foreground)]">
                  {pillar.title}
                </h3>
                <p className="prose-body mt-3 max-w-lg">{pillar.body}</p>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-12">
          <StudioCTA href="/ai-production">Explore production →</StudioCTA>
        </div>
      </div>
    </section>
  )
}
