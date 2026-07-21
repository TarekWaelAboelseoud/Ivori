# Admin Security Review V3

## Preserved

- `/studio-ops` remains protected by the existing admin cookie gate in `proxy.ts`.
- `/api/studio-ops/*` remains protected by the proxy matcher.
- `/admin` remains a hardened 404 route.
- Admin responses keep private/no-store cache headers and noindex headers.
- New admin pages are dynamic/no-store.

## Added

- New API routes validate categories, statuses, priorities, roles, email, URL, and dates.
- Writes use in-memory rate limits consistent with existing project utilities.
- Ops and user actions are logged to `ops_activity_log`.
- New tables have RLS enabled and deny public access.

## Residual Risk

- Until per-user authentication is implemented, `actor_email` cannot be reliably populated.
- Service-role server access must remain server-only and never ship to public bundles.
- Role records are placeholders until API routes enforce role permissions.

## Smoke Tests

- Unauthenticated `/api/studio-ops/ops-items` should return `401`.
- Unauthenticated `/studio-ops/leads` should redirect to `/studio-ops/login`.
- `/admin` should remain `404`.
- `/studio-ops/login` should still render.
- Authenticated quick add, done, archive, and admin user edits should work after SQL is run.
