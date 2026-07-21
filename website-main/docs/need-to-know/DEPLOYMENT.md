# Deployment — Ivori Digitals

**Live domain:** https://www.ivoridigitals.com  
**Canonical repo:** linked to GitHub `main`

---

## Correct Vercel project (IMPORTANT)

| Field | Value |
|-------|--------|
| **Project name** | `shopify-cro` |
| **Project ID** | `prj_JcBbLeNegdFqi26upTICrCh6kbYM` |
| **Production alias** | `www.ivoridigitals.com`, `ivoridigitals.com` |

### Wrong project — do NOT deploy here

| Field | Value |
|-------|--------|
| **Legacy name** | `project-0f2s1` |
| **Why** | Previously held the domain alias; caused live site to lag behind `shopify-cro` builds |

If you deploy to the wrong project, **ivoridigitals.com will not update** even when GitHub push succeeds.

---

## Pre-deploy checklist

```bash
# 1. Confirm linked project
npm run verify:vercel
# Expected: ✓ Vercel project OK: shopify-cro

# 2. Lint + build
npm run lint
npm run build

# 3. Deploy production (runs verify first)
npm run deploy:prod
```

If `.vercel/project.json` is missing or wrong:

```bash
npx vercel link
# Select team → shopify-cro (NOT project-0f2s1)
```

---

## Domain workflow after deploy

After `npm run deploy:prod`, confirm the custom domain points at the new deployment:

```bash
# Inspect current domain target
npx vercel inspect ivoridigitals.com

# If domain shows wrong deployment, re-alias:
npx vercel alias set <deployment-url> ivoridigitals.com
npx vercel alias set <deployment-url> www.ivoridigitals.com
```

**GitHub → Vercel auto-deploy** only works when the GitHub integration is connected to **`shopify-cro`**. Check Vercel → Project Settings → Git.

---

## Supabase migrations (manual, production)

Run `supabase/schema.sql` in the Supabase SQL Editor (idempotent, safe to
re-run). It creates all 17 tables in one pass — see `supabase/README.md` for
what it replaces and why.

See `VERCEL_ENV_SETUP.md` for environment variables.

---

## Post-deploy smoke test

| URL | Expected |
|-----|----------|
| `/` | 200 |
| `/ar` | 200 (Arabic studio page, no USD pricing) |
| `/order` | 307 → `/contact` (no token); tokenized intake links still work |
| `/contact` | 200 |
| `/work` | 200 |
| `/process` | 200 |
| `/studio-ops/login` | 200 |
| `/admin` | **404** |
| `/api/studio-ops/finance-records` | **401** (unauthenticated) |
| `/robots.txt` | 200, blocks admin/API |
| `/sitemap.xml` | 200 |

---

## Environment

All production env vars: **`VERCEL_ENV_SETUP.md`**

Minimum for Studio Ops:

- `ADMIN_PASSWORD`
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL=https://www.ivoridigitals.com`
