import { promises as fs } from 'fs'
import path from 'path'
import { appendActivity } from './activity'
import type { InquiryActivity, InquiryInsert, InquiryUpdate, StudioInquiry } from './types'

const DATA_DIR = path.join(process.cwd(), '.data')
const FILE = path.join(DATA_DIR, 'studio-inquiries.json')

function normalize(row: Partial<StudioInquiry> & Pick<StudioInquiry, 'id' | 'contact' | 'created_at'>): StudioInquiry {
  const log = row.activity_log
  return {
    id: row.id,
    brand: row.brand ?? null,
    company_name: row.company_name ?? null,
    about: row.about ?? null,
    needs: row.needs ?? null,
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
    notes: row.notes ?? null,
    archived: row.archived ?? false,
    tags: row.tags ?? [],
    assigned_to: row.assigned_to ?? null,
    source: row.source ?? 'website',
    region: row.region ?? null,
    country: row.country ?? null,
    city: row.city ?? null,
    owner_id: row.owner_id ?? null,
    company_id: row.company_id ?? null,
    contact_id: row.contact_id ?? null,
    archived_at: row.archived_at ?? null,
    last_contacted_at: row.last_contacted_at ?? null,
    internal_summary: row.internal_summary ?? null,
    follow_up_date: row.follow_up_date ?? null,
    lead_score: row.lead_score ?? 0,
    activity_log: Array.isArray(log) ? log : [],
    created_at: row.created_at,
    updated_at: row.updated_at ?? null,
  }
}

async function readAll(): Promise<StudioInquiry[]> {
  try {
    const raw = await fs.readFile(FILE, 'utf-8')
    const parsed = JSON.parse(raw) as Partial<StudioInquiry>[]
    if (!Array.isArray(parsed)) return []
    return parsed.map((r) =>
      normalize({
        ...r,
        id: r.id!,
        contact: r.contact!,
        created_at: r.created_at ?? new Date().toISOString(),
      })
    )
  } catch {
    return []
  }
}

async function writeAll(rows: StudioInquiry[]) {
  await fs.mkdir(DATA_DIR, { recursive: true })
  await fs.writeFile(FILE, JSON.stringify(rows, null, 2), 'utf-8')
}

export async function fileInsertInquiry(row: InquiryInsert): Promise<StudioInquiry> {
  const list = await readAll()
  const created = new Date().toISOString()
  const entry = normalize({
    id: crypto.randomUUID(),
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
    source: row.source ?? 'website',
    notes: null,
    archived: false,
    tags: [],
    assigned_to: null,
    lead_score: 0,
    activity_log: [{ at: created, type: 'created', detail: 'Contact form submitted' }],
    created_at: created,
  })
  list.unshift(entry)
  await writeAll(list)
  return entry
}

export async function fileListInquiries(): Promise<StudioInquiry[]> {
  return readAll()
}

export async function fileUpdateInquiry(
  id: string,
  patch: InquiryUpdate,
  extraActivity?: InquiryActivity[]
) {
  const list = await readAll()
  const idx = list.findIndex((r) => r.id === id)
  if (idx < 0) return null

  let log = list[idx].activity_log ?? []
  for (const a of extraActivity ?? []) {
    log = appendActivity(log, a)
  }

  list[idx] = normalize({ ...list[idx], ...patch, activity_log: log, updated_at: new Date().toISOString() })
  await writeAll(list)
  return list[idx]
}
