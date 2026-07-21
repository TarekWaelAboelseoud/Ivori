import ReceiptsConsole from '@/components/admin/ops/ReceiptsConsole'
import AccessDenied from '@/components/admin/ops/AccessDenied'
import { canAccess, canDelete, getCurrentAdminRole } from '@/lib/admin/permissions'
import { getReceipts } from '@/lib/ops/data'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export default async function ReceiptsPage() {
  const role = await getCurrentAdminRole()
  if (!canAccess(role, 'receipts')) return <AccessDenied module="Receipts" />
  const { receipts, error } = await getReceipts()
  const deletable = await canDelete(role)
  return (
    <ReceiptsConsole
      initial={receipts}
      loadError={error}
      canWrite={canAccess(role, 'receipts', 'write')}
      canDelete={deletable}
    />
  )
}
