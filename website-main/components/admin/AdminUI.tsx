import Link from 'next/link'
import { cn } from '@/lib/utils'

export function AdminPageHeader({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children?: React.ReactNode
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--admin-gold)]">Studio OS</p>
        <h1 className="admin-page-title mt-2">{title}</h1>
        {description && <p className="mt-2 text-sm text-[var(--admin-muted)]">{description}</p>}
      </div>
      {children}
    </div>
  )
}

export function AdminCard({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)]', className)}>{children}</div>
  )
}

export function AdminOpsStrip({
  items,
}: {
  items: { label: string; value: string | number; hint?: string }[]
}) {
  return (
    <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--admin-muted)]">{item.label}</p>
          <p className="mt-1 text-xl font-semibold text-[var(--admin-ivory)]">{item.value}</p>
          {item.hint && <p className="mt-0.5 text-xs text-[var(--admin-muted)]">{item.hint}</p>}
        </div>
      ))}
    </div>
  )
}

export function AdminStatCard({
  label,
  value,
  href,
}: {
  label: string
  value: string | number
  href?: string
}) {
  const inner = (
    <>
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--admin-muted)]">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-[var(--admin-ivory)]">{value}</p>
    </>
  )
  if (href) {
    return (
      <Link
        href={href}
        className="block rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-5 transition-colors hover:border-[var(--admin-gold)]"
      >
        {inner}
      </Link>
    )
  }
  return <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-5">{inner}</div>
}

export function AdminBadge({
  children,
  tone = 'neutral',
}: {
  children: React.ReactNode
  tone?: 'neutral' | 'gold' | 'green' | 'blue' | 'amber'
}) {
  const tones = {
    neutral: 'border-[var(--admin-border)] bg-[var(--admin-elevated)] text-[var(--admin-text)]',
    gold: 'border-[#c9a96a]/30 bg-[#c9a96a]/10 text-[#dfc18a]',
    green: 'border-green-500/20 bg-green-500/10 text-green-400',
    blue: 'border-blue-500/20 bg-blue-500/10 text-blue-400',
    amber: 'border-amber-500/20 bg-amber-500/10 text-amber-400',
  }
  return (
    <span className={cn('rounded-full border px-2.5 py-0.5 text-xs font-medium', tones[tone])}>
      {children}
    </span>
  )
}
