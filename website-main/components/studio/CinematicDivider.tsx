import { cn } from '@/lib/utils'

export default function CinematicDivider({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-4 py-2', className)} aria-hidden>
      <span className="h-px flex-1 cinematic-rule" />
      <span className="h-1 w-1 rotate-45 bg-[var(--gold)] opacity-40" />
      <span className="h-px flex-1 cinematic-rule" />
    </div>
  )
}
