import { notFound } from 'next/navigation'
import { getAdminSettings } from '@/lib/admin/settings'
import { getDb } from '@/lib/supabase-server'
import { canAccess, getCurrentAdminRole } from '@/lib/admin/permissions'
import AccessDenied from '@/components/admin/ops/AccessDenied'
import FormalInvoiceDocument from '@/components/admin/ops/FormalInvoiceDocument'
import PrintButton from '@/components/admin/ops/PrintButton'
import type { FinanceRecord } from '@/lib/ops/types'
import './invoice-print.css'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

type Props = { params: Promise<{ id: string }> }

export default async function InvoicePrintPage({ params }: Props) {
  const role = await getCurrentAdminRole()
  if (!canAccess(role, 'finance')) return <AccessDenied module="Finance" />

  const { id } = await params
  const supabase = getDb()
  if (!supabase) notFound()

  const [{ data, error }, settings] = await Promise.all([
    supabase.from('finance_records').select('*').eq('id', id).single(),
    getAdminSettings(),
  ])

  if (error || !data) notFound()
  const invoice = data as FinanceRecord
  const prefix = settings.company.invoice_prefix || 'IV'
  const invoiceNumber = `${prefix}-${invoice.created_at.slice(0, 10).replaceAll('-', '')}-${invoice.id.slice(0, 6).toUpperCase()}`

  return (
    <div className="invoice-print-shell">
      <div className="invoice-print-toolbar no-print">
        <PrintButton label="Download / Print PDF" />
      </div>
      <FormalInvoiceDocument invoice={invoice} company={settings.company} invoiceNumber={invoiceNumber} />
    </div>
  )
}
