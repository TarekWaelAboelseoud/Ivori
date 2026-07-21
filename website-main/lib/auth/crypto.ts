import crypto from 'node:crypto'
import { env, isMfaConfigured } from '@/lib/env'

/**
 * Encrypts TOTP secrets at rest, since (unlike passwords) they must be
 * decryptable — verifying a code means recomputing HMAC(secret, counter)
 * server-side, so a one-way hash won't work here. Node-only (uses `node:crypto`,
 * not Web Crypto), which is fine: this only ever runs in Node route handlers,
 * never in the Edge proxy.
 */

const ALGORITHM = 'aes-256-gcm'

function getKey(): Buffer {
  if (!isMfaConfigured()) {
    throw new Error('MFA_ENCRYPTION_KEY must be set to a 64-character hex string (32 bytes). Generate with: openssl rand -hex 32')
  }
  return Buffer.from(env.mfaEncryptionKey, 'hex')
}

/** Returns "iv:authTag:ciphertext", all hex-encoded. */
export function encryptSecret(plaintext: string): string {
  const key = getKey()
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`
}

export function decryptSecret(payload: string): string {
  const key = getKey()
  const [ivHex, authTagHex, dataHex] = payload.split(':')
  if (!ivHex || !authTagHex || !dataHex) throw new Error('Malformed encrypted payload')
  const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(ivHex, 'hex'))
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'))
  const decrypted = Buffer.concat([decipher.update(Buffer.from(dataHex, 'hex')), decipher.final()])
  return decrypted.toString('utf8')
}
