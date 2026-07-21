# Admin production debug — fix summary

**Issue:** Inquiries / queue pages not working in production after Supabase v2.

---

## Root causes identified

### 1. Incomplete v2 schema (most likely)

If v2 SQL failed partway (e.g. `updated_at` error), `select('*')` on `studio_inquiries` can fail with **column does not exist**. Pages then showed empty or errored silently (queue ignored `error`).

**Fix:** Re-run full `ivori-production-v2.sql` + `ivori-production-v2-hotfix.sql`.  
**Code fix:** Fallback selects (v2 → v1 columns) + visible error banners.

### 2. Missing `SUPABASE_SERVICE_ROLE_KEY` on Vercel Production

Server pages use service role only. Without it, `getDb()` is null → “Supabase not configured” (inquiries showed banner; queue showed generic empty).

**Fix:** Set key on **Production** scope, redeploy.

### 3. Proxy matcher gap (fixed)

Matcher was only `/studio-ops/:path*` which may not match `/studio-ops` exactly. Now includes `/studio-ops` root plus API paths. **Note:** Next.js requires a static matcher in `proxy.ts`; if you change `ADMIN_PATH` env, update `proxy.ts` matchers manually (see `adminProxyMatchers()` in `lib/admin/paths.ts` for reference).

### 4. Malformed Supabase URL

`/rest/v1` suffix breaks all queries. App strips it — still best to fix in Vercel.

### 5. RLS — not the issue

Service role bypasses RLS. Policies are permissive for service role.

---

## Code changes in this fix

| File | Change |
|------|--------|
| `proxy.ts` | Static matcher: `/studio-ops`, `/studio-ops/:path*`, `/api/studio-ops`, `/api/studio-ops/:path*` |
| `lib/admin/paths.ts` | `adminProxyMatchers()` (reference if env paths change) |
| `lib/admin/runtime.ts` | Env audit + Supabase probe + logging |
| `lib/inquiries/persist.ts` | Schema drift fallback + logs |
| `lib/inquiries/supabase-select.ts` | Column lists |
| `lib/env.ts` | Trim service role key |
| `app/studio-ops/queue/page.tsx` | Explicit errors (no silent empty) |
| `app/studio-ops/page.tsx` | Explicit errors on count failure |
| `components/admin/AdminRuntimeBanner.tsx` | Top-of-console runtime warning |
| `app/api/studio-ops/health/route.ts` | JSON diagnostics (auth required) |

---

## Smoke test (production)

- [ ] `GET /api/studio-ops/health` (logged in) → `"ok": true`
- [ ] `/studio-ops/login` → sign in → redirect
- [ ] `/studio-ops/inquiries` → list or clear error banner
- [ ] `/studio-ops/queue` → table or clear error (empty = no orders OK)
- [ ] PATCH inquiry (status/tags) → saves
- [ ] `/admin` → 404

---

## If still broken

1. Vercel → Deployments → latest → Functions logs → search `[studio-ops:`
2. Health endpoint JSON → which `env` row is `ok: false`
3. Supabase → Table Editor → `studio_inquiries` has columns `archived`, `tags`, `updated_at`
