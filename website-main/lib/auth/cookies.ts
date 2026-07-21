export const ADMIN_USER_COOKIE = 'ivori_admin_user'
export const ADMIN_USER_SESSION_MAX_AGE_SECONDS = 60 * 60 * 8 // 8 hours, matches legacy admin session

export const CUSTOMER_COOKIE = 'ivori_customer'
export const CUSTOMER_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30 // 30 days — client portal, not a security console

export const MFA_PENDING_COOKIE = 'ivori_mfa_pending'
export const MFA_PENDING_MAX_AGE_SECONDS = 60 * 5 // 5 minutes to enter a code before starting over

/** Subject format: "mfa-pending:<admin-user-id>" */
export function buildMfaPendingSubject(id: string): string {
  return `mfa-pending:${id}`
}

export function parseMfaPendingSubject(subject: string): { id: string } | null {
  const match = /^mfa-pending:([^:]+)$/.exec(subject)
  if (!match) return null
  return { id: match[1] }
}

/** Subject format: "admin:<uuid>:<role>" */
export function buildAdminSubject(id: string, role: string): string {
  return `admin:${id}:${role}`
}

export function parseAdminSubject(subject: string): { id: string; role: string } | null {
  const match = /^admin:([^:]+):(.+)$/.exec(subject)
  if (!match) return null
  return { id: match[1], role: match[2] }
}

/** Subject format: "customer:<uuid>" */
export function buildCustomerSubject(id: string): string {
  return `customer:${id}`
}

export function parseCustomerSubject(subject: string): { id: string } | null {
  const match = /^customer:([^:]+)$/.exec(subject)
  if (!match) return null
  return { id: match[1] }
}
