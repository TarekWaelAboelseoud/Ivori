import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'
import ChapterLabel from './ChapterLabel'
import HeroAtmosphere from './HeroAtmosphere'
import Box from './Box'
import { campaigns } from '@/lib/content/visual-assets'

interface CinematicHeroProps {
  chapter?: string
  label: string
  title: React.ReactNode
  lead?: string
  footer?: React.ReactNode
  cta?: { href: string; label: string }
  secondaryCta?: { href: string; label: string }
  imageSrc?: string
  videoSrc?: string
  posterSrc?: string
  /** image = cinematic still; abstract = typography-led, no campaign photo */
  visual?: 'image' | 'abstract' | 'video'
  variant?: 'cinematic' | 'command'
}

export default function CinematicHero({
  chapter,
  label,
  title,
  lead,
  footer,
  cta,
  secondaryCta,
  imageSrc = campaigns.hero,
  videoSrc,
  posterSrc,
  visual = 'image',
}: CinematicHeroProps) {
  const isAbstract = visual === 'abstract'
  const isVideo = visual === 'video' && videoSrc

  return (
    <section className="hero-cinematic relative flex min-h-svh min-h-[100dvh] max-w-full flex-col overflow-hidden bg-[var(--background)]">
      <Box className="absolute inset-0">
        {isVideo ? (
          <video
            className="absolute inset-0 h-full w-full scale-[1.02] object-cover opacity-45"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={posterSrc || imageSrc}
            aria-hidden="true"
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
        ) : !isAbstract && (
          <Image
            src={imageSrc}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center scale-[1.03] animate-[heroKenBurns_24s_ease-in-out_infinite_alternate] opacity-90"
          />
        )}
        <Box
          className="absolute inset-0"
          style={{
            background: isAbstract
              ? 'radial-gradient(ellipse 90% 70% at 18% 18%, var(--gold-glow-strong) 0%, transparent 52%), radial-gradient(ellipse 80% 60% at 82% 18%, color-mix(in srgb, var(--gold) 12%, transparent) 0%, transparent 56%), linear-gradient(180deg, var(--background) 0%, var(--surface) 100%)'
              : isVideo
                ? 'linear-gradient(90deg, var(--background) 0%, color-mix(in srgb, var(--background) 78%, transparent) 44%, color-mix(in srgb, var(--background) 56%, transparent) 100%), linear-gradient(180deg, color-mix(in srgb, var(--background) 70%, transparent) 0%, var(--background) 100%)'
              : 'linear-gradient(180deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.45) 45%, var(--background) 100%)',
          }}
        />
        <HeroAtmosphere />
      </Box>

      <Box style={{ height: 'var(--header-height)' }} className="relative z-10 shrink-0" />

      <Box className="relative z-10 flex flex-1 flex-col justify-center px-[var(--gutter)] pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-2 sm:pb-14 lg:pb-16 2xl:pb-20">
        <Box className="mx-auto w-[calc(100vw-(2*var(--gutter)))] max-w-[var(--container-studio)] sm:w-full lg:grid lg:grid-cols-12 lg:items-end lg:gap-x-12">
          <Box className="lg:col-span-8 xl:col-span-7">
            <ChapterLabel chapter={chapter} tone="gold">
              {label}
            </ChapterLabel>
            <Box className="mt-[var(--stack-sm)] sm:mt-[var(--stack-md)]">{title}</Box>
            {lead && <p className="hero-subline">{lead}</p>}
          </Box>
          {(cta || secondaryCta) && (
            <Box className="mt-[var(--stack-md)] lg:col-span-4 lg:mt-0 lg:col-start-9 xl:col-start-8 lg:pb-2">
              <Box className="flex flex-wrap items-center gap-x-8 gap-y-4">
                {cta && (
                  <Link href={cta.href} className="studio-cta-primary group inline-flex min-h-[44px] items-center gap-2">
                    {cta.label}
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </Link>
                )}
                {secondaryCta && (
                  <Link href={secondaryCta.href} className="studio-cta-ghost min-h-[44px]">
                    {secondaryCta.label}
                  </Link>
                )}
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      {footer && (
        <Box className="relative z-10 shrink-0 border-t border-white/[0.06] px-[var(--gutter)] py-5 sm:py-6">
          <Box className="mx-auto max-w-[var(--container-studio)] overflow-hidden [overflow-wrap:anywhere]">{footer}</Box>
        </Box>
      )}
    </section>
  )
}
