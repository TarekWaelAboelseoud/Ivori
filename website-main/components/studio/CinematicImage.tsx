import Image from 'next/image'
import { cn } from '@/lib/utils'

interface CinematicImageProps {
  src: string
  alt: string
  className?: string
  priority?: boolean
  sizes?: string
  overlay?: 'vignette' | 'bottom' | 'none'
  hoverZoom?: boolean
  ambient?: boolean
}

export default function CinematicImage({
  src,
  alt,
  className,
  priority,
  sizes = '(max-width: 768px) 100vw, 70vw',
  overlay = 'vignette',
  hoverZoom = false,
  ambient = false,
}: CinematicImageProps) {
  return (
    <div className={cn('relative overflow-hidden bg-[var(--surface)]', className)}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className={cn(
          'object-cover transition-transform duration-[1.4s] var(--ease-out-expo)',
          hoverZoom && 'scale-[1.03] group-hover:scale-100',
          ambient && !hoverZoom && 'ambient-drift'
        )}
      />
      {overlay === 'vignette' && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'var(--gradient-vignette)' }}
          aria-hidden
        />
      )}
      {overlay === 'bottom' && (
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent"
          aria-hidden
        />
      )}
    </div>
  )
}
