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

export async function PATCH(req: NextRequest, ctx: RouteContext<'/api/studio-ops/admin-users/[id]'>) {
  const forbidden = await requirePermission('users', 'write')
  if (forbidden) return forbidden
  const { id } = await ctx.params
  const limited = await rateLimit(`admin-users-patch:${clientIp(req)}`, 30, 60_000)
  if (!limited.ok) return adminJson({ error: 'Rate limited' }, { status: 429, headers: { 'Retry-After': String(limited.retryAfter ?? 60) } })

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return adminJson({ error: 'Invalid JSON' }, { status: 400 })
  }

  const patch: Record<string, unknown> = {}
  if (body.email !== undefined) {
    const email = cleanEmail(body.email)
    if (!email) return adminJson({ error: 'valid email required' }, { status: 400 })
    patch.email = email
  }
  if (body.name !== undefined) patch.name = cleanText(body.name, 120)
  if (body.role !== undefined) {
    const role = parseAdminRole(body.role)
    if (!role) return adminJson({ error: 'invalid role' }, { status: 400 })
    patch.role = role
  }
  if (body.status !== undefined) {
    const status = parseAdminUserStatus(body.status)
    if (!status) return adminJson({ error: 'invalid status' }, { status: 400 })
    patch.status = status
  }
  if (body.permissions !== undefined) patch.permissions = cleanMetadata(body.permissions)
  if (body.last_seen_at !== undefined) patch.last_seen_at = typeof body.last_seen_at === 'string' ? body.last_seen_at : null
  if (body.password !== undefined) {
    if (typeof body.password !== 'string' || !isPasswordAcceptable(body.password)) {
      return adminJson({ error: 'password must be 8-200 characters' }, { status: 400 })
    }
    patch.password_hash = await hashPassword(body.password)
  }

  if (!Object.keys(patch).length) return adminJson({ error: 'No valid fields' }, { status: 400 })

  const { data, error } = await db()
    .from('admin_users')
    .update(patch)
    .eq('id', id)
    .select('id, email, name, role, status, permissions, last_seen_at, created_at, updated_at')
    .single()
  if (error) return adminJson({ error: error.message }, { status: 500 })

  await logOpsActivity({ action: 'admin_user_updated', entity_type: 'admin_user', entity_id: id, details: { fields: Object.keys(patch) } })
  return adminJson({ user: data })
}
