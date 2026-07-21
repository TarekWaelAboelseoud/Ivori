import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 12

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS)
}

export async function verifyPassword(plain: string, hash: string | null | undefined): Promise<boolean> {
  if (!hash) return false
  try {
    return await bcrypt.compare(plain, hash)
  } catch {
    return false
  }
}

/** Minimum bar for new passwords — intentionally simple, not a strength meter. */
export function isPasswordAcceptable(plain: string): boolean {
  return typeof plain === 'string' && plain.length >= 8 && plain.length <= 200
}
