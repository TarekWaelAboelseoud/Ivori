import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { getCurrentCustomerId } from '@/lib/auth/current-customer'
import { findCustomerById } from '@/lib/auth/customers'
import { getDb } from '@/lib/supabase-server'
import PortalLogoutButton from './PortalLogoutButton'
import VerifyEmailBanner from './VerifyEmailBanner'

export const metadata = { robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

type OrderRow = {
  id: string
  created_at: string
  status: string
  tier: string
  currency: string
  amount_cents: number | null
}

async function getCustomerOrders(customerId: string): Promise<OrderRow[]> {
  const supabase = getDb()
  if (!supabase) return []
  const { data } = await supabase
    .from('orders')
    .select('id, created_at, status, tier, currency, amount_cents')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })
  return (data as OrderRow[] | null) ?? []
}

function formatAmount(cents: number | null, currency: string) {
  if (cents === null) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format(cents / 100)
}

function formatStatus(status: string) {
  return status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export default async function PortalPage() {
  await connection()

  const customerId = await getCurrentCustomerId()
  if (!customerId) {
    redirect('/login?next=/portal')
  }

  const [orders, customer] = await Promise.all([getCustomerOrders(customerId), findCustomerById(customerId)])

  return (
    <main
      className="min-h-screen px-4 py-16"
      style={{ background: 'var(--background)', color: 'var(--foreground)' }}
    >
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em]" style={{ color: 'var(--text-label)' }}>
              Ivori Digitals
            </p>
            <h1
              className="mt-2 text-2xl font-semibold"
              style={{ color: 'var(--ivory)', fontFamily: 'var(--font-display)' }}
            >
              Your projects
            </h1>
          </div>
          <PortalLogoutButton />
        </div>

        {customer && !customer.email_verified_at && <VerifyEmailBanner />}

        {orders.length === 0 ? (
          <div
            className="rounded-xl border p-8 text-center"
            style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
          >
            <p style={{ color: 'var(--text-body)' }}>
              No projects linked to your account yet. Once your order is confirmed, it will show up here.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {orders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between rounded-xl border p-5"
                style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
              >
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--ivory)' }}>
                    {order.tier ? order.tier.charAt(0).toUpperCase() + order.tier.slice(1) : 'Project'}
                  </p>
                  <p className="mt-1 text-xs" style={{ color: 'var(--text-label)' }}>
                    {new Date(order.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className="rounded-full px-3 py-1 text-xs font-medium"
                    style={{ background: 'var(--gold-glow)', color: 'var(--gold-bright)' }}
                  >
                    {formatStatus(order.status)}
                  </p>
                  <p className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {formatAmount(order.amount_cents, order.currency)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
