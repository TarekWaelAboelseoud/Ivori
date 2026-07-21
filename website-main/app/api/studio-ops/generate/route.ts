import { NextRequest } from 'next/server'
import { db } from '@/lib/supabase-server'
import { generateAuditReport } from '@/lib/claude'
import { adminJson } from '@/lib/security/admin-response'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function POST(req: NextRequest) {
  const { orderId } = await req.json()

  if (!orderId) return adminJson({ error: 'Missing orderId' }, { status: 400 })

  let supabase
  try {
    supabase = db()
  } catch {
    return adminJson({ error: 'Supabase is not configured. Add Supabase env vars before generating reports.' }, { status: 503 })
  }

  // Load audit + intake data
  const { data: order, error } = await supabase
    .from('orders')
    .select('id, status, tier, region, audits(id, intake_data, store_url)')
    .eq('id', orderId)
    .single()

  if (error || !order) {
    return adminJson({ error: 'Order not found' }, { status: 404 })
  }

  const audit = Array.isArray(order.audits) ? order.audits[0] : order.audits
  if (!audit) {
    return adminJson({ error: 'Audit record not found' }, { status: 404 })
  }

  const intakeData = {
    ...(audit.intake_data as Record<string, unknown>),
    store_url: audit.store_url,
    tier: order.tier,
    region: order.region,
  }

  // Generate report
  let report: Record<string, unknown>
  try {
    report = await generateAuditReport(intakeData)
  } catch (err) {
    console.error('[generate] Claude error', err)
    return adminJson({ error: err instanceof Error ? err.message : 'AI generation failed' }, { status: 500 })
  }

  // Save to DB
  const { error: updateErr } = await supabase
    .from('audits')
    .update({ ai_report: report })
    .eq('id', audit.id)

  if (updateErr) {
    console.error('[generate] Supabase update error', updateErr)
    return adminJson({ error: 'Failed to save report' }, { status: 500 })
  }

  // Update order status
  await supabase
    .from('orders')
    .update({ status: 'report_ready' })
    .eq('id', orderId)

  return adminJson({ success: true })
}
