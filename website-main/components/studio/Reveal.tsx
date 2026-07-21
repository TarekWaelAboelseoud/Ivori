'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface RevealProps {
  children: ReactNode
  className?: string
  delay?: number
  asGroup?: boolean
}

export default function Reveal({ children, className = '', delay = 0, asGroup = false }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const timer = window.setTimeout(() => {
            el.setAttribute('data-visible', 'true')
          }, delay)
          observer.disconnect()
          return () => window.clearTimeout(timer)
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [delay])

  return (
    <div
      ref={ref}
      className={cn(asGroup ? 'reveal-group' : 'reveal-item', className)}
    >
      {children}
    </div>
  )
}

export function RevealStagger({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <Reveal asGroup className={className}>
      <div className="contents [&>.reveal-item]:transition-delay-[calc(var(--i,0)*var(--stagger-step))]">
        {children}
      </div>
    </Reveal>
  )
}
