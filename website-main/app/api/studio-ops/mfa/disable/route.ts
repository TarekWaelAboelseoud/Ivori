import { NextRequest } from 'next/server'
import { adminJson } from '@/lib/security/admin-response'
import { rateLimit, clientIp } from '@/lib/security/rate-limit'
import { getCurrentAdminUserSession } from '@/lib/auth/current-admin-user'
import { findAdminUserById, verifyAdminUserPassword, disableTotp } from '@/lib/auth/admin-users'
import { logOpsActivity } from '@/lib/ops/data'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function POST(req: NextRequest) {
  const ip = clientIp(req)
  const limited = await rateLimit(`mfa-disable:${ip}`, 8, 60_000)
  if (!limited.ok) return adminJson({ error: 'Too many attempts. Wait a minute and try again.' }, { status: 429 })

  const session = await getCurrentAdminUserSession()
  if (!session) return adminJson({ error: 'Not signed in.' }, { status: 401 })

  const adminUser = await findAdminUserById(session.id)
  if (!adminUser) return adminJson({ error: 'Account not found.' }, { status: 404 })
  if (!adminUser.totp_enabled) return adminJson({ error: 'MFA is not enabled.' }, { status: 400 })

  let body: { password?: string }
  try {
    body = await req.json()
  } catch {
    return adminJson({ error: 'Invalid request' }, { status: 400 })
  }

  const password = typeof body.password === 'string' ? body.password : ''
  if (!(await verifyAdminUserPassword(adminUser, password))) {
    return adminJson({ error: 'Incorrect password.' }, { status: 401 })
  }

  await disableTotp(adminUser.id)
  await logOpsActivity({
    actor_email: adminUser.email,
    action: 'mfa_disabled',
    entity_type: 'admin_user',
    entity_id: adminUser.id,
  })

  return adminJson({ success: true })
}
