import { NextRequest } from 'next/server'
import { db } from '@/lib/supabase-server'
import { getResend, FROM } from '@/lib/resend'
import { deliveryEmail } from '@/emails/templates'
import { env, isResendConfigured } from '@/lib/env'
import { adminJson } from '@/lib/security/admin-response'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function POST(req: NextRequest) {
  const { orderId } = await req.json()

  if (!orderId) return adminJson({ error: 'Missing orderId' }, { status: 400 })

  if (!isResendConfigured()) {
    return adminJson({ error: 'Resend is not configured. Add RESEND_API_KEY before sending delivery emails.' }, { status: 503 })
  }

  let supabase
  try {
    supabase = db()
  } catch {
    return adminJson({ error: 'Supabase is not configured. Add Supabase env vars before delivering reports.' }, { status: 503 })
  }

  const { data: order } = await supabase
    .from('orders')
    .select('id, email, status, tier, audits(id, ai_report, store_url, pdf_url)')
    .eq('id', orderId)
    .single()

  if (!order) return adminJson({ error: 'Order not found' }, { status: 404 })

  const audit = Array.isArray(order.audits) ? order.audits[0] : order.audits

  if (!audit?.pdf_url) {
    return adminJson({ error: 'No PDF generated yet' }, { status: 400 })
  }

  const report = audit.ai_report as Record<string, unknown>
  const upsellBridge = (report?.upsell_bridge as string) ?? ''
  const storeUrl = audit.store_url ?? order.email

  await getResend().emails.send({
    from: FROM,
    to: order.email,
    subject: `Your Ivori Digitals audit is ready - ${storeUrl}`,
    html: deliveryEmail({
      storeUrl,
      pdfUrl: audit.pdf_url,
      upsellBridge,
      calendlyUrl: env.calendlyUrl || undefined,
    }),
  })

  await supabase
    .from('orders')
    .update({ status: 'delivered' })
    .eq('id', orderId)

  await supabase
    .from('audits')
    .update({ delivered_at: new Date().toISOString(), upsell_sent: true })
    .eq('id', audit.id)

  return adminJson({ success: true })
}
