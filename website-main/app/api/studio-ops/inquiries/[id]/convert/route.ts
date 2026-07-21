import { NextRequest } from 'next/server'
import { db } from '@/lib/supabase-server'
import { adminJson } from '@/lib/security/admin-response'
import { requirePermission } from '@/lib/admin/permissions'
import { logOpsActivity } from '@/lib/ops/data'
import { cleanEmail } from '@/lib/ops/validation'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function POST(_req: NextRequest, ctx: RouteContext<'/api/studio-ops/inquiries/[id]/convert'>) {
  const forbidden = await requirePermission('inquiries', 'write')
  if (forbidden) return forbidden

  const { id } = await ctx.params
  const supabase = db()
  const { data: inquiry, error: readError } = await supabase.from('studio_inquiries').select('*').eq('id', id).single()
  if (readError || !inquiry) return adminJson({ error: readError?.message ?? 'Inquiry not found' }, { status: 404 })

  const row = inquiry as Record<string, unknown>
  const companyName = String(row.company_name || row.brand || 'Unknown company').slice(0, 180)
  const contactValue = String(row.contact || '')
  const email = cleanEmail(contactValue)

  const { data: company, error: companyError } = await supabase
    .from('companies')
    .insert({
      name: companyName,
      website: row.store_url ?? null,
      instagram: row.instagram ?? null,
      region: row.region ?? null,
      status: 'lead',
      notes: row.internal_summary ?? row.notes ?? null,
      metadata: { studio_inquiry_id: id },
    })
    .select('*')
    .single()
  if (companyError) return adminJson({ error: companyError.message }, { status: 500 })

  const { data: contact, error: contactError } = await supabase
    .from('contacts')
    .insert({
      company_id: company.id,
      name: row.brand ?? row.company_name ?? null,
      email,
      whatsapp: row.whatsapp ?? null,
      phone: email ? null : contactValue.slice(0, 80),
      preferred_channel: row.preferred_contact_method ?? null,
      metadata: { studio_inquiry_id: id },
    })
    .select('*')
    .single()
  if (contactError) return adminJson({ error: contactError.message }, { status: 500 })

  await supabase.from('studio_inquiries').update({
    company_id: company.id,
    contact_id: contact.id,
    status: 'qualified',
  }).eq('id', id)

  await supabase.from('client_timeline').insert({
    company_id: company.id,
    contact_id: contact.id,
    inquiry_id: id,
    stage: 'inquiry',
    title: 'Inquiry converted to customer database',
    metadata: { source: row.source ?? 'website' },
  })

  await logOpsActivity({ action: 'inquiry_converted', entity_type: 'inquiry', entity_id: id, details: { company_id: company.id, contact_id: contact.id } })
  return adminJson({ company, contact })
}
