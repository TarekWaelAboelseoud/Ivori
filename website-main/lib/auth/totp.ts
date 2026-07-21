import crypto from 'node:crypto'

/**
 * TOTP per RFC 6238 (the same algorithm Google Authenticator, Authy, 1Password,
 * etc. all implement) — HMAC-SHA1 based, 30-second time step, 6-digit codes.
 * Node-only (uses `node:crypto`), runs in Node route handlers only.
 */

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
const STEP_SECONDS = 30
const DIGITS = 6
const WINDOW = 1 // accept 1 step before/after, to allow for clock drift

export function generateTotpSecret(): string {
  // 20 raw bytes is the RFC-recommended secret length for HMAC-SHA1 TOTP.
  const bytes = crypto.randomBytes(20)
  return base32Encode(bytes)
}

function base32Encode(bytes: Buffer): string {
  let bits = ''
  bytes.forEach((byte) => {
    bits += byte.toString(2).padStart(8, '0')
  })
  let output = ''
  for (let i = 0; i + 5 <= bits.length; i += 5) {
    output += BASE32_ALPHABET[parseInt(bits.slice(i, i + 5), 2)]
  }
  const remainder = bits.length % 5
  if (remainder !== 0) {
    const last = bits.slice(bits.length - remainder).padEnd(5, '0')
    output += BASE32_ALPHABET[parseInt(last, 2)]
  }
  return output
}

function base32Decode(input: string): Buffer {
  const clean = input.toUpperCase().replace(/[^A-Z2-7]/g, '')
  let bits = ''
  for (const char of clean) {
    const index = BASE32_ALPHABET.indexOf(char)
    if (index === -1) continue
    bits += index.toString(2).padStart(5, '0')
  }
  const bytes: number[] = []
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.slice(i, i + 8), 2))
  }
  return Buffer.from(bytes)
}

function hotp(secret: Buffer, counter: number): string {
  const buffer = Buffer.alloc(8)
  buffer.writeBigUInt64BE(BigInt(counter))
  const hmac = crypto.createHmac('sha1', secret).update(buffer).digest()
  const offset = hmac[hmac.length - 1] & 0x0f
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff)
  return (binary % 10 ** DIGITS).toString().padStart(DIGITS, '0')
}

export function generateTotpCode(base32Secret: string, at: number = Date.now()): string {
  const counter = Math.floor(at / 1000 / STEP_SECONDS)
  return hotp(base32Decode(base32Secret), counter)
}

/** Accepts codes from one step before/after "now" to tolerate clock drift. */
export function verifyTotpCode(base32Secret: string, code: string, at: number = Date.now()): boolean {
  if (!/^\d{6}$/.test(code)) return false
  const counter = Math.floor(at / 1000 / STEP_SECONDS)
  for (let offset = -WINDOW; offset <= WINDOW; offset += 1) {
    const expected = hotp(base32Decode(base32Secret), counter + offset)
    if (safeEqual(expected, code)) return true
  }
  return false
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false
  let mismatch = 0
  for (let i = 0; i < a.length; i += 1) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return mismatch === 0
}

export function buildOtpAuthUrl(opts: { secret: string; email: string; issuer?: string }): string {
  const issuer = opts.issuer ?? 'Ivori Digitals'
  const label = encodeURIComponent(`${issuer}:${opts.email}`)
  const params = new URLSearchParams({
    secret: opts.secret,
    issuer,
    algorithm: 'SHA1',
    digits: String(DIGITS),
    period: String(STEP_SECONDS),
  })
  return `otpauth://totp/${label}?${params.toString()}`
}
