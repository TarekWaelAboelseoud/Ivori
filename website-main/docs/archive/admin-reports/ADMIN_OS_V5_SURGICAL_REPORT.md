# Admin OS V5 Surgical Report

## Duplication Root Cause

The admin shell itself was not mounted twice. The duplicated vertical feel came from `/studio-ops/overview/page.tsx` re-exporting the root command-center page while that shared page rendered a metric grid plus a second card-based operating-focus dashboard. The result looked like two overview sections stacked together. V5 keeps a single shell and replaces the second card block with one compact operating table.

## Changed

- Central role/permission map added in `lib/admin/permissions.ts`.
- Admin nav rebuilt as company modules and filtered by server-resolved role.
- Admin pages now show a clean 403 state when the effective role lacks access.
- Finance, receipts, clients, ops item, admin user, and inquiry APIs enforce server-side permissions.
- Inquiries support operational statuses, urgent priority, source, location fields, owner/linkage fields, archive timestamp, richer search/filtering, activity logging, and customer linkage.
- Customer database foundation added: `companies`, `contacts`, `client_timeline`.
- Admin typography tightened to sans-serif operational styling.

## Permissions Matrix

- `administrator`: all modules, read/write/admin.
- `finance`: command read, clients read, finance write, receipts write.
- `operations`: command read, inquiries write, clients write, studio write.
- `sales`: command read, inquiries write, clients write.
- `content_studio`: command read, studio write, clients read.
- `viewer`: command read, inquiries read, clients read, studio read.

## Routes Protected

- `/studio-ops/overview`
- `/studio-ops/inquiries`
- `/studio-ops/clients`
- `/studio-ops/finance`
- `/studio-ops/receipts`
- `/studio-ops/users`

Existing proxy protection still protects all `/studio-ops/*` routes.

## APIs Protected

- `/api/studio-ops/inquiries/[id]`
- `/api/studio-ops/inquiries/[id]/convert`
- `/api/studio-ops/ops-items`
- `/api/studio-ops/ops-items/[id]`
- `/api/studio-ops/admin-users`
- `/api/studio-ops/admin-users/[id]`
- `/api/studio-ops/finance-records`
- `/api/studio-ops/finance-records/[id]`
- `/api/studio-ops/receipts`
- `/api/studio-ops/receipts/[id]`
- `/api/studio-ops/clients`
- `/api/studio-ops/clients/[id]`

## SQL

Run `supabase/ivori-ops-v5.sql` after V4. It is idempotent and preserves existing data.

## Remaining Risks

- Current shared-password auth has no true per-user identity, so `ADMIN_ROLE`/`STUDIO_OPS_ROLE` provides the effective role until email login lands.
- Some older inquiry rows may still have legacy statuses; the UI now uses the new lifecycle going forward.
- Customer linkage is manual conversion, not automatic deduplication yet.
