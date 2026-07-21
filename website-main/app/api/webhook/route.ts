import { NextRequest } from 'next/server'
import { verifyWebhookSignature } from '@/lib/lemonsqueezy'
import { db } from '@/lib/supabase-server'
import { getResend, FROM } from '@/lib/resend'
import { intakeInviteEmail } from '@/emails/templates'
import { appUrlFromRequest, isResendConfigured } from '@/lib/env'

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get('x-signature') ?? ''

  if (!verifyWebhookSignature(rawBody, signature)) {
    return Response.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let payload: Record<string, unknown>
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const event = (payload?.meta as Record<string, unknown>)?.event_name as string

  if (event === 'order_created') {
    await handleOrderCreated(payload, req.nextUrl.origin)
  }

  return Response.json({ received: true })
}

async function handleOrderCreated(payload: Record<string, unknown>, origin: string) {
  let supabase
  try {
    supabase = db()
  } catch {
    console.error('[webhook] Supabase is not configured')
    return
  }

  const meta = payload.meta as Record<string, unknown>
  const data = payload.data as Record<string, unknown>
  const attrs = data?.attributes as Record<string, unknown>
  const custom = (meta?.custom_data ?? {}) as Record<string, string>

  const email = attrs?.user_email as string
  const total = attrs?.total as number
  const currency = (attrs?.currency as string)?.toLowerCase() ?? 'usd'
  const lsOrderId = String(data?.id ?? '')
  const tier = custom?.tier ?? 'starter'
  const region = custom?.region ?? 'international'
  const intakeToken = crypto.randomUUID()

  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .insert({
      payment_id: lsOrderId,
      email,
      amount_cents: total,
      currency,
      region,
      tier,
      status: 'paid',
      intake_token: intakeToken,
    })
    .select('id')
    .single()

  if (orderErr) {
    console.error('[webhook] order insert failed', orderErr)
    return
  }

  const { error: auditErr } = await supabase
    .from('audits')
    .insert({ order_id: order.id })

  if (auditErr) {
    console.error('[webhook] audit insert failed', auditErr)
  }

  if (isResendConfigured()) {
    const intakeUrl = `${appUrlFromRequest(origin)}/order?token=${intakeToken}`

    await getResend().emails.send({
      from: FROM,
      to: email,
      subject: 'Your Ivori Digitals audit - complete your intake form',
      html: intakeInviteEmail({ intakeUrl, tier }),
    })
  }
}
