import SpecializedOpsConsole from '@/components/admin/ops/SpecializedOpsConsole'
import { canDelete, getCurrentAdminRole } from '@/lib/admin/permissions'
import { getOpsItems } from '@/lib/ops/data'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export default async function InternalOpsPage() {
  const { items, error } = await getOpsItems({ category: 'internal_ops' })
  const role = await getCurrentAdminRole()
  const deletable = await canDelete(role)
  return <SpecializedOpsConsole mode="internal_ops" initial={items} loadError={error} canDelete={deletable} />
}
