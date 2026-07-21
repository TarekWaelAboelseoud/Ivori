import { NextRequest } from 'next/server'
import { db } from '@/lib/supabase-server'
import { adminJson } from '@/lib/security/admin-response'
import { clientIp, rateLimit } from '@/lib/security/rate-limit'
import { logAdminAudit } from '@/lib/security/audit'
import { logOpsActivity } from '@/lib/ops/data'
import { canAccess, getCurrentAdminRole } from '@/lib/admin/permissions'
import { cleanDate, cleanEmail, cleanLongText, cleanMetadata, cleanText, cleanUrl, parseOpsCategory, parseOpsPriority, parseOpsStatus } from '@/lib/ops/validation'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function GET(req: NextRequest) {
  const role = await getCurrentAdminRole()
  if (!canAccess(role, 'command') && !canAccess(role, 'studio') && !canAccess(role, 'inquiries')) {
    return adminJson({ error: 'Forbidden' }, { status: 403 })
  }
  const url = new URL(req.url)
  const category = parseOpsCategory(url.searchParams.get('category'))
  const highPriority = url.searchParams.get('highPriority') === 'true'
  const status = parseOpsStatus(url.searchParams.get('status'))
  const priority = parseOpsPriority(url.searchParams.get('priority'))

  let query = db()
    .from('ops_items')
    .select('*')
    .eq('archived', false)
    .order('due_at', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(200)

  if (category) query = query.eq('category', category)
  if (highPriority) query = query.in('priority', ['high', 'urgent'])
  if (status) query = query.eq('status', status)
  if (priority) query = query.eq('priority', priority)

  const { data, error } = await query
  if (error) return adminJson({ error: error.message }, { status: 500 })
  return adminJson({ items: data ?? [] })
}

export async function POST(req: NextRequest) {
  const limited = await rateLimit(`ops-items:${clientIp(req)}`, 30, 60_000)
  if (!limited.ok) return adminJson({ error: 'Rate limited' }, { status: 429, headers: { 'Retry-After': String(limited.retryAfter ?? 60) } })

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return adminJson({ error: 'Invalid JSON' }, { status: 400 })
  }

  const title = cleanText(body.title, 220)
  const category = parseOpsCategory(body.category)
  const status = parseOpsStatus(body.status) ?? 'open'
  const priority = parseOpsPriority(body.priority) ?? 'normal'

  if (!title) return adminJson({ error: 'title required' }, { status: 400 })
  if (!category) return adminJson({ error: 'invalid category' }, { status: 400 })
  const role = await getCurrentAdminRole()
  const allowed = ['leads', 'clients', 'high_priority'].includes(category)
    ? canAccess(role, 'inquiries', 'write') || canAccess(role, 'studio', 'write')
    : canAccess(role, 'studio', 'write')
  if (!allowed) return adminJson({ error: 'Forbidden' }, { status: 403 })

  const { data, error } = await db()
    .from('ops_items')
    .insert({
      title,
      description: cleanLongText(body.description, 4000),
      category,
      status,
      priority,
      owner_name: cleanText(body.owner_name, 120),
      source: cleanText(body.source, 120),
      related_email: cleanEmail(body.related_email),
      related_url: cleanUrl(body.related_url),
      due_at: cleanDate(body.due_at),
      metadata: cleanMetadata(body.metadata),
    })
    .select('*')
    .single()

  if (error) return adminJson({ error: error.message }, { status: 500 })

  await logOpsActivity({ action: 'ops_item_created', entity_type: 'ops_item', entity_id: data.id, details: { category, priority } })
  await logAdminAudit('ops_item_created', { path: '/api/studio-ops/ops-items', ip: clientIp(req), metadata: { category, priority } })

  return adminJson({ item: data }, { status: 201 })
}
