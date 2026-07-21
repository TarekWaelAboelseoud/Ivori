# Admin OS V4 Report

## Changed

- Replaced the duplicated-feeling overview with a single V2 operating dashboard.
- Upgraded `/studio-ops` navigation to click-to-open grouped menus with outside-click close, Escape close, active state, and mobile-safe horizontal nav.
- Added dedicated Finance, Receipts, and Clients modules instead of using generic queue placeholders.
- Added protected APIs for finance records, receipts, and clients.
- Added `supabase/ivori-ops-v4.sql`, which preserves v3 tables and adds finance, receipts, clients, billing, and HR role foundation.

## Why It Matters

The admin console now has real business objects: clients, invoices/payments/expenses, receipts, and billing reminders. Generic ops queues still exist, but finance and client operations can now mature independently.

## SQL

Run `supabase/ivori-ops-v4.sql` in the Supabase production SQL editor. It is idempotent and does not delete existing data.

## Limitations

- Billing automation is manual-first.
- User roles are stored but not fully enforced per route yet.
- Gmail/payment-provider integrations are intentionally deferred.
