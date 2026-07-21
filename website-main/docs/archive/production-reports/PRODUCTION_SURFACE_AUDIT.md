# Production Surface Audit

Date: 2026-05-22

## Preserved Security Surfaces

- `/studio-ops/*` remains dynamic.
- `/api/studio-ops/*` remains dynamic.
- Protected admin/API routes keep private no-store behavior.
- `/admin` remains a hardened 404 decoy.
- `productionBrowserSourceMaps` remains disabled.
- Robots does not advertise `/studio-ops`, `/api`, or `/admin`.

## Header Status

Observed locally:

- `Strict-Transport-Security`
- `X-Frame-Options`
- `X-Content-Type-Options`
- `Referrer-Policy`
- `Permissions-Policy`
- `Content-Security-Policy`
- Admin `X-Robots-Tag`

## Public Metadata Surface

Public metadata intentionally exposes:

- Brand name.
- Cairo/Egypt/MENA positioning.
- Service categories.
- Public social/entity URLs.
- Sitemap routes for public pages.

No admin architecture was added to public metadata.

## Admin Smoke Checks

- `/studio-ops/login`: `200 OK`, private no-store, noindex.
- `/api/studio-ops`: `401 Unauthorized`, private no-store.
- `/admin`: `404 Not Found`.

## Remaining Acceptable Risks

- Public JS still reveals normal public site routes and Next.js runtime chunks, as expected for a public App Router site.
- CSP still uses `unsafe-inline` to preserve existing app behavior.
- Some legacy public SVG assets remain in `/public`; these are not sensitive but can be cleaned in a future asset hygiene pass.
