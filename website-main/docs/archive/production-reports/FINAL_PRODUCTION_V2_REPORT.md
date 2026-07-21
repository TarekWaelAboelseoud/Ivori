# Ivori Digitals — Production V2 Report

**Date:** 2026-05-19  
**Scope:** Operational maturity — no redesign  
**Build:** `npm run build` — pass (37 routes)  
**Commit:** pending push after this report

---

## Summary

Production V2 adds a consolidated Supabase schema, professional inquiry pipeline, mature studio console, security hardening v3, Arabic typography fixes, intentional WhatsApp UX, richer contact qualification, and deployment documentation.

**KVL flagship case study unchanged** — portfolio focus preserved.

---

## 1. Database — `supabase/ivori-production-v2.sql`

Replaces v1 as the canonical migration. Idempotent pattern: create → add columns → defaults → indexes → RLS.

### `studio_inquiries` (extended)

Qualification: `project_type`, `project_stage`, `budget_range`, `timeline`, `goals`, `pain_points`, `revenue_band`  
Channels: `preferred_contact_method`, `whatsapp`, `instagram`, `company_name`  
Ops: `archived`, `tags[]`, `assigned_to`, `last_contacted_at`, `internal_summary`, `follow_up_date`, `lead_score`, `updated_at`

### New tables

| Table | Purpose |
|-------|---------|
| `inquiry_activity_log` | Structured timeline (`inquiry_id`, `action`, `actor`, `metadata`) |
| `admin_settings` | Site, WhatsApp, SEO, feature toggles (JSON per key) |
| `admin_audit_log` | Auth failures, settings/inquiry updates (IP hashed) |

### Retained

`leads`, `orders`, `audits` — compatible with existing console routes.

**Migration:** Run full v2 file once in Supabase SQL Editor. Safe on existing v1 databases.

---

## 2. Admin maturity

### `/studio-ops/inquiries`

- Qualification panel (type, stage, budget, goals, pain, channels)
- Lead score, assigned operator, follow-up date, tags
- Archive / restore quick action
- Mark contacted, internal summary
- Sort: newest, oldest, priority, **score**, **follow-up**
- Filter: archived queue

### `/studio-ops/settings`

- Maintenance flag
- WhatsApp channel: off / footer / float
- SEO title/description overrides (stored in DB)

### API

- `PATCH /api/studio-ops/inquiries/[id]` — extended fields + audit log
- `GET/PATCH /api/studio-ops/settings`

---

## 3. Security hardening v3

| Area | Change |
|------|--------|
| CSP | Tighter: no `unsafe-eval`, `object-src 'none'`, font https |
| Headers | `X-Permitted-Cross-Domain-Policies: none` |
| Auth | Rate limit 8/min; audit on fail/success/rate-limit |
| Admin routes | `noindex`, `no-store` cache (unchanged) |
| Audit | `admin_audit_log` + `lib/security/audit.ts` |
| Contact API | Structured validation via `parseInquiryBody` |

**Unchanged:** `/admin` 404 decoy, `/studio-ops` cookie auth, service-role-only Supabase access.

---

## 4. Contact form

Four steps: Brand → Scope → Fit → Contact  
Structured fields map to DB columns (not only `about` blob).  
Optional: revenue band, pain points, Instagram, preferred channel.

---

## 5. Arabic fixes

- `Noto Sans Arabic` on `[dir=rtl]` layout via `fontArabic.className`
- Disabled `letter-spacing` / `uppercase` on RTL body text (fixes broken glyph shaping)
- Relaxed measure constraints on Arabic headings
- Removed uppercase tracking on AR hero footer line

---

## 6. WhatsApp

- **Removed** green floating popup from `/ar`
- **Added** premium bottom strip (`WhatsAppStrip`) when settings + env allow `footer` channel
- Console setting: off / footer / float
- Env: `NEXT_PUBLIC_WHATSAPP_CHANNEL` (default `footer`)

---

## 7. SEO / site

- Sitemap: work, notes, `/ar` (existing)
- Canonical: `www` (existing)
- Settings table ready for title/description overrides (wire to layout optional later)

---

## Changed files (primary)

| Area | Files |
|------|--------|
| SQL | `supabase/ivori-production-v2.sql` |
| Inquiries | `lib/inquiries/types.ts`, `persist.ts`, `activity.ts`, `file-store.ts` |
| Security | `lib/security/sanitize.ts`, `audit.ts`, `headers.ts` |
| Admin | `app/studio-ops/inquiries/*`, `settings/*`, `api/studio-ops/*` |
| Contact | `components/studio/InquiryFlow.tsx`, `app/api/contact/route.ts` |
| Arabic | `app/ar/*`, `app/globals.css`, `components/studio/WhatsAppStrip.tsx` |
| Docs | `VERCEL_ENV_SETUP.md`, this report |

---

## Deployment notes

1. Run **`supabase/ivori-production-v2.sql`** in Supabase (production project).
2. Set Vercel env per **`VERCEL_ENV_SETUP.md`**.
3. Push `main` → Vercel deploy.
4. Smoke test checklist in env doc.

---

## Risks

| Risk | Mitigation |
|------|------------|
| v2 columns missing before deploy | Run SQL before or immediately after deploy |
| Audit/settings tables absent | App degrades gracefully; audit is best-effort |
| Old inquiries lack structured fields | Qualification panel shows empty; `about` still visible |
| WhatsApp float if channel set to `float` | Default footer; change in settings |

---

## Remaining optional upgrades

- Wire SEO overrides from `admin_settings` into `app/layout.tsx` metadata
- Maintenance mode middleware from settings
- Public inquiry status page (tokenized)
- GA4 env + script
- Arabic `/work` mirror
- Redis-backed rate limits for multi-instance Vercel

---

## Performance impact

**Neutral.** Admin pages are dynamic; public site unchanged in weight. No new client animation libraries.
