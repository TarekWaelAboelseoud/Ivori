import HeroAtmosphere from './HeroAtmosphere'
import MotionHeading from './MotionHeading'

/** Typography-led production moment — no fake reel or product shots */
export default function EditorialAtmosphere({
  kicker,
  title,
  body,
}: {
  kicker: string
  title: React.ReactNode
  body: string
}) {
  return (
    <section className="relative py-[var(--space-section-md)] sm:py-[var(--space-section-lg)]">
      <HeroAtmosphere className="opacity-70" />
      <div className="relative mx-auto max-w-[var(--container-narrow)] px-[var(--gutter)]">
        <p className="text-[10px] font-semibold uppercase tracking-[0.38em] text-[var(--gold)]">{kicker}</p>
        <MotionHeading size="display" measure="display" className="mt-[var(--stack-sm)]">
          {title}
        </MotionHeading>
        <p className="prose-body mt-8 max-w-xl">{body}</p>
      </div>
    </section>
  )
}
