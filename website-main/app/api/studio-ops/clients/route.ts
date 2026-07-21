import { NextRequest } from 'next/server'
import { db } from '@/lib/supabase-server'
import { adminJson } from '@/lib/security/admin-response'
import { clientIp, rateLimit } from '@/lib/security/rate-limit'
import { logOpsActivity } from '@/lib/ops/data'
import { requirePermission } from '@/lib/admin/permissions'
import { cleanAmount, cleanCurrency, cleanDate, cleanDateOnly, cleanEmail, cleanLongText, cleanMetadata, cleanText, cleanUrl, parseClientStatus, parseClientTier, parseRecurringInterval } from '@/lib/ops/validation'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function GET() {
  const forbidden = await requirePermission('clients')
  if (forbidden) return forbidden
  const { data, error } = await db().from('clients').select('*').order('next_follow_up_at', { ascending: true, nullsFirst: false }).order('created_at', { ascending: false }).limit(200)
  if (error) return adminJson({ error: error.message }, { status: 500 })
  return adminJson({ clients: data ?? [] })
}

export async function POST(req: NextRequest) {
  const forbidden = await requirePermission('clients', 'write')
  if (forbidden) return forbidden
  const limited = await rateLimit(`clients:${clientIp(req)}`, 30, 60_000)
  if (!limited.ok) return adminJson({ error: 'Rate limited' }, { status: 429 })
  let body: Record<string, unknown>
  try { body = await req.json() } catch { return adminJson({ error: 'Invalid JSON' }, { status: 400 }) }
  const name = cleanText(body.name, 180)
  if (!name) return adminJson({ error: 'name required' }, { status: 400 })
  const { data, error } = await db().from('clients').insert({
    name,
    email: cleanEmail(body.email),
    company: cleanText(body.company, 180),
    website: cleanUrl(body.website),
    region: cleanText(body.region, 120),
    status: parseClientStatus(body.status) ?? 'prospect',
    tier: parseClientTier(body.tier) ?? 'standard',
    monthly_value: cleanAmount(body.monthly_value),
    currency: cleanCurrency(body.currency),
    owner_name: cleanText(body.owner_name, 120),
    started_at: cleanDateOnly(body.started_at),
    next_follow_up_at: cleanDate(body.next_follow_up_at),
    recurring_interval: parseRecurringInterval(body.recurring_interval) ?? 'monthly',
    next_invoice_at: cleanDate(body.next_invoice_at),
    billing_notes: cleanLongText(body.billing_notes, 2000),
    auto_generate: Boolean(body.auto_generate),
    notes: cleanLongText(body.notes, 4000),
    metadata: cleanMetadata(body.metadata),
  }).select('*').single()
  if (error) return adminJson({ error: error.message }, { status: 500 })
  await logOpsActivity({ action: 'client_created', entity_type: 'client', entity_id: data.id, details: { status: data.status, tier: data.tier } })
  return adminJson({ client: data }, { status: 201 })
}
