import SpecializedOpsConsole from '@/components/admin/ops/SpecializedOpsConsole'
import { canDelete, getCurrentAdminRole } from '@/lib/admin/permissions'
import { getOpsItems } from '@/lib/ops/data'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

/** Client delivery projects — CRO, Shopify, ads, creative, audits */
export default async function ProjectsPage() {
  const { items, error } = await getOpsItems({ category: 'clients' })
  const role = await getCurrentAdminRole()
  const deletable = await canDelete(role)
  return <SpecializedOpsConsole mode="projects" initial={items} loadError={error} canDelete={deletable} />
}
