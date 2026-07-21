'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function ResetPasswordClient() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError("Passwords don't match.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ token, password }),
      })
      const data = (await res.json().catch(() => ({}))) as { success?: boolean; error?: string }
      if (!res.ok || !data.success) {
        setError(data.error || 'Something went wrong.')
        return
      }
      setDone(true)
    } catch {
      setError('Connection error. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors focus:border-[var(--gold)]'
  const fieldStyle = { borderColor: 'var(--border)', background: 'var(--surface-elevated)', color: 'var(--foreground)' }

  if (!token) {
    return (
      <p className="text-center text-sm" style={{ color: 'var(--text-body)' }}>
        This link is missing its reset token. Request a new one from{' '}
        <Link href="/forgot-password" className="underline" style={{ color: 'var(--text-secondary)' }}>
          the forgot password page
        </Link>
        .
      </p>
    )
  }

  if (done) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <p className="text-sm" style={{ color: 'var(--text-body)' }}>
          Your password has been reset.
        </p>
        <Link
          href="/login"
          className="rounded-lg py-3 text-sm font-medium"
          style={{ background: 'var(--gold)', color: 'var(--void)' }}
        >
          Sign in
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="new-password" className="text-sm font-medium" style={{ color: 'var(--text-body)' }}>
          New password
        </label>
        <input
          id="new-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
          autoComplete="new-password"
          autoFocus
          className={inputClass}
          style={fieldStyle}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="confirm-password" className="text-sm font-medium" style={{ color: 'var(--text-body)' }}>
          Confirm password
        </label>
        <input
          id="confirm-password"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Re-enter password"
          autoComplete="new-password"
          className={inputClass}
          style={fieldStyle}
        />
      </div>
      {error && (
        <p className="text-sm" role="alert" style={{ color: '#e07a6b' }}>
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={loading || !password || !confirm}
        className="w-full rounded-lg py-3 text-sm font-medium transition-opacity disabled:opacity-50"
        style={{ background: 'var(--gold)', color: 'var(--void)' }}
      >
        {loading ? 'Saving…' : 'Save new password'}
      </button>
    </form>
  )
}
