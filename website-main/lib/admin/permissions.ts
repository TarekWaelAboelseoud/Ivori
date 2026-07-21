/**
 * Session-aware permission checks — server-only (reads cookies via
 * next/headers, transitively). Do not import this from Client Components;
 * import lib/admin/permission-rules.ts instead for the pure role data.
 */

import { adminJson } from '@/lib/security/admin-response'
import { getCurrentAdminUserSession } from '@/lib/auth/current-admin-user'
import { normalizeAdminRole } from '@/lib/auth/admin-users'
import { ADMIN_ROLES, canAccess } from '@/lib/admin/permission-rules'
import type { AdminModule, AdminRole, PermissionAction } from '@/lib/admin/permission-rules'

export { ADMIN_ROLES, ADMIN_MODULES, canAccess, permissionMatrix } from '@/lib/admin/permission-rules'
export type { AdminRole, AdminModule, PermissionAction } from '@/lib/admin/permission-rules'

/**
 * When logged in via a per-admin-user session (see /api/auth/login), the
 * role actually comes from that person's admin_users row, embedded in their
 * session. When logged in via the legacy shared studio password, there's no
 * individual identity to key off of, so this falls back to the old
 * env-var-based role — unchanged behavior for that login path.
 */
export async function getCurrentAdminRole(): Promise<AdminRole> {
  const session = await getCurrentAdminUserSession()
  if (session) return normalizeAdminRole(session.role)

  const raw = (process.env.ADMIN_ROLE || process.env.STUDIO_OPS_ROLE || 'administrator').trim().toLowerCase()
  if (raw === 'admin' || raw === 'owner') return 'administrator'
  if (raw === 'content') return 'content_studio'
  return ADMIN_ROLES.includes(raw as AdminRole) ? (raw as AdminRole) : 'administrator'
}

export async function isAdministrator(role?: AdminRole) {
  const resolved = role ?? (await getCurrentAdminRole())
  return resolved === 'administrator'
}

export async function canDelete(role?: AdminRole) {
  return isAdministrator(role)
}

export async function requireAdminDelete() {
  if (!(await canDelete())) return adminJson({ error: 'Administrator access required' }, { status: 403 })
  return null
}

export async function requirePermission(module: AdminModule, action: PermissionAction = 'read') {
  const role = await getCurrentAdminRole()
  return canAccess(role, module, action) ? null : adminJson({ error: 'Forbidden' }, { status: 403 })
}
