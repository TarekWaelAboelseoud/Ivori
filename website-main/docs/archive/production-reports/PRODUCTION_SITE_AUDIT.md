# Production Site Audit — Ivori Digitals

**Live:** https://www.ivoridigitals.com/  
**Date:** 2026-05-19  
**Build:** Passes locally after fixes

---

## Critical (fixed this pass)

| ID | Issue | Why | Fix | Auto-fixed |
|----|-------|-----|-----|------------|
| C1 | Admin login silent failure | Proxy used Web Crypto hash; auth route used Node `crypto.createHash` — could mismatch; soft `router.push` did not always apply cookie | Unified `lib/admin/session.ts`; hard redirect `window.location.assign`; trim `ADMIN_PASSWORD` | Yes |
| C2 | Double rate limit on login | Proxy + route both counted attempts (5 max → ~2 tries) | Rate limit only on auth route (10/min) | Yes |
| C3 | Canonical host split | Live site on `www`; env default apex | Default URL `https://www.ivoridigitals.com`; apex → www redirect | Yes |

---

## High (fixed)

| ID | Issue | Fix | Auto-fixed |
|----|-------|-----|------------|
| H1 | No favicon | Weak brand in tabs | `app/icon.tsx` (gold I on void) | Yes |
| H2 | OG/Twitter missing image refs | Poor social previews | Linked `/opengraph-image` in metadata | Yes |
| H3 | Homepage copy wordy / agency-like | SEO + trust | Tighter hero, problem, bridges | Yes |
| H4 | `vercel.svg` / `next.svg` in public | Framework residue | Removed | Yes |
| H5 | Logout cookie not cleared reliably | Session stuck | Cookie delete with `path: '/'`, `maxAge: 0` | Yes |

---

## Medium (documented / partial)

| ID | Issue | Why | Fix | Auto-fixed |
|----|-------|-----|-----|------------|
| M1 | CSP `unsafe-inline` / `unsafe-eval` | Next.js requirement | Accept; tighten post-launch with nonces | No |
| M2 | In-memory rate limits | Vercel multi-instance | OK at current scale | No |
| M3 | `/local-payment` legacy bordered UI | Old product page | Defer harmonization | No |
| M4 | Legacy `/order`, `/success` routes | Audit product | robots disallow | Partial |
| M5 | No `apple-icon` separate asset | Uses generated icon | Optional later | No |
| M6 | `ADMIN_PASSWORD` must be set in Vercel | Empty → dev default | Document in checklist | No |

---

## Low

| ID | Issue | Status |
|----|-------|--------|
| L1 | Cursor ambient client JS | Intentional — minimal |
| L2 | SignatureGenesis long scroll | Cinematic — keep |
| L3 | concept case studies in internal portfolio | Internal only |
| L4 | No automated Lighthouse in CI | Manual post-deploy |

---

## Routes verified (build)

Public: `/`, `/ar`, `/contact`, `/approach`, `/ai-production`, `/cro`, `/shopify`, `/media-buying`  
Console: `/studio-ops/login` → `/studio-ops`  
Legacy: `/admin` → 404; `/work` → `/approach`

---

## Deployment impact

- **Requires Vercel env:** `ADMIN_PASSWORD` (trimmed, no trailing spaces), `NEXT_PUBLIC_SITE_URL=https://www.ivoridigitals.com`
- **No DB migration** this pass
- **Safe redeploy** — surgical copy + auth fix
