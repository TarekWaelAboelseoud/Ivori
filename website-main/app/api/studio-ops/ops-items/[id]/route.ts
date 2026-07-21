import { NextRequest } from 'next/server'
import { db } from '@/lib/supabase-server'
import { adminJson } from '@/lib/security/admin-response'
import { clientIp, rateLimit } from '@/lib/security/rate-limit'
import { logOpsActivity } from '@/lib/ops/data'
import { canAccess, getCurrentAdminRole, requireAdminDelete } from '@/lib/admin/permissions'
import { cleanDate, cleanEmail, cleanLongText, cleanMetadata, cleanText, cleanUrl, parseOpsCategory, parseOpsPriority, parseOpsStatus } from '@/lib/ops/validation'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function PATCH(req: NextRequest, ctx: RouteContext<'/api/studio-ops/ops-items/[id]'>) {
  const role = await getCurrentAdminRole()
  if (!canAccess(role, 'studio', 'write') && !canAccess(role, 'inquiries', 'write')) {
    return adminJson({ error: 'Forbidden' }, { status: 403 })
  }
  const { id } = await ctx.params
  const limited = await rateLimit(`ops-items-patch:${clientIp(req)}`, 60, 60_000)
  if (!limited.ok) return adminJson({ error: 'Rate limited' }, { status: 429, headers: { 'Retry-After': String(limited.retryAfter ?? 60) } })

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return adminJson({ error: 'Invalid JSON' }, { status: 400 })
  }

  const patch: Record<string, unknown> = {}
  if (body.title !== undefined) patch.title = cleanText(body.title, 220)
  if (body.description !== undefined) patch.description = cleanLongText(body.description, 4000)
  if (body.category !== undefined) {
    const category = parseOpsCategory(body.category)
    if (!category) return adminJson({ error: 'invalid category' }, { status: 400 })
    patch.category = category
  }
  if (body.status !== undefined) {
    const status = parseOpsStatus(body.status)
    if (!status) return adminJson({ error: 'invalid status' }, { status: 400 })
    patch.status = status
    if (status === 'done') patch.completed_at = new Date().toISOString()
    if (status === 'archived') patch.archived = true
  }
  if (body.priority !== undefined) {
    const priority = parseOpsPriority(body.priority)
    if (!priority) return adminJson({ error: 'invalid priority' }, { status: 400 })
    patch.priority = priority
  }
  if (body.owner_name !== undefined) patch.owner_name = cleanText(body.owner_name, 120)
  if (body.source !== undefined) patch.source = cleanText(body.source, 120)
  if (body.related_email !== undefined) patch.related_email = cleanEmail(body.related_email)
  if (body.related_url !== undefined) patch.related_url = cleanUrl(body.related_url)
  if (body.due_at !== undefined) patch.due_at = cleanDate(body.due_at)
  if (body.completed_at !== undefined) patch.completed_at = cleanDate(body.completed_at)
  if (body.archived !== undefined) patch.archived = Boolean(body.archived)
  if (body.metadata !== undefined) patch.metadata = cleanMetadata(body.metadata)

  if (!Object.keys(patch).length) return adminJson({ error: 'No valid fields' }, { status: 400 })

  const { data, error } = await db().from('ops_items').update(patch).eq('id', id).select('*').single()
  if (error) return adminJson({ error: error.message }, { status: 500 })

  await logOpsActivity({ action: 'ops_item_updated', entity_type: 'ops_item', entity_id: id, details: { fields: Object.keys(patch) } })
  return adminJson({ item: data })
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<'/api/studio-ops/ops-items/[id]'>) {
  const adminDenied = await requireAdminDelete()
  if (adminDenied) return adminDenied
  const role = await getCurrentAdminRole()
  if (!canAccess(role, 'studio', 'write') && !canAccess(role, 'inquiries', 'write')) {
    return adminJson({ error: 'Forbidden' }, { status: 403 })
  }
  const { id } = await ctx.params
  const { error } = await db().from('ops_items').delete().eq('id', id)
  if (error) return adminJson({ error: error.message }, { status: 500 })
  await logOpsActivity({ action: 'ops_item_deleted', entity_type: 'ops_item', entity_id: id })
  return adminJson({ ok: true })
}
