import { getDb } from '@/lib/supabase-server'
import { DEFAULT_CURRENCY } from '@/lib/ops/currency'

export type CompanySettings = {
  display_name: string
  legal_name: string
  website: string
  email: string
  phone: string
  whatsapp: string
  address: string
  region: string
  vat_number: string
  default_currency: string
  invoice_prefix: string
  payment_instructions: string
  invoice_footer: string
  bank_notes: string
}

export type AdminSettingsMap = {
  site: { maintenance: boolean; maintenance_message?: string }
  whatsapp: { enabled: boolean; channel: 'off' | 'footer' | 'float' }
  seo: { title_override?: string; description_override?: string }
  features: { notes_public?: boolean }
  company: CompanySettings
}

const DEFAULT_COMPANY: CompanySettings = {
  display_name: 'Ivori Digitals',
  legal_name: 'Ivori Digitals',
  website: 'https://www.ivoridigitals.com',
  email: 'hello@ivoridigitals.com',
  phone: '',
  whatsapp: '',
  address: 'Cairo, Egypt',
  region: 'Egypt & MENA',
  vat_number: '',
  default_currency: DEFAULT_CURRENCY,
  invoice_prefix: 'IV',
  payment_instructions:
    'Payment via bank transfer, InstaPay, or Vodafone Cash. Reference the invoice number on all transfers.',
  invoice_footer: 'Thank you for your business. Ivori Digitals — premium ecommerce growth studio.',
  bank_notes: '',
}

const DEFAULTS: AdminSettingsMap = {
  site: { maintenance: false },
  whatsapp: { enabled: true, channel: 'footer' },
  seo: {},
  features: { notes_public: true },
  company: DEFAULT_COMPANY,
}

function mergeSection<T extends object>(base: T, value: unknown): T {
  if (value && typeof value === 'object') return { ...base, ...(value as T) }
  return base
}

export async function getAdminSettings(): Promise<AdminSettingsMap> {
  const supabase = getDb()
  if (!supabase) return DEFAULTS

  const { data, error } = await supabase.from('admin_settings').select('key, value')
  if (error || !data?.length) return DEFAULTS

  const out: AdminSettingsMap = {
    site: { ...DEFAULTS.site },
    whatsapp: { ...DEFAULTS.whatsapp },
    seo: { ...DEFAULTS.seo },
    features: { ...DEFAULTS.features },
    company: { ...DEFAULTS.company },
  }

  for (const row of data) {
    const key = row.key as keyof AdminSettingsMap
    if (key === 'site') out.site = mergeSection(out.site, row.value)
    if (key === 'whatsapp') out.whatsapp = mergeSection(out.whatsapp, row.value)
    if (key === 'seo') out.seo = mergeSection(out.seo, row.value)
    if (key === 'features') out.features = mergeSection(out.features, row.value)
    if (key === 'company') out.company = mergeSection(out.company, row.value)
  }
  return out
}

export async function patchAdminSettings(
  patch: Partial<AdminSettingsMap>
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = getDb()
  if (!supabase) {
    return { ok: false, error: 'Database not configured' }
  }

  for (const [key, value] of Object.entries(patch)) {
    if (!(key in DEFAULTS)) continue
    const { error } = await supabase
      .from('admin_settings')
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
    if (error) return { ok: false, error: error.message }
  }

  return { ok: true }
}

export { DEFAULT_COMPANY }
