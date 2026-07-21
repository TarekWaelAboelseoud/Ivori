import AdminUsersConsole from '@/components/admin/ops/AdminUsersConsole'
import AccessDenied from '@/components/admin/ops/AccessDenied'
import { canAccess, getCurrentAdminRole } from '@/lib/admin/permissions'
import { getAdminUsers } from '@/lib/ops/data'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export default async function UsersPage() {
  const role = await getCurrentAdminRole()
  if (!canAccess(role, 'users')) return <AccessDenied module="Admin Users" />
  const { users, error } = await getAdminUsers()
  return <AdminUsersConsole initial={users} loadError={error} />
}
