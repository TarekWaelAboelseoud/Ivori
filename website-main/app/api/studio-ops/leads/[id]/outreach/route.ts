import { NextRequest } from 'next/server'
import { db } from '@/lib/supabase-server'
import { generateOutreach } from '@/lib/claude-lead'
import { adminJson } from '@/lib/security/admin-response'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function POST(req: NextRequest, ctx: RouteContext<'/api/studio-ops/leads/[id]/outreach'>) {
  const { id } = await ctx.params

  const supabase = db()
  const { data: lead, error } = await supabase
    .from('leads')
    .select('brand_name, store_url, niche, country, contact_name, cro_opportunity_score, implementation_opportunity, ai_assessment')
    .eq('id', id)
    .single()

  if (error || !lead) return adminJson({ error: 'Lead not found' }, { status: 404 })

  const assessment = (lead.ai_assessment ?? {}) as Record<string, unknown>
  const topProblems = (assessment.top_problems as string[]) ?? []
  const outreachHook = (assessment.outreach_hook as string) ?? ''

  if (!topProblems.length || !outreachHook) {
    return adminJson({ error: 'Run assessment first to generate outreach context' }, { status: 400 })
  }

  let outreach: Record<string, unknown>
  try {
    outreach = await generateOutreach({
      brand_name:                 lead.brand_name ?? undefined,
      store_url:                  lead.store_url,
      niche:                      lead.niche ?? undefined,
      country:                    lead.country ?? undefined,
      contact_name:               lead.contact_name ?? undefined,
      top_problems:               topProblems,
      outreach_hook:              outreachHook,
      cro_opportunity_score:      lead.cro_opportunity_score ?? 50,
      implementation_opportunity: lead.implementation_opportunity ?? 'medium',
    })
  } catch (err) {
    console.error('[outreach] Claude error', err)
    return adminJson({ error: 'Outreach generation failed' }, { status: 500 })
  }

  await supabase.from('leads').update({ outreach_copy: outreach }).eq('id', id)

  return adminJson({ success: true, outreach })
}
