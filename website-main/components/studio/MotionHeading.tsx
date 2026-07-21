import { cn } from '@/lib/utils'

/** Editorial display sizes — use hero once per page, display for chapter openers, section for in-page. */
export type MotionHeadingSize =
  | 'hero'
  | 'display'
  | 'section'
  | 'title'
  | 'subtitle'
  /** @deprecated use display */
  | 'cover'
  /** @deprecated use section */
  | 'xl'
  /** @deprecated use title */
  | 'lg'
  /** @deprecated use subtitle */
  | 'md'

interface MotionHeadingProps {
  as?: 'h1' | 'h2' | 'h3' | 'p'
  size?: MotionHeadingSize
  children: React.ReactNode
  className?: string
  balance?: boolean
  animate?: boolean
  measure?: 'hero' | 'display' | 'section' | 'none'
}

const sizeClasses: Record<MotionHeadingSize, string> = {
  hero: 'type-hero',
  display: 'type-display',
  section: 'type-section',
  title: 'type-title',
  subtitle: 'type-subtitle',
  cover: 'type-display',
  xl: 'type-section',
  lg: 'type-title',
  md: 'type-subtitle',
}

const measureClasses = {
  hero: 'measure-hero',
  display: 'measure-display',
  section: 'measure-section',
  none: '',
}

export default function MotionHeading({
  as: Tag = 'h2',
  size = 'section',
  children,
  className,
  balance = true,
  animate = false,
  measure = 'none',
}: MotionHeadingProps) {
  const resolved = size === 'hero' ? 'hero' : size === 'cover' || size === 'display' ? 'display' : size === 'xl' || size === 'section' ? 'section' : size === 'lg' || size === 'title' ? 'title' : size === 'md' || size === 'subtitle' ? 'subtitle' : size

  const autoMeasure =
    measure === 'none'
      ? resolved === 'hero'
        ? 'hero'
        : resolved === 'display'
          ? 'display'
          : resolved === 'section'
            ? 'section'
            : 'none'
      : measure

  return (
    <Tag
      className={cn(
        sizeClasses[size],
        autoMeasure !== 'none' && measureClasses[autoMeasure],
        balance && 'text-balance',
        animate && 'animate-fade-up delay-200',
        className
      )}
    >
      {children}
    </Tag>
  )
}
