import { NextRequest } from 'next/server'
import { adminJson } from '@/lib/security/admin-response'
import { getCurrentAdminUserSession } from '@/lib/auth/current-admin-user'
import { findAdminUserById, confirmTotpEnrollment } from '@/lib/auth/admin-users'
import { decryptSecret } from '@/lib/auth/crypto'
import { verifyTotpCode } from '@/lib/auth/totp'
import { generateBackupCodes } from '@/lib/auth/backup-codes'
import { logOpsActivity } from '@/lib/ops/data'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function POST(req: NextRequest) {
  const session = await getCurrentAdminUserSession()
  if (!session) return adminJson({ error: 'Not signed in.' }, { status: 401 })

  const adminUser = await findAdminUserById(session.id)
  if (!adminUser || !adminUser.totp_secret) {
    return adminJson({ error: 'Start enrollment first.' }, { status: 400 })
  }
  if (adminUser.totp_enabled) {
    return adminJson({ error: 'MFA is already enabled.' }, { status: 409 })
  }

  let body: { code?: string }
  try {
    body = await req.json()
  } catch {
    return adminJson({ error: 'Invalid request' }, { status: 400 })
  }

  const code = typeof body.code === 'string' ? body.code.trim() : ''
  const secret = decryptSecret(adminUser.totp_secret)
  if (!verifyTotpCode(secret, code)) {
    return adminJson({ error: 'That code didn\u2019t match. Check your authenticator app and try again.' }, { status: 400 })
  }

  const { raw, hashes } = await generateBackupCodes()
  await confirmTotpEnrollment(adminUser.id, hashes)
  await logOpsActivity({
    actor_email: adminUser.email,
    action: 'mfa_enabled',
    entity_type: 'admin_user',
    entity_id: adminUser.id,
  })

  return adminJson({ success: true, backupCodes: raw })
}
