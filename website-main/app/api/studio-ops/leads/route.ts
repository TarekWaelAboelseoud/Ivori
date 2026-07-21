import { NextRequest } from 'next/server'
import { db } from '@/lib/supabase-server'
import { adminJson } from '@/lib/security/admin-response'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function GET() {
  const { data } = await db()
    .from('leads')
    .select('id, brand_name, store_url, country, niche, lead_score, status, ad_activity, implementation_opportunity, contacted_at, created_at')
    .order('lead_score', { ascending: false })
  return adminJson(data ?? [])
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const {
    store_url, brand_name, country, niche,
    contact_email, contact_name, contact_instagram,
    ad_activity, notes, source,
  } = body

  if (!store_url) return adminJson({ error: 'store_url required' }, { status: 400 })

  const { data, error } = await db()
    .from('leads')
    .insert({
      store_url, brand_name, country, niche,
      contact_email, contact_name, contact_instagram,
      ad_activity: ad_activity ?? 'unknown',
      notes, source: source ?? 'manual',
    })
    .select('id')
    .single()

  if (error) return adminJson({ error: error.message }, { status: 500 })
  return adminJson({ id: data.id })
}
