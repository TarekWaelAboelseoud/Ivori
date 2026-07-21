import FinanceConsole from '@/components/admin/ops/FinanceConsole'
import AccessDenied from '@/components/admin/ops/AccessDenied'
import { canAccess, canDelete, getCurrentAdminRole } from '@/lib/admin/permissions'
import { getFinanceRecords } from '@/lib/ops/data'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export default async function FinancePage() {
  const role = await getCurrentAdminRole()
  if (!canAccess(role, 'finance')) return <AccessDenied module="Finance" />
  const { records, error } = await getFinanceRecords()
  const deletable = await canDelete(role)
  return (
    <FinanceConsole
      initial={records}
      loadError={error}
      canWrite={canAccess(role, 'finance', 'write')}
      canDelete={deletable}
    />
  )
}
