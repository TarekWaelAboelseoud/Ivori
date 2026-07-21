import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_API_PATH, ADMIN_PATH, adminPath } from '@/lib/admin/paths'
import { ADMIN_COOKIE, adminSessionValid } from '@/lib/admin/session'
import { env } from '@/lib/env'
import { securityHeaders } from '@/lib/security/headers'
import { ADMIN_PRIVATE_CACHE, applyAdminNoStoreHeaders } from '@/lib/security/admin-response'
import { verifySignedSession } from '@/lib/auth/session'
import { ADMIN_USER_COOKIE, ADMIN_USER_SESSION_MAX_AGE_SECONDS, CUSTOMER_COOKIE, CUSTOMER_SESSION_MAX_AGE_SECONDS } from '@/lib/auth/cookies'

const PORTAL_PATH = '/portal'

function applySecurityHeaders(res: NextResponse, pathname: string) {
  securityHeaders.forEach(({ key, value }) => res.headers.set(key, value))
  if (pathname.startsWith(ADMIN_PATH) || pathname.startsWith(ADMIN_API_PATH) || pathname.startsWith(PORTAL_PATH)) {
    applyAdminNoStoreHeaders(res.headers)
  }
  return res
}

async function isAdminAuthed(req: NextRequest): Promise<boolean> {
  const sharedCookie = req.cookies.get(ADMIN_COOKIE)?.value
  if (await adminSessionValid(sharedCookie, env.adminPassword)) return true

  const perUserCookie = req.cookies.get(ADMIN_USER_COOKIE)?.value
  const perUserSession = await verifySignedSession(perUserCookie, env.sessionSecret, ADMIN_USER_SESSION_MAX_AGE_SECONDS)
  return perUserSession !== null
}

async function isCustomerAuthed(req: NextRequest): Promise<boolean> {
  const cookie = req.cookies.get(CUSTOMER_COOKIE)?.value
  const session = await verifySignedSession(cookie, env.sessionSecret, CUSTOMER_SESSION_MAX_AGE_SECONDS)
  return session !== null
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (pathname.startsWith(PORTAL_PATH)) {
    const authed = await isCustomerAuthed(req)
    if (!authed) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('next', pathname)
      const res = NextResponse.redirect(loginUrl)
      res.headers.set('Cache-Control', ADMIN_PRIVATE_CACHE)
      res.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive')
      return res
    }
    return applySecurityHeaders(NextResponse.next(), pathname)
  }

  const loginPath = adminPath('/login')
  const authPath = `${ADMIN_API_PATH}/auth`
  const authed = await isAdminAuthed(req)

  if (pathname === loginPath) {
    if (authed) {
      return NextResponse.redirect(new URL(ADMIN_PATH, req.url))
    }
    return applySecurityHeaders(NextResponse.next(), pathname)
  }

  if (pathname === authPath) {
    return applySecurityHeaders(NextResponse.next(), pathname)
  }

  if (!authed) {
    if (pathname.startsWith(ADMIN_API_PATH)) {
      const res = NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      securityHeaders.forEach(({ key, value }) => res.headers.set(key, value))
      applyAdminNoStoreHeaders(res.headers)
      return res
    }
    const loginUrl = new URL(loginPath, req.url)
    loginUrl.searchParams.set('next', pathname)
    const res = NextResponse.redirect(loginUrl)
    res.headers.set('Cache-Control', ADMIN_PRIVATE_CACHE)
    res.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive')
    return res
  }

  return applySecurityHeaders(NextResponse.next(), pathname)
}

/**
 * Static matcher (Next.js requires compile-time literals).
 * If you change ADMIN_PATH env, update these paths to match.
 */
export const config = {
  matcher: [
    '/studio-ops', '/studio-ops/:path*', '/api/studio-ops', '/api/studio-ops/:path*',
    '/portal', '/portal/:path*',
  ],
}
