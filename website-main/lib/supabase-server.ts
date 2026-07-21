import { createClient } from '@supabase/supabase-js'
import { env, isSupabaseConfigured } from '@/lib/env'

export function getDb() {
  if (!isSupabaseConfigured()) return null

  return createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    db: { schema: 'public' },
  })
}

export function db() {
  const client = getDb()
  if (!client) {
    throw new Error('Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.')
  }
  return client
}
