import { NextRequest } from 'next/server'
import { db } from '@/lib/supabase-server'
import { adminJson } from '@/lib/security/admin-response'
import { logOpsActivity } from '@/lib/ops/data'
import { requirePermission, requireAdminDelete } from '@/lib/admin/permissions'
import { cleanAmount, cleanCurrency, cleanDateOnly, cleanLongText, cleanMetadata, cleanText, cleanUrl, parseReceiptCategory, parseReceiptStatus } from '@/lib/ops/validation'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function PATCH(req: NextRequest, ctx: RouteContext<'/api/studio-ops/receipts/[id]'>) {
  const forbidden = await requirePermission('receipts', 'write')
  if (forbidden) return forbidden
  const { id } = await ctx.params
  let body: Record<string, unknown>
  try { body = await req.json() } catch { return adminJson({ error: 'Invalid JSON' }, { status: 400 }) }
  const patch: Record<string, unknown> = {}
  if (body.title !== undefined) patch.title = cleanText(body.title, 220)
  if (body.vendor !== undefined) patch.vendor = cleanText(body.vendor, 160)
  if (body.category !== undefined) { const v = parseReceiptCategory(body.category); if (!v) return adminJson({ error: 'invalid category' }, { status: 400 }); patch.category = v }
  if (body.status !== undefined) { const v = parseReceiptStatus(body.status); if (!v) return adminJson({ error: 'invalid status' }, { status: 400 }); patch.status = v }
  if (body.amount !== undefined) patch.amount = cleanAmount(body.amount)
  if (body.currency !== undefined) patch.currency = cleanCurrency(body.currency)
  if (body.payment_method !== undefined) patch.payment_method = cleanText(body.payment_method, 120)
  if (body.purchased_at !== undefined) patch.purchased_at = cleanDateOnly(body.purchased_at)
  if (body.client_name !== undefined) patch.client_name = cleanText(body.client_name, 160)
  if (body.project_name !== undefined) patch.project_name = cleanText(body.project_name, 160)
  if (body.file_url !== undefined) patch.file_url = cleanUrl(body.file_url)
  if (body.notes !== undefined) patch.notes = cleanLongText(body.notes, 2000)
  if (body.metadata !== undefined) patch.metadata = cleanMetadata(body.metadata)
  if (!Object.keys(patch).length) return adminJson({ error: 'No valid fields' }, { status: 400 })
  const { data, error } = await db().from('receipts').update(patch).eq('id', id).select('*').single()
  if (error) return adminJson({ error: error.message }, { status: 500 })
  await logOpsActivity({ action: 'receipt_updated', entity_type: 'receipt', entity_id: id, details: { fields: Object.keys(patch) } })
  return adminJson({ receipt: data })
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<'/api/studio-ops/receipts/[id]'>) {
  const adminDenied = await requireAdminDelete()
  if (adminDenied) return adminDenied
  const forbidden = await requirePermission('receipts', 'write')
  if (forbidden) return forbidden
  const { id } = await ctx.params
  const { error } = await db().from('receipts').delete().eq('id', id)
  if (error) return adminJson({ error: error.message }, { status: 500 })
  await logOpsActivity({ action: 'receipt_deleted', entity_type: 'receipt', entity_id: id })
  return adminJson({ ok: true })
}
