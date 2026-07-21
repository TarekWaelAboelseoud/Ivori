import { NextRequest } from 'next/server'
import { rateLimit, clientIp } from '@/lib/security/rate-limit'
import { adminJson } from '@/lib/security/admin-response'
import { cleanEmail } from '@/lib/ops/validation'
import { findAdminUserByEmail } from '@/lib/auth/admin-users'
import { findCustomerByEmail } from '@/lib/auth/customers'
import { createVerificationToken } from '@/lib/auth/verification-tokens'
import { sendPasswordResetEmail } from '@/lib/auth/send-auth-email'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

// Always the same generic response, regardless of whether the email exists —
// this is deliberate: telling an attacker "no account with that email" is a
// user-enumeration leak. Real requests get an email; everyone gets this message.
const GENERIC_MESSAGE = "If an account exists for that email, we've sent a reset link."

export async function POST(req: NextRequest) {
  const ip = clientIp(req)
  const limited = await rateLimit(`forgot-password:${ip}`, 6, 60_000)
  if (!limited.ok) {
    return adminJson(
      { error: 'Too many attempts. Wait a minute and try again.' },
      { status: 429, headers: limited.retryAfter ? { 'Retry-After': String(limited.retryAfter) } : {} }
    )
  }

  let body: { email?: string }
  try {
    body = await req.json()
  } catch {
    return adminJson({ error: 'Invalid request' }, { status: 400 })
  }

  const email = cleanEmail(body.email)
  if (!email) return adminJson({ message: GENERIC_MESSAGE })

  const adminUser = await findAdminUserByEmail(email)
  if (adminUser && adminUser.status === 'active') {
    const token = await createVerificationToken('admin', adminUser.id, 'password_reset')
    if (token) await sendPasswordResetEmail(adminUser.email, token)
    return adminJson({ message: GENERIC_MESSAGE })
  }

  const customer = await findCustomerByEmail(email)
  if (customer && customer.status === 'active') {
    const token = await createVerificationToken('customer', customer.id, 'password_reset')
    if (token) await sendPasswordResetEmail(customer.email, token)
  }

  return adminJson({ message: GENERIC_MESSAGE })
}
