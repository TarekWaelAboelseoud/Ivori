import { notFound, redirect } from 'next/navigation'
import Nav from '@/components/Nav'
import Footer from '@/components/studio/Footer'
import SelectedWorkDetail from '@/components/studio/SelectedWorkDetail'
import { getSelectedWork, legacyWorkSlugs, selectedWork } from '@/lib/content/selected-work'
import { breadcrumbJsonLd, jsonLd, pageMetadata, webPageJsonLd } from '@/lib/seo/site'
import type { Metadata } from 'next'

type Props = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return selectedWork.map((w) => ({ slug: w.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const work = getSelectedWork(slug)
  if (!work) return {}
  return pageMetadata(`${work.title} - Ivori Digitals selected work`, work.thesis, `/work/${work.slug}`)
}

export default async function WorkDetailPage({ params }: Props) {
  const { slug } = await params
  const work = getSelectedWork(slug)
  if (!work && legacyWorkSlugs.includes(slug)) redirect('/work')
  if (!work) notFound()

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            webPageJsonLd({
              name: `${work.title} selected work`,
              description: work.thesis,
              path: `/work/${work.slug}`,
            })
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            breadcrumbJsonLd([
              { name: 'Ivori Digitals', path: '/' },
              { name: 'Selected work', path: '/work' },
              { name: work.title, path: `/work/${work.slug}` },
            ])
          ),
        }}
      />
      <Nav />
      <main className="bg-[var(--background)]">
        <SelectedWorkDetail work={work} />
      </main>
      <Footer />
    </>
  )
}
