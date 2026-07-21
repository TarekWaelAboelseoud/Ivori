export const OPS_CATEGORIES = [
  'leads',
  'clients',
  'high_priority',
  'finance',
  'domain_hosting',
  'content',
  'partnerships',
  'outreach',
  'internal_ops',
  'automation',
  'receipts',
] as const

export const OPS_STATUSES = ['open', 'in_progress', 'waiting', 'blocked', 'done', 'archived'] as const
export const OPS_PRIORITIES = ['low', 'normal', 'high', 'urgent'] as const
export const ADMIN_ROLES = ['administrator', 'finance', 'operations', 'sales', 'content_studio', 'viewer'] as const
export const ADMIN_USER_STATUSES = ['active', 'invited', 'disabled'] as const

export type OpsCategory = (typeof OPS_CATEGORIES)[number]
export type OpsStatus = (typeof OPS_STATUSES)[number]
export type OpsPriority = (typeof OPS_PRIORITIES)[number]
export type AdminRole = (typeof ADMIN_ROLES)[number]
export type AdminUserStatus = (typeof ADMIN_USER_STATUSES)[number]

export const FINANCE_TYPES = ['invoice', 'payment', 'expense', 'refund', 'subscription', 'tax', 'payroll', 'other'] as const
export const FINANCE_STATUSES = ['draft', 'sent', 'pending', 'unpaid', 'partial', 'paid', 'overdue', 'cancelled'] as const
export const RECEIPT_CATEGORIES = [
  'software',
  'ads',
  'production',
  'domain_hosting',
  'contractor',
  'travel',
  'office',
  'equipment',
  'client_expense',
  'general',
] as const
export const RECEIPT_STATUSES = ['unreviewed', 'reviewed', 'reimbursed', 'archived'] as const
export const CLIENT_STATUSES = ['prospect', 'active', 'paused', 'completed', 'lost'] as const
export const CLIENT_TIERS = ['starter', 'standard', 'premium', 'flagship'] as const
export const RECURRING_INTERVALS = ['none', 'monthly', 'quarterly', 'annual'] as const

export type FinanceType = (typeof FINANCE_TYPES)[number]
export type FinanceStatus = (typeof FINANCE_STATUSES)[number]
export type ReceiptCategory = (typeof RECEIPT_CATEGORIES)[number]
export type ReceiptStatus = (typeof RECEIPT_STATUSES)[number]
export type ClientStatus = (typeof CLIENT_STATUSES)[number]
export type ClientTier = (typeof CLIENT_TIERS)[number]
export type RecurringInterval = (typeof RECURRING_INTERVALS)[number]

export const OPS_CATEGORY_LABELS: Record<OpsCategory, string> = {
  leads: 'Leads',
  clients: 'Clients',
  high_priority: 'High Priority',
  finance: 'Finance',
  domain_hosting: 'Domain & Hosting',
  content: 'Content',
  partnerships: 'Partnerships',
  outreach: 'Outreach',
  internal_ops: 'Internal Ops',
  automation: 'Automation',
  receipts: 'Receipts',
}

export const OPS_CATEGORY_PATHS: Record<OpsCategory, string> = {
  leads: '/studio-ops/inquiries',
  clients: '/studio-ops/clients',
  high_priority: '/studio-ops/internal-ops',
  finance: '/studio-ops/finance',
  domain_hosting: '/studio-ops/internal-ops',
  content: '/studio-ops/content',
  partnerships: '/studio-ops/inquiries',
  outreach: '/studio-ops/inquiries',
  internal_ops: '/studio-ops/internal-ops',
  automation: '/studio-ops/internal-ops',
  receipts: '/studio-ops/receipts',
}

export const OPS_CATEGORY_DESCRIPTIONS: Record<OpsCategory, string> = {
  leads: 'Qualified opportunities and inbound prospects waiting for next action.',
  clients: 'Active client work, delivery concerns, and relationship notes.',
  high_priority: 'Urgent operating items across the whole company.',
  finance: 'Pending finance tasks, payment follow-ups, and billing notes.',
  domain_hosting: 'Domains, DNS, hosting, renewals, and vendor access.',
  content: 'Content workflow, publishing tasks, and production queue.',
  partnerships: 'Partner conversations, referral channels, and strategic alliances.',
  outreach: 'Outbound campaigns, warm introductions, and reply tracking.',
  internal_ops: 'Internal operating tasks that do not belong to a client queue.',
  automation: 'Systems, scripts, automations, and process improvements.',
  receipts: 'Receipts, proof of payment, expense capture, and reconciliation.',
}
