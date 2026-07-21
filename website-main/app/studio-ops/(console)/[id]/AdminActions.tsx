'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Zap, FileText, Send, Loader2 } from 'lucide-react'

interface Props {
  orderId: string
  status: string
  hasPdf: boolean
  hasReport: boolean
}

export default function AdminActions({ orderId, status, hasPdf, hasReport }: Props) {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const router = useRouter()

  async function call(endpoint: string, label: string) {
    setLoading(label)
    setError('')
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Something went wrong'); return }
      router.refresh()
    } catch {
      setError('Network error. Try again.')
    } finally {
      setLoading(null)
    }
  }

  const isLoading = (label: string) => loading === label
  const busy = loading !== null

  return (
    <div className="flex flex-col gap-3">
      {/* Generate Report */}
      <button
        onClick={() => call('/api/studio-ops/generate', 'generate')}
        disabled={busy || status === 'paid'}
        className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-[#161616] px-4 py-3 text-sm font-semibold text-zinc-200 transition-all hover:border-[color-mix(in_srgb,var(--admin-gold)_40%,transparent)] hover:text-white disabled:opacity-40"
      >
        {isLoading('generate')
          ? <Loader2 className="h-4 w-4 animate-spin text-[#dfc18a]" />
          : <Zap className="h-4 w-4 text-[#dfc18a]" />}
        {isLoading('generate') ? 'Generating... (30–60s)' : hasReport ? 'Re-generate Report' : 'Generate Report'}
      </button>

      {/* Generate PDF */}
      <button
        onClick={() => call('/api/studio-ops/pdf', 'pdf')}
        disabled={busy || !hasReport}
        className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-[#161616] px-4 py-3 text-sm font-semibold text-zinc-200 transition-all hover:border-[color-mix(in_srgb,var(--admin-gold)_40%,transparent)] hover:text-white disabled:opacity-40"
      >
        {isLoading('pdf')
          ? <Loader2 className="h-4 w-4 animate-spin text-[#dfc18a]" />
          : <FileText className="h-4 w-4 text-[#dfc18a]" />}
        {isLoading('pdf') ? 'Generating PDF...' : hasPdf ? 'Re-generate PDF' : 'Generate PDF'}
      </button>

      {/* Deliver */}
      <button
        onClick={() => call('/api/studio-ops/deliver', 'deliver')}
        disabled={busy || !hasPdf || status === 'delivered'}
        className="flex items-center gap-2 admin-btn-primary px-4 py-3 text-sm disabled:opacity-40"
      >
        {isLoading('deliver')
          ? <Loader2 className="h-4 w-4 animate-spin" />
          : <Send className="h-4 w-4" />}
        {isLoading('deliver') ? 'Sending...' : status === 'delivered' ? '✓ Delivered' : 'Deliver to Client'}
      </button>

      {error && (
        <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}
