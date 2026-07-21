import { NextRequest } from 'next/server'
import { db } from '@/lib/supabase-server'
import { adminJson } from '@/lib/security/admin-response'
import { clientIp, rateLimit } from '@/lib/security/rate-limit'
import { logOpsActivity } from '@/lib/ops/data'
import { canAccess, getCurrentAdminRole, requireAdminDelete, requirePermission } from '@/lib/admin/permissions'
import { cleanAmount, cleanCurrency, cleanDate, cleanEmail, cleanLongText, cleanMetadata, cleanText, cleanUrl, parseFinanceStatus, parseFinanceType, parseRecurringInterval } from '@/lib/ops/validation'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function PATCH(req: NextRequest, ctx: RouteContext<'/api/studio-ops/finance-records/[id]'>) {
  const forbidden = await requirePermission('finance', 'write')
  if (forbidden) return forbidden
  const { id } = await ctx.params
  const limited = await rateLimit(`finance-records-patch:${clientIp(req)}`, 60, 60_000)
  if (!limited.ok) return adminJson({ error: 'Rate limited' }, { status: 429 })
  let body: Record<string, unknown>
  try { body = await req.json() } catch { return adminJson({ error: 'Invalid JSON' }, { status: 400 }) }
  const patch: Record<string, unknown> = {}
  if (body.type !== undefined) { const v = parseFinanceType(body.type); if (!v) return adminJson({ error: 'invalid type' }, { status: 400 }); patch.type = v }
  if (body.status !== undefined) { const v = parseFinanceStatus(body.status); if (!v) return adminJson({ error: 'invalid status' }, { status: 400 }); patch.status = v }
  if (body.title !== undefined) patch.title = cleanText(body.title, 220)
  if (body.description !== undefined) patch.description = cleanLongText(body.description, 4000)
  if (body.client_name !== undefined) patch.client_name = cleanText(body.client_name, 160)
  if (body.client_email !== undefined) patch.client_email = cleanEmail(body.client_email)
  if (body.amount !== undefined) patch.amount = cleanAmount(body.amount)
  if (body.currency !== undefined) patch.currency = cleanCurrency(body.currency)
  if (body.due_at !== undefined) patch.due_at = cleanDate(body.due_at)
  if (body.paid_at !== undefined) patch.paid_at = cleanDate(body.paid_at)
  if (body.receipt_url !== undefined) patch.receipt_url = cleanUrl(body.receipt_url)
  if (body.invoice_url !== undefined) patch.invoice_url = cleanUrl(body.invoice_url)
  if (body.recurring_interval !== undefined) patch.recurring_interval = parseRecurringInterval(body.recurring_interval)
  if (body.next_invoice_at !== undefined) patch.next_invoice_at = cleanDate(body.next_invoice_at)
  if (body.billing_notes !== undefined) patch.billing_notes = cleanLongText(body.billing_notes, 2000)
  if (body.auto_generate !== undefined) patch.auto_generate = Boolean(body.auto_generate)
  if (body.metadata !== undefined) patch.metadata = cleanMetadata(body.metadata)
  if (!Object.keys(patch).length) return adminJson({ error: 'No valid fields' }, { status: 400 })
  const { data, error } = await db().from('finance_records').update(patch).eq('id', id).select('*').single()
  if (error) return adminJson({ error: error.message }, { status: 500 })
  await logOpsActivity({ action: 'finance_record_updated', entity_type: 'finance_record', entity_id: id, details: { fields: Object.keys(patch) } })
  return adminJson({ record: data })
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<'/api/studio-ops/finance-records/[id]'>) {
  const adminDenied = await requireAdminDelete()
  if (adminDenied) return adminDenied
  const role = await getCurrentAdminRole()
  if (!canAccess(role, 'finance', 'write')) {
    return adminJson({ error: 'Forbidden' }, { status: 403 })
  }
  const { id } = await ctx.params
  const { error } = await db().from('finance_records').delete().eq('id', id)
  if (error) return adminJson({ error: error.message }, { status: 500 })
  await logOpsActivity({ action: 'finance_record_deleted', entity_type: 'finance_record', entity_id: id })
  return adminJson({ ok: true })
}
