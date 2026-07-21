import { createHash } from 'crypto'
import { getDb } from '@/lib/supabase-server'

export type AuditEvent =
  | 'auth_failed'
  | 'auth_success'
  | 'auth_rate_limited'
  | 'inquiry_updated'
  | 'ops_item_created'
  | 'ops_item_updated'
  | 'admin_user_created'
  | 'admin_user_updated'
  | 'finance_record_created'
  | 'finance_record_updated'
  | 'receipt_created'
  | 'receipt_updated'
  | 'client_created'
  | 'client_updated'
  | 'settings_updated'
  | 'suspicious_request'

function hashIp(ip: string) {
  return createHash('sha256').update(ip).digest('hex').slice(0, 16)
}

/** Best-effort audit log — never blocks the request path */
export async function logAdminAudit(
  event: AuditEvent,
  opts?: { path?: string; ip?: string; metadata?: Record<string, unknown> }
) {
  const supabase = getDb()
  if (!supabase) {
    if (process.env.NODE_ENV === 'development') {
      console.info('[audit]', event, opts)
    }
    return
  }

  try {
    await supabase.from('admin_audit_log').insert({
      event_type: event,
      path: opts?.path ?? null,
      ip_hash: opts?.ip ? hashIp(opts.ip) : null,
      metadata: opts?.metadata ?? {},
    })
  } catch {
    /* table may not exist until v2 migration */
  }
}
