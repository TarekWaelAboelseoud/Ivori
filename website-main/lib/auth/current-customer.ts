import { cookies } from 'next/headers'
import { env } from '@/lib/env'
import { verifySignedSession } from '@/lib/auth/session'
import { CUSTOMER_COOKIE, CUSTOMER_SESSION_MAX_AGE_SECONDS, parseCustomerSubject } from '@/lib/auth/cookies'

/** Server-side only (reads next/headers cookies) — use in Server Components and Route Handlers. */
export async function getCurrentCustomerId(): Promise<string | null> {
  const jar = await cookies()
  const cookie = jar.get(CUSTOMER_COOKIE)?.value
  const session = await verifySignedSession(cookie, env.sessionSecret, CUSTOMER_SESSION_MAX_AGE_SECONDS)
  if (!session) return null
  return parseCustomerSubject(session.subject)?.id ?? null
}
