import { logStudioOps } from '@/lib/admin/runtime'
import { isSupabaseConfigured } from '@/lib/env'
import { getDb } from '@/lib/supabase-server'
import { activityForPatch, appendActivity } from './activity'
import {
  INQUIRY_SELECT_V1,
  INQUIRY_SELECT_V2,
  isMissingColumnError,
} from './supabase-select'
import { fileInsertInquiry, fileListInquiries, fileUpdateInquiry } from './file-store'
import type { InquiryInsert, InquiryUpdate, StudioInquiry } from './types'

export type PersistResult =
  | { ok: true; inquiry: StudioInquiry; storage: 'supabase' | 'local' }
  | { ok: false; error: string; code: 'NO_DATABASE' | 'INSERT_FAILED' }

const SQL_HINT = 'Run supabase/schema.sql once in the Supabase SQL editor.'

async function fetchInquiryRows(supabase: NonNullable<ReturnType<typeof getDb>>) {
  const query = () =>
    supabase.from('studio_inquiries').select('*').order('created_at', { ascending: false }).limit(300)

  let result = await query()
  if (!result.error) return result

  if (isMissingColumnError(result.error.message)) {
    logStudioOps('inquiries', 'schema drift, retrying v2 columns', { err: result.error.message })
    result = await supabase
      .from('studio_inquiries')
      .select(INQUIRY_SELECT_V2)
      .order('created_at', { ascending: false })
      .limit(300)
  }

  if (result.error && isMissingColumnError(result.error.message)) {
    logStudioOps('inquiries', 'schema drift, retrying v1 columns', { err: result.error.message })
    result = await supabase
      .from('studio_inquiries')
      .select(INQUIRY_SELECT_V1)
      .order('created_at', { ascending: false })
      .limit(300)
  }

  return result
}

function parseTags(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.filter((t): t is string => typeof t === 'string')
  return []
}

function normalizeSource(raw: unknown): StudioInquiry['source'] {
  const value = typeof raw === 'string' ? raw : ''
  if (['website', 'instagram', 'whatsapp', 'referral', 'manual'].includes(value)) return value
  return value === 'contact' || !value ? 'website' : value
}

export function normalizeRow(r: Record<string, unknown>): StudioInquiry {
  const log = r.activity_log
  return {
    id: r.id as string,
    brand: (r.brand as string) ?? null,
    company_name: (r.company_name as string) ?? null,
    about: (r.about as string) ?? null,
    needs: (r.needs as string) ?? null,
    contact: r.contact as string,
    goals: (r.goals as string) ?? null,
    project_type: (r.project_type as string) ?? null,
    project_stage: (r.project_stage as string) ?? null,
    budget_range: (r.budget_range as string) ?? null,
    timeline: (r.timeline as string) ?? null,
    pain_points: (r.pain_points as string) ?? null,
    revenue_band: (r.revenue_band as string) ?? null,
    preferred_contact_method: (r.preferred_contact_method as string) ?? null,
    whatsapp: (r.whatsapp as string) ?? null,
    instagram: (r.instagram as string) ?? null,
    status: (r.status as StudioInquiry['status']) ?? 'new',
    priority: (r.priority as StudioInquiry['priority']) ?? 'medium',
    notes: (r.notes as string) ?? null,
    archived: Boolean(r.archived),
    tags: parseTags(r.tags),
    assigned_to: (r.assigned_to as string) ?? null,
    source: normalizeSource(r.source),
    region: (r.region as string) ?? null,
    country: (r.country as string) ?? null,
    city: (r.city as string) ?? null,
    owner_id: (r.owner_id as string) ?? null,
    company_id: (r.company_id as string) ?? null,
    contact_id: (r.contact_id as string) ?? null,
    archived_at: (r.archived_at as string) ?? null,
    last_contacted_at: (r.last_contacted_at as string) ?? null,
    internal_summary: (r.internal_summary as string) ?? null,
    follow_up_date: (r.follow_up_date as string) ?? null,
    lead_score: typeof r.lead_score === 'number' ? r.lead_score : Number(r.lead_score) || 0,
    activity_log: Array.isArray(log) ? (log as StudioInquiry['activity_log']) : [],
    created_at: r.created_at as string,
    updated_at: (r.updated_at as string) ?? null,
  }
}

async function logActivityTable(
  inquiryId: string,
  action: string,
  actor: string,
  metadata: Record<string, unknown>
) {
  const supabase = getDb()
  if (!supabase) return
  try {
    await supabase.from('inquiry_activity_log').insert({
      inquiry_id: inquiryId,
      action,
      actor,
      metadata,
    })
  } catch {
    /* optional until v2 migration */
  }
}

export async function insertInquiry(row: InquiryInsert): Promise<PersistResult> {
  const created = new Date().toISOString()
  const activity_log = [{ at: created, type: 'created' as const, detail: 'Contact form submitted' }]
  const payload = {
    brand: row.brand,
    company_name: row.company_name ?? row.brand,
    about: row.about,
    needs: row.needs,
    contact: row.contact,
    goals: row.goals ?? null,
    project_type: row.project_type ?? null,
    project_stage: row.project_stage ?? null,
    budget_range: row.budget_range ?? null,
    timeline: row.timeline ?? null,
    pain_points: row.pain_points ?? null,
    revenue_band: row.revenue_band ?? null,
    preferred_contact_method: row.preferred_contact_method ?? null,
    whatsapp: row.whatsapp ?? null,
    instagram: row.instagram ?? null,
    status: row.status ?? 'new',
    priority: row.priority ?? 'medium',
    region: row.region ?? null,
    country: row.country ?? null,
    city: row.city ?? null,
    source: row.source ?? 'contact',
    activity_log,
    archived: false,
    tags: [],
    lead_score: 0,
  }

  const supabase = getDb()
  if (supabase) {
    const { data, error } = await supabase.from('studio_inquiries').insert(payload).select('*').single()

    if (!error && data) {
      const inquiry = normalizeRow(data as Record<string, unknown>)
      await logActivityTable(inquiry.id, 'created', 'contact_form', { source: inquiry.source })
      return { ok: true, inquiry, storage: 'supabase' }
    }

    const message = error?.message ?? 'Unknown database error'
    const missingTable = /studio_inquiries|relation|does not exist|column/i.test(message)

    if (process.env.NODE_ENV === 'development') {
      const local = await fileInsertInquiry(row)
      return { ok: true, inquiry: local, storage: 'local' }
    }

    return {
      ok: false,
      error: missingTable ? SQL_HINT : message,
      code: 'INSERT_FAILED',
    }
  }

  if (process.env.NODE_ENV === 'development') {
    const local = await fileInsertInquiry(row)
    return { ok: true, inquiry: local, storage: 'local' }
  }

  return {
    ok: false,
    error: 'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.',
    code: 'NO_DATABASE',
  }
}

export async function listInquiries(options?: {
  status?: string
  priority?: string
  q?: string
  sort?: string
  archived?: string
  tag?: string
  source?: string
  owner?: string
}): Promise<{ rows: StudioInquiry[]; error?: string; sources: string[] }> {
  const sources: string[] = []
  let rows: StudioInquiry[] = []

  const supabase = getDb()
  if (supabase) {
    const { data, error } = await fetchInquiryRows(supabase)

    if (error) {
      logStudioOps('inquiries', 'list failed', { message: error.message })
      const hint = isMissingColumnError(error.message) ? SQL_HINT : error.message
      return { rows: [], error: hint, sources }
    }
    rows = (data ?? []).map((r) => normalizeRow(r as Record<string, unknown>))
    sources.push('supabase')
  }

  if (process.env.NODE_ENV === 'development') {
    const local = await fileListInquiries()
    const seen = new Set(rows.map((r) => r.id))
    for (const r of local) {
      if (!seen.has(r.id)) rows.push(r)
    }
    if (local.length) sources.push('local')
  }

  const showArchived = options?.archived === '1'
  if (!showArchived) {
    rows = rows.filter((r) => !r.archived)
  } else {
    rows = rows.filter((r) => r.archived)
  }

  const sort = options?.sort ?? 'newest'
  rows.sort((a, b) => {
    if (sort === 'priority') {
      const rank = { urgent: 0, high: 1, medium: 2, low: 3 }
      const d = rank[a.priority ?? 'medium'] - rank[b.priority ?? 'medium']
      if (d !== 0) return d
    }
    if (sort === 'score') {
      return (b.lead_score ?? 0) - (a.lead_score ?? 0)
    }
    if (sort === 'follow_up') {
      const fa = a.follow_up_date ? new Date(a.follow_up_date).getTime() : Infinity
      const fb = b.follow_up_date ? new Date(b.follow_up_date).getTime() : Infinity
      return fa - fb
    }
    const ta = new Date(a.created_at).getTime()
    const tb = new Date(b.created_at).getTime()
    return sort === 'oldest' ? ta - tb : tb - ta
  })

  if (options?.status && options.status !== 'all') {
    rows = rows.filter((r) => r.status === options.status)
  }

  if (options?.priority && options.priority !== 'all') {
    rows = rows.filter((r) => (r.priority ?? 'medium') === options.priority)
  }

  if (options?.tag?.trim()) {
    const tag = options.tag.trim().toLowerCase()
    rows = rows.filter((r) => r.tags.some((t) => t.toLowerCase() === tag))
  }

  if (options?.source?.trim() && options.source !== 'all') {
    rows = rows.filter((r) => r.source === options.source)
  }

  if (options?.owner?.trim() && options.owner !== 'all') {
    rows = rows.filter((r) => (r.assigned_to ?? 'unassigned') === options.owner)
  }

  if (options?.q?.trim()) {
    const q = options.q.trim().toLowerCase()
    rows = rows.filter((r) => {
      const hay = [
        r.brand,
        r.company_name,
        r.contact,
        r.about,
        r.needs,
        r.notes,
        r.region,
        r.country,
        r.city,
        r.source,
        r.goals,
        r.project_type,
        r.internal_summary,
        r.assigned_to,
        ...r.tags,
      ]
      return hay.some((f) => f?.toLowerCase().includes(q))
    })
  }

  if (!rows.length && !isSupabaseConfigured() && process.env.NODE_ENV !== 'development') {
    return { rows: [], error: 'Supabase is not configured.', sources }
  }

  return { rows, sources }
}

export async function updateInquiry(
  id: string,
  patch: InquiryUpdate,
  actor = 'admin'
): Promise<{ ok: true; inquiry?: StudioInquiry } | { ok: false; error: string }> {
  const supabase = getDb()

  if (supabase) {
    let readResult = await supabase.from('studio_inquiries').select('*').eq('id', id).single()
    if (readResult.error && isMissingColumnError(readResult.error.message)) {
      readResult = await supabase.from('studio_inquiries').select(INQUIRY_SELECT_V2).eq('id', id).single()
    }
    const { data: current, error: readErr } = readResult

    if (readErr || !current) {
      if (process.env.NODE_ENV !== 'development') {
        return { ok: false, error: readErr?.message ?? 'Inquiry not found' }
      }
    } else {
      const prev = normalizeRow(current as Record<string, unknown>)
      const activities = activityForPatch(prev, patch, actor)
      let log = prev.activity_log
      for (const a of activities) {
        log = appendActivity(log, a)
        await logActivityTable(id, a.type, actor, {
          from: a.from,
          to: a.to,
          detail: a.detail,
        })
      }
      const { data: updated, error } = await supabase
        .from('studio_inquiries')
        .update({ ...patch, activity_log: log })
        .eq('id', id)
        .select('*')
        .single()
      if (!error && updated) {
        return { ok: true, inquiry: normalizeRow(updated as Record<string, unknown>) }
      }
      if (process.env.NODE_ENV !== 'development') {
        return { ok: false as const, error: error?.message ?? 'Update failed' }
      }
    }
  }

  if (process.env.NODE_ENV === 'development') {
    const list = await fileListInquiries()
    const current = list.find((r) => r.id === id)
    const activities = current ? activityForPatch(current, patch, actor) : []
    const updated = await fileUpdateInquiry(id, patch, activities)
    if (updated) return { ok: true, inquiry: updated }
  }

  return { ok: false, error: 'Inquiry not found' }
}

export async function updateInquiryStatus(id: string, status: string) {
  return updateInquiry(id, { status: status as StudioInquiry['status'] })
}
