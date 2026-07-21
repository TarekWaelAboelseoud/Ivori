# Cache Behavior Fixes

## Admin Pages

- `/studio-ops/login` now calls `connection()` before render.
- `/studio-ops/(console)/layout.tsx` now calls `connection()` before rendering protected shell content.
- Admin segments export:
  - `dynamic = 'force-dynamic'`
  - `revalidate = 0`
  - `fetchCache = 'force-no-store'`

## Admin APIs

Every `/api/studio-ops/*` handler now uses the shared admin response helper or applies equivalent headers after cookie mutation.

Required headers:

```http
Cache-Control: private, no-store, no-cache, max-age=0, must-revalidate
Vary: Cookie, Authorization
X-Robots-Tag: noindex, nofollow, noarchive
```

## Validation Targets

After deployment, verify:

```bash
curl -i https://www.ivoridigitals.com/studio-ops/login
curl -i -H "RSC: 1" https://www.ivoridigitals.com/studio-ops/login
curl -i https://www.ivoridigitals.com/api/studio-ops
curl -i https://www.ivoridigitals.com/robots.txt
```

Expected:

- No `X-Nextjs-Prerender` on admin login or admin RSC responses.
- No `X-Vercel-Cache: HIT` or `X-Vercel-Cache: PRERENDER` on admin login.
- No admin nav, route map, runtime diagnostics, env names, or repo references in unauthenticated login HTML/RSC.
- Protected API 401 responses are private/no-store.
