import { rateLimit, clientIp } from '@/lib/security/rate-limit'
import { adminJson } from '@/lib/security/admin-response'
import { getCurrentCustomerId } from '@/lib/auth/current-customer'
import { findCustomerById } from '@/lib/auth/customers'
import { createVerificationToken } from '@/lib/auth/verification-tokens'
import { sendVerificationEmail } from '@/lib/auth/send-auth-email'
import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function POST(req: NextRequest) {
  const ip = clientIp(req)
  const limited = await rateLimit(`resend-verification:${ip}`, 4, 60_000)
  if (!limited.ok) {
    return adminJson(
      { error: 'Too many attempts. Wait a minute and try again.' },
      { status: 429, headers: limited.retryAfter ? { 'Retry-After': String(limited.retryAfter) } : {} }
    )
  }

  const customerId = await getCurrentCustomerId()
  if (!customerId) return adminJson({ error: 'Not signed in.' }, { status: 401 })

  const customer = await findCustomerById(customerId)
  if (!customer) return adminJson({ error: 'Account not found.' }, { status: 404 })
  if (customer.email_verified_at) return adminJson({ success: true, alreadyVerified: true })

  const token = await createVerificationToken('customer', customer.id, 'email_verification')
  if (token) await sendVerificationEmail(customer.email, token)

  return adminJson({ success: true })
}
