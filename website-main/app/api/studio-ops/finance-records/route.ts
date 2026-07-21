import { NextRequest } from 'next/server'
import { db } from '@/lib/supabase-server'
import { adminJson } from '@/lib/security/admin-response'
import { clientIp, rateLimit } from '@/lib/security/rate-limit'
import { logOpsActivity } from '@/lib/ops/data'
import { requirePermission } from '@/lib/admin/permissions'
import { cleanAmount, cleanCurrency, cleanDate, cleanEmail, cleanLongText, cleanMetadata, cleanText, cleanUrl, parseFinanceStatus, parseFinanceType, parseRecurringInterval } from '@/lib/ops/validation'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function GET() {
  const forbidden = await requirePermission('finance')
  if (forbidden) return forbidden
  const { data, error } = await db().from('finance_records').select('*').order('due_at', { ascending: true, nullsFirst: false }).order('created_at', { ascending: false }).limit(200)
  if (error) return adminJson({ error: error.message }, { status: 500 })
  return adminJson({ records: data ?? [] })
}

export async function POST(req: NextRequest) {
  const forbidden = await requirePermission('finance', 'write')
  if (forbidden) return forbidden
  const limited = await rateLimit(`finance-records:${clientIp(req)}`, 30, 60_000)
  if (!limited.ok) return adminJson({ error: 'Rate limited' }, { status: 429 })
  let body: Record<string, unknown>
  try { body = await req.json() } catch { return adminJson({ error: 'Invalid JSON' }, { status: 400 }) }
  const type = parseFinanceType(body.type) ?? 'invoice'
  const status = parseFinanceStatus(body.status) ?? 'draft'
  const title = cleanText(body.title, 220)
  if (!title) return adminJson({ error: 'title required' }, { status: 400 })
  const { data, error } = await db().from('finance_records').insert({
    type,
    status,
    client_name: cleanText(body.client_name, 160),
    client_email: cleanEmail(body.client_email),
    title,
    description: cleanLongText(body.description, 4000),
    amount: cleanAmount(body.amount),
    currency: cleanCurrency(body.currency),
    due_at: cleanDate(body.due_at),
    paid_at: cleanDate(body.paid_at),
    receipt_url: cleanUrl(body.receipt_url),
    invoice_url: cleanUrl(body.invoice_url),
    recurring_interval: parseRecurringInterval(body.recurring_interval),
    next_invoice_at: cleanDate(body.next_invoice_at),
    billing_notes: cleanLongText(body.billing_notes, 2000),
    auto_generate: Boolean(body.auto_generate),
    metadata: cleanMetadata(body.metadata),
  }).select('*').single()
  if (error) return adminJson({ error: error.message }, { status: 500 })
  await logOpsActivity({ action: 'finance_record_created', entity_type: 'finance_record', entity_id: data.id, details: { type, status } })
  return adminJson({ record: data }, { status: 201 })
}
