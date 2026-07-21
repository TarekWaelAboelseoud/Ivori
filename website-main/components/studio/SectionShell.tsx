import { cn } from '@/lib/utils'
import Reveal from './Reveal'

interface SectionShellProps {
  id?: string
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'none'
  border?: 'none' | 'top' | 'bottom' | 'y'
  reveal?: boolean
  fullBleed?: boolean
}

const sizeMap = {
  none: '',
  sm: 'py-[var(--space-section-sm)]',
  md: 'py-[var(--space-section-md)]',
  lg: 'py-[var(--space-section-lg)]',
  xl: 'py-[var(--space-section-xl)]',
}

const borderMap = {
  none: '',
  top: 'border-t border-[var(--border)]',
  bottom: 'border-b border-[var(--border)]',
  y: 'border-y border-[var(--border)]',
}

export default function SectionShell({
  id,
  children,
  className,
  size = 'md',
  border = 'none',
  reveal = true,
  fullBleed = false,
}: SectionShellProps) {
  const inner = (
    <section
      id={id}
      className={cn(
        'relative',
        sizeMap[size],
        borderMap[border],
        fullBleed ? '' : '',
        className
      )}
    >
      {children}
    </section>
  )

  if (!reveal) return inner
  return <Reveal>{inner}</Reveal>
}

export function SectionContainer({
  children,
  narrow,
  className,
}: {
  children: React.ReactNode
  narrow?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        'mx-auto w-full px-[var(--gutter)]',
        narrow ? 'max-w-[var(--container-narrow)]' : 'max-w-[var(--container-studio)]',
        className
      )}
    >
      {children}
    </div>
  )
}
