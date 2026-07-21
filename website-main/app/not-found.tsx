import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/studio/Footer'
import MotionHeading from '@/components/studio/MotionHeading'
import StudioCTA from '@/components/studio/StudioCTA'
import HeroAtmosphere from '@/components/studio/HeroAtmosphere'

export default function NotFound() {
  return (
    <>
      <Nav />
      <main className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-[var(--background)] px-[var(--gutter)] pt-[var(--header-height)] text-center">
        <HeroAtmosphere className="opacity-40" />
        <div className="relative z-10 max-w-md">
          <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[var(--gold)]">Off route</p>
          <MotionHeading as="h1" size="md" className="mt-8">
            This chapter
            <br />
            <em>isn&apos;t written.</em>
          </MotionHeading>
          <p className="mt-6 text-sm leading-7 text-[var(--text-body)]">
            Return to the studio — or begin a new brief.
          </p>
          <div className="mt-12 flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
            <StudioCTA href="/" variant="pill">
              Back to studio
            </StudioCTA>
            <Link href="/contact" className="text-sm text-[var(--text-dim)] transition-colors hover:text-[var(--foreground)]">
              Contact
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
