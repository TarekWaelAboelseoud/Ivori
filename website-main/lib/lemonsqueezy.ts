import crypto from 'crypto'
import { env, isLemonSqueezyConfigured } from '@/lib/env'

const LS_API = 'https://api.lemonsqueezy.com/v1'

function headers() {
  return {
    Accept: 'application/vnd.api+json',
    'Content-Type': 'application/vnd.api+json',
    Authorization: `Bearer ${env.lemonSqueezyApiKey}`,
  }
}

export function getVariantId(tier: string, region: string): string | null {
  const legacyTier = {
    quick: 'starter',
    audit: 'full',
  }[tier] ?? tier
  const key = `${legacyTier}_${region}`.toUpperCase().replace('-', '_')
  return env.lemonSqueezyVariants[key as keyof typeof env.lemonSqueezyVariants] || null
}

export async function createCheckout(
  variantId: string,
  opts: { tier: string; region: string; redirectUrl: string }
): Promise<{ url: string } | null> {
  if (!isLemonSqueezyConfigured()) return null

  const body = {
    data: {
      type: 'checkouts',
      attributes: {
        checkout_options: { embed: false },
        checkout_data: {
          custom: { tier: opts.tier, region: opts.region },
        },
        product_options: {
          redirect_url: opts.redirectUrl,
          receipt_link_url: opts.redirectUrl,
        },
      },
      relationships: {
        store: {
          data: { type: 'stores', id: env.lemonSqueezyStoreId },
        },
        variant: {
          data: { type: 'variants', id: variantId },
        },
      },
    },
  }

  const res = await fetch(`${LS_API}/checkouts`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    console.error('[LS] createCheckout failed', res.status, await res.text())
    return null
  }

  const json = await res.json()
  const url: string = json?.data?.attributes?.url
  return url ? { url } : null
}

export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  if (!env.lemonSqueezyWebhookSecret || !signature) return false
  const digest = crypto.createHmac('sha256', env.lemonSqueezyWebhookSecret).update(rawBody).digest('hex')
  try {
    return crypto.timingSafeEqual(Buffer.from(digest, 'hex'), Buffer.from(signature, 'hex'))
  } catch {
    return false
  }
}
