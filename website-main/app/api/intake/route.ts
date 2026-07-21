import { NextRequest } from 'next/server'
import { db } from '@/lib/supabase-server'
import { getResend, FROM, ADMIN_EMAIL } from '@/lib/resend'
import { intakeReceivedEmail, adminNotificationEmail } from '@/emails/templates'
import { appUrlFromRequest, isResendConfigured } from '@/lib/env'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { token, ...intakeData } = body

  if (!token) {
    return Response.json({ error: 'Missing token' }, { status: 400 })
  }

  let supabase
  try {
    supabase = db()
  } catch {
    return Response.json(
      { error: 'Intake storage is not configured yet. Please contact Ivori Digitals directly.' },
      { status: 503 }
    )
  }

  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .select('id, email, tier, region, status')
    .eq('intake_token', token)
    .single()

  if (orderErr || !order) {
    return Response.json({ error: 'Invalid or expired intake link' }, { status: 404 })
  }

  if (order.status === 'intake_received') {
    return Response.json({ error: 'Intake already submitted' }, { status: 409 })
  }

  const storeUrl = String(intakeData.store_url ?? '')

  const { error: auditErr } = await supabase
    .from('audits')
    .update({
      store_url: storeUrl,
      intake_data: intakeData,
    })
    .eq('order_id', order.id)

  if (auditErr) {
    console.error('[intake] audit update failed', auditErr)
    return Response.json({ error: 'Failed to save intake' }, { status: 500 })
  }

  await supabase
    .from('orders')
    .update({ status: 'intake_received' })
    .eq('id', order.id)

  if (isResendConfigured()) {
    await getResend().emails.send({
      from: FROM,
      to: order.email,
      subject: 'Intake received - your audit is in progress',
      html: intakeReceivedEmail({ storeUrl }),
    })

    if (ADMIN_EMAIL) {
      const adminUrl = `${appUrlFromRequest(req.nextUrl.origin)}/studio-ops/${order.id}`
      await getResend().emails.send({
        from: FROM,
        to: ADMIN_EMAIL,
        subject: `New audit intake: ${storeUrl}`,
        html: adminNotificationEmail({
          storeUrl,
          email: order.email,
          tier: order.tier,
          region: order.region,
          adminUrl,
        }),
      })
    }
  }

  return Response.json({ success: true })
}
