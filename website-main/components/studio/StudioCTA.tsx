import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StudioCTAProps {
  href: string
  children: React.ReactNode
  variant?: 'text' | 'pill'
  className?: string
}

export default function StudioCTA({
  href,
  children,
  variant = 'text',
  className,
}: StudioCTAProps) {
  if (variant === 'pill') {
    return (
      <Link
        href={href}
        className={cn(
          'inline-flex min-h-11 min-w-[2.75rem] items-center justify-center gap-2 rounded-full border border-[var(--border-strong)] px-5 py-2.5 text-[11px] font-medium tracking-[var(--tracking-ui)] text-[var(--foreground)] transition-[border-color,background-color,color] duration-[var(--duration-ui)] hover:border-[var(--gold-mid)] hover:bg-[var(--gold-glow)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-3 focus-visible:outline-[color-mix(in_srgb,var(--gold)_50%,transparent)]',
          className
        )}
      >
        {children}
        <ArrowUpRight className="h-3.5 w-3.5 text-[var(--gold)]" />
      </Link>
    )
  }

  return (
    <Link
      href={href}
      className={cn(
        'group inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-[var(--gold)] transition-colors duration-[var(--duration-fast)] hover:text-[var(--foreground)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-3 focus-visible:outline-[color-mix(in_srgb,var(--gold)_50%,transparent)]',
        className
      )}
    >
      {children}
      <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </Link>
  )
}
