'use client'

import { useState } from 'react'

type Step = 'idle' | 'enrolling' | 'confirming' | 'backup-codes' | 'enabled' | 'disabling'

export default function AccountClient({
  email,
  totpEnabled,
  mfaConfigured,
}: {
  email: string
  totpEnabled: boolean
  mfaConfigured: boolean
}) {
  const [step, setStep] = useState<Step>(totpEnabled ? 'enabled' : 'idle')
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('')
  const [secret, setSecret] = useState('')
  const [code, setCode] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function startEnrollment() {
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/studio-ops/mfa/enroll', { method: 'POST', credentials: 'same-origin' })
      const data = (await res.json().catch(() => ({}))) as {
        secret?: string
        qrCodeDataUrl?: string
        error?: string
      }
      if (!res.ok || !data.secret) {
        setError(data.error || 'Could not start MFA setup.')
        return
      }
      setSecret(data.secret)
      setQrCodeDataUrl(data.qrCodeDataUrl || '')
      setStep('confirming')
    } catch {
      setError('Connection error.')
    } finally {
      setLoading(false)
    }
  }

  async function confirmEnrollment(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/studio-ops/mfa/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ code }),
      })
      const data = (await res.json().catch(() => ({}))) as { success?: boolean; backupCodes?: string[]; error?: string }
      if (!res.ok || !data.success) {
        setError(data.error || 'Invalid code.')
        return
      }
      setBackupCodes(data.backupCodes || [])
      setStep('backup-codes')
    } catch {
      setError('Connection error.')
    } finally {
      setLoading(false)
    }
  }

  async function disableMfa(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/studio-ops/mfa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ password }),
      })
      const data = (await res.json().catch(() => ({}))) as { success?: boolean; error?: string }
      if (!res.ok || !data.success) {
        setError(data.error || 'Could not disable MFA.')
        return
      }
      setPassword('')
      setStep('idle')
    } catch {
      setError('Connection error.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = 'admin-input'

  if (!mfaConfigured) {
    return (
      <p className="text-sm text-[var(--admin-muted)]">
        MFA isn&apos;t configured on this server yet (missing <code>MFA_ENCRYPTION_KEY</code>). Ask whoever manages
        deployment to set it before this can be enabled.
      </p>
    )
  }

  if (step === 'backup-codes') {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm font-medium text-[var(--admin-ivory)]">MFA is now enabled.</p>
        <p className="text-sm text-[var(--admin-muted)]">
          Save these backup codes somewhere safe. Each one can be used once if you lose access to your authenticator
          app. They won&apos;t be shown again.
        </p>
        <div className="grid grid-cols-2 gap-2 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg)] p-4 font-mono text-sm">
          {backupCodes.map((code) => (
            <span key={code}>{code}</span>
          ))}
        </div>
        <button className="admin-btn-primary w-fit" onClick={() => setStep('enabled')}>
          I&apos;ve saved these
        </button>
      </div>
    )
  }

  if (step === 'confirming') {
    return (
      <form onSubmit={confirmEnrollment} className="flex flex-col gap-4">
        <p className="text-sm text-[var(--admin-muted)]">
          Scan this QR code with an authenticator app (Google Authenticator, Authy, 1Password, etc.), then enter the
          6-digit code it shows.
        </p>
        {qrCodeDataUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={qrCodeDataUrl} alt="MFA setup QR code" className="h-48 w-48 rounded-lg border border-[var(--admin-border)]" />
        )}
        <p className="text-xs text-[var(--admin-muted)]">
          Can&apos;t scan it? Enter this key manually: <code className="text-[var(--admin-ivory)]">{secret}</code>
        </p>
        <input
          className={inputClass}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="6-digit code"
          inputMode="numeric"
          autoFocus
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button className="admin-btn-primary w-fit" type="submit" disabled={loading || code.length !== 6}>
          {loading ? 'Verifying…' : 'Confirm and enable'}
        </button>
      </form>
    )
  }

  if (step === 'disabling') {
    return (
      <form onSubmit={disableMfa} className="flex flex-col gap-4">
        <p className="text-sm text-[var(--admin-muted)]">Enter your password to disable MFA for {email}.</p>
        <input
          className={inputClass}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoFocus
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <div className="flex gap-2">
          <button className="admin-btn-primary w-fit" type="submit" disabled={loading || !password}>
            {loading ? 'Disabling…' : 'Disable MFA'}
          </button>
          <button type="button" className="admin-quick-action" onClick={() => setStep('enabled')}>
            Cancel
          </button>
        </div>
      </form>
    )
  }

  if (step === 'enabled') {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-[var(--admin-ivory)]">MFA is enabled for {email}.</p>
        <button className="admin-quick-action w-fit" onClick={() => setStep('disabling')}>
          Disable MFA
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-[var(--admin-muted)]">
        MFA is not enabled. Turning it on requires a code from an authenticator app every time you sign in.
      </p>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button className="admin-btn-primary w-fit" onClick={startEnrollment} disabled={loading}>
        {loading ? 'Starting…' : 'Enable MFA'}
      </button>
    </div>
  )
}
