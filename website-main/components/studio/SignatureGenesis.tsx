'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { campaigns } from '@/lib/content/visual-assets'
import ChapterLabel from './ChapterLabel'
import { cn } from '@/lib/utils'

/**
 * Signature Ivori moment: scroll-pinned text mask reveal over cinematic still.
 * Restrained — one section, one memory.
 */
export default function SignatureGenesis() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return

    const onScroll = () => {
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight
      const total = el.offsetHeight - vh
      if (total <= 0) return
      const scrolled = Math.min(Math.max(-rect.top, 0), total)
      setProgress(scrolled / total)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const opacity = Math.min(1, progress * 2.2)
  const imageScale = 1 + progress * 0.06
  const textClip = `${Math.max(0, 100 - progress * 120)}%`

  return (
    <section ref={wrapRef} className="relative h-[115vh] sm:h-[155vh]" id="ivori-signature" aria-label="Ivori signature experience">
      <div className="sticky top-0 flex h-svh min-h-[100dvh] items-center overflow-hidden bg-[var(--background)]">
        <div className="absolute inset-0">
          <Image
            src={campaigns.hero}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover transition-transform duration-75 ease-out"
            style={{ transform: `scale(${imageScale})` }}
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-[var(--container-studio)] px-[var(--gutter)]">
          <ChapterLabel chapter="Ivori" tone="gold" className="mb-8 opacity-90">
            Signature system
          </ChapterLabel>
          <h2
            className="type-display max-w-[var(--measure-display)] font-light text-transparent"
            style={{
              backgroundImage: `linear-gradient(180deg, #f0ece4 0%, #c9a96a 100%)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              clipPath: `inset(0 0 ${textClip} 0)`,
              opacity,
            }}
          >
            One studio.
            <br />
            Four disciplines.
            <br />
            <span className="italic text-[var(--gold-bright)]">One line to purchase.</span>
          </h2>
          <p
            className={cn(
              'prose-body mt-10 max-w-[var(--measure-lead)] transition-opacity duration-500',
              progress > 0.55 ? 'opacity-100' : 'opacity-0'
            )}
          >
            CRO, AI production, media, and Shopify systems - engineered in Cairo for brands that
            compete on perception and purchase.
          </p>
        </div>

        <div
          className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
          style={{ opacity: 1 - progress }}
          aria-hidden
        >
          <span className="text-[10px] uppercase tracking-[0.4em] text-[var(--text-dim)]">Scroll</span>
        </div>
      </div>
    </section>
  )
}
