import Link from 'next/link'
import { isSupabaseConfigured } from '@/lib/env'
import { getOverviewV2 } from '@/lib/ops/data'
import { getDb } from '@/lib/supabase-server'
import { AdminCard, AdminPageHeader } from '@/components/admin/AdminUI'
import AccessDenied from '@/components/admin/ops/AccessDenied'
import { canAccess, getCurrentAdminRole } from '@/lib/admin/permissions'
import { formatMoney } from '@/lib/ops/currency'

function Metric({ label, value, href, tone }: { label: string; value: string | number; href?: string; tone?: 'warn' }) {
  const inner = (
    <>
      <p className="admin-metric-label">{label}</p>
      <p className={`admin-metric-value ${tone === 'warn' ? 'text-amber-400' : ''}`}>{value}</p>
    </>
  )
  return href ? <Link className="admin-metric-card block transition-colors hover:border-[var(--admin-gold)]" href={href}>{inner}</Link> : <div className="admin-metric-card">{inner}</div>
}

export default async function OverviewDashboard() {
  const role = await getCurrentAdminRole()
  if (!canAccess(role, 'command')) return <AccessDenied module="Command Center" />

  if (!isSupabaseConfigured() || !getDb()) {
    return (
      <div>
        <AdminPageHeader title="Overview" description="Configure Supabase to activate Studio OS." />
        <div className="admin-banner admin-banner-warn">Supabase is not configured for this deployment.</div>
      </div>
    )
  }

  const { data, error } = await getOverviewV2()

  return (
    <div>
      <AdminPageHeader title="Overview" description="Company operating snapshot for today, finance, clients, receipts, and priority work." />

      {error && (
        <div className="admin-banner admin-banner-warn mb-5">
          Finance/clients/receipts tables are not active yet. Run <code>supabase/schema.sql</code> to enable the full dashboard.
        </div>
      )}

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Leads" value={data?.openLeads ?? 0} href="/studio-ops/inquiries" />
        <Metric label="Active clients" value={data?.activeClients ?? 0} href="/studio-ops/clients" />
        <Metric label="Pending finance" value={formatMoney(data?.pendingFinanceValue ?? 0)} href="/studio-ops/finance" />
        <Metric label="Overdue finance" value={formatMoney(data?.overdueFinanceValue ?? 0)} href="/studio-ops/finance" tone="warn" />
        <Metric label="Receipts this month" value={formatMoney(data?.receiptsThisMonth ?? 0)} href="/studio-ops/receipts" />
        <Metric label="Urgent ops" value={data?.urgentOpsItems ?? 0} href="/studio-ops/internal-ops" tone="warn" />
        <Metric label="Due this week" value={data?.dueThisWeek ?? 0} href="/studio-ops/internal-ops" />
        <Metric label="New inquiries" value={data?.newInquiries ?? 0} href="/studio-ops/inquiries" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_0.8fr]">
        <AdminCard className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr><th>Operating queue</th><th>Now</th><th>Next action</th></tr>
            </thead>
            <tbody>
              <tr><td>Upcoming billing</td><td>{data?.upcomingBilling ?? 0}</td><td>Review client invoice dates</td></tr>
              <tr><td>Finance collection</td><td>{formatMoney(data?.overdueFinanceValue ?? 0)} overdue</td><td>{(data?.overdueFinanceValue ?? 0) > 0 ? 'Follow up overdue invoices' : 'Review pending invoices'}</td></tr>
              <tr><td>Receipts workflow</td><td>{formatMoney(data?.receiptsThisMonth ?? 0)}</td><td>Review unreviewed receipts</td></tr>
            </tbody>
          </table>
        </AdminCard>
        <AdminCard className="p-5">
          <h2 className="text-sm font-semibold text-[var(--admin-ivory)]">Recent activity</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {data?.recentActivity?.length ? data.recentActivity.map((item) => (
              <li key={item.id} className="border-b border-[var(--admin-border)] pb-3 last:border-0">
                <p className="text-[var(--admin-ivory)]">{item.action.replaceAll('_', ' ')}</p>
                <p className="mt-1 text-xs text-[var(--admin-muted)]">{item.entity_type} - {new Date(item.created_at).toLocaleString()}</p>
              </li>
            )) : <li className="text-[var(--admin-muted)]">No recent activity yet. Create an ops, finance, receipt, or client record to start the log.</li>}
          </ul>
        </AdminCard>
      </div>
    </div>
  )
}
