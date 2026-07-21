'use client'

import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { AdminBadge, AdminCard, AdminPageHeader } from '@/components/admin/AdminUI'
import { OPS_CATEGORY_DESCRIPTIONS, OPS_CATEGORY_LABELS, OPS_PRIORITIES, OPS_STATUSES } from '@/lib/ops/config'
import type { OpsCategory, OpsPriority, OpsStatus } from '@/lib/ops/config'
import type { OpsItem } from '@/lib/ops/types'

type FilterValue = 'all' | OpsStatus | OpsPriority

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  const data = (await res.json().catch(() => ({}))) as T & { error?: string }
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

function toneForPriority(priority: OpsPriority) {
  if (priority === 'urgent') return 'gold'
  if (priority === 'high') return 'amber'
  if (priority === 'low') return 'neutral'
  return 'blue'
}

function toneForStatus(status: OpsStatus) {
  if (status === 'done') return 'green'
  if (status === 'blocked') return 'amber'
  if (status === 'waiting') return 'blue'
  return 'neutral'
}

export default function OpsCategoryPage({
  category,
  initial,
  highPriorityOnly = false,
  loadError,
}: {
  category: OpsCategory
  initial: OpsItem[]
  highPriorityOnly?: boolean
  loadError?: string
}) {
  const [items, setItems] = useState(initial)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<FilterValue>('all')
  const [priority, setPriority] = useState<FilterValue>('all')
  const [title, setTitle] = useState('')
  const [owner, setOwner] = useState('')
  const [dueAt, setDueAt] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState(loadError ? 'Run supabase/schema.sql to activate this queue.' : '')

  const titleText = highPriorityOnly ? 'High Priority' : OPS_CATEGORY_LABELS[category]
  const description = highPriorityOnly
    ? 'Aggregated urgent and high-priority items across all operating queues.'
    : OPS_CATEGORY_DESCRIPTIONS[category]

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((item) => {
      if (status !== 'all' && item.status !== status) return false
      if (priority !== 'all' && item.priority !== priority) return false
      if (!q) return true
      return [item.title, item.description, item.owner_name, item.source, item.related_email, item.related_url]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    })
  }, [items, priority, query, status])

  async function refresh() {
    const params = highPriorityOnly ? '?highPriority=true' : `?category=${category}`
    const data = await api<{ items: OpsItem[] }>(`/api/studio-ops/ops-items${params}`)
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
          category: highPriorityOnly ? 'high_priority' : category,
          priority: highPriorityOnly ? 'urgent' : 'normal',
          owner_name: owner || null,
          due_at: dueAt || null,
          source: 'manual',
        }),
      })
      setTitle('')
      setOwner('')
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

  return (
    <div>
      <AdminPageHeader title={titleText} description={description} />

      {message && (
        <div className={`admin-banner ${loadError ? 'admin-banner-warn' : 'admin-banner-error'} mb-6`}>
          {message}
        </div>
      )}

      <AdminCard className="mb-6 p-4">
        <form onSubmit={addItem} className="grid gap-3 lg:grid-cols-[minmax(0,1.5fr)_180px_160px_auto]">
          <input
            className="admin-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Quick add item"
            maxLength={220}
          />
          <input
            className="admin-input"
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            placeholder="Owner"
            maxLength={120}
          />
          <input className="admin-input" type="date" value={dueAt} onChange={(e) => setDueAt(e.target.value)} />
          <button className="admin-btn-primary min-h-0" disabled={busy || !!loadError} type="submit">
            Add
          </button>
        </form>
      </AdminCard>

      <div className="mb-5 grid gap-3 lg:grid-cols-[1fr_auto_auto]">
        <input
          className="admin-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search queue"
        />
        <select className="admin-input lg:w-44" value={status} onChange={(e) => setStatus(e.target.value as FilterValue)}>
          <option value="all">All statuses</option>
          {OPS_STATUSES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <select className="admin-input lg:w-44" value={priority} onChange={(e) => setPriority(e.target.value as FilterValue)}>
          <option value="all">All priorities</option>
          {OPS_PRIORITIES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div className={busy ? 'is-busy space-y-3' : 'space-y-3'}>
        {visible.length === 0 ? (
          <div className="admin-empty">
            <p className="font-display text-xl text-zinc-300">No items in this queue</p>
            <p className="mt-2 text-sm text-zinc-500">Add the next operational item when it appears.</p>
          </div>
        ) : (
          visible.map((item) => (
            <AdminCard key={item.id} className="p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-sm font-semibold text-zinc-100">{item.title}</h2>
                    <AdminBadge tone={toneForStatus(item.status)}>{item.status}</AdminBadge>
                    <AdminBadge tone={toneForPriority(item.priority)}>{item.priority}</AdminBadge>
                    {highPriorityOnly && <AdminBadge tone="blue">{OPS_CATEGORY_LABELS[item.category]}</AdminBadge>}
                  </div>
                  {item.description && <p className="mt-2 text-sm text-zinc-500">{item.description}</p>}
                  <p className="mt-3 text-xs text-zinc-600">
                    Owner: {item.owner_name || 'Unassigned'} · Due: {item.due_at ? new Date(item.due_at).toLocaleDateString() : 'None'} · Source:{' '}
                    {item.source || 'manual'}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <button className="admin-quick-action" disabled={busy} onClick={() => patchItem(item.id, { status: 'in_progress' })}>
                    Start
                  </button>
                  <button className="admin-quick-action" disabled={busy} onClick={() => patchItem(item.id, { status: 'done' })}>
                    Done
                  </button>
                  <button className="admin-quick-action" disabled={busy} onClick={() => patchItem(item.id, { archived: true, status: 'archived' })}>
                    Archive
                  </button>
                </div>
              </div>
            </AdminCard>
          ))
        )}
      </div>
    </div>
  )
}
