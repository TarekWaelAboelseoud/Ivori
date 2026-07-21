import crypto from 'node:crypto'
import { hashPassword, verifyPassword } from '@/lib/auth/password'

const BACKUP_CODE_COUNT = 8

function formatCode(raw: Buffer): string {
  const hex = raw.toString('hex').slice(0, 10).toUpperCase()
  return `${hex.slice(0, 5)}-${hex.slice(5, 10)}`
}

/** Returns the raw codes to show the user once, plus their bcrypt hashes to store. */
export async function generateBackupCodes(): Promise<{ raw: string[]; hashes: string[] }> {
  const raw = Array.from({ length: BACKUP_CODE_COUNT }, () => formatCode(crypto.randomBytes(8)))
  const hashes = await Promise.all(raw.map((code) => hashPassword(code)))
  return { raw, hashes }
}

/**
 * Checks a submitted code against the stored hashes and, if it matches,
 * returns the remaining hash list with that one removed (single-use).
 * Returns null if no match was found.
 */
export async function consumeBackupCode(submitted: string, hashes: string[]): Promise<string[] | null> {
  const normalized = submitted.trim().toUpperCase()
  for (let i = 0; i < hashes.length; i += 1) {
    if (await verifyPassword(normalized, hashes[i])) {
      return [...hashes.slice(0, i), ...hashes.slice(i + 1)]
    }
  }
  return null
}
