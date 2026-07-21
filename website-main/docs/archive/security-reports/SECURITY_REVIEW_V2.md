# Security Review V2 — Ivori Digitals

**Date:** 2026-05-19

---

## Summary

| Area | Status |
|------|--------|
| Console auth | **Fixed** — unified hashing, reliable cookies |
| Headers | Good — HSTS, CSP, nosniff, no X-Powered-By |
| Indexing | Console + API blocked in robots |
| Contact API | Rate limited + sanitized |
| Admin discoverability | `/admin` 404 decoy; console at `/studio-ops` |

---

## Attack surface

| Endpoint | Public | Controls |
|----------|--------|----------|
| Marketing pages | Yes | CSP, static/SSR |
| `POST /api/contact` | Yes | 6/min IP, validation |
| `POST /api/studio-ops/auth` | Yes (obscured path) | 10/min IP, password |
| Other `/api/studio-ops/*` | No | Cookie + proxy |
| `POST /api/checkout`, webhook, intake | Yes | Secrets + validation |

---

## Admin auth (fixed)

**Root cause of login failure:**
1. Possible hash mismatch between Edge proxy and Node auth route
2. Aggressive double rate limiting
3. Client-side navigation not always sending new cookie

**Remediation:**
- `lib/admin/session.ts` — single SHA-256 via Web Crypto (Edge + Node)
- `env.adminPassword` trimmed
- Login uses `credentials: 'same-origin'` + full page redirect
- Logout clears cookie with `path: '/'`

---

## Headers

- `poweredByHeader: false`
- `productionBrowserSourceMaps: false`
- Console routes: `X-Robots-Tag: noindex`
- Referrer-Policy: strict-origin-when-cross-origin

---

## Recommendations

1. Set strong unique `ADMIN_PASSWORD` in Vercel (rotate quarterly)
2. Optional: custom `ADMIN_PATH` env + update `proxy.ts` matcher
3. Optional: Upstash Redis for rate limits at scale
4. Keep repo private; never commit `.env.local`

---

## Cookie

| Property | Value |
|----------|-------|
| Name | `cro_admin` |
| httpOnly | true |
| secure | true on HTTPS |
| sameSite | lax |
| path | `/` |
| maxAge | 7 days |
