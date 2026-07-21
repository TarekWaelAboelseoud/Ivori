/** Security headers for production (v3) */

const supabaseOrigin = (() => {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!raw) return ''
  try {
    return new URL(raw).origin
  } catch {
    return ''
  }
})()

const connectSrc = ["'self'", supabaseOrigin].filter(Boolean).join(' ')
const analyticsConnectSrc = [
  'https://www.google-analytics.com',
  'https://analytics.google.com',
  'https://region1.google-analytics.com',
].join(' ')

export const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), interest-cohort=()',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://www.google-analytics.com https://www.googletagmanager.com",
      "font-src 'self' data:",
      `connect-src ${connectSrc} ${analyticsConnectSrc}`,
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
      'upgrade-insecure-requests',
    ].join('; '),
  },
] as const
