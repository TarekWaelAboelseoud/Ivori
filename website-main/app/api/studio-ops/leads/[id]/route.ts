import { NextRequest } from 'next/server'
import { db } from '@/lib/supabase-server'
import { adminJson } from '@/lib/security/admin-response'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function PATCH(req: NextRequest, ctx: RouteContext<'/api/studio-ops/leads/[id]'>) {
  const { id } = await ctx.params
  const updates = await req.json()

  // Whitelist updatable fields
  const allowed = [
    'brand_name', 'store_url', 'country', 'niche', 'contact_email',
    'contact_name', 'contact_instagram', 'ad_activity', 'notes', 'source',
    'status', 'contacted_at', 'last_followup_at', 'implementation_opportunity',
  ]
  const safe = Object.fromEntries(
    Object.entries(updates).filter(([k]) => allowed.includes(k))
  )

  if (safe.status === 'contacted' && !safe.contacted_at) {
    safe.contacted_at = new Date().toISOString()
  }

  const { error } = await db().from('leads').update(safe).eq('id', id)
  if (error) return adminJson({ error: error.message }, { status: 500 })
  return adminJson({ success: true })
}
