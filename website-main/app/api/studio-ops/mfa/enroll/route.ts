import { adminJson } from '@/lib/security/admin-response'
import { isMfaConfigured } from '@/lib/env'
import { getCurrentAdminUserSession } from '@/lib/auth/current-admin-user'
import { findAdminUserById, beginTotpEnrollment } from '@/lib/auth/admin-users'
import { generateTotpSecret, buildOtpAuthUrl } from '@/lib/auth/totp'
import { encryptSecret } from '@/lib/auth/crypto'
import QRCode from 'qrcode'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function POST() {
  if (!isMfaConfigured()) {
    return adminJson({ error: 'MFA is not configured on this server yet (missing MFA_ENCRYPTION_KEY).' }, { status: 503 })
  }

  // Self-service only: requires being logged in via a per-user admin session
  // specifically (not the legacy shared password, which has no individual
  // admin_users identity to attach MFA to).
  const session = await getCurrentAdminUserSession()
  if (!session) {
    return adminJson(
      { error: 'MFA setup requires signing in with your personal account at /login, not the shared studio password.' },
      { status: 403 }
    )
  }

  const adminUser = await findAdminUserById(session.id)
  if (!adminUser) return adminJson({ error: 'Account not found.' }, { status: 404 })
  if (adminUser.totp_enabled) return adminJson({ error: 'MFA is already enabled. Disable it first to reconfigure.' }, { status: 409 })

  const secret = generateTotpSecret()
  await beginTotpEnrollment(adminUser.id, encryptSecret(secret))

  const otpauthUrl = buildOtpAuthUrl({ secret, email: adminUser.email })
  const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl)

  return adminJson({ secret, otpauthUrl, qrCodeDataUrl })
}
