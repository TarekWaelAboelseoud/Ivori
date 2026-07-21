/** Input sanitization for public forms */

const MAX = {
  brand: 120,
  company_name: 120,
  about: 4000,
  needs: 500,
  contact: 320,
  goals: 800,
  project_type: 80,
  project_stage: 80,
  budget_range: 60,
  timeline: 60,
  pain_points: 1200,
  revenue_band: 60,
  preferred_contact_method: 40,
  whatsapp: 40,
  instagram: 80,
} as const

export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, '').trim()
}

export function clampField(value: unknown, max: number): string {
  if (typeof value !== 'string') return ''
  return stripHtml(value).slice(0, max)
}

export interface ParsedInquiryBody {
  brand: string | null
  company_name: string | null
  about: string | null
  needs: string | null
  contact: string
  goals: string | null
  project_type: string | null
  project_stage: string | null
  budget_range: string | null
  timeline: string | null
  pain_points: string | null
  revenue_band: string | null
  preferred_contact_method: string | null
  whatsapp: string | null
  instagram: string | null
}

/** @deprecated use parseInquiryBody */
export function parseContactBody(body: unknown): ParsedInquiryBody | null {
  return parseInquiryBody(body)
}

export function parseInquiryBody(body: unknown): ParsedInquiryBody | null {
  if (!body || typeof body !== 'object') return null
  const b = body as Record<string, unknown>

  const contact = clampField(b.contact, MAX.contact)
  const whatsapp = clampField(b.whatsapp, MAX.whatsapp)
  const primary = contact || whatsapp
  if (!primary || primary.length < 3) return null

  const preferred = clampField(b.preferred_contact_method, MAX.preferred_contact_method)

  return {
    brand: clampField(b.brand, MAX.brand) || null,
    company_name: clampField(b.company_name, MAX.company_name) || null,
    about: clampField(b.about, MAX.about) || null,
    needs: clampField(b.needs, MAX.needs) || null,
    contact: primary,
    goals: clampField(b.goals, MAX.goals) || null,
    project_type: clampField(b.project_type, MAX.project_type) || null,
    project_stage: clampField(b.project_stage, MAX.project_stage) || null,
    budget_range: clampField(b.budget_range, MAX.budget_range) || null,
    timeline: clampField(b.timeline, MAX.timeline) || null,
    pain_points: clampField(b.pain_points, MAX.pain_points) || null,
    revenue_band: clampField(b.revenue_band, MAX.revenue_band) || null,
    preferred_contact_method: preferred || null,
    whatsapp: whatsapp || null,
    instagram: clampField(b.instagram, MAX.instagram) || null,
  }
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function parseTagsInput(value: unknown): string[] | null {
  if (value === undefined) return null
  if (!Array.isArray(value)) return []
  return value
    .filter((t): t is string => typeof t === 'string')
    .map((t) => stripHtml(t).slice(0, 32))
    .filter(Boolean)
    .slice(0, 12)
}
