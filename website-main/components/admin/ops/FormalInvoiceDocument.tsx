import IvoriMark from '@/components/brand/IvoriMark'
import { DEFAULT_COMPANY, type CompanySettings } from '@/lib/admin/settings'
import { formatMoney } from '@/lib/ops/currency'
import type { FinanceRecord } from '@/lib/ops/types'

function formatDate(value: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function FormalInvoiceDocument({
  invoice,
  company,
  invoiceNumber,
}: {
  invoice: FinanceRecord
  company: CompanySettings
  invoiceNumber: string
}) {
  const co = company ?? DEFAULT_COMPANY
  const currency = invoice.currency || co.default_currency || 'EGP'
  const subtotal = Number(invoice.amount || 0)
  const total = subtotal

  return (
    <article className="formal-invoice">
      <header className="formal-invoice-header">
        <div className="formal-invoice-brand">
          <IvoriMark size="lg" variant="light" />
          <div>
            <p className="formal-invoice-company">{co.display_name}</p>
            <p className="formal-invoice-meta">{co.legal_name}</p>
            <p className="formal-invoice-meta">{co.address}</p>
            <p className="formal-invoice-meta">{co.email}{co.phone ? ` · ${co.phone}` : ''}</p>
            <p className="formal-invoice-meta">{co.website.replace(/^https?:\/\//, '')}</p>
          </div>
        </div>
        <div className="formal-invoice-title-block">
          <h1 className="formal-invoice-title">TAX INVOICE</h1>
          <dl className="formal-invoice-meta-grid">
            <div>
              <dt>Invoice no.</dt>
              <dd>{invoiceNumber}</dd>
            </div>
            <div>
              <dt>Issue date</dt>
              <dd>{formatDate(invoice.created_at)}</dd>
            </div>
            <div>
              <dt>Due date</dt>
              <dd>{formatDate(invoice.due_at)}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd className="capitalize">{invoice.status.replaceAll('_', ' ')}</dd>
            </div>
          </dl>
        </div>
      </header>

      <section className="formal-invoice-parties">
        <div>
          <p className="formal-invoice-label">Bill to</p>
          <p className="formal-invoice-party-name">{invoice.client_name || 'Client'}</p>
          {invoice.client_email && <p className="formal-invoice-meta">{invoice.client_email}</p>}
        </div>
        <div>
          <p className="formal-invoice-label">From</p>
          <p className="formal-invoice-party-name">{co.display_name}</p>
          <p className="formal-invoice-meta">{co.region}</p>
          {co.vat_number && <p className="formal-invoice-meta">VAT/Tax ID: {co.vat_number}</p>}
        </div>
      </section>

      <table className="formal-invoice-table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Qty</th>
            <th>Unit price</th>
            <th>Line total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>{invoice.title}</strong>
              {invoice.description && <p className="formal-invoice-line-desc">{invoice.description}</p>}
            </td>
            <td>1</td>
            <td>{formatMoney(subtotal, currency)}</td>
            <td>{formatMoney(subtotal, currency)}</td>
          </tr>
        </tbody>
      </table>

      <section className="formal-invoice-totals">
        <div className="formal-invoice-totals-row">
          <span>Subtotal</span>
          <span>{formatMoney(subtotal, currency)}</span>
        </div>
        <div className="formal-invoice-totals-row">
          <span>Discount</span>
          <span>—</span>
        </div>
        <div className="formal-invoice-totals-row">
          <span>VAT / Tax</span>
          <span>{co.vat_number ? 'As applicable' : '—'}</span>
        </div>
        <div className="formal-invoice-totals-row formal-invoice-totals-grand">
          <span>Total due</span>
          <span>{formatMoney(total, currency)}</span>
        </div>
      </section>

      <section className="formal-invoice-notes">
        <p className="formal-invoice-label">Payment instructions</p>
        <p>{invoice.billing_notes || co.payment_instructions}</p>
        {co.bank_notes && <p className="formal-invoice-meta mt-2">{co.bank_notes}</p>}
        {invoice.paid_at && <p className="formal-invoice-meta mt-2">Paid: {formatDate(invoice.paid_at)}</p>}
      </section>

      <footer className="formal-invoice-signatures">
        <div>
          <p className="formal-invoice-label">Prepared by</p>
          <div className="formal-invoice-sign-line" />
          <p className="formal-invoice-meta">{co.display_name}</p>
        </div>
        <div>
          <p className="formal-invoice-label">Authorized signature</p>
          <div className="formal-invoice-sign-line" />
        </div>
        <div>
          <p className="formal-invoice-label">Client acceptance</p>
          <div className="formal-invoice-sign-line" />
        </div>
      </footer>

      <p className="formal-invoice-footer">{co.invoice_footer}</p>
    </article>
  )
}
