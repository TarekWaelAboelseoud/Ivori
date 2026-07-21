/**
 * Signed sessions for per-admin-user login and customer accounts.
 *
 * Deliberately separate from lib/admin/session.ts, which continues to handle
 * the legacy shared-password admin login unchanged (signed with the shared
 * password itself, as before). These newer login paths sign with a fixed
 * SESSION_SECRET instead, since there's no single shared password to key off
 * of — each admin user and each customer has their own password.
 *
 * Must work in both the Edge proxy (proxy.ts) and Node route handlers, so
 * this uses Web Crypto (available in both) rather than Node's `crypto` module.
 */

const encoder = new TextEncoder()

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function randomHex(bytes = 16): string {
  const value = new Uint8Array(bytes)
  crypto.getRandomValues(value)
  return toHex(value)
}

async function sign(message: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message))
  return toHex(new Uint8Array(signature))
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false
  let mismatch = 0
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return mismatch === 0
}

function toBase64Url(text: string): string {
  const bytes = encoder.encode(text)
  let binary = ''
  bytes.forEach((b) => (binary += String.fromCharCode(b)))
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(value: string): string {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
  return new TextDecoder().decode(bytes)
}

/**
 * Subjects identify who a session belongs to, e.g. `admin:<uuid>:<role>` or
 * `customer:<uuid>`. Kept as an opaque string so callers decide the shape.
 * Token format: v1.<issuedAt>.<nonce>.<base64url(subject)>.<mac>
 */
export async function issueSignedSession(
  subject: string,
  secret: string
): Promise<string> {
  const issuedAt = Date.now().toString()
  const nonce = randomHex()
  const encodedSubject = toBase64Url(subject)
  const message = `${issuedAt}.${nonce}.${encodedSubject}`
  const mac = await sign(message, secret)
  return `v1.${message}.${mac}`
}

export async function verifySignedSession(
  cookieValue: string | undefined,
  secret: string,
  maxAgeSeconds: number
): Promise<{ subject: string } | null> {
  if (!cookieValue || !secret) return null

  const parts = cookieValue.split('.')
  if (parts.length !== 5 || parts[0] !== 'v1') return null

  const [, issuedAt, nonce, encodedSubject, mac] = parts
  if (!/^\d+$/.test(issuedAt) || !/^[a-f0-9]{32}$/.test(nonce) || !/^[a-f0-9]{64}$/.test(mac)) {
    return null
  }

  const ageMs = Date.now() - Number(issuedAt)
  if (!Number.isFinite(ageMs) || ageMs < 0 || ageMs > maxAgeSeconds * 1000) {
    return null
  }

  const message = `${issuedAt}.${nonce}.${encodedSubject}`
  const expected = await sign(message, secret)
  if (!safeEqual(mac, expected)) return null

  try {
    const subject = fromBase64Url(encodedSubject)
    return { subject }
  } catch {
    return null
  }
}
