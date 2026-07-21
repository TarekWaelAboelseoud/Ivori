'use client'

import { useState } from 'react'

export default function VerifyEmailBanner() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleResend() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/resend-verification', { method: 'POST', credentials: 'same-origin' })
      const data = (await res.json().catch(() => ({}))) as { success?: boolean; error?: string }
      if (!res.ok || !data.success) {
        setError(data.error || 'Could not send email.')
        return
      }
      setSent(true)
    } catch {
      setError('Connection error.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4"
      style={{ borderColor: 'var(--gold)', background: 'var(--gold-glow)' }}
    >
      <p className="text-sm" style={{ color: 'var(--gold-bright)' }}>
        {sent ? 'Verification email sent — check your inbox.' : 'Please verify your email address.'}
      </p>
      {!sent && (
        <button
          type="button"
          onClick={handleResend}
          disabled={loading}
          className="rounded-lg px-4 py-1.5 text-xs font-medium transition-opacity disabled:opacity-50"
          style={{ background: 'var(--gold)', color: 'var(--void)' }}
        >
          {loading ? 'Sending…' : 'Resend email'}
        </button>
      )}
      {error && (
        <p className="w-full text-xs" style={{ color: '#e07a6b' }}>
          {error}
        </p>
      )}
    </div>
  )
}
