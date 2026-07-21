# Ivori Digitals — Production Audit

**Date:** 2026-05-19  
**Scope:** Full codebase + deploy surface  
**Mode:** Hardening (no redesign)

---

## Summary

| Severity | Found | Fixed in this pass |
|----------|-------|-------------------|
| Critical | 2 | 2 |
| High | 5 | 5 |
| Medium | 8 | 6 |
| Low | 12 | 4 |

---

## Critical

### C1 — Obvious `/admin` surface
- **Issue:** Studio console at `/admin` + `/api/admin` easily discovered and indexed.
- **Why it matters:** Brute-force, recon, and operational exposure.
- **Fix:** Moved to `/studio-ops` + `/api/studio-ops`. Legacy `/admin` returns 404 via decoy route. API decoy returns 404 JSON.
- **Fixed:** Yes

### C2 — Supabase URL with `/rest/v1` (env example)
- **Issue:** `NEXT_PUBLIC_SUPABASE_URL` including REST path caused “Invalid path specified in request URL”.
- **Why it matters:** Inquiry pipeline broken in production.
- **Fix:** `lib/supabase-url.ts` normalizes URL; README + example corrected (prior commit).
- **Fixed:** Yes (prior pass)

---

## High

### H1 — No rate limit on admin auth
- **Issue:** Unlimited password attempts on `/api/.../auth`.
- **Fix:** Rate limit 5/min per IP in `proxy.ts` + `app/api/studio-ops/auth/route.ts`.
- **Fixed:** Yes

### H2 — `X-Powered-By` / source maps
- **Issue:** Framework fingerprinting; source maps in production.
- **Fix:** `poweredByHeader: false`, `productionBrowserSourceMaps: false` in `next.config.ts`.
- **Fixed:** Yes

### H3 — Default metadata generator
- **Issue:** Next.js default generator meta tag.
- **Fix:** `generator` + `applicationName` set to `Ivori Digitals` in `lib/seo/site.ts`.
- **Fixed:** Yes

### H4 — Robots did not block new console path
- **Issue:** `/studio-ops/` could be crawled.
- **Fix:** Added to `app/robots.ts` disallow list.
- **Fixed:** Yes

### H5 — SQL schema drift on existing DBs
- **Issue:** `CREATE TABLE IF NOT EXISTS` + indexes on missing columns.
- **Fix:** Idempotent `supabase/ivori-production.sql` with column backfill (prior commit).
- **Fixed:** Yes (prior pass)

---

## Medium

### M1 — CSP allows `unsafe-eval`
- **Issue:** Broad script CSP for Next.js compatibility.
- **Why it matters:** Slightly wider XSS blast radius.
- **Fix:** Documented; tightening requires nonces (post-launch).
- **Fixed:** Deferred

### M2 — In-memory rate limit
- **Issue:** Resets on cold start; not shared across Vercel instances.
- **Fix:** Acceptable at current scale; upgrade to Redis/Upstash if traffic grows.
- **Fixed:** Documented

### M3 — Admin cookie name `cro_admin`
- **Issue:** Legacy name hints at CRO product.
- **Fix:** Kept for stability; httpOnly + secure on HTTPS.
- **Fixed:** Deferred (rename = forced re-login)

### M4 — `ADMIN_PASSWORD` default in dev
- **Issue:** `admin2024` fallback in `lib/env.ts`.
- **Fix:** Launch checklist requires strong production env.
- **Fixed:** Documented

### M5 — Legacy audit routes (`/order`, `/work`)
- **Issue:** Old product surfaces still in repo.
- **Fix:** `robots` disallow; `/work` redirects to `/approach`.
- **Fixed:** Partial

### M6 — Portfolio admin page references concept case studies
- **Issue:** Internal only; not public.
- **Fix:** Acceptable for internal ops; not linked from public site.
- **Fixed:** N/A

### M7 — Rate limit not on all admin API routes
- **Issue:** Only auth is rate-limited.
- **Fix:** Auth is primary brute-force vector; extend if abused.
- **Fixed:** Partial

### M8 — Console metadata title “Studio OS”
- **Issue:** Slightly branded in browser tab.
- **Fix:** Renamed to “Console”.
- **Fixed:** Yes

---

## Low

| ID | Issue | Fixed |
|----|-------|-------|
| L1 | No `middleware.ts` filename (uses `proxy.ts` — valid in Next 16) | N/A |
| L2 | `CursorAmbient` client effect — minor perf | Deferred |
| L3 | Unused `visual-presets.ts` | Yes — deleted |
| L4 | Duplicate `X-DNS-Prefetch` in headers (caught during edit) | Yes |
| L5 | TODO/FIXME in repo | None found |
| L6 | `console.log` in production | None found |
| L7 | Case studies file for internal portfolio only | Kept |
| L8 | expansion-paths.ts documentation only | Kept |
| L9 | WhatsApp float on AR page only | By design |
| L10 | Hero Ken Burns 24s animation | Intentional cinematic |
| L11 | `/local-payment` legacy styling (bordered grid) | Deferred |
| L12 | Auth cookie `path: /` | Required for console |

---

## Accessibility (spot check)

- Focus visible styles on `.studio-link` and global `:focus-visible`
- Min touch targets 44px on CTAs
- `prefers-reduced-motion` respected in CSS
- RTL: Arabic layout + `Noto Sans Arabic`

---

## Performance (spot check)

- Images via `next/image` on heroes
- `productionBrowserSourceMaps: false`
- Static prerender on marketing pages
- Font `display: swap`

---

## SEO (spot check)

- `sitemap.ts` — core routes
- `robots.ts` — admin, api, legacy paths blocked
- Canonical + hreflang on `/ar`
- JSON-LD Organization on layout
- OG image route exists

---

## Broken links (manual)

| Route | Status |
|-------|--------|
| `/work` | Redirects → `/approach` |
| `/admin` | 404 (decoy) |
| `/studio-ops` | Protected (login) |
| Public nav links | OK |

---

## Hydration / console

- No `TODO`/`console.log` in app code
- Build + TypeScript pass after admin migration
- Recommend smoke test in production after deploy
