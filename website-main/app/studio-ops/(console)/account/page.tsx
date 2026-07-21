import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { getCurrentAdminUserSession } from '@/lib/auth/current-admin-user'
import { findAdminUserById } from '@/lib/auth/admin-users'
import { isMfaConfigured } from '@/lib/env'
import { AdminCard, AdminPageHeader } from '@/components/admin/AdminUI'
import AccountClient from './AccountClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export default async function AccountPage() {
  await connection()

  const session = await getCurrentAdminUserSession()

  if (!session) {
    return (
      <div>
        <AdminPageHeader title="My Account" description="Personal security settings." />
        <AdminCard className="p-6">
          <p className="text-sm text-[var(--admin-muted)]">
            You&apos;re signed in with the shared studio password, which isn&apos;t tied to an individual account.
            To manage MFA and your own password, sign out and sign back in with your personal email and password at{' '}
            <a href="/login" className="underline">
              /login
            </a>
            .
          </p>
        </AdminCard>
      </div>
    )
  }

  const adminUser = await findAdminUserById(session.id)
  if (!adminUser) redirect('/studio-ops')

  return (
    <div>
      <AdminPageHeader title="My Account" description={`Signed in as ${adminUser.email}.`} />
      <AdminCard className="p-6">
        <AccountClient
          email={adminUser.email}
          totpEnabled={adminUser.totp_enabled}
          mfaConfigured={isMfaConfigured()}
        />
      </AdminCard>
    </div>
  )
}
