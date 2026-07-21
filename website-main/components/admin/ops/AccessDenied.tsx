import { AdminPageHeader } from '@/components/admin/AdminUI'

export default function AccessDenied({ module }: { module: string }) {
  return (
    <div>
      <AdminPageHeader title="Access denied" description={`Your current admin role cannot access ${module}.`} />
      <div className="admin-banner admin-banner-warn">
        This area is protected by server-side role permissions. Ask an administrator to change your role.
      </div>
    </div>
  )
}
