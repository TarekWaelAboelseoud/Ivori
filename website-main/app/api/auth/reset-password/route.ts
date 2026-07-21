import { NextRequest } from 'next/server'
import { rateLimit, clientIp } from '@/lib/security/rate-limit'
import { adminJson } from '@/lib/security/admin-response'
import { isPasswordAcceptable, hashPassword } from '@/lib/auth/password'
import { consumeVerificationToken } from '@/lib/auth/verification-tokens'
import { updateAdminUserPassword } from '@/lib/auth/admin-users'
import { updateCustomerPassword } from '@/lib/auth/customers'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function POST(req: NextRequest) {
  const ip = clientIp(req)
  const limited = await rateLimit(`reset-password:${ip}`, 10, 60_000)
  if (!limited.ok) {
    return adminJson(
      { error: 'Too many attempts. Wait a minute and try again.' },
      { status: 429, headers: limited.retryAfter ? { 'Retry-After': String(limited.retryAfter) } : {} }
    )
  }

  let body: { token?: string; password?: string }
  try {
    body = await req.json()
  } catch {
    return adminJson({ error: 'Invalid request' }, { status: 400 })
  }

  const token = typeof body.token === 'string' ? body.token : ''
  const password = typeof body.password === 'string' ? body.password : ''

  if (!token) return adminJson({ error: 'Missing or invalid reset link.' }, { status: 400 })
  if (!isPasswordAcceptable(password)) {
    return adminJson({ error: 'Password must be 8-200 characters.' }, { status: 400 })
  }

  const consumed = await consumeVerificationToken(token, 'password_reset')
  if (!consumed) {
    return adminJson({ error: 'This reset link is invalid or has expired. Request a new one.' }, { status: 400 })
  }

  const passwordHash = await hashPassword(password)
  if (consumed.accountType === 'admin') {
    await updateAdminUserPassword(consumed.accountId, passwordHash)
  } else {
    await updateCustomerPassword(consumed.accountId, passwordHash)
  }

  return adminJson({ success: true })
}
