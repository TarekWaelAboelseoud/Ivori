import { cn } from '@/lib/utils'

interface ChapterLabelProps {
  chapter?: string
  children: React.ReactNode
  className?: string
  tone?: 'gold' | 'muted'
}

export default function ChapterLabel({
  chapter,
  children,
  className,
  tone = 'muted',
}: ChapterLabelProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {chapter && (
        <span className="text-[var(--text-micro)] font-semibold uppercase tracking-[var(--tracking-label)] text-[var(--text-ghost)]">
          {chapter}
        </span>
      )}
      <p
        className={cn(
          'max-w-[20rem] text-[var(--text-micro)] font-semibold uppercase tracking-[var(--tracking-label)] [overflow-wrap:anywhere] sm:max-w-full',
          tone === 'gold' ? 'text-[var(--gold)]' : 'text-[var(--text-label)]'
        )}
      >
        {children}
      </p>
    </div>
  )
}
