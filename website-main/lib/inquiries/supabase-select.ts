/** Column lists for schema drift — v2 migration may be partial in production */

export const INQUIRY_SELECT_V1 =
  'id, created_at, brand, about, needs, contact, status, priority, notes, region, source, activity_log'

export const INQUIRY_SELECT_V2 =
  `${INQUIRY_SELECT_V1}, updated_at, company_name, goals, project_type, project_stage, budget_range, timeline, pain_points, revenue_band, preferred_contact_method, whatsapp, instagram, archived, tags, assigned_to, last_contacted_at, internal_summary, follow_up_date, lead_score, country, city, owner_id, company_id, contact_id, archived_at`

export function isMissingColumnError(message: string): boolean {
  return /column|does not exist|42703/i.test(message)
}
