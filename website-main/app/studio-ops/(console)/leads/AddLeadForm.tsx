'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X } from 'lucide-react'

export default function AddLeadForm() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    store_url: '', brand_name: '', country: '', niche: '',
    contact_email: '', contact_instagram: '', ad_activity: 'unknown', source: 'manual',
  })
  const router = useRouter()

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.store_url) return
    setLoading(true)
    try {
      const res = await fetch('/api/studio-ops/leads', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        const { id } = await res.json()
        setOpen(false)
        router.push(`/studio-ops/leads/${id}`)
        router.refresh()
      }
    } finally { setLoading(false) }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 admin-btn-primary px-4 py-2.5 text-sm transition-colors"
      >
        <Plus className="h-4 w-4" /> Add Lead
      </button>
    )
  }

  return (
    <form onSubmit={submit} className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-[#111] p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-semibold text-white">Add Lead</h2>
          <button type="button" onClick={() => setOpen(false)}>
            <X className="h-4 w-4 text-zinc-500 hover:text-white" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="mb-1 block text-xs text-zinc-400">Store URL *</label>
            <input type="url" required value={form.store_url} onChange={e => set('store_url', e.target.value)}
              placeholder="https://store.myshopify.com" className={inp} />
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-400">Brand Name</label>
            <input value={form.brand_name} onChange={e => set('brand_name', e.target.value)} placeholder="Brand Co" className={inp} />
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-400">Country</label>
            <input value={form.country} onChange={e => set('country', e.target.value)} placeholder="Egypt" className={inp} />
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-400">Niche</label>
            <input value={form.niche} onChange={e => set('niche', e.target.value)} placeholder="Fashion" className={inp} />
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-400">Ad Activity</label>
            <select value={form.ad_activity} onChange={e => set('ad_activity', e.target.value)} className={inp}>
              <option value="active">Active Ads</option>
              <option value="inactive">No Ads</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="mb-1 block text-xs text-zinc-400">Instagram Handle</label>
            <input value={form.contact_instagram} onChange={e => set('contact_instagram', e.target.value)} placeholder="@brand" className={inp} />
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-400">Source</label>
            <select value={form.source} onChange={e => set('source', e.target.value)} className={inp}>
              <option value="manual">Manual</option>
              <option value="meta_ads">Meta Ad Library</option>
              <option value="instagram">Instagram</option>
              <option value="builtwith">BuiltWith</option>
              <option value="referral">Referral</option>
            </select>
          </div>
        </div>

        <div className="mt-5 flex gap-3">
          <button type="button" onClick={() => setOpen(false)}
            className="flex-1 rounded-xl border border-zinc-700 py-2.5 text-sm text-zinc-300 hover:text-white">
            Cancel
          </button>
          <button type="submit" disabled={loading || !form.store_url}
            className="admin-btn-primary flex-1 py-2.5 text-sm disabled:opacity-50">
            {loading ? 'Adding...' : 'Add & View'}
          </button>
        </div>
      </div>
    </form>
  )
}

const inp = 'w-full rounded-lg border border-zinc-800 bg-[#161616] px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-[color-mix(in_srgb,var(--admin-gold)_40%,transparent)]'
