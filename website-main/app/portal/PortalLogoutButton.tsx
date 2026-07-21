'use client'

import { useState } from 'react'

export default function PortalLogoutButton() {
  const [loading, setLoading] = useState(false)

  async function handleLogout() {
    setLoading(true)
    try {
      await fetch('/api/auth/logout', { method: 'DELETE', credentials: 'same-origin' })
    } finally {
      window.location.assign('/login')
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="rounded-lg border px-4 py-2 text-xs font-medium transition-opacity disabled:opacity-50"
      style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
    >
      {loading ? 'Signing out…' : 'Log out'}
    </button>
  )
}
