import Link from 'next/link'
import Image from 'next/image'
import { getFlagshipWork, getFeaturedWork } from '@/lib/content/selected-work'
import ChapterLabel from './ChapterLabel'
import MotionHeading from './MotionHeading'
import StudioCTA from './StudioCTA'

export default function SelectedWorkTeaser() {
  const primary = getFlagshipWork()
  const secondary = getFeaturedWork().filter((w) => w.slug !== primary?.slug).slice(0, 1)

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <ChapterLabel chapter="03">Selected work</ChapterLabel>
        <StudioCTA href="/work">All work</StudioCTA>
      </div>
      <MotionHeading size="section" measure="section" className="mb-6 sm:mb-8">
        Current client delivery.
      </MotionHeading>

      {primary && (
        <Link href={`/work/${primary.slug}`} className="group block border border-[var(--border)]">
          <div className="grid sm:grid-cols-2">
            <div className="relative aspect-[4/3] overflow-hidden sm:aspect-[16/11]">
              <Image
                src={primary.coverImage}
                alt={`${primary.title} — Ivori Digitals`}
                fill
                priority
                className="object-cover transition-transform duration-[900ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.012]"
                sizes="(max-width: 640px) 100vw, 50vw"
              />
            </div>
            <div className="flex flex-col justify-center p-6 sm:p-8">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--gold)]">{primary.label}</p>
              <p className="mt-2 font-display text-2xl font-light text-[var(--foreground)] sm:text-3xl">{primary.title}</p>
              <p className="mt-3 text-sm leading-7 text-[var(--text-body)]">{primary.thesis}</p>
            </div>
          </div>
        </Link>
      )}

      {secondary.length > 0 && (
        <ul className="mt-4">
          {secondary.map((work) => (
            <li key={work.slug} className="border border-t-0 border-[var(--border)]">
              <Link href={`/work/${work.slug}`} className="group flex items-center gap-5 p-5 sm:p-6">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden sm:h-20 sm:w-20">
                  <Image
                    src={work.coverImage}
                    alt={`${work.title} work preview`}
                    fill
                    className="object-cover"
                    sizes="5rem"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--gold-mid)]">{work.label}</p>
                  <p className="mt-1 font-display text-lg font-light text-[var(--foreground)]">{work.title}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
