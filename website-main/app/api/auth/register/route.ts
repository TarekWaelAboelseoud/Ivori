import { NextRequest, NextResponse } from 'next/server'
import { env, isSessionSecretConfigured } from '@/lib/env'
import { rateLimit, clientIp } from '@/lib/security/rate-limit'
import { adminJson, applyAdminNoStoreHeaders } from '@/lib/security/admin-response'
import { cleanEmail, cleanText } from '@/lib/ops/validation'
import { issueSignedSession } from '@/lib/auth/session'
import { isPasswordAcceptable } from '@/lib/auth/password'
import { CUSTOMER_COOKIE, CUSTOMER_SESSION_MAX_AGE_SECONDS, buildCustomerSubject } from '@/lib/auth/cookies'
import { createCustomer, findCustomerByEmail } from '@/lib/auth/customers'
import { findAdminUserByEmail } from '@/lib/auth/admin-users'
import { createVerificationToken } from '@/lib/auth/verification-tokens'
import { sendVerificationEmail } from '@/lib/auth/send-auth-email'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

function isHttps(req: NextRequest) {
  return req.nextUrl.protocol === 'https:' || req.headers.get('x-forwarded-proto') === 'https'
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req)
  const limited = await rateLimit(`account-register:${ip}`, 6, 60_000)
  if (!limited.ok) {
    return adminJson(
      { error: 'Too many attempts. Wait a minute and try again.' },
      { status: 429, headers: limited.retryAfter ? { 'Retry-After': String(limited.retryAfter) } : {} }
    )
  }

  if (!isSessionSecretConfigured()) {
    return adminJson(
      { error: 'Sign-up is not configured on this server yet (missing SESSION_SECRET).' },
      { status: 503 }
    )
  }

  let body: { email?: string; password?: string; name?: string }
  try {
    body = await req.json()
  } catch {
    return adminJson({ error: 'Invalid request' }, { status: 400 })
  }

  const email = cleanEmail(body.email)
  const password = typeof body.password === 'string' ? body.password : ''
  const name = cleanText(body.name, 120)

  if (!email) return adminJson({ error: 'Enter a valid email address.' }, { status: 400 })
  if (!isPasswordAcceptable(password)) {
    return adminJson({ error: 'Password must be 8-200 characters.' }, { status: 400 })
  }

  // Don't let someone register a client account under an email that's
  // already an admin account — keeps the two identity spaces from colliding.
  const existingAdmin = await findAdminUserByEmail(email)
  if (existingAdmin) {
    return adminJson({ error: 'An account with this email already exists.' }, { status: 409 })
  }

  const existingCustomer = await findCustomerByEmail(email)
  if (existingCustomer) {
    return adminJson({ error: 'An account with this email already exists.' }, { status: 409 })
  }

  const { customer, error } = await createCustomer({ email, password, name })
  if (!customer || error) {
    return adminJson({ error: error || 'Could not create account.' }, { status: 400 })
  }

  const verifyToken = await createVerificationToken('customer', customer.id, 'email_verification')
  if (verifyToken) await sendVerificationEmail(customer.email, verifyToken)

  const subject = buildCustomerSubject(customer.id)
  const token = await issueSignedSession(subject, env.sessionSecret)

  const res = NextResponse.json({ success: true, redirect: '/portal' }, { status: 201 })
  applyAdminNoStoreHeaders(res.headers)
  res.cookies.set(CUSTOMER_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' || isHttps(req),
    sameSite: 'strict',
    maxAge: CUSTOMER_SESSION_MAX_AGE_SECONDS,
    path: '/',
  })
  return res
}
