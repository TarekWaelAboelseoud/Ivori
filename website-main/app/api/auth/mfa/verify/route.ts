import { NextRequest, NextResponse } from 'next/server'
import { env } from '@/lib/env'
import { rateLimit, clientIp } from '@/lib/security/rate-limit'
import { adminJson, applyAdminNoStoreHeaders } from '@/lib/security/admin-response'
import { logAdminAudit } from '@/lib/security/audit'
import { issueSignedSession, verifySignedSession } from '@/lib/auth/session'
import { decryptSecret } from '@/lib/auth/crypto'
import { verifyTotpCode } from '@/lib/auth/totp'
import { consumeBackupCode } from '@/lib/auth/backup-codes'
import { findAdminUserById, updateBackupCodes } from '@/lib/auth/admin-users'
import {
  ADMIN_USER_COOKIE,
  ADMIN_USER_SESSION_MAX_AGE_SECONDS,
  MFA_PENDING_COOKIE,
  MFA_PENDING_MAX_AGE_SECONDS,
  buildAdminSubject,
  parseMfaPendingSubject,
} from '@/lib/auth/cookies'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

function isHttps(req: NextRequest) {
  return req.nextUrl.protocol === 'https:' || req.headers.get('x-forwarded-proto') === 'https'
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req)
  const limited = await rateLimit(`mfa-verify:${ip}`, 8, 60_000)
  if (!limited.ok) {
    return adminJson(
      { error: 'Too many attempts. Wait a minute and try again.' },
      { status: 429, headers: limited.retryAfter ? { 'Retry-After': String(limited.retryAfter) } : {} }
    )
  }

  const pendingCookie = req.cookies.get(MFA_PENDING_COOKIE)?.value
  const pendingSession = await verifySignedSession(pendingCookie, env.sessionSecret, MFA_PENDING_MAX_AGE_SECONDS)
  const pending = pendingSession ? parseMfaPendingSubject(pendingSession.subject) : null

  if (!pending) {
    return adminJson({ error: 'Your login session expired. Sign in again.' }, { status: 401 })
  }

  let body: { code?: string }
  try {
    body = await req.json()
  } catch {
    return adminJson({ error: 'Invalid request' }, { status: 400 })
  }

  const code = typeof body.code === 'string' ? body.code.trim() : ''
  if (!code) return adminJson({ error: 'Enter a code.' }, { status: 400 })

  const adminUser = await findAdminUserById(pending.id)
  if (!adminUser || !adminUser.totp_enabled || !adminUser.totp_secret || adminUser.status !== 'active') {
    return adminJson({ error: 'MFA is not active on this account.' }, { status: 400 })
  }

  let ok = false

  if (/^\d{6}$/.test(code)) {
    const secret = decryptSecret(adminUser.totp_secret)
    ok = verifyTotpCode(secret, code)
  } else {
    // Treat anything else as an attempted backup code (format: XXXXX-XXXXX)
    const remaining = await consumeBackupCode(code, adminUser.backup_codes)
    if (remaining) {
      ok = true
      await updateBackupCodes(adminUser.id, remaining)
    }
  }

  if (!ok) {
    await logAdminAudit('auth_failed', { path: '/api/auth/mfa/verify', ip, metadata: { adminUserId: adminUser.id } })
    return adminJson({ error: 'Invalid code.' }, { status: 401 })
  }

  await logAdminAudit('auth_success', {
    path: '/api/auth/mfa/verify',
    ip,
    metadata: { adminUserId: adminUser.id, mfa: true },
  })

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
  res.cookies.set(MFA_PENDING_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  })
  return res
}
