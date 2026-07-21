'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, Mail, RotateCw } from 'lucide-react'

export default function LeadActions({ id, hasAssessment }: { id: string; hasAssessment: boolean }) {
  const [assessing, setAssessing] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function assess() {
    setAssessing(true)
    setError(null)
    try {
      const res = await fetch(`/api/studio-ops/leads/${id}/assess`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Assessment failed'); return }
      router.refresh()
    } catch { setError('Network error') }
    finally { setAssessing(false) }
  }

  async function generateOutreach() {
    setGenerating(true)
    setError(null)
    try {
      const res = await fetch(`/api/studio-ops/leads/${id}/outreach`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Outreach generation failed'); return }
      router.refresh()
    } catch { setError('Network error') }
    finally { setGenerating(false) }
  }

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">{error}</p>
      )}
      <div className="flex gap-3">
        <button
          onClick={assess}
          disabled={assessing}
          className="flex items-center gap-2 admin-btn-primary px-4 py-2.5 text-sm disabled:opacity-50 transition-colors"
        >
          {assessing ? <RotateCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {assessing ? 'Assessing...' : hasAssessment ? 'Re-Assess' : 'AI Assess'}
        </button>
        <button
          onClick={generateOutreach}
          disabled={generating || !hasAssessment}
          title={!hasAssessment ? 'Run assessment first' : undefined}
          className="flex items-center gap-2 rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-semibold text-zinc-300 hover:text-white hover:border-zinc-500 disabled:opacity-40 transition-colors"
        >
          {generating ? <RotateCw className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
          {generating ? 'Generating...' : 'Gen Outreach'}
        </button>
      </div>
    </div>
  )
}
