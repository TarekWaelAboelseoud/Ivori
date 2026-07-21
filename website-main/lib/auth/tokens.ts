import crypto from 'node:crypto'

/**
 * Opaque, single-use tokens for password reset and email verification links.
 * The raw token is only ever emailed to the user — the database stores just
 * a SHA-256 hash of it (see verification_tokens.token_hash), same principle
 * as password storage: a leaked database shouldn't hand out usable tokens.
 */

export function generateRawToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function hashToken(rawToken: string): string {
  return crypto.createHash('sha256').update(rawToken).digest('hex')
}
