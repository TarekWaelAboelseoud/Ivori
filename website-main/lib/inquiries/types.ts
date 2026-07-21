export type InquiryStatus = 'new' | 'contacted' | 'qualified' | 'proposal_sent' | 'won' | 'lost' | 'archived'
export type InquiryPriority = 'low' | 'medium' | 'high' | 'urgent'
export type InquirySource = 'website' | 'instagram' | 'whatsapp' | 'referral' | 'manual'

export type InquiryActivityType =
  | 'created'
  | 'status'
  | 'priority'
  | 'notes'
  | 'region'
  | 'tags'
  | 'assigned'
  | 'archived'
  | 'lead_score'
  | 'follow_up'
  | 'summary'
  | 'contacted'
  | 'source'
  | 'location'
  | 'linkage'

export interface InquiryActivity {
  at: string
  type: InquiryActivityType
  from?: string
  to?: string
  detail?: string
  actor?: string
}

export interface StudioInquiry {
  id: string
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
  status: InquiryStatus
  priority: InquiryPriority
  notes: string | null
  archived: boolean
  tags: string[]
  assigned_to: string | null
  source: InquirySource | string
  region: string | null
  country: string | null
  city: string | null
  owner_id: string | null
  company_id: string | null
  contact_id: string | null
  archived_at: string | null
  last_contacted_at: string | null
  internal_summary: string | null
  follow_up_date: string | null
  lead_score: number
  activity_log: InquiryActivity[]
  created_at: string
  updated_at?: string | null
}

export interface InquiryInsert {
  brand: string | null
  company_name?: string | null
  about: string | null
  needs: string | null
  contact: string
  goals?: string | null
  project_type?: string | null
  project_stage?: string | null
  budget_range?: string | null
  timeline?: string | null
  pain_points?: string | null
  revenue_band?: string | null
  preferred_contact_method?: string | null
  whatsapp?: string | null
  instagram?: string | null
  status?: InquiryStatus
  priority?: InquiryPriority
  region?: string | null
  source?: InquirySource | string
  country?: string | null
  city?: string | null
}

export interface InquiryUpdate {
  status?: InquiryStatus
  priority?: InquiryPriority
  notes?: string | null
  region?: string | null
  country?: string | null
  city?: string | null
  source?: InquirySource | string
  archived?: boolean
  archived_at?: string | null
  tags?: string[]
  assigned_to?: string | null
  owner_id?: string | null
  company_id?: string | null
  contact_id?: string | null
  internal_summary?: string | null
  follow_up_date?: string | null
  lead_score?: number
  last_contacted_at?: string | null
  project_type?: string | null
  goals?: string | null
}
