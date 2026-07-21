import type {
  AdminRole,
  AdminUserStatus,
  ClientStatus,
  ClientTier,
  FinanceStatus,
  FinanceType,
  OpsCategory,
  OpsPriority,
  OpsStatus,
  ReceiptCategory,
  ReceiptStatus,
  RecurringInterval,
} from './config'

export interface OpsItem {
  id: string
  title: string
  description: string | null
  category: OpsCategory
  status: OpsStatus
  priority: OpsPriority
  owner_id: string | null
  owner_name: string | null
  source: string | null
  related_email: string | null
  related_url: string | null
  due_at: string | null
  completed_at: string | null
  archived: boolean
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface AdminUser {
  id: string
  email: string
  name: string | null
  role: AdminRole
  status: AdminUserStatus
  permissions: Record<string, unknown>
  last_seen_at: string | null
  created_at: string
  updated_at: string
}

export interface FinanceRecord {
  id: string
  type: FinanceType
  status: FinanceStatus
  client_name: string | null
  client_email: string | null
  title: string
  description: string | null
  amount: number
  currency: string
  due_at: string | null
  paid_at: string | null
  related_ops_item_id: string | null
  related_inquiry_id: string | null
  receipt_url: string | null
  invoice_url: string | null
  recurring_interval: RecurringInterval | null
  next_invoice_at: string | null
  billing_notes: string | null
  auto_generate: boolean
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface Receipt {
  id: string
  vendor: string | null
  title: string
  category: ReceiptCategory
  amount: number
  currency: string
  payment_method: string | null
  purchased_at: string | null
  status: ReceiptStatus
  client_name: string | null
  project_name: string | null
  file_url: string | null
  notes: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  name: string
  email: string | null
  company: string | null
  website: string | null
  region: string | null
  status: ClientStatus
  tier: ClientTier
  monthly_value: number
  currency: string
  owner_name: string | null
  started_at: string | null
  next_follow_up_at: string | null
  recurring_interval: RecurringInterval | null
  next_invoice_at: string | null
  billing_notes: string | null
  auto_generate: boolean
  notes: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}
