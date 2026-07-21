# Environment runtime audit — Ivori Digitals

Use this when `/studio-ops/inquiries` or `/studio-ops/queue` fail in production.

---

## Required for admin + inquiries (Production)

| Variable | Scope | Valid example | Common failure |
|----------|--------|---------------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Production, Preview | `https://abcdefgh.supabase.co` | `/rest/v1` suffix, trailing space |
| `SUPABASE_SERVICE_ROLE_KEY` | Production, Preview | `eyJhbG…` (100+ chars) | Missing on Production only, newline in value |
| `ADMIN_PASSWORD` | Production, Preview | Strong secret, 8+ chars | Trailing newline → login works but hash mismatch rare if trimmed |

## Recommended

| Variable | Notes |
|----------|--------|
| `NEXT_PUBLIC_SITE_URL` | `https://www.ivoridigitals.com` |
| `ADMIN_PATH` | Default `/studio-ops` — if custom, proxy matcher auto-syncs |
| `ADMIN_API_PATH` | Default `/api/studio-ops` |
| `NEXT_PUBLIC_WHATSAPP_CHANNEL` | `footer` \| `off` \| `float` |

## Not required for inquiries console

| Variable | Used for |
|----------|----------|
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Future client reads only |
| `RESEND_*` | Contact email notifications |
| `ANTHROPIC_API_KEY` | Lead assess/outreach |
| `LEMONSQUEEZY_*` | Paid orders queue |

---

## Verify in production (after login)

Open (while signed in):

```
https://www.ivoridigitals.com/api/studio-ops/health
```

Expect JSON:

- `ok: true`
- `supabaseConfigured: true`
- `supabase.ok: true`
- `env` entries with `ok: true` for URL + service key + admin password

If `401` → auth/cookie issue (see proxy matcher).  
If `supabase.error` mentions **column** → re-run `supabase/ivori-production-v2.sql`.

---

## Route consistency (verified)

| Surface | Path |
|---------|------|
| Console UI | `/studio-ops/*` |
| Console API | `/api/studio-ops/*` |
| Login | `/studio-ops/login` |
| Auth | `POST /api/studio-ops/auth` |
| Decoy | `/admin` → 404 |

No live code references `/api/admin` for mutations (decoy 404 only).

---

## Preview vs Production mismatch

Symptoms:

- Login works on preview URL but inquiries empty on production
- Different Supabase projects per environment

Fix: Copy Production env vars to Preview, or use one Supabase project intentionally.

---

## Post-deploy checklist

1. Vercel → Settings → Environment Variables → Production
2. Redeploy (required after env change)
3. Supabase SQL: v2 + hotfix if `updated_at` was missing
4. `/api/studio-ops/health` → `ok: true`
5. `/studio-ops/inquiries` loads list
