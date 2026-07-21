# Database schema

**`schema.sql` is the single source of truth.** Paste it into the Supabase SQL
Editor and run it once for a fresh project. It creates all 17 tables this app
uses, in the correct order, with indexes, triggers, RLS, and seed data.

It's idempotent — safe to run again later (e.g. after pulling a change to
this file) without duplicating rows or erroring on things that already exist.

## What used to be here

This schema used to be built from 7 separate files, added over time in two
lineages that were never merged:

- `ivori-production.sql` → `-v2.sql` (+ a hotfix) — public site tables
  (inquiries, leads, orders, audits)
- `ivori-ops-v3.sql` → `-v6.sql` — Studio-Ops backend tables (ops items,
  admin users, finance, receipts, clients, companies, contacts, RBAC)

Those files are kept in `archive/` for historical reference only —
**do not run them.** `schema.sql` supersedes all of them.

### Why this got consolidated

1. **There was no single file representing the current schema.** Setting up
   a new environment meant running all 7 files in the exact right order.
2. **The deployment docs were actually wrong.** `DEPLOYMENT.md` and
   `VERCEL_ENV_SETUP.md` only listed `-v2`, `-v4`, and `-v6` — `-v3` and `-v5`
   were never mentioned. Verified by running exactly those documented steps:
   it produces only 13 of the 17 tables. `companies`, `contacts`,
   `client_timeline`, and `admin_role_permissions` (created only in `-v5`)
   would silently never exist on a database set up by following the docs.
3. **Row-level security was inconsistent.** The 6 "production" tables
   (`studio_inquiries`, `leads`, `orders`, `audits`, `admin_settings`,
   `admin_audit_log`, `inquiry_activity_log`) had RLS policies of
   `using (true)` — which allows *any* role, including the public/anon key,
   full access. The other 11 "ops" tables correctly used `using (false)`
   (deny all, service-role-only via bypass). `schema.sql` makes every table
   deny-all. This changes nothing about how the app behaves today — the app
   only ever connects with the service role key
   (`lib/supabase-server.ts`), which bypasses RLS regardless of policy — it
   just removes a gap that existed if the anon key were ever accidentally
   used somewhere.
4. **Two identical trigger functions existed** under different names
   (`update_updated_at` and `set_updated_at`) — merged into one.
5. **3 duplicate indexes** existed on the same columns under different names
   (`idx_finance_records_status` / `finance_records_status_idx`, etc.) —
   removed.

### How this was verified, not just rewritten by hand

The old 7 files were actually run in sequence against a real Postgres
instance, the resulting schema was dumped, and `schema.sql` was checked
against that dump: all 236 columns (name, type, nullability, default) and all
constraints matched exactly. `schema.sql` was then run against a *fresh*
database and diffed the same way — zero unexpected differences, only the 5
intentional changes listed above.
