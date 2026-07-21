import ClientsConsole from '@/components/admin/ops/ClientsConsole'
import AccessDenied from '@/components/admin/ops/AccessDenied'
import { canAccess, canDelete, getCurrentAdminRole } from '@/lib/admin/permissions'
import { getClients } from '@/lib/ops/data'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export default async function ClientsPage() {
  const role = await getCurrentAdminRole()
  if (!canAccess(role, 'clients')) return <AccessDenied module="Clients" />
  const { clients, error } = await getClients()
  const deletable = await canDelete(role)
  return (
    <ClientsConsole
      initial={clients}
      loadError={error}
      canWrite={canAccess(role, 'clients', 'write')}
      canDelete={deletable}
    />
  )
}
