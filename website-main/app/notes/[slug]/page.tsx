import { notFound } from 'next/navigation'
import Nav from '@/components/Nav'
import Footer from '@/components/studio/Footer'
import MotionHeading from '@/components/studio/MotionHeading'
import ChapterLabel from '@/components/studio/ChapterLabel'
import SectionShell, { SectionContainer } from '@/components/studio/SectionShell'
import StudioCTA from '@/components/studio/StudioCTA'
import { getStudioNote, studioNotes } from '@/lib/content/notes'
import { articleJsonLd, breadcrumbJsonLd, jsonLd, pageMetadata } from '@/lib/seo/site'
import type { Metadata } from 'next'

type Props = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return studioNotes.map((n) => ({ slug: n.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const note = getStudioNote(slug)
  if (!note) return {}
  return pageMetadata(note.title, note.excerpt, `/notes/${note.slug}`)
}

export default async function NotePage({ params }: Props) {
  const { slug } = await params
  const note = getStudioNote(slug)
  if (!note) notFound()

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(articleJsonLd(note)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            breadcrumbJsonLd([
              { name: 'Ivori Digitals', path: '/' },
              { name: 'Notes', path: '/notes' },
              { name: note.title, path: `/notes/${note.slug}` },
            ])
          ),
        }}
      />
      <Nav />
      <main className="bg-[var(--background)]">
        <SectionShell size="lg" border="bottom" reveal={false}>
          <SectionContainer narrow>
            <ChapterLabel tone="gold">{note.date}</ChapterLabel>
            <MotionHeading as="h1" size="lg" className="mt-6 max-w-[var(--measure-wide)]">
              {note.title}
            </MotionHeading>
          </SectionContainer>
        </SectionShell>

        <SectionShell size="md">
          <SectionContainer narrow>
            <div className="max-w-[var(--measure-prose)] space-y-6">
              {note.body.map((paragraph) => (
                <p key={paragraph.slice(0, 24)} className="prose-body">
                  {paragraph}
                </p>
              ))}
            </div>
            <div className="mt-16 border-t border-[var(--border)] pt-10">
              <StudioCTA href="/notes">All notes →</StudioCTA>
            </div>
          </SectionContainer>
        </SectionShell>
      </main>
      <Footer />
    </>
  )
}
