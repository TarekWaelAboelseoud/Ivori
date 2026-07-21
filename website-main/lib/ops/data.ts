import { getDb } from '@/lib/supabase-server'
import type { OpsCategory } from './config'
import type { AdminUser, Client, FinanceRecord, OpsItem, Receipt } from './types'

export interface OpsSummary {
  openLeads: number
  activeClients: number
  urgentItems: number
  dueThisWeek: number
  financePending: number
  financePendingValue: number
  financeOverdueValue: number
  receiptsThisMonth: number
  upcomingBilling: number
  recentActivity: {
    id: string
    actor_email: string | null
    action: string
    entity_type: string
    entity_id: string | null
    details: Record<string, unknown>
    created_at: string
  }[]
}

export async function getOpsItems(opts: {
  category?: OpsCategory
  highPriorityOnly?: boolean
  includeArchived?: boolean
  limit?: number
}): Promise<{ items: OpsItem[]; error?: string }> {
  const supabase = getDb()
  if (!supabase) return { items: [] }

  let query = supabase
    .from('ops_items')
    .select('*')
    .order('due_at', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(opts.limit ?? 100)

  if (opts.category) query = query.eq('category', opts.category)
  if (opts.highPriorityOnly) query = query.in('priority', ['high', 'urgent'])
  if (!opts.includeArchived) query = query.eq('archived', false)

  const { data, error } = await query
  if (error) return { items: [], error: error.message }
  return { items: (data ?? []) as OpsItem[] }
}

export async function getAdminUsers(): Promise<{ users: AdminUser[]; error?: string }> {
  const supabase = getDb()
  if (!supabase) return { users: [] }

  const { data, error } = await supabase
    .from('admin_users')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) return { users: [], error: error.message }
  return { users: (data ?? []) as AdminUser[] }
}

export async function getOpsSummary(): Promise<{ summary: OpsSummary | null; error?: string }> {
  const supabase = getDb()
  if (!supabase) return { summary: null }

  const now = new Date()
  const weekEnd = new Date(now)
  weekEnd.setDate(now.getDate() + 7)

  const [leads, clients, urgent, due, finance, activity] = await Promise.all([
    supabase.from('ops_items').select('id', { count: 'exact', head: true }).eq('category', 'leads').eq('archived', false).neq('status', 'done'),
    supabase.from('ops_items').select('id', { count: 'exact', head: true }).eq('category', 'clients').eq('archived', false).neq('status', 'done'),
    supabase.from('ops_items').select('id', { count: 'exact', head: true }).eq('archived', false).in('priority', ['high', 'urgent']).neq('status', 'done'),
    supabase.from('ops_items').select('id', { count: 'exact', head: true }).eq('archived', false).lte('due_at', weekEnd.toISOString()).neq('status', 'done'),
    supabase.from('ops_items').select('id', { count: 'exact', head: true }).eq('category', 'finance').eq('archived', false).neq('status', 'done'),
    supabase.from('ops_activity_log').select('*').order('created_at', { ascending: false }).limit(8),
  ])

  const firstError = [leads.error, clients.error, urgent.error, due.error, finance.error, activity.error].find(Boolean)
  if (firstError) return { summary: null, error: firstError.message }

  return {
    summary: {
      openLeads: leads.count ?? 0,
      activeClients: clients.count ?? 0,
      urgentItems: urgent.count ?? 0,
      dueThisWeek: due.count ?? 0,
      financePending: finance.count ?? 0,
      financePendingValue: 0,
      financeOverdueValue: 0,
      receiptsThisMonth: 0,
      upcomingBilling: 0,
      recentActivity: (activity.data ?? []) as OpsSummary['recentActivity'],
    },
  }
}

export async function getFinanceRecords(): Promise<{ records: FinanceRecord[]; error?: string }> {
  const supabase = getDb()
  if (!supabase) return { records: [] }
  const { data, error } = await supabase
    .from('finance_records')
    .select('*')
    .order('due_at', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(200)
  if (error) return { records: [], error: error.message }
  return { records: (data ?? []) as FinanceRecord[] }
}

export async function getReceipts(): Promise<{ receipts: Receipt[]; error?: string }> {
  const supabase = getDb()
  if (!supabase) return { receipts: [] }
  const { data, error } = await supabase
    .from('receipts')
    .select('*')
    .order('purchased_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(200)
  if (error) return { receipts: [], error: error.message }
  return { receipts: (data ?? []) as Receipt[] }
}

export async function getClients(): Promise<{ clients: Client[]; error?: string }> {
  const supabase = getDb()
  if (!supabase) return { clients: [] }
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('next_follow_up_at', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(200)
  if (error) return { clients: [], error: error.message }
  return { clients: (data ?? []) as Client[] }
}

export async function getOverviewV2(): Promise<{
  data: {
    openLeads: number
    activeClients: number
    pendingFinanceValue: number
    overdueFinanceValue: number
    receiptsThisMonth: number
    urgentOpsItems: number
    dueThisWeek: number
    newInquiries: number
    upcomingBilling: number
    recentActivity: OpsSummary['recentActivity']
  } | null
  error?: string
}> {
  const supabase = getDb()
  if (!supabase) return { data: null }
  const now = new Date()
  const weekEnd = new Date(now)
  weekEnd.setDate(now.getDate() + 7)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const [leads, clients, finance, receipts, urgent, due, inquiries, activity, billing] = await Promise.all([
    supabase.from('ops_items').select('id', { count: 'exact', head: true }).eq('category', 'leads').eq('archived', false).neq('status', 'done'),
    supabase.from('clients').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('finance_records').select('amount, status, type'),
    supabase.from('receipts').select('amount, purchased_at').gte('purchased_at', monthStart.toISOString().slice(0, 10)),
    supabase.from('ops_items').select('id', { count: 'exact', head: true }).eq('archived', false).in('priority', ['high', 'urgent']).neq('status', 'done'),
    supabase.from('ops_items').select('id', { count: 'exact', head: true }).eq('archived', false).lte('due_at', weekEnd.toISOString()).neq('status', 'done'),
    supabase.from('studio_inquiries').select('id', { count: 'exact', head: true }).eq('status', 'new'),
    supabase.from('ops_activity_log').select('*').order('created_at', { ascending: false }).limit(8),
    supabase.from('clients').select('id', { count: 'exact', head: true }).lte('next_invoice_at', weekEnd.toISOString()).neq('status', 'lost'),
  ])
  const firstError = [leads.error, clients.error, finance.error, receipts.error, urgent.error, due.error, inquiries.error, activity.error, billing.error].find(Boolean)
  if (firstError) return { data: null, error: firstError.message }

  const financeRows = (finance.data ?? []) as Pick<FinanceRecord, 'amount' | 'status' | 'type'>[]
  const pendingFinanceValue = financeRows
    .filter((row) => ['sent', 'pending'].includes(row.status) && row.type !== 'expense')
    .reduce((sum, row) => sum + Number(row.amount || 0), 0)
  const overdueFinanceValue = financeRows
    .filter((row) => row.status === 'overdue' && row.type !== 'expense')
    .reduce((sum, row) => sum + Number(row.amount || 0), 0)
  const receiptsThisMonth = ((receipts.data ?? []) as Pick<Receipt, 'amount'>[]).reduce((sum, row) => sum + Number(row.amount || 0), 0)

  return {
    data: {
      openLeads: leads.count ?? 0,
      activeClients: clients.count ?? 0,
      pendingFinanceValue,
      overdueFinanceValue,
      receiptsThisMonth,
      urgentOpsItems: urgent.count ?? 0,
      dueThisWeek: due.count ?? 0,
      newInquiries: inquiries.count ?? 0,
      upcomingBilling: billing.count ?? 0,
      recentActivity: (activity.data ?? []) as OpsSummary['recentActivity'],
    },
  }
}

export async function logOpsActivity(input: {
  actor_email?: string | null
  action: string
  entity_type: string
  entity_id?: string | null
  details?: Record<string, unknown>
}) {
  const supabase = getDb()
  if (!supabase) return
  try {
    await supabase.from('ops_activity_log').insert({
      actor_email: input.actor_email ?? null,
      action: input.action,
      entity_type: input.entity_type,
      entity_id: input.entity_id ?? null,
      details: input.details ?? {},
    })
  } catch {
    /* best effort */
  }
}
