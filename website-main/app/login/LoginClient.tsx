'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

type Mode = 'login' | 'signup'
type Step = 'credentials' | 'mfa'

export default function LoginClient() {
  const [mode, setMode] = useState<Mode>('login')
  const [step, setStep] = useState<Step>('credentials')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [mfaCode, setMfaCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const searchParams = useSearchParams()
  const nextPath = searchParams.get('next') || ''

  async function handleCredentialsSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(mode === 'login' ? { email, password } : { email, password, name }),
      })

      const data = (await res.json().catch(() => ({}))) as {
        error?: string
        success?: boolean
        redirect?: string
        mfaRequired?: boolean
      }

      if (!res.ok || !data.success) {
        setError(data.error || (res.status === 429 ? 'Too many attempts.' : 'Something went wrong.'))
        return
      }

      if (data.mfaRequired) {
        setStep('mfa')
        return
      }

      const fallback = data.redirect || '/portal'
      const dest = mode === 'login' && nextPath ? nextPath : fallback
      window.location.assign(dest)
    } catch {
      setError('Connection error. Try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleMfaSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/mfa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ code: mfaCode }),
      })

      const data = (await res.json().catch(() => ({}))) as { error?: string; success?: boolean; redirect?: string }

      if (!res.ok || !data.success) {
        setError(data.error || 'Invalid code.')
        return
      }

      window.location.assign(nextPath || data.redirect || '/studio-ops')
    } catch {
      setError('Connection error. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors focus:border-[var(--gold)]'
  const fieldStyle = { borderColor: 'var(--border)', background: 'var(--surface-elevated)', color: 'var(--foreground)' }

  if (step === 'mfa') {
    return (
      <div className="flex flex-col gap-5">
        <div>
          <h2 className="text-sm font-medium" style={{ color: 'var(--ivory)' }}>
            Enter your authentication code
          </h2>
          <p className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
            Open your authenticator app, or use one of your backup codes.
          </p>
        </div>
        <form onSubmit={handleMfaSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            inputMode="numeric"
            value={mfaCode}
            onChange={(e) => setMfaCode(e.target.value)}
            placeholder="123456 or backup code"
            autoComplete="one-time-code"
            autoFocus
            className={inputClass}
            style={fieldStyle}
          />
          {error && (
            <p className="text-sm" role="alert" style={{ color: '#e07a6b' }}>
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading || !mfaCode}
            className="w-full rounded-lg py-3 text-sm font-medium transition-opacity disabled:opacity-50"
            style={{ background: 'var(--gold)', color: 'var(--void)' }}
          >
            {loading ? 'Verifying…' : 'Verify'}
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex gap-1 rounded-lg border p-1" style={{ borderColor: 'var(--border)' }}>
        <button
          type="button"
          onClick={() => {
            setMode('login')
            setError('')
          }}
          className="flex-1 rounded-md py-2 text-sm font-medium transition-colors"
          style={
            mode === 'login'
              ? { background: 'var(--gold)', color: 'var(--void)' }
              : { color: 'var(--text-body)' }
          }
        >
          Log in
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('signup')
            setError('')
          }}
          className="flex-1 rounded-md py-2 text-sm font-medium transition-colors"
          style={
            mode === 'signup'
              ? { background: 'var(--gold)', color: 'var(--void)' }
              : { color: 'var(--text-body)' }
          }
        >
          Sign up
        </button>
      </div>

      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
        {mode === 'login'
          ? 'Team members and clients use the same form — we\u2019ll take you to the right place.'
          : 'Create a client account to view your project and order status.'}
      </p>

      <form onSubmit={handleCredentialsSubmit} className="flex flex-col gap-4">
        {mode === 'signup' && (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="login-name" className="text-sm font-medium" style={{ color: 'var(--text-body)' }}>
              Name
            </label>
            <input
              id="login-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              autoComplete="name"
              className={inputClass}
              style={fieldStyle}
            />
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="login-email" className="text-sm font-medium" style={{ color: 'var(--text-body)' }}>
            Email
          </label>
          <input
            id="login-email"
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

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="login-password" className="text-sm font-medium" style={{ color: 'var(--text-body)' }}>
              Password
            </label>
            {mode === 'login' && (
              <Link href="/forgot-password" className="text-xs underline" style={{ color: 'var(--text-secondary)' }}>
                Forgot password?
              </Link>
            )}
          </div>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={mode === 'signup' ? 'At least 8 characters' : 'Enter password'}
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
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
          disabled={loading || !email || !password}
          className="w-full rounded-lg py-3 text-sm font-medium transition-opacity disabled:opacity-50"
          style={{ background: 'var(--gold)', color: 'var(--void)' }}
        >
          {loading ? (mode === 'login' ? 'Signing in…' : 'Creating account…') : mode === 'login' ? 'Sign in' : 'Create account'}
        </button>
      </form>

      <p className="text-center text-xs" style={{ color: 'var(--text-faint)' }}>
        Studio team using the shared studio password?{' '}
        <Link href="/studio-ops/login" className="underline" style={{ color: 'var(--text-secondary)' }}>
          Use it here
        </Link>
        .
      </p>
    </div>
  )
}
