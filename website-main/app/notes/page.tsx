import Nav from '@/components/Nav'
import Footer from '@/components/studio/Footer'
import MotionHeading from '@/components/studio/MotionHeading'
import ChapterLabel from '@/components/studio/ChapterLabel'
import SectionShell, { SectionContainer } from '@/components/studio/SectionShell'
import { studioNotes } from '@/lib/content/notes'
import { pageMetadata } from '@/lib/seo/site'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = pageMetadata(
  'Notes — Ivori Digitals',
  'Strategic observations on premium ecommerce, conversion, and fashion commerce in MENA.',
  '/notes'
)

export default function NotesPage() {
  return (
    <>
      <Nav />
      <main className="bg-[var(--background)]">
        <SectionShell size="lg" border="bottom" reveal={false}>
          <SectionContainer narrow>
            <ChapterLabel tone="gold">Notes</ChapterLabel>
            <MotionHeading as="h1" size="lg" className="mt-6">
              Thinking,
              <br />
              <em>in public.</em>
            </MotionHeading>
            <p className="prose-lead mt-6 max-w-md">Occasional observations. Not a blog.</p>
          </SectionContainer>
        </SectionShell>

        <SectionShell size="md">
          <SectionContainer narrow>
            <ul className="divide-y divide-[var(--border)]">
              {studioNotes.map((note) => (
                <li key={note.slug} className="py-10 first:pt-0 sm:py-12">
                  <Link href={`/notes/${note.slug}`} className="group block">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--text-dim)]">
                      {note.date}
                    </p>
                    <h2 className="mt-3 font-display text-2xl font-light text-[var(--foreground)] transition-colors group-hover:text-[var(--gold)] sm:text-3xl">
                      {note.title}
                    </h2>
                    <p className="mt-4 max-w-lg text-sm leading-7 text-[var(--text-body)]">{note.excerpt}</p>
                    <p className="mt-5 text-[11px] uppercase tracking-[0.22em] text-[var(--text-dim)] group-hover:text-[var(--gold)]">
                      Read →
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </SectionContainer>
        </SectionShell>
      </main>
      <Footer />
    </>
  )
}
