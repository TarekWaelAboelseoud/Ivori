import { getAdminSettings } from '@/lib/admin/settings'
import { AdminPageHeader } from '@/components/admin/AdminUI'
import AccessDenied from '@/components/admin/ops/AccessDenied'
import { canAccess, getCurrentAdminRole } from '@/lib/admin/permissions'
import SettingsForm from './SettingsForm'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const role = await getCurrentAdminRole()
  if (!canAccess(role, 'system')) return <AccessDenied module="System Settings" />

  const settings = await getAdminSettings()

  return (
    <div>
      <AdminPageHeader
        title="Settings"
        description="Company profile, invoices, site toggles, WhatsApp, and SEO. Stored in Supabase admin_settings."
      />
      <p className="mb-6 text-xs text-zinc-600">
        Run <code className="text-[#dfc18a]">supabase/schema.sql</code> if settings fail to save.
      </p>
      <SettingsForm initial={settings} />
    </div>
  )
}
