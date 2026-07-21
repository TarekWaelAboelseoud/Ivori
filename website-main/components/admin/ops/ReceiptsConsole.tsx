'use client'

import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { AdminBadge, AdminCard, AdminPageHeader } from '@/components/admin/AdminUI'
import ConfirmAction from '@/components/admin/ops/ConfirmAction'
import { RECEIPT_CATEGORIES, RECEIPT_STATUSES } from '@/lib/ops/config'
import type { ReceiptCategory } from '@/lib/ops/config'
import { DEFAULT_CURRENCY, formatMoney } from '@/lib/ops/currency'
import type { Receipt } from '@/lib/ops/types'

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  const data = (await res.json().catch(() => ({}))) as T & { error?: string }
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

export default function ReceiptsConsole({
  initial,
  loadError,
  canWrite,
  canDelete,
}: {
  initial: Receipt[]
  loadError?: string
  canWrite: boolean
  canDelete: boolean
}) {
  const [receipts, setReceipts] = useState(initial)
  const [query, setQuery] = useState('')
  const [message, setMessage] = useState(loadError ? 'Run supabase/schema.sql to activate Receipts V1.' : '')
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState({
    title: '',
    vendor: '',
    amount: '',
    category: 'general' as ReceiptCategory,
    purchased_at: '',
    payment_method: '',
  })

  const visible = useMemo(() => {
    const q = query.toLowerCase().trim()
    return q
      ? receipts.filter((r) =>
          [r.title, r.vendor, r.client_name, r.project_name]
            .filter(Boolean)
            .some((v) => String(v).toLowerCase().includes(q))
        )
      : receipts.filter((r) => r.status !== 'archived')
  }, [query, receipts])
  const monthTotal = receipts.filter((r) => r.status !== 'archived').reduce((sum, r) => sum + Number(r.amount || 0), 0)

  async function refresh() {
    const data = await api<{ receipts: Receipt[] }>('/api/studio-ops/receipts')
    setReceipts(data.receipts)
  }

  async function addReceipt(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setMessage('')
    try {
      await api('/api/studio-ops/receipts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, amount: Number(form.amount || 0), currency: DEFAULT_CURRENCY }),
      })
      setForm({ title: '', vendor: '', amount: '', category: 'general', purchased_at: '', payment_method: '' })
      await refresh()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not create receipt')
    } finally {
      setBusy(false)
    }
  }

  async function patch(id: string, body: Record<string, unknown>) {
    const data = await api<{ receipt: Receipt }>(`/api/studio-ops/receipts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    setReceipts((prev) => prev.map((r) => (r.id === id ? data.receipt : r)))
  }

  async function remove(id: string) {
    await api(`/api/studio-ops/receipts/${id}`, { method: 'DELETE' })
    setReceipts((prev) => prev.filter((r) => r.id !== id))
  }

  return (
    <div>
      <AdminPageHeader title="Receipts" description="Expense capture, receipt review, reimbursement, and export-ready tracking — EGP default." />
      {message && <div className={`admin-banner ${loadError ? 'admin-banner-warn' : 'admin-banner-error'} mb-5`}>{message}</div>}
      <div className="mb-5 grid gap-3 md:grid-cols-3">
        <Metric label="Tracked total" value={formatMoney(monthTotal)} />
        <Metric label="Unreviewed" value={String(receipts.filter((r) => r.status === 'unreviewed').length)} />
        <Metric label="Active rows" value={String(receipts.filter((r) => r.status !== 'archived').length)} />
      </div>
      <AdminCard className="mb-5 p-4">
        <form onSubmit={addReceipt} className="grid gap-3 lg:grid-cols-[1fr_160px_140px_180px_150px_auto]">
          <input className="admin-input" placeholder="Receipt title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          <input className="admin-input" placeholder="Vendor" value={form.vendor} onChange={(e) => setForm((f) => ({ ...f, vendor: e.target.value }))} />
          <input className="admin-input" placeholder="Amount (EGP)" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} />
          <select className="admin-input" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as ReceiptCategory }))}>
            {RECEIPT_CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <input className="admin-input" type="date" value={form.purchased_at} onChange={(e) => setForm((f) => ({ ...f, purchased_at: e.target.value }))} />
          <button className="admin-btn-primary min-h-0" disabled={busy || !!loadError || !canWrite}>
            Add
          </button>
        </form>
      </AdminCard>
      <input className="admin-input mb-4" placeholder="Search receipts, vendors, clients, projects" value={query} onChange={(e) => setQuery(e.target.value)} />
      <AdminCard className="overflow-x-auto">
        <table className="admin-table min-w-[760px]">
          <thead>
            <tr>
              <th>Receipt</th>
              <th>Category</th>
              <th>Date</th>
              <th>Status</th>
              <th>Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={6}>No receipts tracked yet.</td>
              </tr>
            ) : (
              visible.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div className="font-medium text-[var(--admin-ivory)]">{r.title}</div>
                    <div className="text-xs text-[var(--admin-muted)]">{r.vendor || '—'}</div>
                  </td>
                  <td>{r.category}</td>
                  <td>{r.purchased_at || '—'}</td>
                  <td>
                    <AdminBadge tone={r.status === 'reviewed' ? 'green' : 'neutral'}>{r.status}</AdminBadge>
                  </td>
                  <td>{formatMoney(Number(r.amount), r.currency)}</td>
                  <td>
                    <div className="flex flex-wrap gap-2">
                      {canWrite && (
                        <select className="admin-input" value={r.status} disabled={!canWrite} onChange={(e) => patch(r.id, { status: e.target.value })}>
                          {RECEIPT_STATUSES.map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                        </select>
                      )}
                      {canWrite && r.status !== 'archived' && (
                        <button className="admin-quick-action" disabled={busy} onClick={() => patch(r.id, { status: 'archived' })}>
                          Archive
                        </button>
                      )}
                      {canDelete && (
                        <ConfirmAction
                          label="Delete"
                          warning="Permanently remove this receipt? This cannot be undone."
                          disabled={busy}
                          onConfirm={() => remove(r.id)}
                        />
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </AdminCard>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="admin-metric-card">
      <p className="admin-metric-label">{label}</p>
      <p className="admin-metric-value">{value}</p>
    </div>
  )
}
