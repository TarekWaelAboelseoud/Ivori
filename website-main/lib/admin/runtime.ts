import { ADMIN_API_PATH, ADMIN_PATH } from '@/lib/admin/paths'
import { isSupabaseConfigured } from '@/lib/env'
import { normalizeSupabaseUrl } from '@/lib/supabase-url'
import { getDb } from '@/lib/supabase-server'

export type EnvCheck = {
  name: string
  ok: boolean
  detail: string
}

export function auditEnv(): EnvCheck[] {
  const url = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL || '')
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()
  const adminPw = (process.env.ADMIN_PASSWORD || '').trim()
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || '').trim()

  const checks: EnvCheck[] = [
    {
      name: 'NEXT_PUBLIC_SUPABASE_URL',
      ok: Boolean(url && url.includes('.supabase.co')),
      detail: url ? (url.includes('/rest/v1') ? 'invalid: includes /rest/v1' : url) : 'missing',
    },
    {
      name: 'SUPABASE_SERVICE_ROLE_KEY',
      ok: serviceKey.length > 20,
      detail: serviceKey ? `set (${serviceKey.length} chars)` : 'missing — inquiries/queue will not load',
    },
    {
      name: 'ADMIN_PASSWORD',
      ok: adminPw.length >= 8,
      detail: adminPw ? 'set' : 'missing — using insecure dev default in code',
    },
    {
      name: 'NEXT_PUBLIC_SITE_URL',
      ok: Boolean(siteUrl),
      detail: siteUrl || 'optional but recommended',
    },
    {
      name: 'ADMIN_PATH',
      ok: ADMIN_PATH === '/studio-ops' || Boolean(process.env.ADMIN_PATH),
      detail: `${ADMIN_PATH} (matcher must match)`,
    },
    {
      name: 'ADMIN_API_PATH',
      ok: ADMIN_API_PATH === '/api/studio-ops' || Boolean(process.env.ADMIN_API_PATH),
      detail: ADMIN_API_PATH,
    },
  ]

  return checks
}

export async function probeSupabase(): Promise<{
  ok: boolean
  error?: string
  inquiryCount?: number
  orderCount?: number
  schemaHint?: string
}> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: 'Supabase env not configured' }
  }

  const supabase = getDb()
  if (!supabase) {
    return { ok: false, error: 'getDb() returned null' }
  }

  const { count, error } = await supabase
    .from('studio_inquiries')
    .select('id', { count: 'exact', head: true })

  if (error) {
    const hint = /column/i.test(error.message)
      ? 'Run supabase/schema.sql (schema incomplete)'
      : undefined
    return { ok: false, error: error.message, schemaHint: hint }
  }

  const orders = await supabase.from('orders').select('id', { count: 'exact', head: true })

  return {
    ok: true,
    inquiryCount: count ?? 0,
    orderCount: orders.count ?? 0,
    error: orders.error?.message,
  }
}

export function logStudioOps(context: string, message: string, extra?: Record<string, unknown>) {
  console.error(`[studio-ops:${context}]`, message, extra ?? '')
}
