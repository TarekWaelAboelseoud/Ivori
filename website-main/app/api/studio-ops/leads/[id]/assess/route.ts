import { NextRequest } from 'next/server'
import { db } from '@/lib/supabase-server'
import { assessLead } from '@/lib/claude-lead'
import { adminJson } from '@/lib/security/admin-response'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function POST(req: NextRequest, ctx: RouteContext<'/api/studio-ops/leads/[id]/assess'>) {
  const { id } = await ctx.params

  const supabase = db()
  const { data: lead, error } = await supabase
    .from('leads')
    .select('store_url, niche, country, ad_activity, notes')
    .eq('id', id)
    .single()

  if (error || !lead) return adminJson({ error: 'Lead not found' }, { status: 404 })

  let assessment: Record<string, unknown>
  try {
    assessment = await assessLead({
      store_url:   lead.store_url,
      niche:       lead.niche ?? undefined,
      country:     lead.country ?? undefined,
      ad_activity: lead.ad_activity ?? undefined,
      notes:       lead.notes ?? undefined,
    })
  } catch (err) {
    console.error('[assess] Claude error', err)
    return adminJson({ error: 'Assessment failed' }, { status: 500 })
  }

  await supabase.from('leads').update({
    ai_assessment:              assessment,
    cro_opportunity_score:      assessment.cro_opportunity_score as number,
    implementation_opportunity: assessment.implementation_opportunity as string,
    ad_activity:                assessment.ad_activity_signal as string,
    lead_score:                 assessment.cro_opportunity_score as number,
    status:                     'researched',
  }).eq('id', id)

  return adminJson({ success: true, assessment })
}
