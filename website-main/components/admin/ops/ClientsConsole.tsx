'use client'

import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { AdminBadge, AdminCard, AdminPageHeader } from '@/components/admin/AdminUI'
import ConfirmAction from '@/components/admin/ops/ConfirmAction'
import { CLIENT_STATUSES, CLIENT_TIERS } from '@/lib/ops/config'
import type { ClientStatus, ClientTier, RecurringInterval } from '@/lib/ops/config'
import { DEFAULT_CURRENCY, formatMoney } from '@/lib/ops/currency'
import type { Client } from '@/lib/ops/types'

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  const data = (await res.json().catch(() => ({}))) as T & { error?: string }
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

export default function ClientsConsole({
  initial,
  loadError,
  canWrite,
  canDelete,
}: {
  initial: Client[]
  loadError?: string
  canWrite: boolean
  canDelete: boolean
}) {
  const [clients, setClients] = useState(initial)
  const [message, setMessage] = useState(loadError ? 'Run supabase/schema.sql to activate Clients V1.' : '')
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    monthly_value: '',
    tier: 'standard' as ClientTier,
    status: 'prospect' as ClientStatus,
    next_invoice_at: '',
    recurring_interval: 'monthly' as RecurringInterval,
  })
  const metrics = useMemo(
    () => ({
      active: clients.filter((c) => c.status === 'active').length,
      prospects: clients.filter((c) => c.status === 'prospect').length,
      monthly: clients.filter((c) => c.status === 'active').reduce((sum, c) => sum + Number(c.monthly_value || 0), 0),
    }),
    [clients]
  )

  async function refresh() {
    const data = await api<{ clients: Client[] }>('/api/studio-ops/clients')
    setClients(data.clients)
  }

  async function addClient(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setMessage('')
    try {
      await api('/api/studio-ops/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          monthly_value: Number(form.monthly_value || 0),
          currency: DEFAULT_CURRENCY,
          auto_generate: false,
        }),
      })
      setForm({
        name: '',
        email: '',
        company: '',
        monthly_value: '',
        tier: 'standard',
        status: 'prospect',
        next_invoice_at: '',
        recurring_interval: 'monthly',
      })
      await refresh()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not create client')
    } finally {
      setBusy(false)
    }
  }

  async function patch(id: string, body: Record<string, unknown>) {
    const data = await api<{ client: Client }>(`/api/studio-ops/clients/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    setClients((prev) => prev.map((c) => (c.id === id ? data.client : c)))
  }

  async function remove(id: string) {
    await api(`/api/studio-ops/clients/${id}`, { method: 'DELETE' })
    setClients((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <div>
      <AdminPageHeader title="Clients" description="Client directory, monthly value, ownership, follow-ups, and billing foundation." />
      {message && <div className={`admin-banner ${loadError ? 'admin-banner-warn' : 'admin-banner-error'} mb-5`}>{message}</div>}
      <div className="mb-5 grid gap-3 md:grid-cols-3">
        <Metric label="Active clients" value={String(metrics.active)} />
        <Metric label="Prospects" value={String(metrics.prospects)} />
        <Metric label="Monthly value" value={formatMoney(metrics.monthly)} />
      </div>
      <AdminCard className="mb-5 p-4">
        <form onSubmit={addClient} className="grid gap-3 lg:grid-cols-[1fr_180px_150px_130px_150px_auto]">
          <input className="admin-input" placeholder="Client name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <input className="admin-input" placeholder="Email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          <select className="admin-input" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as ClientStatus }))}>
            {CLIENT_STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <input className="admin-input" placeholder="Monthly (EGP)" value={form.monthly_value} onChange={(e) => setForm((f) => ({ ...f, monthly_value: e.target.value }))} />
          <input className="admin-input" type="date" value={form.next_invoice_at} onChange={(e) => setForm((f) => ({ ...f, next_invoice_at: e.target.value }))} />
          <button className="admin-btn-primary min-h-0" disabled={busy || !!loadError || !canWrite}>
            Add
          </button>
        </form>
      </AdminCard>
      <AdminCard className="overflow-x-auto">
        <table className="admin-table min-w-[820px]">
          <thead>
            <tr>
              <th>Client</th>
              <th>Status</th>
              <th>Tier</th>
              <th>Owner</th>
              <th>Monthly</th>
              <th>Next billing</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.length === 0 ? (
              <tr>
                <td colSpan={7}>No clients yet. Add prospects and active accounts here.</td>
              </tr>
            ) : (
              clients.map((client) => (
                <tr key={client.id}>
                  <td>
                    <div className="font-medium text-[var(--admin-ivory)]">{client.name}</div>
                    <div className="text-xs text-[var(--admin-muted)]">{client.email || client.company || '—'}</div>
                  </td>
                  <td>
                    <AdminBadge tone={client.status === 'active' ? 'green' : client.status === 'prospect' ? 'blue' : 'neutral'}>{client.status}</AdminBadge>
                  </td>
                  <td>
                    <select className="admin-input" value={client.tier} disabled={!canWrite} onChange={(e) => patch(client.id, { tier: e.target.value })}>
                      {CLIENT_TIERS.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </td>
                  <td>{client.owner_name || '—'}</td>
                  <td>{formatMoney(Number(client.monthly_value), client.currency)}</td>
                  <td>{client.next_invoice_at ? new Date(client.next_invoice_at).toLocaleDateString('en-GB') : '—'}</td>
                  <td>
                    <div className="flex flex-wrap gap-2">
                      {canWrite && (
                        <>
                          <button className="admin-quick-action" disabled={busy} onClick={() => patch(client.id, { auto_generate: true })}>
                            Auto invoice
                          </button>
                          <button className="admin-quick-action" disabled={busy} onClick={() => patch(client.id, { next_invoice_at: new Date().toISOString() })}>
                            Create invoice
                          </button>
                          {client.status !== 'lost' && (
                            <button className="admin-quick-action" disabled={busy} onClick={() => patch(client.id, { status: 'lost' })}>
                              Archive
                            </button>
                          )}
                        </>
                      )}
                      {canDelete && (
                        <ConfirmAction
                          label="Delete"
                          warning="Permanently remove this client record? Linked invoices are not deleted."
                          disabled={busy}
                          onConfirm={() => remove(client.id)}
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
