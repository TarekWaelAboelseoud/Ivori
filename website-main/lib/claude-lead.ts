import Anthropic from '@anthropic-ai/sdk'
import {
  ASSESSMENT_SYSTEM_PROMPT, buildAssessmentPrompt,
} from '@/prompts/assessment'
import {
  OUTREACH_SYSTEM_PROMPT, buildOutreachPrompt,
} from '@/prompts/outreach'
import { env, isAnthropicConfigured } from '@/lib/env'

// Sonnet 4.6 for qualification work — fast, cheap, accurate enough
const LEAD_MODEL = 'claude-sonnet-4-6'

function client() {
  if (!isAnthropicConfigured()) {
    throw new Error('Anthropic is not configured. Add ANTHROPIC_API_KEY before using AI admin actions.')
  }
  return new Anthropic({ apiKey: env.anthropicApiKey })
}

function parseJSON(text: string): Record<string, unknown> {
  const clean = text.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim()
  return JSON.parse(clean)
}

// ── Fetch and extract key signals from a store URL ──────────────────────────
export async function scrapeStoreSignals(url: string): Promise<string | null> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    })
    clearTimeout(timeout)

    if (!res.ok) return null
    const html = await res.text()

    // Extract high-signal sections only (reduces tokens)
    const signals: string[] = []

    // Title + meta
    const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim()
    if (title) signals.push(`TITLE: ${title}`)

    const desc = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)?.[1]?.trim()
      ?? html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i)?.[1]?.trim()
    if (desc) signals.push(`META DESCRIPTION: ${desc}`)

    // H1
    const h1 = html.match(/<h1[^>]*>([^<]{3,120})<\/h1>/i)?.[1]?.trim()
    if (h1) signals.push(`H1: ${h1}`)

    // Price patterns
    const prices = html.match(/\$[\d,]+\.?\d*|[\d,]+\s*(?:EGP|SAR|AED|USD)/g)?.slice(0, 5)
    if (prices?.length) signals.push(`PRICES VISIBLE: ${prices.join(', ')}`)

    // App/tech signals in script tags
    const scripts = html.match(/src=["'][^"']+["']/g)?.join(' ') ?? ''
    const apps: string[] = []
    if (/klaviyo/i.test(scripts))        apps.push('Klaviyo')
    if (/yotpo/i.test(scripts))          apps.push('Yotpo reviews')
    if (/judge\.me/i.test(scripts + html)) apps.push('Judge.me reviews')
    if (/okendo/i.test(scripts))         apps.push('Okendo')
    if (/loox/i.test(scripts))           apps.push('Loox')
    if (/recart|omnisend/i.test(scripts))apps.push('Recart/Omnisend')
    if (/attentive/i.test(scripts))      apps.push('Attentive SMS')
    if (/privy/i.test(scripts))          apps.push('Privy')
    if (/shopify\.com\/s\/files/i.test(html)) apps.push('Confirmed Shopify')
    if (apps.length) signals.push(`DETECTED APPS: ${apps.join(', ')}`)

    // Review signals in body
    if (/\d+\s*reviews?/i.test(html))    signals.push('HAS REVIEW COUNTS IN HTML')
    if (/out of 5|stars?/i.test(html))   signals.push('HAS STAR RATINGS IN HTML')
    if (/free shipping/i.test(html))     signals.push('FREE SHIPPING MENTIONED')
    if (/30.day|money.back/i.test(html)) signals.push('GUARANTEE MENTIONED')
    if (/out of stock|sold out/i.test(html)) signals.push('OUT OF STOCK SIGNALS')

    // First 800 chars of visible body text
    const bodyText = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 800)
    if (bodyText) signals.push(`BODY TEXT SAMPLE: ${bodyText}`)

    return signals.join('\n')
  } catch {
    return null
  }
}

// ── Quick lead assessment ────────────────────────────────────────────────────
export async function assessLead(input: {
  store_url: string
  niche?: string
  country?: string
  ad_activity?: string
  notes?: string
}): Promise<Record<string, unknown>> {
  const html_excerpt = await scrapeStoreSignals(input.store_url)

  const msg = await client().messages.create({
    model: LEAD_MODEL,
    max_tokens: 1024,
    system: ASSESSMENT_SYSTEM_PROMPT,
    messages: [{
      role: 'user',
      content: buildAssessmentPrompt({ ...input, html_excerpt: html_excerpt ?? undefined }),
    }],
  })

  const text = msg.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as { type: 'text'; text: string }).text)
    .join('')

  return parseJSON(text)
}

// ── Outreach copy generation ─────────────────────────────────────────────────
export async function generateOutreach(input: {
  brand_name?: string
  store_url: string
  niche?: string
  country?: string
  top_problems: string[]
  outreach_hook: string
  cro_opportunity_score: number
  implementation_opportunity: string
  contact_name?: string
}): Promise<Record<string, unknown>> {
  const msg = await client().messages.create({
    model: LEAD_MODEL,
    max_tokens: 2048,
    system: OUTREACH_SYSTEM_PROMPT,
    messages: [{
      role: 'user',
      content: buildOutreachPrompt(input),
    }],
  })

  const text = msg.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as { type: 'text'; text: string }).text)
    .join('')

  return parseJSON(text)
}
