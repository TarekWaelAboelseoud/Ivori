# Technical SEO V2

Date: 2026-05-22

## Build

`npm.cmd run build` passed on Next.js 16.2.6.

## Metadata

- Homepage title and description now include exact Ivori Digitals positioning.
- Global keywords include branded disambiguation terms.
- Canonical and hreflang remain intact.
- OpenGraph/Twitter metadata remain consistent.
- Manifest and icon chain remain active.

## Structured Data

Global graph includes:

- Organization
- Brand
- LocalBusiness / ProfessionalService
- WebSite
- SearchAction
- Service catalog

Page-level schemas include:

- Homepage WebPage
- Homepage FAQPage
- Service schemas
- CreativeWork for work pages
- Article for notes
- BreadcrumbList for details

## Indexing

- Public pages remain indexable.
- Admin/private routes remain noindex and no-store.
- Sitemap priority increased for work pages:
  - KVL: `0.92`
  - Featured work: `0.82`
  - Other work: `0.72`

## Performance

- No heavy new client dependencies were added.
- JSON-LD is server-rendered.
- Icon/manifest routes are App Router metadata routes.
- Homepage cinematic section height reduced to lower perceived scroll weight.

## Security Regression Check

Validated locally:

- `/studio-ops/login`: private no-store, noindex.
- `/api/studio-ops`: 401, private no-store, `Vary: Cookie, Authorization`.
- `/admin`: 404.
- `/robots.txt`: no admin/API route hints.

## Remaining Technical Recommendations

- Replace placeholder `sameAs` URLs with confirmed live accounts.
- Consider a nonce-based CSP in a separate security pass.
- Add a real on-site search before expanding SearchAction further.
