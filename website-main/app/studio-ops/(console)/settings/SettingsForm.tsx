'use client'

import { useState, type ReactNode } from 'react'
import type { AdminSettingsMap } from '@/lib/admin/settings'
import { DEFAULT_CURRENCY } from '@/lib/ops/currency'

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="mt-4 block text-sm text-[var(--admin-muted)]">
      {label}
      <div className="mt-2">{children}</div>
    </label>
  )
}

export default function SettingsForm({ initial }: { initial: AdminSettingsMap }) {
  const [settings, setSettings] = useState(initial)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  function setCompany<K extends keyof AdminSettingsMap['company']>(key: K, value: AdminSettingsMap['company'][K]) {
    setSettings((s) => ({ ...s, company: { ...s.company, [key]: value } }))
  }

  async function save() {
    setBusy(true)
    setMsg('')
    try {
      const res = await fetch('/api/studio-ops/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string; settings?: AdminSettingsMap }
      if (!res.ok) throw new Error(data.error || 'Save failed')
      if (data.settings) setSettings(data.settings)
      setMsg('Saved')
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <section className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-elevated)] p-5">
        <h2 className="text-sm font-semibold text-[var(--admin-ivory)]">Company profile</h2>
        <p className="mt-1 text-xs text-[var(--admin-muted)]">Used on formal invoices and client-facing documents.</p>
        <Field label="Display name">
          <input className="admin-input w-full" value={settings.company.display_name} onChange={(e) => setCompany('display_name', e.target.value)} />
        </Field>
        <Field label="Legal name">
          <input className="admin-input w-full" value={settings.company.legal_name} onChange={(e) => setCompany('legal_name', e.target.value)} />
        </Field>
        <Field label="Website">
          <input className="admin-input w-full" value={settings.company.website} onChange={(e) => setCompany('website', e.target.value)} />
        </Field>
        <Field label="Email">
          <input className="admin-input w-full" type="email" value={settings.company.email} onChange={(e) => setCompany('email', e.target.value)} />
        </Field>
        <Field label="Phone">
          <input className="admin-input w-full" value={settings.company.phone} onChange={(e) => setCompany('phone', e.target.value)} />
        </Field>
        <Field label="WhatsApp">
          <input className="admin-input w-full" value={settings.company.whatsapp} onChange={(e) => setCompany('whatsapp', e.target.value)} />
        </Field>
        <Field label="Address">
          <input className="admin-input w-full" value={settings.company.address} onChange={(e) => setCompany('address', e.target.value)} />
        </Field>
        <Field label="Region">
          <input className="admin-input w-full" value={settings.company.region} onChange={(e) => setCompany('region', e.target.value)} />
        </Field>
        <Field label="VAT / Tax ID">
          <input className="admin-input w-full" value={settings.company.vat_number} onChange={(e) => setCompany('vat_number', e.target.value)} />
        </Field>
        <Field label="Default currency">
          <select className="admin-input w-full" value={settings.company.default_currency} onChange={(e) => setCompany('default_currency', e.target.value)}>
            <option value="EGP">EGP — Egyptian Pound</option>
            <option value="USD">USD — US Dollar</option>
            <option value="EUR">EUR — Euro</option>
            <option value="GBP">GBP — British Pound</option>
          </select>
        </Field>
        <Field label="Invoice prefix">
          <input className="admin-input w-full" value={settings.company.invoice_prefix} onChange={(e) => setCompany('invoice_prefix', e.target.value)} />
        </Field>
        <Field label="Payment instructions">
          <textarea className="admin-input mt-2 min-h-[96px] w-full resize-y" value={settings.company.payment_instructions} onChange={(e) => setCompany('payment_instructions', e.target.value)} />
        </Field>
        <Field label="Bank / payment notes">
          <textarea className="admin-input mt-2 min-h-[72px] w-full resize-y" value={settings.company.bank_notes} onChange={(e) => setCompany('bank_notes', e.target.value)} />
        </Field>
        <Field label="Invoice footer">
          <textarea className="admin-input mt-2 min-h-[72px] w-full resize-y" value={settings.company.invoice_footer} onChange={(e) => setCompany('invoice_footer', e.target.value)} />
        </Field>
        <p className="mt-3 text-xs text-[var(--admin-muted)]">Default currency for new records: {DEFAULT_CURRENCY}</p>
      </section>

      <section className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-elevated)] p-5">
        <h2 className="text-sm font-semibold text-[var(--admin-ivory)]">Site</h2>
        <label className="mt-4 flex items-center gap-3 text-sm text-[var(--admin-text)]">
          <input
            type="checkbox"
            checked={settings.site.maintenance}
            onChange={(e) => setSettings((s) => ({ ...s, site: { ...s.site, maintenance: e.target.checked } }))}
          />
          Maintenance mode
        </label>
      </section>

      <section className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-elevated)] p-5">
        <h2 className="text-sm font-semibold text-[var(--admin-ivory)]">WhatsApp</h2>
        <label className="mt-4 flex items-center gap-3 text-sm text-[var(--admin-text)]">
          <input
            type="checkbox"
            checked={settings.whatsapp.enabled}
            onChange={(e) => setSettings((s) => ({ ...s, whatsapp: { ...s.whatsapp, enabled: e.target.checked } }))}
          />
          Enabled
        </label>
        <label className="mt-4 block text-sm text-[var(--admin-muted)]">
          Channel
          <select
            className="admin-input mt-2 w-full"
            value={settings.whatsapp.channel}
            onChange={(e) =>
              setSettings((s) => ({
                ...s,
                whatsapp: { ...s.whatsapp, channel: e.target.value as AdminSettingsMap['whatsapp']['channel'] },
              }))
            }
          >
            <option value="off">Off</option>
            <option value="footer">Footer strip</option>
            <option value="float">Float</option>
          </select>
        </label>
        <p className="mt-2 text-xs text-[var(--admin-muted)]">
          Number comes from <code className="text-[var(--admin-gold)]">NEXT_PUBLIC_WHATSAPP_NUMBER</code>.
        </p>
      </section>

      <section className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-elevated)] p-5">
        <h2 className="text-sm font-semibold text-[var(--admin-ivory)]">SEO overrides</h2>
        <label className="mt-4 block text-sm text-[var(--admin-muted)]">
          Title override
          <input
            className="admin-input mt-2 w-full"
            value={settings.seo.title_override ?? ''}
            onChange={(e) => setSettings((s) => ({ ...s, seo: { ...s.seo, title_override: e.target.value || undefined } }))}
          />
        </label>
        <label className="mt-4 block text-sm text-[var(--admin-muted)]">
          Description override
          <textarea
            className="admin-input mt-2 min-h-[96px] w-full resize-y"
            value={settings.seo.description_override ?? ''}
            onChange={(e) => setSettings((s) => ({ ...s, seo: { ...s.seo, description_override: e.target.value || undefined } }))}
          />
        </label>
      </section>

      <button type="button" disabled={busy} onClick={save} className="admin-btn-primary">
        {busy ? 'Saving...' : 'Save settings'}
      </button>
      {msg && <p className="text-sm text-[var(--admin-muted)]">{msg}</p>}
    </div>
  )
}
