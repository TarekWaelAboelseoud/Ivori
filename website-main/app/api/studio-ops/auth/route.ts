import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_COOKIE, ADMIN_SESSION_MAX_AGE_SECONDS, issueAdminSession } from '@/lib/admin/session'
import { ADMIN_USER_COOKIE } from '@/lib/auth/cookies'
import { env } from '@/lib/env'
import { rateLimit, clientIp } from '@/lib/security/rate-limit'
import { logAdminAudit } from '@/lib/security/audit'
import { adminJson, applyAdminNoStoreHeaders } from '@/lib/security/admin-response'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

function isHttps(req: NextRequest) {
  return req.nextUrl.protocol === 'https:' || req.headers.get('x-forwarded-proto') === 'https'
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req)
  const limited = await rateLimit(`admin-auth:${ip}`, 8, 60_000)
  if (!limited.ok) {
    await logAdminAudit('auth_rate_limited', { path: '/api/studio-ops/auth', ip })
    return adminJson(
      { error: 'Too many attempts. Wait a minute and try again.' },
      {
        status: 429,
        headers: limited.retryAfter ? { 'Retry-After': String(limited.retryAfter) } : {},
      }
    )
  }

  let body: { password?: string }
  try {
    body = await req.json()
  } catch {
    return adminJson({ error: 'Invalid request' }, { status: 400 })
  }

  const password = typeof body.password === 'string' ? body.password : ''

  if (!password || password !== env.adminPassword) {
    await logAdminAudit('auth_failed', { path: '/api/studio-ops/auth', ip })
    return adminJson({ error: 'Invalid password' }, { status: 401 })
  }

  await logAdminAudit('auth_success', { path: '/api/studio-ops/auth', ip })

  const token = await issueAdminSession(password)

  const res = NextResponse.json({ success: true })
  applyAdminNoStoreHeaders(res.headers)
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' || isHttps(req),
    sameSite: 'strict',
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
    path: '/',
  })
  return res
}

export async function DELETE() {
  const res = NextResponse.json({ success: true })
  applyAdminNoStoreHeaders(res.headers)
  res.cookies.set(ADMIN_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  })
  res.cookies.set(ADMIN_USER_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  })
  return res
}
