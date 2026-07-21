/** Shared admin session signing - must work in Edge proxy and Node route handlers. */

export const ADMIN_COOKIE = 'cro_admin'
export const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 8

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

export async function issueAdminSession(password: string): Promise<string> {
  const issuedAt = Date.now().toString()
  const nonce = randomHex()
  const message = `${issuedAt}.${nonce}`
  const mac = await sign(message, password)
  return `v1.${message}.${mac}`
}

export async function adminSessionValid(
  cookieValue: string | undefined,
  password: string
): Promise<boolean> {
  if (!cookieValue || !password) return false

  const parts = cookieValue.split('.')
  if (parts.length !== 4 || parts[0] !== 'v1') return false

  const [, issuedAt, nonce, mac] = parts
  if (!/^\d+$/.test(issuedAt) || !/^[a-f0-9]{32}$/.test(nonce) || !/^[a-f0-9]{64}$/.test(mac)) {
    return false
  }

  const ageMs = Date.now() - Number(issuedAt)
  if (!Number.isFinite(ageMs) || ageMs < 0 || ageMs > ADMIN_SESSION_MAX_AGE_SECONDS * 1000) {
    return false
  }

  const expected = await sign(`${issuedAt}.${nonce}`, password)
  return safeEqual(mac, expected)
}
