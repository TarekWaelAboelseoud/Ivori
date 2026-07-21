# Ivori Digitals — Security Surface Report

**Date:** 2026-05-19

---

## Attack surface overview

| Surface | Exposure | Protection |
|---------|----------|------------|
| Public marketing pages | Internet | Static/SSR, CSP, HSTS |
| `/contact` API | Internet | Rate limit, sanitization |
| `/api/checkout`, `/api/webhook`, `/api/intake` | Internet | Provider secrets, validation |
| `/studio-ops` | Obscured URL | Cookie auth, proxy, noindex |
| `/api/studio-ops/*` | Obscured URL | Cookie auth via proxy, 401 JSON |
| Legacy `/admin` | Decoy 404 | `notFound()` page |
| Legacy `/api/admin` | Decoy 404 | JSON 404 handler |
| Supabase | Backend | Service role server-only, RLS enabled |

---

## Public routes (indexable)

`/`, `/ar`, `/contact`, `/approach`, `/ai-production`, `/cro`, `/shopify`, `/media-buying`

**Not indexed (robots):** `/admin/`, `/studio-ops/`, `/api/`, `/work/`, `/order/`, `/success/`

---

## Console (formerly admin)

| Item | Detail |
|------|--------|
| **URL** | `/studio-ops` (override via `ADMIN_PATH`) |
| **API** | `/api/studio-ops` (override via `ADMIN_API_PATH`) |
| **Auth** | `ADMIN_PASSWORD` → SHA-256 cookie `cro_admin` |
| **Session** | 7 days, httpOnly, secure on HTTPS, sameSite lax |
| **Brute force** | 5 attempts/min/IP on auth |
| **Metadata** | `noindex`, title “Console” |
| **Headers** | `X-Robots-Tag: noindex, nofollow, noarchive` on console paths |

**Operational note:** Bookmark `/studio-ops/login` — do not link from public site.

---

## Middleware / proxy (`proxy.ts`)

- Matcher: `/studio-ops/:path*`, `/api/studio-ops/:path*`
- Unauthenticated → redirect to login or 401 JSON
- Applies global security headers + console cache headers

---

## Security headers (`lib/security/headers.ts`)

| Header | Value |
|--------|--------|
| HSTS | 2y, includeSubDomains, preload |
| X-Frame-Options | SAMEORIGIN |
| X-Content-Type-Options | nosniff |
| Referrer-Policy | strict-origin-when-cross-origin |
| Permissions-Policy | camera/mic/geo off |
| CSP | default-src self; img https; connect https |

**Removed:** `X-Powered-By` (via Next config)

---

## API hardening

| Route | Controls |
|-------|----------|
| `POST /api/contact` | Rate limit 6/min, `parseContactBody`, HTML escape in email |
| `POST /api/studio-ops/auth` | Rate limit 5/min, generic errors |
| Admin mutations | Auth required via proxy |
| Webhook | LemonSqueezy secret (verify in route) |

---

## Data layer

- **Supabase:** `ivori-production.sql` — RLS on, permissive policies for service role
- **Service role:** Server-only env `SUPABASE_SERVICE_ROLE_KEY`
- **Never expose:** Service role, `ADMIN_PASSWORD`, webhook secrets in client bundle

---

## Admin discoverability review

| Vector | Risk | Mitigation |
|--------|------|------------|
| `/admin` URL | Was high | 404 decoy |
| robots.txt | Was medium | Disallow `/studio-ops/` |
| Sitemap | Low | Console not listed |
| GitHub source | Medium | Private repo recommended |
| Error messages | Low | Generic 401/404 |
| Bundle strings | Low | Paths are string literals — obscurity only |

**Recommendation:** Set custom `ADMIN_PATH` in Vercel env (e.g. `/ivori-ops-8f3k`) and update `proxy.ts` matcher to match.

---

## Remaining risks (accepted)

1. **Security through obscurity** on console path — combine with strong password.
2. **CSP unsafe-inline/unsafe-eval** — Next.js constraint.
3. **Single-factor password auth** — sufficient for solo studio ops; add 2FA later if team grows.
4. **In-memory rate limits** — edge cold starts reset buckets.

---

## Incident response (minimal)

1. Rotate `ADMIN_PASSWORD` in Vercel → redeploy
2. Rotate `SUPABASE_SERVICE_ROLE_KEY` in Supabase
3. Change `ADMIN_PATH` + update proxy matcher + redeploy
4. Review Supabase logs for anomalous queries
