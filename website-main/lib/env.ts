import { normalizeSupabaseUrl } from '@/lib/supabase-url'

export const env = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  adminPassword: (process.env.ADMIN_PASSWORD || (process.env.NODE_ENV === 'production' ? '' : 'ivori52')).trim(),

  // Signs per-admin-user and customer account sessions. Deliberately separate
  // from adminPassword: the legacy shared admin login still signs its own
  // session with the shared password (see lib/admin/session.ts) and is
  // unaffected by this. Dev gets a fallback so local login works without
  // setup; production must set a real secret or these newer login paths
  // refuse to issue sessions (see isSessionSecretConfigured below).
  sessionSecret: (
    process.env.SESSION_SECRET || (process.env.NODE_ENV === 'production' ? '' : 'dev-only-insecure-session-secret')
  ).trim(),

  // Encrypts TOTP (MFA) secrets at rest — must be a 64-char hex string (32
  // bytes). Unlike sessionSecret/adminPassword, there's no dev fallback:
  // TOTP secrets are sensitive enough that a hardcoded dev default would be
  // a bad habit to encourage. MFA setup simply isn't available until this
  // is set, in any environment.
  mfaEncryptionKey: (process.env.MFA_ENCRYPTION_KEY || '').trim(),

  supabaseUrl: normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL || ''),
  supabaseAnonKey: (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim(),
  supabaseServiceRoleKey: (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim(),

  lemonSqueezyApiKey: process.env.LEMONSQUEEZY_API_KEY || '',
  lemonSqueezyStoreId: process.env.LEMONSQUEEZY_STORE_ID || '',
  lemonSqueezyWebhookSecret: process.env.LEMONSQUEEZY_WEBHOOK_SECRET || '',
  lemonSqueezyVariants: {
    STARTER_INTERNATIONAL: process.env.LEMONSQUEEZY_VARIANT_STARTER_INTL || '',
    FULL_INTERNATIONAL: process.env.LEMONSQUEEZY_VARIANT_FULL_INTL || '',
    RETAINER_INTERNATIONAL: process.env.LEMONSQUEEZY_VARIANT_RETAINER_INTL || '',
    STARTER_EGYPT_MENA: process.env.LEMONSQUEEZY_VARIANT_STARTER_MENA || '',
    FULL_EGYPT_MENA: process.env.LEMONSQUEEZY_VARIANT_FULL_MENA || '',
    RETAINER_EGYPT_MENA: process.env.LEMONSQUEEZY_VARIANT_RETAINER_MENA || '',
  },

  resendApiKey: process.env.RESEND_API_KEY || '',
  resendFromEmail: process.env.RESEND_FROM_EMAIL || 'hello@ivoridigitals.com',
  resendFromName: process.env.RESEND_FROM_NAME || 'Ivori Digitals',
  adminEmail: process.env.ADMIN_EMAIL || process.env.RESEND_FROM_EMAIL || '',

  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',

  upstashRedisUrl: process.env.UPSTASH_REDIS_REST_URL || '',
  upstashRedisToken: process.env.UPSTASH_REDIS_REST_TOKEN || '',

  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'hello@ivoridigitals.com',
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '',
  instapayHandle: process.env.NEXT_PUBLIC_INSTAPAY_HANDLE || '',
  vodafoneCashNumber: process.env.NEXT_PUBLIC_VODAFONE_CASH_NUMBER || '',
  bankTransferText: process.env.NEXT_PUBLIC_BANK_TRANSFER_TEXT || '',
  calendlyUrl: process.env.NEXT_PUBLIC_CALENDLY_URL || '',
}

export function isSupabaseConfigured() {
  return Boolean(env.supabaseUrl && env.supabaseServiceRoleKey)
}

export function isLemonSqueezyConfigured() {
  return Boolean(env.lemonSqueezyApiKey && env.lemonSqueezyStoreId)
}

export function isResendConfigured() {
  return Boolean(env.resendApiKey)
}

export function isAnthropicConfigured() {
  return Boolean(env.anthropicApiKey)
}

/** True when rate limiting is backed by durable Redis rather than per-instance memory. */
export function isRateLimitDurable() {
  return Boolean(env.upstashRedisUrl && env.upstashRedisToken)
}

/** True when per-admin-user login and client account login/signup can safely issue sessions. */
export function isSessionSecretConfigured() {
  return Boolean(env.sessionSecret)
}

/** True when MFA/TOTP secrets can be safely encrypted at rest — required before enabling MFA setup. */
export function isMfaConfigured() {
  return env.mfaEncryptionKey.length === 64
}

export function appUrlFromRequest(origin?: string) {
  return process.env.NEXT_PUBLIC_APP_URL || origin || env.appUrl
}
