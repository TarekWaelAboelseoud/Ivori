import { NextRequest, NextResponse } from 'next/server'
import { env, isSessionSecretConfigured } from '@/lib/env'
import { rateLimit, clientIp } from '@/lib/security/rate-limit'
import { adminJson, applyAdminNoStoreHeaders } from '@/lib/security/admin-response'
import { logAdminAudit } from '@/lib/security/audit'
import { cleanEmail } from '@/lib/ops/validation'
import { issueSignedSession } from '@/lib/auth/session'
import {
  ADMIN_USER_COOKIE,
  ADMIN_USER_SESSION_MAX_AGE_SECONDS,
  CUSTOMER_COOKIE,
  CUSTOMER_SESSION_MAX_AGE_SECONDS,
  MFA_PENDING_COOKIE,
  MFA_PENDING_MAX_AGE_SECONDS,
  buildAdminSubject,
  buildCustomerSubject,
  buildMfaPendingSubject,
} from '@/lib/auth/cookies'
import { findAdminUserByEmail, touchAdminUserLogin, verifyAdminUserPassword } from '@/lib/auth/admin-users'
import { findCustomerByEmail, touchCustomerLogin, verifyCustomerPassword } from '@/lib/auth/customers'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

function isHttps(req: NextRequest) {
  return req.nextUrl.protocol === 'https:' || req.headers.get('x-forwarded-proto') === 'https'
}

const GENERIC_ERROR = 'Invalid email or password.'

export async function POST(req: NextRequest) {
  const ip = clientIp(req)
  const limited = await rateLimit(`account-login:${ip}`, 8, 60_000)
  if (!limited.ok) {
    return adminJson(
      { error: 'Too many attempts. Wait a minute and try again.' },
      { status: 429, headers: limited.retryAfter ? { 'Retry-After': String(limited.retryAfter) } : {} }
    )
  }

  if (!isSessionSecretConfigured()) {
    return adminJson(
      { error: 'Login is not configured on this server yet (missing SESSION_SECRET).' },
      { status: 503 }
    )
  }

  let body: { email?: string; password?: string }
  try {
    body = await req.json()
  } catch {
    return adminJson({ error: 'Invalid request' }, { status: 400 })
  }

  const email = cleanEmail(body.email)
  const password = typeof body.password === 'string' ? body.password : ''
  if (!email || !password) {
    return adminJson({ error: GENERIC_ERROR }, { status: 400 })
  }

  // Admin accounts take priority: if this email belongs to an admin user at
  // all, treat this as an admin login attempt and don't fall through to
  // checking customer accounts, even if the password doesn't match.
  const adminUser = await findAdminUserByEmail(email)
  if (adminUser) {
    const ok =
      adminUser.status === 'active' && (await verifyAdminUserPassword(adminUser, password))

    if (!ok) {
      await logAdminAudit('auth_failed', { path: '/api/auth/login', ip, metadata: { mode: 'admin' } })
      return adminJson({ error: GENERIC_ERROR }, { status: 401 })
    }

    await touchAdminUserLogin(adminUser.id)
    await logAdminAudit('auth_success', {
      path: '/api/auth/login',
      ip,
      metadata: { mode: 'admin', adminUserId: adminUser.id },
    })

    if (adminUser.totp_enabled) {
      const pendingSubject = buildMfaPendingSubject(adminUser.id)
      const pendingToken = await issueSignedSession(pendingSubject, env.sessionSecret)

      const res = NextResponse.json({ success: true, mfaRequired: true })
      applyAdminNoStoreHeaders(res.headers)
      res.cookies.set(MFA_PENDING_COOKIE, pendingToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production' || isHttps(req),
        sameSite: 'strict',
        maxAge: MFA_PENDING_MAX_AGE_SECONDS,
        path: '/',
      })
      return res
    }

    const subject = buildAdminSubject(adminUser.id, adminUser.role)
    const token = await issueSignedSession(subject, env.sessionSecret)

    const res = NextResponse.json({ success: true, redirect: '/studio-ops' })
    applyAdminNoStoreHeaders(res.headers)
    res.cookies.set(ADMIN_USER_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' || isHttps(req),
      sameSite: 'strict',
      maxAge: ADMIN_USER_SESSION_MAX_AGE_SECONDS,
      path: '/',
    })
    return res
  }

  const customer = await findCustomerByEmail(email)
  if (!customer || customer.status !== 'active' || !(await verifyCustomerPassword(customer, password))) {
    return adminJson({ error: GENERIC_ERROR }, { status: 401 })
  }

  await touchCustomerLogin(customer.id)

  const subject = buildCustomerSubject(customer.id)
  const token = await issueSignedSession(subject, env.sessionSecret)

  const res = NextResponse.json({ success: true, redirect: '/portal' })
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
