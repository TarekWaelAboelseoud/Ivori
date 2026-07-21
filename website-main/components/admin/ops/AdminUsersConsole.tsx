'use client'

import { useState } from 'react'
import type { FormEvent } from 'react'
import { AdminBadge, AdminCard, AdminPageHeader } from '@/components/admin/AdminUI'
import { ADMIN_ROLES } from '@/lib/ops/config'
import type { AdminRole } from '@/lib/ops/config'
import type { AdminUser } from '@/lib/ops/types'

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  const data = (await res.json().catch(() => ({}))) as T & { error?: string }
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

export default function AdminUsersConsole({ initial, loadError }: { initial: AdminUser[]; loadError?: string }) {
  const [users, setUsers] = useState(initial)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<AdminRole>('administrator')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState(loadError ? 'Run supabase/schema.sql to activate admin users.' : '')
  const [busy, setBusy] = useState(false)
  const [passwordDraftId, setPasswordDraftId] = useState<string | null>(null)
  const [passwordDraft, setPasswordDraft] = useState('')

  async function refresh() {
    const data = await api<{ users: AdminUser[] }>('/api/studio-ops/admin-users')
    setUsers(data.users)
  }

  async function addUser(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setMessage('')
    try {
      await api<{ user: AdminUser }>('/api/studio-ops/admin-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(password ? { email, name, role, password } : { email, name, role }),
      })
      setEmail('')
      setName('')
      setRole('administrator')
      setPassword('')
      await refresh()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not create user')
    } finally {
      setBusy(false)
    }
  }

  async function patchUser(id: string, patch: Record<string, unknown>) {
    setBusy(true)
    setMessage('')
    try {
      const data = await api<{ user: AdminUser }>(`/api/studio-ops/admin-users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      })
      setUsers((prev) => prev.map((user) => (user.id === id ? data.user : user)))
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setBusy(false)
    }
  }

  async function submitPassword(id: string) {
    if (!passwordDraft) return
    await patchUser(id, { password: passwordDraft })
    setPasswordDraftId(null)
    setPasswordDraft('')
  }

  return (
    <div>
      <AdminPageHeader
        title="Admin Users"
        description="Role directory, access status, and per-user login (set a password to enable /login for a team member)."
      />

      {message && (
        <div className={`admin-banner ${loadError ? 'admin-banner-warn' : 'admin-banner-error'} mb-6`}>
          {message}
        </div>
      )}

      <AdminCard className="mb-6 p-4">
        <form onSubmit={addUser} className="grid gap-3 lg:grid-cols-[1fr_1fr_1fr_160px_auto]">
          <input className="admin-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@ivoridigitals.com" />
          <input className="admin-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
          <input
            className="admin-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (optional)"
            autoComplete="new-password"
          />
          <select className="admin-input" value={role} onChange={(e) => setRole(e.target.value as AdminRole)}>
            {ADMIN_ROLES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <button className="admin-btn-primary min-h-0" type="submit" disabled={busy || !!loadError}>
            Add
          </button>
        </form>
        <p className="mt-2 text-xs text-[var(--admin-muted)]">
          Leave password blank to create a placeholder — they can be given one later. Without a password set, this
          person can only get in via the shared studio password.
        </p>
      </AdminCard>

      <div className="space-y-3">
        {users.length === 0 ? (
          <div className="admin-empty">
            <p className="font-display text-xl text-zinc-300">No admin users yet</p>
            <p className="mt-2 text-sm text-zinc-500">Create placeholders now; authentication migration comes later.</p>
          </div>
        ) : (
          users.map((user) => (
            <AdminCard key={user.id} className="p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-sm font-semibold text-zinc-100">{user.name || user.email}</h2>
                    <AdminBadge tone={user.status === 'active' ? 'green' : 'neutral'}>{user.status}</AdminBadge>
                    <AdminBadge tone="blue">{user.role}</AdminBadge>
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">{user.email}</p>
                  <p className="mt-1 text-xs text-zinc-600">
                    Last seen: {user.last_seen_at ? new Date(user.last_seen_at).toLocaleString() : 'Never'} · Permissions:{' '}
                    {Object.keys(user.permissions ?? {}).length ? Object.keys(user.permissions).join(', ') : 'default role profile'}
                  </p>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <select
                    className="admin-input"
                    value={user.role}
                    disabled={busy}
                    onChange={(e) => patchUser(user.id, { role: e.target.value })}
                  >
                    {ADMIN_ROLES.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  <select
                    className="admin-input"
                    value={user.status}
                    disabled={busy}
                    onChange={(e) => patchUser(user.id, { status: e.target.value })}
                  >
                    <option value="active">active</option>
                    <option value="invited">invited</option>
                    <option value="disabled">disabled</option>
                  </select>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[var(--admin-border)] pt-3">
                <button className="admin-quick-action" disabled={busy} onClick={() => patchUser(user.id, { status: 'invited' })}>
                  Invite placeholder
                </button>
                <button className="admin-quick-action" disabled={busy} onClick={() => patchUser(user.id, { status: 'disabled' })}>
                  Deactivate
                </button>
                {passwordDraftId === user.id ? (
                  <>
                    <input
                      className="admin-input min-h-0 w-40"
                      type="password"
                      autoFocus
                      placeholder="New password"
                      value={passwordDraft}
                      onChange={(e) => setPasswordDraft(e.target.value)}
                    />
                    <button
                      className="admin-quick-action"
                      disabled={busy || passwordDraft.length < 8}
                      onClick={() => submitPassword(user.id)}
                    >
                      Save password
                    </button>
                    <button
                      className="admin-quick-action"
                      onClick={() => {
                        setPasswordDraftId(null)
                        setPasswordDraft('')
                      }}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button className="admin-quick-action" disabled={busy} onClick={() => setPasswordDraftId(user.id)}>
                    Set password
                  </button>
                )}
                <span className="text-xs text-[var(--admin-muted)]">
                  Login: {user.email} + password at <code>/login</code>
                </span>
              </div>
            </AdminCard>
          ))
        )}
      </div>
    </div>
  )
}
