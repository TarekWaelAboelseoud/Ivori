'use client'

import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { AdminBadge, AdminCard, AdminPageHeader } from '@/components/admin/AdminUI'
import ConfirmAction from '@/components/admin/ops/ConfirmAction'
import type { OpsCategory, OpsPriority, OpsStatus } from '@/lib/ops/config'
import type { OpsItem } from '@/lib/ops/types'

type Mode = 'content' | 'internal_ops' | 'projects'

const modeCategory: Record<Mode, OpsCategory> = {
  content: 'content',
  internal_ops: 'internal_ops',
  projects: 'clients',
}

const modeConfig = {
  content: {
    title: 'Content Calendar',
    description: 'Production queue for ecommerce content, assets, channels, owners, due dates, and publish status.',
    addPlaceholder: 'Content task or asset',
    secondaryPlaceholder: 'Channel or content type',
    empty: 'No content work is scheduled.',
    searchPlaceholder: 'Search asset, channel, owner, or note',
  },
  internal_ops: {
    title: 'Internal Ops',
    description: 'Business administration, internal tasks, vendor follow-ups, access, and operating housekeeping.',
    addPlaceholder: 'Internal business task',
    secondaryPlaceholder: 'Owner or department',
    empty: 'No internal tasks are open.',
    searchPlaceholder: 'Search internal tasks',
  },
  projects: {
    title: 'Projects & Delivery',
    description: 'Client delivery work — CRO, Shopify, Meta Ads, AI production, creative, and audits. Track owner, deadline, and status.',
    addPlaceholder: 'Project or deliverable',
    secondaryPlaceholder: 'Service type or client',
    empty: 'No active client projects. Add a delivery item or convert a won inquiry.',
    searchPlaceholder: 'Search project, client, service, or owner',
  },
} satisfies Record<
  Mode,
  {
    title: string
    description: string
    addPlaceholder: string
    secondaryPlaceholder: string
    empty: string
    searchPlaceholder: string
  }
>

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  const data = (await res.json().catch(() => ({}))) as T & { error?: string }
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

function badgeTone(value: OpsStatus | OpsPriority) {
  if (value === 'done') return 'green'
  if (value === 'urgent' || value === 'high' || value === 'blocked') return 'amber'
  if (value === 'in_progress' || value === 'waiting') return 'blue'
  return 'neutral'
}

export default function SpecializedOpsConsole({
  mode,
  initial,
  loadError,
  canDelete = false,
}: {
  mode: Mode
  initial: OpsItem[]
  loadError?: string
  canDelete?: boolean
}) {
  const config = modeConfig[mode]
  const [items, setItems] = useState(initial)
  const [query, setQuery] = useState('')
  const [title, setTitle] = useState('')
  const [secondary, setSecondary] = useState('')
  const [dueAt, setDueAt] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState(loadError ? 'Run the latest Supabase ops schema to activate this page.' : '')

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter((item) =>
      [item.title, item.description, item.owner_name, item.source, item.related_url]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    )
  }, [items, query])

  const grouped = useMemo(() => {
    if (mode === 'content') {
      return {
        Production: visible.filter((i) => !['done', 'archived'].includes(i.status)),
        Published: visible.filter((i) => i.status === 'done'),
      } as Record<string, OpsItem[]>
    }
    if (mode === 'projects') {
      return {
        Active: visible.filter((i) => ['open', 'in_progress', 'waiting', 'blocked'].includes(i.status)),
        Completed: visible.filter((i) => ['done', 'archived'].includes(i.status)),
      } as Record<string, OpsItem[]>
    }
    return {
      Active: visible.filter((i) => !['done', 'archived'].includes(i.status)),
      Completed: visible.filter((i) => i.status === 'done'),
    } as Record<string, OpsItem[]>
  }, [mode, visible])

  async function refresh() {
    const data = await api<{ items: OpsItem[] }>(`/api/studio-ops/ops-items?category=${modeCategory[mode]}`)
    setItems(data.items)
  }

  async function addItem(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setBusy(true)
    setMessage('')
    try {
      await api<{ item: OpsItem }>('/api/studio-ops/ops-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          category: modeCategory[mode],
          priority: 'normal',
          owner_name: mode === 'content' ? null : secondary || null,
          source: mode === 'content' ? secondary || 'content calendar' : mode === 'projects' ? secondary || 'delivery' : 'internal',
          due_at: dueAt || null,
        }),
      })
      setTitle('')
      setSecondary('')
      setDueAt('')
      await refresh()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not add item')
    } finally {
      setBusy(false)
    }
  }

  async function patchItem(id: string, patch: Record<string, unknown>) {
    setBusy(true)
    setMessage('')
    try {
      const data = await api<{ item: OpsItem }>(`/api/studio-ops/ops-items/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      })
      setItems((prev) => prev.map((item) => (item.id === id ? data.item : item)))
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setBusy(false)
    }
  }

  async function removeItem(id: string) {
    await api(`/api/studio-ops/ops-items/${id}`, { method: 'DELETE' })
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  return (
    <div>
      <AdminPageHeader title={config.title} description={config.description} />
      {message && <div className={`admin-banner ${loadError ? 'admin-banner-warn' : 'admin-banner-error'} mb-5`}>{message}</div>}

      <div className="mb-5 grid gap-3 lg:grid-cols-[1fr_1fr_160px_auto]">
        <form onSubmit={addItem} className="contents">
          <input className="admin-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={config.addPlaceholder} maxLength={220} />
          <input className="admin-input" value={secondary} onChange={(e) => setSecondary(e.target.value)} placeholder={config.secondaryPlaceholder} maxLength={120} />
          <input className="admin-input" type="date" value={dueAt} onChange={(e) => setDueAt(e.target.value)} />
          <button className="admin-btn-primary" disabled={busy || !!loadError} type="submit">Add</button>
        </form>
      </div>

      <div className="mb-5">
        <input className="admin-input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={config.searchPlaceholder} />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        {Object.entries(grouped).map(([group, groupItems]) => (
          <AdminCard key={group} className="p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-[var(--admin-ivory)]">{group}</h2>
              <span className="text-xs text-[var(--admin-muted)]">{groupItems.length}</span>
            </div>
            <div className={busy ? 'space-y-3 opacity-70' : 'space-y-3'}>
              {groupItems.length === 0 ? (
                <p className="rounded-lg border border-dashed border-[var(--admin-border)] p-4 text-sm text-[var(--admin-muted)]">{config.empty}</p>
              ) : (
                groupItems.map((item) => (
                  <article key={item.id} className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-elevated)] p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-[var(--admin-ivory)]">{item.title}</h3>
                        <p className="mt-1 text-xs text-[var(--admin-muted)]">
                          {mode === 'content'
                            ? `Channel/type: ${item.source || 'Unassigned'}`
                            : mode === 'projects'
                              ? `Service/client: ${item.source || 'Unassigned'} · Owner: ${item.owner_name || 'Unassigned'}`
                              : `Owner: ${item.owner_name || 'Unassigned'}`}{' '}
                          · Due: {item.due_at ? new Date(item.due_at).toLocaleDateString() : 'None'}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <AdminBadge tone={badgeTone(item.status)}>{item.status.replaceAll('_', ' ')}</AdminBadge>
                        <AdminBadge tone={badgeTone(item.priority)}>{item.priority}</AdminBadge>
                      </div>
                    </div>
                    {item.description && <p className="mt-3 text-sm text-[var(--admin-text)]">{item.description}</p>}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button className="admin-quick-action" disabled={busy} onClick={() => patchItem(item.id, { status: 'in_progress' })}>In progress</button>
                      <button className="admin-quick-action" disabled={busy} onClick={() => patchItem(item.id, { status: 'waiting' })}>{mode === 'content' ? 'Review' : 'Waiting'}</button>
                      <button className="admin-quick-action" disabled={busy} onClick={() => patchItem(item.id, { status: 'done', completed_at: new Date().toISOString() })}>
                        {mode === 'content' ? 'Published' : mode === 'projects' ? 'Completed' : 'Done'}
                      </button>
                      <button className="admin-quick-action" disabled={busy} onClick={() => patchItem(item.id, { archived: true, status: 'archived' })}>Archive</button>
                      {canDelete && (
                        <ConfirmAction
                          label="Delete"
                          warning="Permanently remove this task? This cannot be undone."
                          disabled={busy}
                          onConfirm={() => removeItem(item.id)}
                        />
                      )}
                    </div>
                  </article>
                ))
              )}
            </div>
          </AdminCard>
        ))}
      </div>
    </div>
  )
}
