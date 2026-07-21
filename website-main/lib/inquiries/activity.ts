import type { InquiryActivity, InquiryUpdate } from './types'

export function appendActivity(
  log: InquiryActivity[] | null | undefined,
  entry: Omit<InquiryActivity, 'at'>
): InquiryActivity[] {
  const prev = Array.isArray(log) ? log : []
  return [{ at: new Date().toISOString(), actor: entry.actor ?? 'system', ...entry }, ...prev].slice(0, 50)
}

export function activityForPatch(
  prev: StudioInquiryPatchable,
  patch: InquiryUpdate,
  actor = 'admin'
): InquiryActivity[] {
  const entries: Omit<InquiryActivity, 'at'>[] = []
  if (patch.status && patch.status !== prev.status) {
    entries.push({ type: 'status', from: prev.status, to: patch.status, actor })
  }
  if (patch.priority && patch.priority !== prev.priority) {
    entries.push({ type: 'priority', from: prev.priority, to: patch.priority, actor })
  }
  if (patch.notes !== undefined && patch.notes !== prev.notes) {
    entries.push({ type: 'notes', detail: 'Notes updated', actor })
  }
  if (patch.region !== undefined && patch.region !== prev.region) {
    entries.push({ type: 'region', to: patch.region ?? undefined, actor })
  }
  if ((patch.country !== undefined && patch.country !== prev.country) || (patch.city !== undefined && patch.city !== prev.city)) {
    entries.push({ type: 'location', detail: 'Location updated', actor })
  }
  if (patch.source !== undefined && patch.source !== prev.source) {
    entries.push({ type: 'source', from: prev.source ?? undefined, to: patch.source ?? undefined, actor })
  }
  if (patch.archived !== undefined && patch.archived !== prev.archived) {
    entries.push({ type: 'archived', to: String(patch.archived), actor })
  }
  if (patch.tags !== undefined) {
    entries.push({ type: 'tags', detail: (patch.tags ?? []).join(', ') || 'cleared', actor })
  }
  if (patch.assigned_to !== undefined && patch.assigned_to !== prev.assigned_to) {
    entries.push({ type: 'assigned', to: patch.assigned_to ?? 'unassigned', actor })
  }
  if (patch.company_id !== undefined || patch.contact_id !== undefined) {
    entries.push({ type: 'linkage', detail: 'Customer linkage updated', actor })
  }
  if (patch.lead_score !== undefined && patch.lead_score !== prev.lead_score) {
    entries.push({ type: 'lead_score', from: String(prev.lead_score), to: String(patch.lead_score), actor })
  }
  if (patch.follow_up_date !== undefined && patch.follow_up_date !== prev.follow_up_date) {
    entries.push({ type: 'follow_up', to: patch.follow_up_date ?? 'cleared', actor })
  }
  if (patch.internal_summary !== undefined && patch.internal_summary !== prev.internal_summary) {
    entries.push({ type: 'summary', detail: 'Summary updated', actor })
  }
  if (patch.last_contacted_at !== undefined && patch.last_contacted_at !== prev.last_contacted_at) {
    entries.push({ type: 'contacted', detail: 'Last contacted updated', actor })
  }
  return entries.map((e) => ({ ...e, at: new Date().toISOString() }))
}

type StudioInquiryPatchable = {
  status?: string
  priority?: string
  notes?: string | null
  region?: string | null
  country?: string | null
  city?: string | null
  source?: string | null
  archived?: boolean
  tags?: string[]
  assigned_to?: string | null
  company_id?: string | null
  contact_id?: string | null
  lead_score?: number
  follow_up_date?: string | null
  internal_summary?: string | null
  last_contacted_at?: string | null
}
