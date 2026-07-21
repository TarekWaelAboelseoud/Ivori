import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import LoginClient from './LoginClient'
import { env } from '@/lib/env'
import { ADMIN_COOKIE, adminSessionValid } from '@/lib/admin/session'
import { verifySignedSession } from '@/lib/auth/session'
import {
  ADMIN_USER_COOKIE,
  ADMIN_USER_SESSION_MAX_AGE_SECONDS,
  CUSTOMER_COOKIE,
  CUSTOMER_SESSION_MAX_AGE_SECONDS,
} from '@/lib/auth/cookies'

export const metadata = { robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export default async function LoginPage() {
  await connection()

  const jar = await cookies()

  const sharedCookie = jar.get(ADMIN_COOKIE)?.value
  const adminUserCookie = jar.get(ADMIN_USER_COOKIE)?.value
  const customerCookie = jar.get(CUSTOMER_COOKIE)?.value

  const isSharedAdmin = await adminSessionValid(sharedCookie, env.adminPassword)
  const isPerUserAdmin =
    (await verifySignedSession(adminUserCookie, env.sessionSecret, ADMIN_USER_SESSION_MAX_AGE_SECONDS)) !== null

  if (isSharedAdmin || isPerUserAdmin) {
    redirect('/studio-ops')
  }

  const isCustomer =
    (await verifySignedSession(customerCookie, env.sessionSecret, CUSTOMER_SESSION_MAX_AGE_SECONDS)) !== null

  if (isCustomer) {
    redirect('/portal')
  }

  return (
    <main
      className="flex min-h-screen items-center justify-center px-4"
      style={{ background: 'var(--background)', color: 'var(--foreground)' }}
    >
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.2em]" style={{ color: 'var(--text-label)' }}>
            Ivori Digitals
          </p>
          <h1 className="mt-2 text-2xl font-semibold" style={{ color: 'var(--ivory)', fontFamily: 'var(--font-display)' }}>
            Sign in
          </h1>
        </div>
        <div
          className="rounded-xl border p-6"
          style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
        >
          <LoginClient />
        </div>
      </div>
    </main>
  )
}
