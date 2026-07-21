import { getDb } from '@/lib/supabase-server'
import { verifyPassword } from '@/lib/auth/password'
import type { AdminRole } from '@/lib/admin/permissions'

export type AdminUserRecord = {
  id: string
  email: string
  name: string | null
  role: string
  status: 'active' | 'invited' | 'disabled'
  password_hash: string | null
  totp_secret: string | null
  totp_enabled: boolean
  backup_codes: string[]
  last_seen_at: string | null
}

export async function findAdminUserByEmail(email: string): Promise<AdminUserRecord | null> {
  const supabase = getDb()
  if (!supabase) return null
  const { data } = await supabase
    .from('admin_users')
    .select('id, email, name, role, status, password_hash, totp_secret, totp_enabled, backup_codes, last_seen_at')
    .eq('email', email.toLowerCase())
    .maybeSingle()
  return (data as AdminUserRecord | null) ?? null
}

export async function findAdminUserById(id: string): Promise<AdminUserRecord | null> {
  const supabase = getDb()
  if (!supabase) return null
  const { data } = await supabase
    .from('admin_users')
    .select('id, email, name, role, status, password_hash, totp_secret, totp_enabled, backup_codes, last_seen_at')
    .eq('id', id)
    .maybeSingle()
  return (data as AdminUserRecord | null) ?? null
}

export async function updateAdminUserPassword(id: string, newPasswordHash: string) {
  const supabase = getDb()
  if (!supabase) return
  await supabase.from('admin_users').update({ password_hash: newPasswordHash }).eq('id', id)
}

/** Stores a pending (not-yet-confirmed) TOTP secret. totp_enabled stays false until confirmTotpEnrollment. */
export async function beginTotpEnrollment(id: string, encryptedSecret: string) {
  const supabase = getDb()
  if (!supabase) return
  await supabase.from('admin_users').update({ totp_secret: encryptedSecret, totp_enabled: false }).eq('id', id)
}

export async function confirmTotpEnrollment(id: string, backupCodeHashes: string[]) {
  const supabase = getDb()
  if (!supabase) return
  await supabase.from('admin_users').update({ totp_enabled: true, backup_codes: backupCodeHashes }).eq('id', id)
}

export async function disableTotp(id: string) {
  const supabase = getDb()
  if (!supabase) return
  await supabase.from('admin_users').update({ totp_enabled: false, totp_secret: null, backup_codes: [] }).eq('id', id)
}

export async function updateBackupCodes(id: string, backupCodeHashes: string[]) {
  const supabase = getDb()
  if (!supabase) return
  await supabase.from('admin_users').update({ backup_codes: backupCodeHashes }).eq('id', id)
}

export async function verifyAdminUserPassword(user: AdminUserRecord, password: string): Promise<boolean> {
  return verifyPassword(password, user.password_hash)
}

export async function touchAdminUserLogin(id: string) {
  const supabase = getDb()
  if (!supabase) return
  await supabase.from('admin_users').update({ last_seen_at: new Date().toISOString() }).eq('id', id)
}

/** Maps the DB role values (which include some legacy aliases) to the app's AdminRole type. */
export function normalizeAdminRole(role: string): AdminRole {
  const raw = role.trim().toLowerCase()
  if (raw === 'owner' || raw === 'admin') return 'administrator'
  if (raw === 'content') return 'content_studio'
  const known: AdminRole[] = ['administrator', 'finance', 'operations', 'sales', 'content_studio', 'viewer']
  return known.includes(raw as AdminRole) ? (raw as AdminRole) : 'viewer'
}
