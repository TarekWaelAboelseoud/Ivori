# Vercel environment variables — Ivori Digitals

Set these in **Vercel → Project `shopify-cro` → Settings → Environment Variables**.  
Apply to **Production**, **Preview**, and **Development** unless noted.

> **Deployment:** See **`DEPLOYMENT.md`** for the correct Vercel project, domain alias workflow, and pre-deploy checks (`npm run verify:vercel`).

---

## Required (production)

| Variable | Example | Notes |
|----------|---------|--------|
| `NEXT_PUBLIC_SITE_URL` | `https://www.ivoridigitals.com` | Canonical site URL. **No trailing slash.** |
| `ADMIN_PASSWORD` | `ivori52` (dev) / *(your production secret)* | Studio console at `/studio-ops/login`. **Production:** set in Vercel — not in client bundle. Local dev fallback is `ivori52` when unset. Trimmed — **no trailing newline**. |
| `SESSION_SECRET` | *(random 32+ byte string)* | Signs per-admin-user login and client account sessions (`/login`, `/portal`). Separate from `ADMIN_PASSWORD` — required for the newer per-user/client login paths to work at all. Local dev has an insecure fallback; **production must set a real value** or `/api/auth/login` and `/api/auth/register` return 503. Generate with `openssl rand -hex 32`. |
| `MFA_ENCRYPTION_KEY` | *(64-char hex string, 32 bytes)* | Encrypts TOTP/MFA secrets at rest for per-admin-user accounts. No dev fallback — MFA setup is unavailable anywhere until this is set. Generate with `openssl rand -hex 32`. |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://abcdefgh.supabase.co` | Project URL only — **not** `/rest/v1`. |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbG…` | **Server only.** Never expose to client. |

Run SQL migrations in Supabase (see `DEPLOYMENT.md`):

- `supabase/schema.sql` — creates all 17 tables in one pass

---

## Recommended (production)

| Variable | Example | Notes |
|----------|---------|--------|
| `ADMIN_EMAIL` | `hello@ivoridigitals.com` | Inquiry notification recipient. |
| `RESEND_API_KEY` | `re_…` | Email delivery for contact form **and** password reset / email verification links. Without it, those emails are silently skipped (logged server-side) rather than failing the request. |
| `RESEND_FROM_EMAIL` | `hello@ivoridigitals.com` | Must be verified in Resend. |
| `RESEND_FROM_NAME` | `Ivori Digitals` | Display name on outbound mail. |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | `201012345678` | Digits only (country code, no `+` or spaces). |
| `NEXT_PUBLIC_WHATSAPP_CHANNEL` | `footer` | `footer`, `off`, or `float`. |

---

## Optional — integrations

| Variable | Used for |
|----------|----------|
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Future client reads (not required for current console) |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Display / mailto fallback |
| `NEXT_PUBLIC_APP_URL` | Legacy checkout links; prefer `NEXT_PUBLIC_SITE_URL` |
| `NEXT_PUBLIC_CALENDLY_URL` | Booking link if enabled |
| `NEXT_PUBLIC_INSTAPAY_HANDLE` | Local payment page |
| `NEXT_PUBLIC_VODAFONE_CASH_NUMBER` | Local payment page |
| `NEXT_PUBLIC_BANK_TRANSFER_TEXT` | Local payment page |
| `ANTHROPIC_API_KEY` | Lead assess / outreach in console |
| `LEMONSQUEEZY_*` | Paid audit checkout (if used) |

### Lemon Squeezy (optional)

- `LEMONSQUEEZY_API_KEY`
- `LEMONSQUEEZY_STORE_ID`
- `LEMONSQUEEZY_WEBHOOK_SECRET`
- `LEMONSQUEEZY_VARIANT_*` (per tier/region)

### Analytics (optional)

- `NEXT_PUBLIC_GA_MEASUREMENT_ID` — add when GA4 is wired

---

## Environment scope

| Scope | Guidance |
|-------|----------|
| **Production** | All required + recommended. Use live Supabase, live Resend, `www` URL. |
| **Preview** | Same as production **or** separate Supabase project. Never use production `ADMIN_PASSWORD` on shared preview URLs if repo is public. |
| **Development** | `.env.local` — can omit Supabase (dev uses `.data/studio-inquiries.json` for inquiries). |

---

## Common mistakes

1. **Wrong Vercel project** — Deploying to `project-0f2s1` instead of **`shopify-cro`** leaves ivoridigitals.com on stale code. Run `npm run verify:vercel` before deploy.
2. **Trailing spaces** — `ADMIN_PASSWORD` copied with newline breaks login.
3. **Wrong Supabase URL** — Use root project URL only, not `/rest/v1`.
4. **Anon vs service role** — Console needs **service role** on server.
5. **Schema not run** — Run `supabase/schema.sql` before deploying, or admin/finance routes will fail on missing tables.

---

## Deployment checklist

1. `npm run verify:vercel` → must show `shopify-cro`
2. Set variables in Vercel Production (`shopify-cro` project)
3. Run `supabase/schema.sql` in Supabase
4. `npm run lint && npm run build`
5. `npm run deploy:prod` **or** push `main` (if Git linked to `shopify-cro`)
6. Confirm domain: `npx vercel inspect ivoridigitals.com`
7. Smoke test: `/`, `/ar`, `/contact`, `/order` → `/contact`, `/studio-ops/login`, `/admin` (404)

---

## Security

- Do **not** commit `.env.local`.
- Do **not** add `SUPABASE_SERVICE_ROLE_KEY` or `ADMIN_PASSWORD` to `NEXT_PUBLIC_*`.
- Rotate `ADMIN_PASSWORD` if exposed.
