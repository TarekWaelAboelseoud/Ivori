import Image from 'next/image'
import type { WorkSignal, WorkVisual, WorkVisualSection } from '@/lib/content/selected-work'

export function WorkSignals({ signals }: { signals: WorkSignal[] }) {
  if (!signals.length) return null
  const cols = signals.length > 3 ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-3'
  return (
    <ul className={`work-signals grid gap-px border border-[var(--border)] bg-[var(--border)] ${cols}`}>
      {signals.map((s) => (
        <li key={s.label} className="bg-[var(--background)] px-5 py-6 sm:px-6 sm:py-7">
          <p className="font-display text-xl font-light text-[var(--foreground)] sm:text-2xl">{s.value}</p>
          <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-label)]">
            {s.label}
          </p>
        </li>
      ))}
    </ul>
  )
}

export function WorkVisualSections({ sections }: { sections: WorkVisualSection[] }) {
  if (!sections.length) return null
  return (
    <div className="work-visual-sections mt-16 space-y-16 sm:mt-20 sm:space-y-20">
      {sections.map((section) => (
        <section key={section.title}>
          <h2 className="text-[10px] font-semibold uppercase tracking-[var(--tracking-label)] text-[var(--gold)]">
            {section.title}
          </h2>
          <div className="mt-8 space-y-10 sm:space-y-12">
            {section.visuals.map((v, i) => (
              <VisualFrame key={`${section.title}-${i}`} visual={v} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

export function WorkVisuals({ visuals }: { visuals: WorkVisual[] }) {
  if (!visuals.length) return null
  return (
    <div className="work-visuals mt-16 space-y-12 sm:mt-20 sm:space-y-16">
      {visuals.map((v, i) => (
        <VisualFrame key={`${v.caption}-${i}`} visual={v} />
      ))}
    </div>
  )
}

function VisualFrame({ visual: v }: { visual: WorkVisual }) {
  return (
    <figure className="work-visual-figure">
      {v.layout === 'compare' && v.compareBefore && v.compareAfter ? (
        <div className="grid grid-cols-2 gap-px border border-[var(--border)] bg-[var(--border)]">
          <CompareCell src={v.compareBefore} tag="Before" />
          <CompareCell src={v.compareAfter} tag="After" />
        </div>
      ) : (
        <div className={layoutClass(v.layout)}>
          <Image src={v.src} alt={v.caption} fill className="object-cover" sizes="(max-width: 640px) 100vw, 72rem" />
        </div>
      )}
      <figcaption className="work-visual-caption mt-4 max-w-[var(--measure-prose)]">{v.caption}</figcaption>
    </figure>
  )
}

function layoutClass(layout?: WorkVisual['layout']) {
  switch (layout) {
    case 'portrait':
      return 'relative mx-auto max-w-[22rem] aspect-[9/16] overflow-hidden border border-[var(--border)] sm:max-w-sm'
    case 'detail':
      return 'relative aspect-[3/2] overflow-hidden border border-[var(--border)] sm:aspect-[16/9] sm:max-w-2xl'
    case 'landscape':
    default:
      return 'relative aspect-[16/10] overflow-hidden border border-[var(--border)] sm:aspect-[2/1]'
  }
}

function CompareCell({ src, tag }: { src: string; tag: string }) {
  return (
    <div className="relative aspect-[4/5] bg-[var(--background)] sm:aspect-[3/4]">
      <Image src={src} alt={`${tag} visual comparison`} fill className="object-cover" sizes="50vw" />
      <span className="absolute left-3 top-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/70">
        {tag}
      </span>
    </div>
  )
}
