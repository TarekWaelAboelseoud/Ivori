'use client'

import { useState } from 'react'
import { ArrowRight, CheckCircle2 } from 'lucide-react'

const REVENUE_RANGES = [
  'Under 500,000 EGP/mo',
  '500,000 – 2,000,000 EGP/mo',
  '2,000,000 – 8,000,000 EGP/mo',
  '8,000,000 – 20,000,000 EGP/mo',
  '20,000,000+ EGP/mo',
]

const TRAFFIC_SOURCES = [
  'Meta Ads (Facebook/Instagram)',
  'Google Ads',
  'TikTok Ads',
  'Organic / SEO',
  'Email Marketing',
  'Influencer / UGC',
  'Mixed / Multiple',
  'Other',
]

interface Props {
  token: string
  tier: string
  region: string
}

export default function IntakeForm({ token, tier, region }: Props) {
  const [form, setForm] = useState({
    store_url: '',
    niche: '',
    monthly_revenue: '',
    primary_traffic: '',
    top_products: '',
    biggest_problem: '',
    conversion_rate: '',
    additional_notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!form.store_url || !form.monthly_revenue || !form.primary_traffic || !form.biggest_problem) {
      setError('Please fill in all required fields.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, tier, region, ...form }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.')
        return
      }
      setSubmitted(true)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#2a2722] bg-[#11100e]">
          <CheckCircle2 className="h-7 w-7 text-[#c9a96a]" />
        </div>
        <h2 className="text-xl font-semibold text-[#f5f2ec]">Intake submitted.</h2>
        <p className="max-w-sm text-sm leading-6 text-[#a8a29a]">
          Your intake is now in the queue. Reviews and audits are delivered by email within 48 hours; implementation scopes are confirmed directly.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Field label="Store URL" required>
        <input
          type="url"
          placeholder="https://yourstore.myshopify.com"
          value={form.store_url}
          onChange={(e) => set('store_url', e.target.value)}
          className={inputClass}
        />
      </Field>

      <Field label="Store niche / industry">
        <input
          type="text"
          placeholder="e.g. Fashion, supplements, home decor"
          value={form.niche}
          onChange={(e) => set('niche', e.target.value)}
          className={inputClass}
        />
      </Field>

      <Field label="Monthly revenue range" required>
        <select value={form.monthly_revenue} onChange={(e) => set('monthly_revenue', e.target.value)} className={inputClass}>
          <option value="">Select range...</option>
          {REVENUE_RANGES.map((range) => <option key={range} value={range}>{range}</option>)}
        </select>
      </Field>

      <Field label="Primary traffic source" required>
        <select value={form.primary_traffic} onChange={(e) => set('primary_traffic', e.target.value)} className={inputClass}>
          <option value="">Select source...</option>
          {TRAFFIC_SOURCES.map((source) => <option key={source} value={source}>{source}</option>)}
        </select>
      </Field>

      <Field label="Top 3 products by revenue">
        <textarea
          placeholder="List your top-selling products by name. This helps us focus the review on what matters most."
          rows={3}
          value={form.top_products}
          onChange={(e) => set('top_products', e.target.value)}
          className={inputClass}
        />
      </Field>

      <Field label="What is your biggest conversion problem right now?" required>
        <textarea
          placeholder="Be specific. For example: people add to cart but do not checkout, mobile bounce rate is high, or customers ask the same payment questions."
          rows={4}
          value={form.biggest_problem}
          onChange={(e) => set('biggest_problem', e.target.value)}
          className={inputClass}
        />
      </Field>

      <Field label="Current conversion rate (if known)">
        <input
          type="text"
          placeholder="e.g. 1.8% - leave blank if unsure"
          value={form.conversion_rate}
          onChange={(e) => set('conversion_rate', e.target.value)}
          className={inputClass}
        />
      </Field>

      <Field label="Anything else we should know?">
        <textarea
          placeholder="Specific pages to focus on, past tests you have run, apps you use, or local payment concerns."
          rows={3}
          value={form.additional_notes}
          onChange={(e) => set('additional_notes', e.target.value)}
          className={inputClass}
        />
      </Field>

      {error && (
        <p className="border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#f5f2ec] px-6 py-3 text-sm font-semibold text-[#0a0a0a] transition-colors hover:bg-white disabled:cursor-wait disabled:opacity-60"
      >
        {loading ? 'Submitting...' : 'Submit intake form'}
        {!loading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
      </button>

      <p className="text-center text-xs text-[#756b5d]">
        Reviews and audits are delivered within 48 hours after submission.
      </p>
    </form>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-[#d8d0c3]">
        {label}
        {required && <span className="ml-1 text-[#c9a96a]">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputClass =
  'w-full rounded-md border border-[#2a2722] bg-[#0a0a0a] px-4 py-3 text-sm text-[#f5f2ec] placeholder-[#756b5d] outline-none transition-colors focus:border-[#c9a96a] focus:ring-1 focus:ring-[#c9a96a]/20'
