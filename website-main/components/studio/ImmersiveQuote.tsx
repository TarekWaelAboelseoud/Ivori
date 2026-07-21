import { cn } from '@/lib/utils'
import StudioCTA from './StudioCTA'
import MotionHeading from './MotionHeading'

interface ImmersiveQuoteProps {
  quote: React.ReactNode
  body?: string
  cta?: { href: string; label: string }
  className?: string
}

export default function ImmersiveQuote({ quote, body, cta, className }: ImmersiveQuoteProps) {
  return (
    <blockquote className={cn('relative', className)}>
      <MotionHeading as="p" size="display" measure="display" className="italic leading-[1.08]">
        {quote}
      </MotionHeading>
      {body && <p className="prose-lead mt-8">{body}</p>}
      {cta && (
        <div className="mt-10">
          <StudioCTA href={cta.href}>{cta.label}</StudioCTA>
        </div>
      )}
    </blockquote>
  )
}
