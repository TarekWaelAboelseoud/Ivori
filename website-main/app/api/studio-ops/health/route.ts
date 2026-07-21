import { auditEnv, probeSupabase } from '@/lib/admin/runtime'
import { ADMIN_API_PATH, ADMIN_PATH } from '@/lib/admin/paths'
import { isSupabaseConfigured } from '@/lib/env'
import { adminJson } from '@/lib/security/admin-response'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

/** Authenticated via proxy — diagnostics for production debugging */
export async function GET() {
  const env = auditEnv()
  const supabase = await probeSupabase()

  return adminJson({
    ok: env.every((c) => c.ok || c.name === 'NEXT_PUBLIC_SITE_URL') && supabase.ok,
    paths: { admin: ADMIN_PATH, api: ADMIN_API_PATH },
    supabaseConfigured: isSupabaseConfigured(),
    env,
    supabase,
    timestamp: new Date().toISOString(),
  })
}
