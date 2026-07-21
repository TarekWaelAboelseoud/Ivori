'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { AdminBadge } from '@/components/admin/AdminUI'
import type { StudioInquiry } from '@/lib/inquiries/types'

const STATUS_TONE: Record<string, 'gold' | 'blue' | 'green' | 'neutral' | 'amber'> = {
  new: 'gold',
  contacted: 'blue',
  qualified: 'gold',
  proposal_sent: 'amber',
  won: 'green',
  lost: 'neutral',
  archived: 'neutral',
}

async function patchInquiry(id: string, body: Record<string, unknown>) {
  const res = await fetch(`/api/studio-ops/inquiries/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = (await res.json().catch(() => ({}))) as { error?: string; inquiry?: StudioInquiry }
  if (!res.ok) throw new Error(data.error || 'Update failed')
  return data.inquiry
}

async function createOpsItem(body: Record<string, unknown>) {
  const res = await fetch('/api/studio-ops/ops-items', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = (await res.json().catch(() => ({}))) as { error?: string }
  if (!res.ok) throw new Error(data.error || 'Could not add to ops')
}

async function convertInquiry(id: string) {
  const res = await fetch(`/api/studio-ops/inquiries/${id}/convert`, { method: 'POST' })
  const data = (await res.json().catch(() => ({}))) as { error?: string }
  if (!res.ok) throw new Error(data.error || 'Could not convert inquiry')
}

function copyText(text: string) {
  void navigator.clipboard.writeText(text)
}

function scoreTone(score: number): 'gold' | 'blue' | 'neutral' {
  if (score >= 70) return 'gold'
  if (score >= 40) return 'blue'
  return 'neutral'
}

export default function InquiryConsole({ initial, canWrite }: { initial: StudioInquiry[]; canWrite: boolean }) {
  const [rows, setRows] = useState(initial)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [toast, setToast] = useState('')
  const [busy, setBusy] = useState(false)
  const [tagInput, setTagInput] = useState('')

  const selected = rows.find((r) => r.id === selectedId) ?? null

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast(''), 2200)
  }, [])

  const updateRow = useCallback(
    async (id: string, patch: Record<string, unknown>) => {
      setBusy(true)
      try {
        const updated = await patchInquiry(id, patch)
        setRows((prev) =>
          prev.map((r) => {
            if (r.id !== id) return r
            if (updated) return updated
            return { ...r, ...patch } as StudioInquiry
          })
        )
        showToast('Saved')
      } catch (e) {
        showToast(e instanceof Error ? e.message : 'Failed')
      } finally {
        setBusy(false)
      }
    },
    [showToast]
  )

  const addToOps = useCallback(
    async (inquiry: StudioInquiry) => {
      setBusy(true)
      try {
        await createOpsItem({
          title: inquiry.brand || inquiry.company_name || `Inquiry from ${inquiry.contact}`,
          description: [inquiry.goals, inquiry.needs, inquiry.pain_points || inquiry.about].filter(Boolean).join('\n\n'),
          category: inquiry.priority === 'high' ? 'high_priority' : 'leads',
          priority: inquiry.priority === 'urgent' ? 'urgent' : inquiry.priority === 'high' ? 'high' : 'normal',
          owner_name: inquiry.assigned_to,
          source: 'studio_inquiry',
          related_email: inquiry.contact.includes('@') ? inquiry.contact : null,
          metadata: {
            studio_inquiry_id: inquiry.id,
            email_from: inquiry.contact,
            email_subject: inquiry.brand || inquiry.company_name || null,
            automation_source: 'manual_inquiry_conversion',
          },
        })
        showToast('Added to ops')
      } catch (e) {
        showToast(e instanceof Error ? e.message : 'Failed')
      } finally {
        setBusy(false)
      }
    },
    [showToast]
  )

  const convertToCustomer = useCallback(
    async (inquiry: StudioInquiry) => {
      setBusy(true)
      try {
        await convertInquiry(inquiry.id)
        await updateRow(inquiry.id, { status: 'qualified' })
        showToast('Linked to customer database')
      } catch (e) {
        showToast(e instanceof Error ? e.message : 'Failed')
      } finally {
        setBusy(false)
      }
    },
    [showToast, updateRow]
  )

  const workflow = useMemo(
    () =>
      [
        { status: 'new' as const, label: 'New' },
        { status: 'contacted' as const, label: 'Contacted' },
        { status: 'qualified' as const, label: 'Qualified' },
        { status: 'proposal_sent' as const, label: 'Proposal sent' },
        { status: 'won' as const, label: 'Won' },
        { status: 'lost' as const, label: 'Lost' },
      ] as const,
    []
  )

  useEffect(() => {
    const isTyping = () => {
      const el = document.activeElement
      if (!el) return false
      const tag = el.tagName
      return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
    }

    const onKey = (e: KeyboardEvent) => {
      if (isTyping()) return
      if (e.key === 'Escape' && selectedId) {
        setSelectedId(null)
        return
      }
      if (!rows.length) return
      const idx = rows.findIndex((r) => r.id === selectedId)
      if (e.key === 'j' || e.key === 'k') {
        e.preventDefault()
        const delta = e.key === 'j' ? 1 : -1
        const next =
          idx === -1
            ? delta > 0
              ? 0
              : rows.length - 1
            : Math.min(Math.max(idx + delta, 0), rows.length - 1)
        setSelectedId(rows[next].id)
        setTagInput(rows[next].tags.join(', '))
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [rows, selectedId])

  return (
    <div className="admin-console-layout">
      {toast && (
        <div className="admin-toast" role="status">
          {toast}
        </div>
      )}

      <div className="admin-console-list space-y-3">
        {rows.length === 0 ? (
          <div className="admin-empty">
            <p className="font-display text-xl text-zinc-300">No inquiries yet</p>
            <p className="mt-2 text-sm text-zinc-500">Submissions from the contact form appear here.</p>
          </div>
        ) : (
          rows.map((row) => (
            <button
              key={row.id}
              type="button"
              onClick={() => {
                setSelectedId(row.id)
                setTagInput(row.tags.join(', '))
              }}
              className={`admin-inquiry-row w-full text-left ${selectedId === row.id ? 'admin-inquiry-row-active' : ''} ${busy ? 'is-busy' : ''}`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-base font-medium text-zinc-100">{row.brand || row.company_name || 'No brand'}</span>
                <AdminBadge tone={STATUS_TONE[row.status]}>{row.status}</AdminBadge>
                {(row.priority === 'high' || row.priority === 'urgent') && <AdminBadge tone="gold">{row.priority}</AdminBadge>}
                {row.lead_score > 0 && <AdminBadge tone={scoreTone(row.lead_score)}>{row.lead_score}</AdminBadge>}
                {row.follow_up_date && <AdminBadge tone="amber">follow-up</AdminBadge>}
              </div>
              <p className="mt-1 truncate text-xs text-zinc-500">{row.contact}</p>
              <p className="mt-0.5 text-[10px] text-zinc-600">
                {new Date(row.created_at).toLocaleString()}
                {row.project_type ? ` · ${row.project_type}` : ''}
                {row.assigned_to ? ` · ${row.assigned_to}` : ''}
              </p>
            </button>
          ))
        )}
      </div>

      {selected && (
        <div
          className="admin-console-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Inquiry detail"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedId(null)
          }}
        >
          <div className={`admin-console-drawer-inner${busy ? ' is-busy' : ''}`} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="admin-drawer-title">{selected.brand || selected.company_name || 'Inquiry'}</h2>
                <p className="mt-1 text-xs text-zinc-500">{new Date(selected.created_at).toLocaleString()}</p>
              </div>
              <button type="button" className="admin-btn-ghost px-3 py-1 text-xs" onClick={() => setSelectedId(null)}>
                Close
              </button>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {workflow.map((step) => (
                <button
                  key={step.status}
                  type="button"
                  disabled={busy || !canWrite || selected.status === step.status}
                  onClick={() => updateRow(selected.id, { status: step.status })}
                  className={`admin-quick-action ${selected.status === step.status ? 'admin-quick-action-active' : ''}`}
                >
                  {step.label}
                </button>
              ))}
              <button
                type="button"
                disabled={busy || !canWrite}
                onClick={() =>
                  updateRow(selected.id, {
                    archived: !selected.archived,
                    archived_at: selected.archived ? null : new Date().toISOString(),
                    status: selected.archived ? 'new' : 'archived',
                  })
                }
                className="admin-quick-action"
              >
                {selected.archived ? 'Restore' : 'Archive'}
              </button>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1">
                <span className="admin-field-label">Priority</span>
                <select
                  className="admin-input"
                  value={selected.priority}
                  disabled={busy || !canWrite}
                  onChange={(e) => updateRow(selected.id, { priority: e.target.value })}
                >
                  <option value="low">low</option>
                  <option value="medium">medium</option>
                  <option value="high">high</option>
                  <option value="urgent">urgent</option>
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="admin-field-label">Source</span>
                <select
                  className="admin-input"
                  value={selected.source}
                  disabled={busy || !canWrite}
                  onChange={(e) => updateRow(selected.id, { source: e.target.value })}
                >
                  <option value="website">website</option>
                  <option value="instagram">instagram</option>
                  <option value="whatsapp">whatsapp</option>
                  <option value="referral">referral</option>
                  <option value="manual">manual</option>
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="admin-field-label">Lead score</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  className="admin-input"
                  defaultValue={selected.lead_score}
                  disabled={busy || !canWrite}
                  onBlur={(e) => {
                    const v = Number(e.target.value)
                    if (!Number.isNaN(v) && v !== selected.lead_score) {
                      updateRow(selected.id, { lead_score: v })
                    }
                  }}
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="admin-field-label">Assigned</span>
                <input
                  className="admin-input"
                  defaultValue={selected.assigned_to ?? ''}
                  disabled={busy || !canWrite}
                  placeholder="Operator"
                  onBlur={(e) => {
                    const v = e.target.value.trim()
                    if (v !== (selected.assigned_to ?? '')) updateRow(selected.id, { assigned_to: v || null })
                  }}
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="admin-field-label">Follow-up date</span>
                <input
                  type="date"
                  className="admin-input"
                  defaultValue={selected.follow_up_date?.slice(0, 10) ?? ''}
                  disabled={busy || !canWrite}
                  onBlur={(e) => {
                    const v = e.target.value
                    if (v !== (selected.follow_up_date?.slice(0, 10) ?? '')) {
                      updateRow(selected.id, { follow_up_date: v || null })
                    }
                  }}
                />
              </label>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <label className="flex flex-col gap-1">
                <span className="admin-field-label">Region</span>
                <input
                  className="admin-input"
                  defaultValue={selected.region ?? ''}
                  disabled={busy || !canWrite}
                  onBlur={(e) => updateRow(selected.id, { region: e.target.value.trim() || null })}
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="admin-field-label">Country</span>
                <input
                  className="admin-input"
                  defaultValue={selected.country ?? ''}
                  disabled={busy || !canWrite}
                  onBlur={(e) => updateRow(selected.id, { country: e.target.value.trim() || null })}
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="admin-field-label">City</span>
                <input
                  className="admin-input"
                  defaultValue={selected.city ?? ''}
                  disabled={busy || !canWrite}
                  onBlur={(e) => updateRow(selected.id, { city: e.target.value.trim() || null })}
                />
              </label>
            </div>

            <label className="mt-4 flex flex-col gap-1">
              <span className="admin-field-label">Tags (comma-separated)</span>
              <input
                className="admin-input"
                value={tagInput}
                disabled={busy || !canWrite}
                onChange={(e) => setTagInput(e.target.value)}
                onBlur={() => {
                  const tags = tagInput
                    .split(',')
                    .map((t) => t.trim())
                    .filter(Boolean)
                  if (tags.join(',') !== selected.tags.join(',')) {
                    updateRow(selected.id, { tags })
                  }
                }}
              />
            </label>

            <label className="mt-4 flex flex-col gap-1">
              <span className="admin-field-label">Internal summary</span>
              <textarea
                className="admin-input min-h-[72px] resize-y"
                defaultValue={selected.internal_summary ?? ''}
                disabled={busy || !canWrite}
                onBlur={(e) => {
                  const v = e.target.value
                  if (v !== (selected.internal_summary ?? '')) updateRow(selected.id, { internal_summary: v || null })
                }}
              />
            </label>

            <label className="mt-4 flex flex-col gap-1">
              <span className="admin-field-label">Internal notes</span>
              <textarea
                className="admin-input min-h-[100px] resize-y"
                defaultValue={selected.notes ?? ''}
                disabled={busy || !canWrite}
                onBlur={(e) => {
                  const v = e.target.value
                  if (v !== (selected.notes ?? '')) updateRow(selected.id, { notes: v || null })
                }}
              />
            </label>

            <QualificationBlock inquiry={selected} />

            <div className="mt-6 flex flex-wrap gap-2">
              <button
                type="button"
                className="admin-btn-ghost text-xs"
                onClick={() => {
                  copyText(selected.contact)
                  showToast('Contact copied')
                }}
              >
                Copy contact
              </button>
              <button
                type="button"
                className="admin-btn-ghost text-xs"
                onClick={() => {
                  const brief = [
                    selected.brand,
                    selected.goals,
                    selected.project_type,
                    selected.needs,
                    selected.contact,
                  ]
                    .filter(Boolean)
                    .join('\n')
                  copyText(brief)
                  showToast('Brief copied')
                }}
              >
                Copy brief
              </button>
              <button
                type="button"
                className="admin-btn-ghost text-xs"
                disabled={!canWrite}
                onClick={() => updateRow(selected.id, { last_contacted_at: new Date().toISOString(), status: 'contacted' })}
              >
                Mark contacted
              </button>
              <button type="button" className="admin-btn-ghost text-xs" disabled={busy || !canWrite} onClick={() => addToOps(selected)}>
                Add to Ops
              </button>
              <button type="button" className="admin-btn-ghost text-xs" disabled={busy || !canWrite} onClick={() => convertToCustomer(selected)}>
                Link customer
              </button>
              <a href={`mailto:${selected.contact}`} className="admin-btn-primary text-xs">
                Email
              </a>
            </div>

            <Timeline inquiry={selected} />
          </div>
        </div>
      )}
    </div>
  )
}

function QualificationBlock({ inquiry }: { inquiry: StudioInquiry }) {
  const fields = [
    ['Type', inquiry.project_type],
    ['Stage', inquiry.project_stage],
    ['Timeline', inquiry.timeline],
    ['Budget', inquiry.budget_range],
    ['Revenue', inquiry.revenue_band],
    ['Goals', inquiry.goals],
    ['Needs', inquiry.needs],
    ['Pain', inquiry.pain_points || inquiry.about],
    ['WhatsApp', inquiry.whatsapp],
    ['Instagram', inquiry.instagram],
    ['Preferred', inquiry.preferred_contact_method],
  ].filter(([, v]) => v)

  if (!fields.length) return null

  return (
    <div className="mt-6 rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
      <p className="admin-field-label">Qualification</p>
      <dl className="mt-3 space-y-2 text-sm">
        {fields.map(([k, v]) => (
          <div key={k} className="grid grid-cols-[7rem_1fr] gap-2">
            <dt className="text-zinc-600">{k}</dt>
            <dd className="text-zinc-400">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

function Timeline({ inquiry }: { inquiry: StudioInquiry }) {
  return (
    <div className="mt-8 border-t border-zinc-800 pt-6">
      <p className="admin-field-label">Timeline</p>
      <ul className="mt-3 space-y-2">
        {(inquiry.activity_log?.length
          ? inquiry.activity_log
          : [{ at: inquiry.created_at, type: 'created' as const, detail: 'Submitted' }]
        ).map((entry, i) => (
          <li key={`${entry.at}-${i}`} className="flex gap-3 text-xs text-zinc-500">
            <span className="shrink-0 tabular-nums text-zinc-600">{new Date(entry.at).toLocaleString()}</span>
            <span className="text-zinc-400">
              {entry.type === 'status' && entry.from && entry.to
                ? `Status ${entry.from} → ${entry.to}`
                : entry.type === 'priority' && entry.to
                  ? `Priority → ${entry.to}`
                  : entry.detail ?? entry.type}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[10px] text-zinc-600">Source: {inquiry.source}</p>
    </div>
  )
}
