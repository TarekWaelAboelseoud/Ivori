'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'

const CONSOLE_PATH = '/studio-ops'
const AUTH_ENDPOINT = '/api/studio-ops/auth'

export default function LoginForm() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const searchParams = useSearchParams()
  const nextPath = searchParams.get('next') || CONSOLE_PATH

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch(AUTH_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ password }),
      })

      const data = (await res.json().catch(() => ({}))) as { error?: string; success?: boolean }

      if (!res.ok) {
        setError(data.error || (res.status === 429 ? 'Too many attempts.' : 'Invalid password.'))
        return
      }

      if (!data.success) {
        setError('Sign-in failed. Try again.')
        return
      }

      const dest = nextPath.startsWith(CONSOLE_PATH) ? nextPath : CONSOLE_PATH
      window.location.assign(dest)
    } catch {
      setError('Connection error. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="console-password" className="text-sm font-medium text-zinc-300">
          Password
        </label>
        <input
          id="console-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          autoComplete="current-password"
          autoFocus
          className="admin-input"
        />
      </div>

      {error && <p className="text-sm text-red-400" role="alert">{error}</p>}

      <button
        type="submit"
        disabled={loading || !password}
        className="admin-btn-primary py-3 text-sm w-full disabled:opacity-50"
      >
        {loading ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  )
}
