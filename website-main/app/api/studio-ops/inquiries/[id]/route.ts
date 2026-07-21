import { NextRequest } from 'next/server'
import { updateInquiry } from '@/lib/inquiries/persist'
import { logAdminAudit } from '@/lib/security/audit'
import { parseTagsInput } from '@/lib/security/sanitize'
import { clientIp } from '@/lib/security/rate-limit'
import { adminJson } from '@/lib/security/admin-response'
import { requirePermission } from '@/lib/admin/permissions'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'
import type { InquiryPriority, InquiryStatus } from '@/lib/inquiries/types'

const STATUSES: InquiryStatus[] = ['new', 'contacted', 'qualified', 'proposal_sent', 'won', 'lost', 'archived']
const PRIORITIES: InquiryPriority[] = ['low', 'medium', 'high', 'urgent']

export async function PATCH(req: NextRequest, ctx: RouteContext<'/api/studio-ops/inquiries/[id]'>) {
  const forbidden = await requirePermission('inquiries', 'write')
  if (forbidden) return forbidden
  const { id } = await ctx.params
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return adminJson({ error: 'Invalid JSON' }, { status: 400 })
  }

  const patch: Parameters<typeof updateInquiry>[1] = {}

  if (typeof body.status === 'string') {
    if (!STATUSES.includes(body.status as InquiryStatus)) {
      return adminJson({ error: 'Invalid status' }, { status: 400 })
    }
    patch.status = body.status as InquiryStatus
  }

  if (typeof body.priority === 'string') {
    if (!PRIORITIES.includes(body.priority as InquiryPriority)) {
      return adminJson({ error: 'Invalid priority' }, { status: 400 })
    }
    patch.priority = body.priority as InquiryPriority
  }

  if (body.notes !== undefined) patch.notes = typeof body.notes === 'string' ? body.notes.slice(0, 8000) : null
  if (body.region !== undefined) patch.region = typeof body.region === 'string' ? body.region.slice(0, 120) : null
  if (body.country !== undefined) patch.country = typeof body.country === 'string' ? body.country.slice(0, 120) : null
  if (body.city !== undefined) patch.city = typeof body.city === 'string' ? body.city.slice(0, 120) : null
  if (body.source !== undefined) patch.source = typeof body.source === 'string' ? body.source.slice(0, 80) : 'manual'
  if (body.archived !== undefined) patch.archived = Boolean(body.archived)
  if (body.archived_at !== undefined) {
    patch.archived_at = typeof body.archived_at === 'string' && body.archived_at ? body.archived_at : null
  }
  if (body.assigned_to !== undefined) {
    patch.assigned_to = typeof body.assigned_to === 'string' ? body.assigned_to.slice(0, 80) : null
  }
  if (body.owner_id !== undefined) patch.owner_id = typeof body.owner_id === 'string' ? body.owner_id : null
  if (body.company_id !== undefined) patch.company_id = typeof body.company_id === 'string' ? body.company_id : null
  if (body.contact_id !== undefined) patch.contact_id = typeof body.contact_id === 'string' ? body.contact_id : null
  if (body.internal_summary !== undefined) {
    patch.internal_summary = typeof body.internal_summary === 'string' ? body.internal_summary.slice(0, 2000) : null
  }
  if (body.follow_up_date !== undefined) {
    patch.follow_up_date =
      typeof body.follow_up_date === 'string' && body.follow_up_date ? body.follow_up_date.slice(0, 10) : null
  }
  if (body.lead_score !== undefined) {
    const n = Number(body.lead_score)
    if (!Number.isNaN(n)) patch.lead_score = Math.min(100, Math.max(0, Math.round(n)))
  }
  if (body.last_contacted_at !== undefined) {
    patch.last_contacted_at =
      typeof body.last_contacted_at === 'string' && body.last_contacted_at ? body.last_contacted_at : null
  }
  const tags = parseTagsInput(body.tags)
  if (tags !== null) patch.tags = tags

  if (Object.keys(patch).length === 0) {
    return adminJson({ error: 'No valid fields' }, { status: 400 })
  }

  const result = await updateInquiry(id, patch, 'admin')
  if (!result.ok) {
    return adminJson({ error: result.error }, { status: 500 })
  }

  await logAdminAudit('inquiry_updated', {
    path: `/api/studio-ops/inquiries/${id}`,
    ip: clientIp(req),
    metadata: { fields: Object.keys(patch) },
  })

  return adminJson({
    success: true,
    inquiry: 'inquiry' in result ? result.inquiry : undefined,
  })
}
