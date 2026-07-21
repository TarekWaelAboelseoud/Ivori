import { NextRequest } from 'next/server'
import { createCheckout, getVariantId } from '@/lib/lemonsqueezy'
import { appUrlFromRequest, env, isLemonSqueezyConfigured } from '@/lib/env'

function localPaymentResponse(reason: string) {
  return Response.json({
    fallback: 'local_payment',
    reason,
    localPaymentUrl: '/local-payment',
    contactEmail: env.contactEmail,
    whatsappNumber: env.whatsappNumber,
  })
}

export async function POST(req: NextRequest) {
  const { tier, region } = await req.json()

  if (!tier || !region) {
    return Response.json({ error: 'Missing tier or region' }, { status: 400 })
  }

  if (!isLemonSqueezyConfigured()) {
    return localPaymentResponse('Online checkout is not configured yet.')
  }

  const variantId = getVariantId(tier, region)
  if (!variantId) {
    return localPaymentResponse('This plan is not connected to online checkout yet.')
  }

  const redirectUrl = `${appUrlFromRequest(req.nextUrl.origin)}/success`
  const checkout = await createCheckout(variantId, { tier, region, redirectUrl })

  if (!checkout) {
    return localPaymentResponse('Online checkout could not be created right now.')
  }

  return Response.json({ url: checkout.url })
}
