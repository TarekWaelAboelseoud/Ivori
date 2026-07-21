'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ForgotPasswordClient() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ email }),
      })
      const data = (await res.json().catch(() => ({}))) as { message?: string; error?: string }
      setMessage(data.message || data.error || "If an account exists for that email, we've sent a reset link.")
    } catch {
      setMessage('Connection error. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors focus:border-[var(--gold)]'
  const fieldStyle = { borderColor: 'var(--border)', background: 'var(--surface-elevated)', color: 'var(--foreground)' }

  if (message) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <p className="text-sm" style={{ color: 'var(--text-body)' }}>
          {message}
        </p>
        <Link href="/login" className="text-xs underline" style={{ color: 'var(--text-secondary)' }}>
          Back to login
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
        Enter your email and we&apos;ll send you a link to reset your password.
      </p>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="forgot-email" className="text-sm font-medium" style={{ color: 'var(--text-body)' }}>
          Email
        </label>
        <input
          id="forgot-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          autoFocus
          className={inputClass}
          style={fieldStyle}
        />
      </div>
      <button
        type="submit"
        disabled={loading || !email}
        className="w-full rounded-lg py-3 text-sm font-medium transition-opacity disabled:opacity-50"
        style={{ background: 'var(--gold)', color: 'var(--void)' }}
      >
        {loading ? 'Sending…' : 'Send reset link'}
      </button>
      <Link href="/login" className="text-center text-xs underline" style={{ color: 'var(--text-secondary)' }}>
        Back to login
      </Link>
    </form>
  )
}
