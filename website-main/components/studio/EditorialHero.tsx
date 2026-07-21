import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import ChapterLabel from './ChapterLabel'

interface EditorialHeroProps {
  label: string
  title: React.ReactNode
  footer?: React.ReactNode
  chapter?: string
  children?: React.ReactNode
  cta?: { href: string; label: string }
  secondaryCta?: { href: string; label: string }
  className?: string
}

export default function EditorialHero({
  label,
  title,
  footer,
  chapter,
  children,
  cta,
  secondaryCta,
  className,
}: EditorialHeroProps) {
  return (
    <section
      className={cn(
        'relative flex min-h-svh min-h-[100dvh] flex-col justify-between bg-[var(--background)] px-[var(--gutter)] pb-8 pt-6',
        className
      )}
    >
      <div style={{ height: 'var(--header-height)' }} />

      <div className="relative z-10 flex flex-1 flex-col justify-center">
        <ChapterLabel chapter={chapter} tone="gold">
          {label}
        </ChapterLabel>
        <div className="mt-8">{title}</div>
        {children && <div className="mt-8 max-w-xl">{children}</div>}
        {(cta || secondaryCta) && (
          <div className="mt-10 flex flex-wrap items-center gap-6">
            {cta && (
              <Link
                href={cta.href}
                className="group inline-flex items-center gap-2 text-sm font-medium text-[var(--gold)] transition-colors hover:text-[var(--foreground)]"
              >
                {cta.label}
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            )}
            {secondaryCta && (
              <Link
                href={secondaryCta.href}
                className="text-sm text-[var(--text-dim)] transition-colors hover:text-[var(--foreground)]"
              >
                {secondaryCta.label}
              </Link>
            )}
          </div>
        )}
      </div>

      {footer && (
        <div className="relative z-10 animate-fade-in delay-700 border-t border-[var(--border)] pt-6">
          {footer}
        </div>
      )}
    </section>
  )
}
