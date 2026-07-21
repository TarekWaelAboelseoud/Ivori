'use client'

import { useState } from 'react'

export default function ConfirmAction({
  label,
  confirmLabel,
  warning,
  variant = 'danger',
  disabled,
  onConfirm,
}: {
  label: string
  confirmLabel?: string
  warning: string
  variant?: 'danger' | 'neutral'
  disabled?: boolean
  onConfirm: () => Promise<void> | void
}) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  async function run() {
    setBusy(true)
    try {
      await onConfirm()
      setOpen(false)
    } finally {
      setBusy(false)
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        className={variant === 'danger' ? 'admin-quick-action admin-quick-action-danger' : 'admin-quick-action'}
        disabled={disabled}
        onClick={() => setOpen(true)}
      >
        {label}
      </button>
    )
  }

  return (
    <div className="admin-inline-confirm">
      <p className="text-xs text-[var(--admin-muted)]">{warning}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <button type="button" className="admin-quick-action admin-quick-action-danger" disabled={busy} onClick={run}>
          {confirmLabel ?? label}
        </button>
        <button type="button" className="admin-quick-action" disabled={busy} onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
    </div>
  )
}
