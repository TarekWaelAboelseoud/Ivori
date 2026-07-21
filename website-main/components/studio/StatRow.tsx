import { cn } from '@/lib/utils'

export interface Stat {
  value: string
  label: string
}

export default function StatRow({ stats, className }: { stats: Stat[]; className?: string }) {
  return (
    <div className={cn('grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4 sm:gap-x-10', className)}>
      {stats.map((s) => (
        <div key={s.label} className="flex flex-col gap-2">
          <p className="type-section font-display font-light tabular-nums text-[var(--gold)]">{s.value}</p>
          <p className="type-caption normal-case tracking-[0.12em]">{s.label}</p>
        </div>
      ))}
    </div>
  )
}
