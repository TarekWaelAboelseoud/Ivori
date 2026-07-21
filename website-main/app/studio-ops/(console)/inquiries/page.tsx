import Link from 'next/link'
import { isSupabaseConfigured } from '@/lib/env'
import { listInquiries } from '@/lib/inquiries/persist'
import { AdminPageHeader } from '@/components/admin/AdminUI'
import AccessDenied from '@/components/admin/ops/AccessDenied'
import { canAccess, getCurrentAdminRole } from '@/lib/admin/permissions'
import InquiryConsole from './InquiryConsole'

export const dynamic = 'force-dynamic'

export default async function InquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string
    priority?: string
    q?: string
    sort?: string
    archived?: string
    source?: string
    owner?: string
  }>
}) {
  const role = await getCurrentAdminRole()
  if (!canAccess(role, 'inquiries')) return <AccessDenied module="Leads & Inquiries" />
  const { status, priority, q, sort, archived, source, owner } = await searchParams
  const { rows: list, error, sources } = await listInquiries({ status, priority, q, sort, archived, source, owner })

  const statusFilters = [
    { value: 'all', label: 'All' },
    { value: 'new', label: 'New' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'qualified', label: 'Qualified' },
    { value: 'proposal_sent', label: 'Proposal Sent' },
    { value: 'won', label: 'Won' },
    { value: 'lost', label: 'Lost' },
    { value: 'archived', label: 'Archived' },
  ]
  const priorityFilters = ['all', 'urgent', 'high', 'medium', 'low']
  const sortOptions = [
    { id: 'newest', label: 'Newest' },
    { id: 'oldest', label: 'Oldest' },
    { id: 'priority', label: 'Priority' },
    { id: 'score', label: 'Score' },
    { id: 'follow_up', label: 'Follow-up' },
  ]

  function href(overrides: { status?: string; priority?: string; sort?: string; archived?: string }) {
    const p = new URLSearchParams()
    const s = overrides.status ?? status ?? 'all'
    const pr = overrides.priority ?? priority ?? 'all'
    const so = overrides.sort ?? sort ?? 'newest'
    const ar = overrides.archived ?? archived
    if (s !== 'all') p.set('status', s)
    if (pr !== 'all') p.set('priority', pr)
    if (so !== 'newest') p.set('sort', so)
    if (ar === '1') p.set('archived', '1')
    if (q) p.set('q', q)
    const qs = p.toString()
    return qs ? `/studio-ops/inquiries?${qs}` : '/studio-ops/inquiries'
  }

  return (
    <div>
      <AdminPageHeader
        title="Inquiries"
        description={
          list.length
            ? `${list.length} in queue${sources.length ? ` · ${sources.join(' + ')}` : ''}`
            : 'Studio contact pipeline'
        }
      />

      {!isSupabaseConfigured() && (
        <div className="admin-banner admin-banner-warn mb-6">
          <p className="font-medium">Supabase not configured</p>
          <p className="mt-1 text-xs opacity-80">
            Run <code>supabase/schema.sql</code> once. Dev fallback:{' '}
            <code>.data/studio-inquiries.json</code>
          </p>
        </div>
      )}

      {error && (
        <div className="admin-banner admin-banner-error mb-6">
          <p className="font-medium">Could not load inquiries</p>
          <p className="mt-1 text-xs opacity-80">{error}</p>
          {/invalid path/i.test(error) && (
            <p className="mt-2 text-xs opacity-80">
              Check <code>NEXT_PUBLIC_SUPABASE_URL</code> — use{' '}
              <code>https://YOUR_REF.supabase.co</code> only (no <code>/rest/v1</code>).
            </p>
          )}
        </div>
      )}

      <div className="mb-6 space-y-3">
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((s) => (
            <Link key={s.value} href={href({ status: s.value })} className={`admin-filter-pill ${(status ?? 'all') === s.value ? 'admin-filter-pill-active' : ''}`}>
              {s.label}
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {priorityFilters.map((p) => (
            <Link key={p} href={href({ priority: p })} className={`admin-filter-pill ${(priority ?? 'all') === p ? 'admin-filter-pill-active' : ''}`}>
              {p === 'all' ? 'any priority' : p}
            </Link>
          ))}
          <span className="mx-2 h-4 w-px bg-zinc-800" aria-hidden />
          {sortOptions.map((o) => (
            <Link key={o.id} href={href({ sort: o.id })} className={`admin-filter-pill ${(sort ?? 'newest') === o.id ? 'admin-filter-pill-active' : ''}`}>
              {o.label}
            </Link>
          ))}
          <span className="mx-2 h-4 w-px bg-zinc-800" aria-hidden />
          <Link
            href={href({ archived: archived === '1' ? '' : '1', status: 'all' })}
            className={`admin-filter-pill ${archived === '1' ? 'admin-filter-pill-active' : ''}`}
          >
            {archived === '1' ? 'archived only' : 'hide archived'}
          </Link>
        </div>
      </div>

      <form className="mb-8 flex flex-col gap-2 sm:flex-row" action="/studio-ops/inquiries" method="get">
        {status && status !== 'all' && <input type="hidden" name="status" value={status} />}
        {priority && priority !== 'all' && <input type="hidden" name="priority" value={priority} />}
        {sort && sort !== 'newest' && <input type="hidden" name="sort" value={sort} />}
        {archived === '1' && <input type="hidden" name="archived" value="1" />}
        <input name="q" defaultValue={q ?? ''} placeholder="Search name, email, company, notes, source..." className="admin-input min-h-[44px] flex-1" />
        <select name="source" defaultValue={source ?? 'all'} className="admin-input min-h-[44px] sm:w-44">
          <option value="all">All sources</option>
          <option value="website">website</option>
          <option value="instagram">instagram</option>
          <option value="whatsapp">whatsapp</option>
          <option value="referral">referral</option>
          <option value="manual">manual</option>
        </select>
        <input name="owner" defaultValue={owner ?? ''} placeholder="Owner" className="admin-input min-h-[44px] sm:w-44" />
        <button type="submit" className="admin-btn-ghost shrink-0 px-6">
          Search
        </button>
      </form>

      <p className="mb-4 text-[10px] text-zinc-600">
        Shortcuts: <kbd className="rounded border border-zinc-800 px-1">j</kbd> /{' '}
        <kbd className="rounded border border-zinc-800 px-1">k</kbd> navigate ·{' '}
        <kbd className="rounded border border-zinc-800 px-1">esc</kbd> close drawer
      </p>

      <InquiryConsole initial={list} canWrite={canAccess(role, 'inquiries', 'write')} />
    </div>
  )
}
