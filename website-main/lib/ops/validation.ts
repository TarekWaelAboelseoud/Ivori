import {
  ADMIN_ROLES,
  ADMIN_USER_STATUSES,
  CLIENT_STATUSES,
  CLIENT_TIERS,
  FINANCE_STATUSES,
  FINANCE_TYPES,
  OPS_CATEGORIES,
  OPS_PRIORITIES,
  OPS_STATUSES,
  RECEIPT_CATEGORIES,
  RECEIPT_STATUSES,
  RECURRING_INTERVALS,
} from './config'
import type {
  AdminRole,
  AdminUserStatus,
  ClientStatus,
  ClientTier,
  FinanceStatus,
  FinanceType,
  OpsCategory,
  OpsPriority,
  OpsStatus,
  ReceiptCategory,
  ReceiptStatus,
  RecurringInterval,
} from './config'

export function cleanText(value: unknown, max = 500): string | null {
  if (typeof value !== 'string') return null
  const cleaned = value.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().slice(0, max)
  return cleaned || null
}

export function cleanLongText(value: unknown, max = 4000): string | null {
  if (typeof value !== 'string') return null
  const cleaned = value.replace(/<[^>]*>/g, '').trim().slice(0, max)
  return cleaned || null
}

export function cleanEmail(value: unknown): string | null {
  const email = cleanText(value, 320)?.toLowerCase() ?? null
  if (!email) return null
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null
}

export function cleanUrl(value: unknown): string | null {
  const url = cleanText(value, 500)
  if (!url) return null
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null
    return parsed.toString().slice(0, 500)
  } catch {
    return null
  }
}

export function cleanDate(value: unknown): string | null {
  if (typeof value !== 'string' || !value) return null
  const time = Date.parse(value)
  return Number.isFinite(time) ? new Date(time).toISOString() : null
}

export function cleanDateOnly(value: unknown): string | null {
  if (typeof value !== 'string' || !value) return null
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null
}

export function cleanAmount(value: unknown): number {
  const n = Number(value)
  if (!Number.isFinite(n)) return 0
  return Math.max(-9999999999.99, Math.min(9999999999.99, Math.round(n * 100) / 100))
}

export function cleanCurrency(value: unknown): string {
  const currency = cleanText(value, 3)?.toUpperCase() ?? 'EGP'
  return /^[A-Z]{3}$/.test(currency) ? currency : 'EGP'
}

function oneOf<T extends readonly string[]>(value: unknown, allowed: T): T[number] | null {
  return typeof value === 'string' && allowed.includes(value) ? value : null
}

export function parseOpsCategory(value: unknown): OpsCategory | null {
  return oneOf(value, OPS_CATEGORIES)
}

export function parseOpsStatus(value: unknown): OpsStatus | null {
  return oneOf(value, OPS_STATUSES)
}

export function parseOpsPriority(value: unknown): OpsPriority | null {
  return oneOf(value, OPS_PRIORITIES)
}

export function parseAdminRole(value: unknown): AdminRole | null {
  return oneOf(value, ADMIN_ROLES)
}

export function parseAdminUserStatus(value: unknown): AdminUserStatus | null {
  return oneOf(value, ADMIN_USER_STATUSES)
}

export function parseFinanceType(value: unknown): FinanceType | null {
  return oneOf(value, FINANCE_TYPES)
}

export function parseFinanceStatus(value: unknown): FinanceStatus | null {
  return oneOf(value, FINANCE_STATUSES)
}

export function parseReceiptCategory(value: unknown): ReceiptCategory | null {
  return oneOf(value, RECEIPT_CATEGORIES)
}

export function parseReceiptStatus(value: unknown): ReceiptStatus | null {
  return oneOf(value, RECEIPT_STATUSES)
}

export function parseClientStatus(value: unknown): ClientStatus | null {
  return oneOf(value, CLIENT_STATUSES)
}

export function parseClientTier(value: unknown): ClientTier | null {
  return oneOf(value, CLIENT_TIERS)
}

export function parseRecurringInterval(value: unknown): RecurringInterval | null {
  return oneOf(value, RECURRING_INTERVALS)
}

export function cleanMetadata(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  return JSON.parse(JSON.stringify(value).slice(0, 8000)) as Record<string, unknown>
}
