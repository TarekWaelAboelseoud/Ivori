import { NextRequest } from 'next/server'
import { db } from '@/lib/supabase-server'
import { adminJson } from '@/lib/security/admin-response'
import { clientIp, rateLimit } from '@/lib/security/rate-limit'
import { logOpsActivity } from '@/lib/ops/data'
import { requirePermission } from '@/lib/admin/permissions'
import { cleanAmount, cleanCurrency, cleanDateOnly, cleanLongText, cleanMetadata, cleanText, cleanUrl, parseReceiptCategory, parseReceiptStatus } from '@/lib/ops/validation'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function GET() {
  const forbidden = await requirePermission('receipts')
  if (forbidden) return forbidden
  const { data, error } = await db().from('receipts').select('*').order('purchased_at', { ascending: false, nullsFirst: false }).order('created_at', { ascending: false }).limit(200)
  if (error) return adminJson({ error: error.message }, { status: 500 })
  return adminJson({ receipts: data ?? [] })
}

export async function POST(req: NextRequest) {
  const forbidden = await requirePermission('receipts', 'write')
  if (forbidden) return forbidden
  const limited = await rateLimit(`receipts:${clientIp(req)}`, 30, 60_000)
  if (!limited.ok) return adminJson({ error: 'Rate limited' }, { status: 429 })
  let body: Record<string, unknown>
  try { body = await req.json() } catch { return adminJson({ error: 'Invalid JSON' }, { status: 400 }) }
  const title = cleanText(body.title, 220)
  if (!title) return adminJson({ error: 'title required' }, { status: 400 })
  const { data, error } = await db().from('receipts').insert({
    vendor: cleanText(body.vendor, 160),
    title,
    category: parseReceiptCategory(body.category) ?? 'general',
    amount: cleanAmount(body.amount),
    currency: cleanCurrency(body.currency),
    payment_method: cleanText(body.payment_method, 120),
    purchased_at: cleanDateOnly(body.purchased_at),
    status: parseReceiptStatus(body.status) ?? 'unreviewed',
    client_name: cleanText(body.client_name, 160),
    project_name: cleanText(body.project_name, 160),
    file_url: cleanUrl(body.file_url),
    notes: cleanLongText(body.notes, 2000),
    metadata: cleanMetadata(body.metadata),
  }).select('*').single()
  if (error) return adminJson({ error: error.message }, { status: 500 })
  await logOpsActivity({ action: 'receipt_created', entity_type: 'receipt', entity_id: data.id, details: { category: data.category } })
  return adminJson({ receipt: data }, { status: 201 })
}
