import { NextRequest } from 'next/server'
import { db } from '@/lib/supabase-server'
import { adminJson } from '@/lib/security/admin-response'
import { clientIp, rateLimit } from '@/lib/security/rate-limit'
import { logOpsActivity } from '@/lib/ops/data'
import { requirePermission } from '@/lib/admin/permissions'
import { cleanEmail, cleanMetadata, cleanText, parseAdminRole, parseAdminUserStatus } from '@/lib/ops/validation'
import { hashPassword, isPasswordAcceptable } from '@/lib/auth/password'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function GET() {
  const forbidden = await requirePermission('users')
  if (forbidden) return forbidden
  const { data, error } = await db()
    .from('admin_users')
    .select('id, email, name, role, status, permissions, last_seen_at, created_at, updated_at')
    .order('created_at', { ascending: false })
    .limit(100)
  if (error) return adminJson({ error: error.message }, { status: 500 })
  return adminJson({ users: data ?? [] })
}

export async function POST(req: NextRequest) {
  const forbidden = await requirePermission('users', 'write')
  if (forbidden) return forbidden
  const limited = await rateLimit(`admin-users:${clientIp(req)}`, 12, 60_000)
  if (!limited.ok) return adminJson({ error: 'Rate limited' }, { status: 429, headers: { 'Retry-After': String(limited.retryAfter ?? 60) } })

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return adminJson({ error: 'Invalid JSON' }, { status: 400 })
  }

  const email = cleanEmail(body.email)
  const role = parseAdminRole(body.role) ?? 'administrator'
  const status = parseAdminUserStatus(body.status) ?? 'active'
  if (!email) return adminJson({ error: 'valid email required' }, { status: 400 })

  let password_hash: string | undefined
  if (body.password !== undefined) {
    if (typeof body.password !== 'string' || !isPasswordAcceptable(body.password)) {
      return adminJson({ error: 'password must be 8-200 characters' }, { status: 400 })
    }
    password_hash = await hashPassword(body.password)
  }

  const { data, error } = await db()
    .from('admin_users')
    .insert({
      email,
      name: cleanText(body.name, 120),
      role,
      status,
      permissions: cleanMetadata(body.permissions),
      ...(password_hash ? { password_hash } : {}),
    })
    .select('id, email, name, role, status, permissions, last_seen_at, created_at, updated_at')
    .single()

  if (error) return adminJson({ error: error.message }, { status: 500 })

  await logOpsActivity({ action: 'admin_user_created', entity_type: 'admin_user', entity_id: data.id, details: { email, role } })
  return adminJson({ user: data }, { status: 201 })
}
