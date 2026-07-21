'use client'

import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import Link from 'next/link'
import { AdminBadge, AdminCard, AdminPageHeader } from '@/components/admin/AdminUI'
import ConfirmAction from '@/components/admin/ops/ConfirmAction'
import { FINANCE_TYPES } from '@/lib/ops/config'
import type { FinanceType } from '@/lib/ops/config'
import { DEFAULT_CURRENCY, formatMoney } from '@/lib/ops/currency'
import type { FinanceRecord } from '@/lib/ops/types'

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  const data = (await res.json().catch(() => ({}))) as T & { error?: string }
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

type Tab = 'all' | 'invoices' | 'expenses'

export default function FinanceConsole({
  initial,
  loadError,
  canWrite,
  canDelete,
}: {
  initial: FinanceRecord[]
  loadError?: string
  canWrite: boolean
  canDelete: boolean
}) {
  const [records, setRecords] = useState(initial)
  const [tab, setTab] = useState<Tab>('all')
  const [message, setMessage] = useState(loadError ? 'Run supabase/schema.sql to activate Finance.' : '')
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState({
    title: '',
    client_name: '',
    amount: '',
    currency: DEFAULT_CURRENCY,
    due_at: '',
    type: 'invoice' as FinanceType,
  })

  const visible = useMemo(() => {
    if (tab === 'invoices') return records.filter((r) => r.type === 'invoice' || r.type === 'payment')
    if (tab === 'expenses') return records.filter((r) => ['expense', 'payroll', 'tax', 'subscription'].includes(r.type))
    return records.filter((r) => r.status !== 'cancelled')
  }, [records, tab])

  const metrics = useMemo(() => {
    const revenue = records.filter((r) => r.type !== 'expense' && r.type !== 'refund' && r.status !== 'cancelled')
    const expenses = records.filter((r) => ['expense', 'payroll', 'tax', 'subscription'].includes(r.type) && r.status !== 'cancelled')
    const collected = revenue.filter((r) => r.status === 'paid').reduce((sum, r) => sum + Number(r.amount), 0)
    const expected = revenue.reduce((sum, r) => sum + Number(r.amount), 0)
    const pending = revenue.filter((r) => ['sent', 'pending', 'draft'].includes(r.status)).reduce((sum, r) => sum + Number(r.amount), 0)
    const overdue = revenue.filter((r) => r.status === 'overdue').reduce((sum, r) => sum + Number(r.amount), 0)
    const expenseTotal = expenses.reduce((sum, r) => sum + Number(r.amount), 0)
    return { expected, collected, pending, overdue, expenses: expenseTotal, net: collected - expenseTotal }
  }, [records])

  async function refresh() {
    const data = await api<{ records: FinanceRecord[] }>('/api/studio-ops/finance-records')
    setRecords(data.records)
  }

  async function addRecord(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setMessage('')
    try {
      await api('/api/studio-ops/finance-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          status: form.type === 'expense' ? 'paid' : 'pending',
          amount: Number(form.amount || 0),
        }),
      })
      setForm({ title: '', client_name: '', amount: '', currency: DEFAULT_CURRENCY, due_at: '', type: 'invoice' })
      await refresh()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not create record')
    } finally {
      setBusy(false)
    }
  }

  async function patch(id: string, body: Record<string, unknown>) {
    setBusy(true)
    setMessage('')
    try {
      const data = await api<{ record: FinanceRecord }>(`/api/studio-ops/finance-records/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      setRecords((prev) => prev.map((r) => (r.id === id ? data.record : r)))
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setBusy(false)
    }
  }

  async function remove(id: string) {
    await api(`/api/studio-ops/finance-records/${id}`, { method: 'DELETE' })
    setRecords((prev) => prev.filter((r) => r.id !== id))
  }

  return (
    <div>
      <AdminPageHeader title="Finance" description="Invoices, expenses, cash flow, and formal billing documents — EGP default." />
      {message && <div className={`admin-banner ${loadError ? 'admin-banner-warn' : 'admin-banner-error'} mb-5`}>{message}</div>}

      <div className="mb-5 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Metric label="Expected revenue" value={formatMoney(metrics.expected)} />
        <Metric label="Collected" value={formatMoney(metrics.collected)} />
        <Metric label="Pending invoices" value={formatMoney(metrics.pending)} />
        <Metric label="Overdue" value={formatMoney(metrics.overdue)} />
        <Metric label="Expenses" value={formatMoney(metrics.expenses)} />
        <Metric label="Net cash" value={formatMoney(metrics.net)} />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {(['all', 'invoices', 'expenses'] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            className={`admin-filter-pill ${tab === t ? 'admin-filter-pill-active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'all' ? 'All active' : t === 'invoices' ? 'Invoices' : 'Expenses'}
          </button>
        ))}
      </div>

      <AdminCard className="mb-5 p-4">
        <form onSubmit={addRecord} className="grid gap-3 lg:grid-cols-[130px_1fr_160px_120px_130px_auto]">
          <select className="admin-input" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as FinanceType }))}>
            {FINANCE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <input className="admin-input" placeholder="Title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          <input className="admin-input" placeholder="Client / vendor" value={form.client_name} onChange={(e) => setForm((f) => ({ ...f, client_name: e.target.value }))} />
          <input className="admin-input" inputMode="decimal" placeholder="Amount (EGP)" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} />
          <input className="admin-input" type="date" value={form.due_at} onChange={(e) => setForm((f) => ({ ...f, due_at: e.target.value }))} />
          <button className="admin-btn-primary min-h-0" disabled={busy || !!loadError || !canWrite}>
            Add
          </button>
        </form>
      </AdminCard>

      <AdminCard className="overflow-x-auto">
        <table className="admin-table min-w-[820px]">
          <thead>
            <tr>
              <th>Record</th>
              <th>Client</th>
              <th>Status</th>
              <th>Due</th>
              <th>Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={6}>No records in this view. Create an invoice or log an expense.</td>
              </tr>
            ) : (
              visible.map((record) => (
                <tr key={record.id}>
                  <td>
                    <div className="font-medium text-[var(--admin-ivory)]">{record.title}</div>
                    <div className="text-xs capitalize text-[var(--admin-muted)]">{record.type.replaceAll('_', ' ')}</div>
                  </td>
                  <td>{record.client_name || '—'}</td>
                  <td>
                    <AdminBadge tone={record.status === 'paid' ? 'green' : record.status === 'overdue' ? 'amber' : 'blue'}>
                      {record.status.replaceAll('_', ' ')}
                    </AdminBadge>
                  </td>
                  <td>{record.due_at ? new Date(record.due_at).toLocaleDateString('en-GB') : '—'}</td>
                  <td>{formatMoney(Number(record.amount), record.currency)}</td>
                  <td>
                    <div className="flex flex-wrap gap-2">
                      {record.type === 'invoice' && (
                        <Link className="admin-quick-action" href={`/studio-ops/finance/invoices/${record.id}/print`}>
                          Print PDF
                        </Link>
                      )}
                      {canWrite && record.type === 'invoice' && record.status !== 'paid' && (
                        <button className="admin-quick-action" disabled={busy} onClick={() => patch(record.id, { status: 'paid', paid_at: new Date().toISOString() })}>
                          Mark paid
                        </button>
                      )}
                      {canWrite && (
                        <button className="admin-quick-action" disabled={busy} onClick={() => patch(record.id, { status: 'cancelled' })}>
                          Archive
                        </button>
                      )}
                      {canDelete && (
                        <ConfirmAction
                          label="Delete"
                          warning="Permanently remove this finance record? This cannot be undone."
                          disabled={busy}
                          onConfirm={() => remove(record.id)}
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
