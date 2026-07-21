# Ivori Digitals — Company-grade rebuild report

**Live:** https://www.ivoridigitals.com/  
**Date:** 2026-05-19

---

## 1. Commit & deployment

| Item | Value |
|------|--------|
| Commit | *(see `git log -1` after push)* |
| Branch | `main` |
| Vercel | Auto-deploy from GitHub push |
| Alias | https://www.ivoridigitals.com |

---

## 2. Logo / favicon fixes

**Problem:** Generic framework triangle / awkward “ID” circle.

**Fix:**
- Shared **`IvoriIconMark`** — serif **“I”** in gold-bordered square (`lib/brand/icon-mark.tsx`)
- Updated: `app/icon.tsx`, `app/apple-icon.tsx`, `app/opengraph-image.tsx`, `public/ivori-icon.svg`
- Nav/footer/admin/invoice use **`IvoriMark`** component
- Metadata icons → `/icon/32`, `/icon/192`, `/icon/512`, SVG
- **`/favicon.ico`** → rewrite to `/icon/32` in `next.config.ts`
- Removed “ID” pill from public nav

---

## 3. Theme bulb (global ivory mode)

**Component:** `components/PublicThemeBulb.tsx`

- Hanging cord + bulb (not pill toggle)
- Default **dark**; click pulls cord → smooth transition to **ivory**
- Persists via `localStorage` key `ivori-public-theme`
- No flash: inline boot script in `app/layout.tsx` sets `data-public-theme` before paint
- CSS transitions on `html`/`body` + `.theme-bulb-*` in `globals.css`
- Accessible: `aria-label`, `aria-pressed`, keyboard Enter/Space
- Used in desktop + mobile nav on all public pages

---

## 4. Work section composition

- **ARK** = primary (flagship), full split card on `/work`
- **KVL** = secondary compact row (not oversized hero)
- Removed “Client project / Production” label noise → `Production · Commerce` / `Fashion · Commerce`
- Homepage teaser: side-by-side primary + compact secondary (no empty half-panel)
- Tighter section heights (`size="sm"`)

---

## 5. Admin password — `ivori52`

| Location | Behavior |
|----------|----------|
| `lib/env.ts` | Dev fallback: **`ivori52`** when `ADMIN_PASSWORD` unset (production fallback: empty → login fails) |
| `.env.local.example` | `ADMIN_PASSWORD=ivori52` |
| `VERCEL_ENV_SETUP.md` | Documents production must set `ADMIN_PASSWORD` in Vercel |
| `app/api/studio-ops/auth/route.ts` | Server-only compare against `env.adminPassword` |

**Action required:** Set **`ADMIN_PASSWORD=ivori52`** (or your chosen secret) on **Vercel → Production** and redeploy. Password is **never** in client bundle.

---

## 6. Studio Ops modules

Existing v3–v5 schema + consoles retained. This pass:

| Module | Route | Status |
|--------|-------|--------|
| Command Center | `/studio-ops/overview` | Metrics + activity |
| Leads & Inquiries | `/studio-ops/inquiries` | Full console |
| Clients CRM | `/studio-ops/clients` | v4/v5 tables |
| **Projects & Delivery** | `/studio-ops/projects` | **NEW** — delivery queue |
| Finance | `/studio-ops/finance` | Invoices, records |
| Receipts | `/studio-ops/receipts` | Review workflow |
| Content | `/studio-ops/content` | Content calendar |
| Internal Ops | `/studio-ops/internal-ops` | Company tasks |
| Admin Users | `/studio-ops/users` | Team records |
| System | `/studio-ops/system` | Settings |

Legacy routes (`/queue`, `/playbook`, `/leads`, etc.) → redirect to overview/inquiries/system.

---

## 7. Invoice print

- Protected route: `/studio-ops/finance/invoices/[id]/print`
- Ivori branding via `IvoriMark`
- Print CSS + `PrintButton` (browser Save as PDF)
- Line items, totals, status, due date

---

## 8. SEO

- Work page + Egypt/MENA service keywords
- `/approach` → **301** to `/process`
- Icons/OG use Ivori mark (not generic)
- Existing schema/sitemap/robots preserved

---

## 9. Security

- `/admin` → hardened 404
- `/studio-ops/*` proxy auth
- `robots.txt` blocks admin/API
- CSP unchanged (`lib/security/headers.ts`)
- Invoice print requires finance permission

---

## 10. Smoke test checklist

### Public (after deploy)

- [ ] `/` — Ivori mark, theme bulb works
- [ ] `/work`, `/work/ark`, `/work/kvl`
- [ ] `/process`, `/contact`, `/cro`, `/shopify`, `/media-buying`, `/ai-production`, `/ar`
- [ ] `/icon/32`, `/robots.txt`, `/sitemap.xml`

### Admin

- [ ] `/studio-ops/login` (password from Vercel env)
- [ ] `/studio-ops/overview`, `/inquiries`, `/clients`, `/projects`, `/finance`, `/receipts`
- [ ] `/admin` → 404

---

## 11. Remaining risks

1. **Vercel `ADMIN_PASSWORD`** must be updated manually to `ivori52` (or new secret) — code does not change production env.
2. Full CRM/finance features require Supabase migrations **v4 + v5** applied.
3. Projects module shares `ops_items` category `clients` — distinct from CRM `clients` table (delivery queue vs company records).

---

## 12. Changed files (summary)

Brand: `lib/brand/icon-mark.tsx`, `components/brand/IvoriMark.tsx`, icons, `public/ivori-icon.svg`  
Theme: `PublicThemeBulb.tsx`, `globals.css`, `Nav.tsx`  
Work: `selected-work.ts`, `work/page.tsx`, `SelectedWorkTeaser.tsx`  
Admin: `projects/page.tsx`, `SpecializedOpsConsole.tsx`, `AdminShell.tsx`, invoice print  
Config: `lib/env.ts`, `next.config.ts`, `.env.local.example`, `VERCEL_ENV_SETUP.md`
