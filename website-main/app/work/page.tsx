import Nav from '@/components/Nav'
import Footer from '@/components/studio/Footer'
import MotionHeading from '@/components/studio/MotionHeading'
import ChapterLabel from '@/components/studio/ChapterLabel'
import SectionShell, { SectionContainer } from '@/components/studio/SectionShell'
import { selectedWork } from '@/lib/content/selected-work'
import { pageMetadata } from '@/lib/seo/site'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'

export const metadata: Metadata = pageMetadata(
  'Selected work | Ivori Digitals ecommerce studio Egypt',
  'Ivori Digitals client work for ARK and KVL — production, Shopify CRO, and commerce systems for Egypt and MENA. Real assets, honest scope.',
  '/work'
)

export default function WorkIndexPage() {
  const primary = selectedWork.find((w) => w.flagship) ?? selectedWork[0]
  const secondary = selectedWork.filter((w) => w.slug !== primary?.slug)

  return (
    <>
      <Nav />
      <main className="bg-[var(--background)]">
        <SectionShell size="sm" border="bottom" reveal={false}>
          <SectionContainer narrow>
            <ChapterLabel chapter="01" tone="gold">
              Selected work
            </ChapterLabel>
            <MotionHeading as="h1" size="display" measure="display" className="mt-5 sm:mt-6">
              Studio work,
              <br />
              <em className="text-[var(--gold)]">kept honest.</em>
            </MotionHeading>
            <p className="prose-body mt-5 max-w-lg">
              Current Ivori Digitals delivery for ARK and KVL — real assets, clear scope, no invented metrics.
            </p>
          </SectionContainer>
        </SectionShell>

        <SectionShell size="sm">
          <SectionContainer>
            {primary && (
              <Link href={`/work/${primary.slug}`} className="group block border border-[var(--border)]">
                <div className="grid lg:grid-cols-12">
                  <div className="relative aspect-[4/3] overflow-hidden lg:col-span-7 lg:aspect-auto lg:min-h-[22rem]">
                    <Image
                      src={primary.coverImage}
                      alt={`${primary.title} — Ivori Digitals client work`}
                      fill
                      className="object-cover transition-transform duration-[900ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.012]"
                      sizes="(max-width: 1024px) 100vw, 58vw"
                      priority
                    />
                  </div>
                  <div className="flex flex-col justify-center p-6 sm:p-8 lg:col-span-5 lg:p-10">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--gold)]">
                      Primary · {primary.label}
                    </p>
                    <h2 className="mt-3 font-display text-3xl font-light text-[var(--foreground)] sm:text-4xl">{primary.title}</h2>
                    <p className="mt-4 text-sm leading-7 text-[var(--text-body)]">{primary.thesis}</p>
                    <p className="mt-6 text-[11px] uppercase tracking-[0.22em] text-[var(--text-dim)] transition-colors group-hover:text-[var(--gold)]">
                      View project →
                    </p>
                  </div>
                </div>
              </Link>
            )}

            {secondary.length > 0 && (
              <ul className="mt-6 space-y-4">
                {secondary.map((work) => (
                  <li key={work.slug}>
                    <Link
                      href={`/work/${work.slug}`}
                      className="group flex flex-col overflow-hidden border border-[var(--border)] sm:flex-row"
                    >
                      <div className="relative aspect-[16/10] sm:aspect-auto sm:h-36 sm:w-52 sm:shrink-0">
                        <Image
                          src={work.coverImage}
                          alt={`${work.title} — Ivori Digitals work`}
                          fill
                          className="object-cover transition-transform duration-[900ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.02]"
                          sizes="(max-width: 640px) 100vw, 13rem"
                        />
                      </div>
                      <div className="flex flex-col justify-center p-5 sm:p-6">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--gold-mid)]">
                          {work.label}
                        </p>
                        <h3 className="mt-2 font-display text-xl font-light text-[var(--foreground)]">{work.title}</h3>
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--text-body)]">{work.thesis}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </SectionContainer>
        </SectionShell>
      </main>
      <Footer />
    </>
  )
}
