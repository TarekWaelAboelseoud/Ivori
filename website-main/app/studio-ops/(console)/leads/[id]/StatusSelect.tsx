'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const STATUSES = ['new', 'researched', 'contacted', 'replied', 'meeting', 'won', 'lost', 'not_qualified']

const STATUS_COLORS: Record<string, string> = {
  new:           'text-zinc-300',
  researched:    'text-blue-400',
  contacted:     'text-yellow-400',
  replied:       'text-purple-400',
  meeting:       'text-[#dfc18a]',
  won:           'text-green-400',
  lost:          'text-red-400',
  not_qualified: 'text-zinc-500',
}

export default function StatusSelect({ id, current }: { id: string; current: string }) {
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  async function update(status: string) {
    setSaving(true)
    await fetch(`/api/studio-ops/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setSaving(false)
    router.refresh()
  }

  return (
    <select
      defaultValue={current}
      disabled={saving}
      onChange={e => update(e.target.value)}
      className={`rounded-lg border border-zinc-800 bg-[#161616] px-3 py-1.5 text-sm font-medium outline-none focus:border-[color-mix(in_srgb,var(--admin-gold)_40%,transparent)] disabled:opacity-50 ${STATUS_COLORS[current] ?? 'text-zinc-300'}`}
    >
      {STATUSES.map(s => (
        <option key={s} value={s} className="text-white bg-[#161616]">{s.replace('_', ' ')}</option>
      ))}
    </select>
  )
}
