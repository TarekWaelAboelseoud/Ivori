/**
 * Supabase JS expects the project URL only, e.g. https://abcdefgh.supabase.co
 * NOT the REST path (…/rest/v1) — that causes "Invalid path specified in request URL".
 */
export function normalizeSupabaseUrl(raw: string): string {
  const trimmed = raw.trim().replace(/^['"]|['"]$/g, '')
  if (!trimmed) return ''

  try {
    const parsed = new URL(trimmed)
    if (parsed.hostname.endsWith('.supabase.co')) {
      return parsed.origin
    }
    const path = parsed.pathname.replace(/\/rest\/v1\/?$/i, '')
    return `${parsed.origin}${path}`.replace(/\/+$/, '')
  } catch {
    return trimmed
      .replace(/\/rest\/v1\/?.*$/i, '')
      .replace(/\/+$/, '')
  }
}
