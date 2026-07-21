import Image from 'next/image'
import type { SelectedWork } from '@/lib/content/selected-work'
import { disciplineLabels } from '@/lib/content/selected-work'
import { WorkSignals, WorkVisuals, WorkVisualSections } from './WorkProjectMedia'
import MotionHeading from './MotionHeading'
import ChapterLabel from './ChapterLabel'
import StudioCTA from './StudioCTA'

export default function SelectedWorkDetail({ work }: { work: SelectedWork }) {
  const isFlagship = work.flagship

  return (
    <article className={isFlagship ? 'work-detail--flagship' : undefined}>
      <div className="work-hero relative min-h-[55vh] overflow-hidden sm:min-h-[68vh]">
        <Image
          src={work.coverImage}
          alt={`${work.title} - ${work.thesis}`}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-[var(--background)]/55 to-[var(--background)]/15" />
        <div className="relative z-10 mx-auto max-w-[var(--container-studio)] px-[var(--gutter)] pb-14 pt-[calc(var(--header-height)+2.5rem)] sm:pb-20 sm:pt-[calc(var(--header-height)+3.5rem)]">
          {isFlagship && (
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.32em] text-[var(--gold)]">
              Latest work
            </p>
          )}
          <ChapterLabel tone="gold">{work.label}</ChapterLabel>
          <MotionHeading as="h1" size="lg" className="mt-5 sm:mt-6">
            {work.title}
          </MotionHeading>
          <p className="prose-lead mt-5 max-w-xl sm:mt-6">{work.thesis}</p>
        </div>
      </div>

      <div
        className={
          isFlagship
            ? 'mx-auto max-w-[var(--container-studio)] px-[var(--gutter)] pb-24 sm:pb-32'
            : 'mx-auto max-w-2xl px-[var(--gutter)] pb-24 sm:pb-32'
        }
      >
        <div className={isFlagship ? 'mx-auto max-w-2xl' : undefined}>
          {work.signals && <WorkSignals signals={work.signals} />}

          {work.context && (
            <p className="prose-body mt-12 border-l border-[var(--gold-mid)]/40 pl-6 text-[var(--text-body)] sm:mt-14 sm:pl-8">
              {work.context}
            </p>
          )}

          <div className="mt-12 flex flex-wrap gap-2 border-b border-[var(--border)] pb-10 sm:mt-14">
            {work.disciplines.map((d) => (
              <span
                key={d}
                className="rounded-full border border-[var(--border)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-label)]"
              >
                {disciplineLabels[d]}
              </span>
            ))}
          </div>

          <section className="mt-12 sm:mt-14">
            <h2 className="text-[10px] font-semibold uppercase tracking-[var(--tracking-label)] text-[var(--gold)]">
              Focus
            </h2>
            <ul className="mt-5 space-y-4 sm:mt-6 sm:space-y-5">
              {work.focus.map((item, i) => (
                <li
                  key={item}
                  className="flex gap-4 border-t border-[var(--border)] pt-4 first:border-t-0 first:pt-0"
                >
                  <span className="shrink-0 text-sm tabular-nums text-[var(--gold-mid)]">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="prose-body">{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {work.visualSections && (
          <div className={isFlagship ? 'mt-16 sm:mt-20' : ''}>
            <WorkVisualSections sections={work.visualSections} />
          </div>
        )}
        {!work.visualSections && work.visuals && <WorkVisuals visuals={work.visuals} />}

        <div className={`work-narrative mx-auto max-w-2xl ${work.visualSections ? 'mt-16' : 'mt-16'} space-y-12 border-t border-[var(--border)] pt-14 sm:mt-20 sm:space-y-14 sm:pt-16`}>
          {[
            { label: 'Challenge', body: work.challenge },
            { label: 'Approach', body: work.approach },
            { label: 'Outcome', body: work.outcome },
          ].map((block) => (
            <div key={block.label}>
              <h2 className="text-[10px] font-semibold uppercase tracking-[var(--tracking-label)] text-[var(--text-label)]">
                {block.label}
              </h2>
              <p className="prose-body mt-3 max-w-[var(--measure-prose)] sm:mt-4">{block.body}</p>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-16 flex max-w-2xl flex-col gap-6 border-t border-[var(--border)] pt-10 sm:mt-20 sm:flex-row sm:items-center sm:justify-between sm:pt-12">
          <p className="text-xs text-[var(--text-dim)]">
            {work.vertical} · {work.year}
          </p>
          <StudioCTA href="/contact" variant="pill">
            Discuss a project
          </StudioCTA>
        </div>
      </div>
    </article>
  )
}
