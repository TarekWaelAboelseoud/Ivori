import { cookies } from 'next/headers'
import { env } from '@/lib/env'
import { verifySignedSession } from '@/lib/auth/session'
import { ADMIN_USER_COOKIE, ADMIN_USER_SESSION_MAX_AGE_SECONDS, parseAdminSubject } from '@/lib/auth/cookies'

/** Server-side only (reads next/headers cookies) — use in Server Components and Route Handlers. */
export async function getCurrentAdminUserSession(): Promise<{ id: string; role: string } | null> {
  const jar = await cookies()
  const cookie = jar.get(ADMIN_USER_COOKIE)?.value
  const session = await verifySignedSession(cookie, env.sessionSecret, ADMIN_USER_SESSION_MAX_AGE_SECONDS)
  if (!session) return null
  return parseAdminSubject(session.subject)
}
