import { NextRequest } from 'next/server'
import { db } from '@/lib/supabase-server'
import { adminJson } from '@/lib/security/admin-response'
import { logOpsActivity } from '@/lib/ops/data'
import { requirePermission, requireAdminDelete } from '@/lib/admin/permissions'
import { cleanAmount, cleanCurrency, cleanDate, cleanDateOnly, cleanEmail, cleanLongText, cleanMetadata, cleanText, cleanUrl, parseClientStatus, parseClientTier, parseRecurringInterval } from '@/lib/ops/validation'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function PATCH(req: NextRequest, ctx: RouteContext<'/api/studio-ops/clients/[id]'>) {
  const forbidden = await requirePermission('clients', 'write')
  if (forbidden) return forbidden
  const { id } = await ctx.params
  let body: Record<string, unknown>
  try { body = await req.json() } catch { return adminJson({ error: 'Invalid JSON' }, { status: 400 }) }
  const patch: Record<string, unknown> = {}
  if (body.name !== undefined) patch.name = cleanText(body.name, 180)
  if (body.email !== undefined) patch.email = cleanEmail(body.email)
  if (body.company !== undefined) patch.company = cleanText(body.company, 180)
  if (body.website !== undefined) patch.website = cleanUrl(body.website)
  if (body.region !== undefined) patch.region = cleanText(body.region, 120)
  if (body.status !== undefined) { const v = parseClientStatus(body.status); if (!v) return adminJson({ error: 'invalid status' }, { status: 400 }); patch.status = v }
  if (body.tier !== undefined) { const v = parseClientTier(body.tier); if (!v) return adminJson({ error: 'invalid tier' }, { status: 400 }); patch.tier = v }
  if (body.monthly_value !== undefined) patch.monthly_value = cleanAmount(body.monthly_value)
  if (body.currency !== undefined) patch.currency = cleanCurrency(body.currency)
  if (body.owner_name !== undefined) patch.owner_name = cleanText(body.owner_name, 120)
  if (body.started_at !== undefined) patch.started_at = cleanDateOnly(body.started_at)
  if (body.next_follow_up_at !== undefined) patch.next_follow_up_at = cleanDate(body.next_follow_up_at)
  if (body.recurring_interval !== undefined) patch.recurring_interval = parseRecurringInterval(body.recurring_interval)
  if (body.next_invoice_at !== undefined) patch.next_invoice_at = cleanDate(body.next_invoice_at)
  if (body.billing_notes !== undefined) patch.billing_notes = cleanLongText(body.billing_notes, 2000)
  if (body.auto_generate !== undefined) patch.auto_generate = Boolean(body.auto_generate)
  if (body.notes !== undefined) patch.notes = cleanLongText(body.notes, 4000)
  if (body.metadata !== undefined) patch.metadata = cleanMetadata(body.metadata)
  if (!Object.keys(patch).length) return adminJson({ error: 'No valid fields' }, { status: 400 })
  const { data, error } = await db().from('clients').update(patch).eq('id', id).select('*').single()
  if (error) return adminJson({ error: error.message }, { status: 500 })
  await logOpsActivity({ action: 'client_updated', entity_type: 'client', entity_id: id, details: { fields: Object.keys(patch) } })
  return adminJson({ client: data })
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<'/api/studio-ops/clients/[id]'>) {
  const adminDenied = await requireAdminDelete()
  if (adminDenied) return adminDenied
  const forbidden = await requirePermission('clients', 'write')
  if (forbidden) return forbidden
  const { id } = await ctx.params
  const { error } = await db().from('clients').delete().eq('id', id)
  if (error) return adminJson({ error: error.message }, { status: 500 })
  await logOpsActivity({ action: 'client_deleted', entity_type: 'client', entity_id: id })
  return adminJson({ ok: true })
}
