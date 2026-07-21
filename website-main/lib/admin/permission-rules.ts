/**
 * Pure role/permission data and checks — no server-only imports (no
 * next/headers, no cookies, no DB). Safe to import from Client Components
 * (e.g. AdminShell.tsx). Session-aware logic lives in lib/admin/permissions.ts
 * instead, which imports from this file.
 */

export const ADMIN_ROLES = ['administrator', 'finance', 'operations', 'sales', 'content_studio', 'viewer'] as const
export const ADMIN_MODULES = [
  'command',
  'inquiries',
  'clients',
  'finance',
  'receipts',
  'studio',
  'users',
  'system',
] as const

export type AdminRole = (typeof ADMIN_ROLES)[number]
export type AdminModule = (typeof ADMIN_MODULES)[number]
export type PermissionAction = 'read' | 'write' | 'admin'

type PermissionSet = Partial<Record<AdminModule, PermissionAction[]>>

export const PERMISSIONS: Record<AdminRole, PermissionSet> = {
  administrator: Object.fromEntries(ADMIN_MODULES.map((module) => [module, ['read', 'write', 'admin']])) as PermissionSet,
  finance: {
    command: ['read'],
    clients: ['read'],
    finance: ['read', 'write'],
    receipts: ['read', 'write'],
  },
  operations: {
    command: ['read'],
    inquiries: ['read', 'write'],
    clients: ['read', 'write'],
    studio: ['read', 'write'],
  },
  sales: {
    command: ['read'],
    inquiries: ['read', 'write'],
    clients: ['read', 'write'],
  },
  content_studio: {
    command: ['read'],
    studio: ['read', 'write'],
    clients: ['read'],
  },
  viewer: {
    command: ['read'],
    inquiries: ['read'],
    clients: ['read'],
    studio: ['read'],
  },
}

export function canAccess(role: AdminRole, module: AdminModule, action: PermissionAction = 'read') {
  if (role === 'administrator') return true
  return Boolean(PERMISSIONS[role][module]?.includes(action))
}

export function permissionMatrix() {
  return PERMISSIONS
}
