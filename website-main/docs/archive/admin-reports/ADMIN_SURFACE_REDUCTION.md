# Admin Surface Reduction

## Scope

This pass did not redesign the admin or add features. It reduced unauthenticated operational intelligence and tightened cache/session behavior.

## Route Structure

The public path remains unchanged:

- Login: `/studio-ops/login`
- Console: `/studio-ops`
- Inquiries: `/studio-ops/inquiries`
- Leads: `/studio-ops/leads`
- Queue: `/studio-ops/queue`
- Settings: `/studio-ops/settings`

Internally, protected console pages now live under `app/studio-ops/(console)`. The route group preserves URLs while preventing `/studio-ops/login` from inheriting the authenticated admin shell.

## Removed From Pre-Auth Rendering

- Admin navigation
- Internal route names
- Runtime check banner
- Environment variable names
- Repo/documentation references
- Deployment instructions

## Deployment Notes

- Deploy to Vercel after build passes.
- Rotate `ADMIN_PASSWORD` after deployment to invalidate old deterministic hash cookies.
- Smoke-test login, logout, `/studio-ops/inquiries`, `/studio-ops/leads`, `/studio-ops/queue`, `/studio-ops/settings`, `/admin`, `/ar`, and `/contact`.
