import { NextRequest } from 'next/server'
import { getAdminSettings, patchAdminSettings, type AdminSettingsMap } from '@/lib/admin/settings'
import { logAdminAudit } from '@/lib/security/audit'
import { clientIp } from '@/lib/security/rate-limit'
import { adminJson } from '@/lib/security/admin-response'
import { requirePermission } from '@/lib/admin/permissions'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function GET() {
  const forbidden = await requirePermission('system')
  if (forbidden) return forbidden
  const settings = await getAdminSettings()
  return adminJson({ settings })
}

export async function PATCH(req: NextRequest) {
  const forbidden = await requirePermission('system', 'write')
  if (forbidden) return forbidden
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return adminJson({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body || typeof body !== 'object') {
    return adminJson({ error: 'Invalid body' }, { status: 400 })
  }

  const patch = body as Partial<AdminSettingsMap>
  const result = await patchAdminSettings(patch)
  if (!result.ok) {
    return adminJson({ error: result.error }, { status: 500 })
  }

  await logAdminAudit('settings_updated', {
    path: '/api/studio-ops/settings',
    ip: clientIp(req),
    metadata: { keys: Object.keys(patch) },
  })

  const settings = await getAdminSettings()
  return adminJson({ success: true, settings })
}
