# Final Deploy Report

**Commit message:** `fix: admin auth, SEO tighten, production polish`  
**Date:** 2026-05-19

---

## What changed

### Admin login (critical)
- `lib/admin/session.ts` — shared password hash
- `proxy.ts` — same hash validation; redirect if already logged in
- `app/api/studio-ops/auth/route.ts` — unified hash; proper cookie delete
- `LoginForm.tsx` — full page redirect after success; better errors
- `LogoutButton.tsx` — reliable sign-out

### SEO
- Default canonical: `https://www.ivoridigitals.com`
- Apex → www redirect in `next.config.ts`
- Shorter homepage copy + metadata
- OG/Twitter images linked
- `app/icon.tsx` favicon

### Cleanup
- Removed `public/vercel.svg`, `public/next.svg`

---

## Files changed

| File | Change |
|------|--------|
| `lib/admin/session.ts` | **New** |
| `proxy.ts` | Auth fix |
| `app/api/studio-ops/auth/route.ts` | Auth fix |
| `app/studio-ops/login/LoginForm.tsx` | UX fix |
| `app/studio-ops/login/page.tsx` | Suspense |
| `app/studio-ops/LogoutButton.tsx` | Logout fix |
| `lib/env.ts` | Trim password |
| `lib/seo/site.ts` | www + OG images |
| `app/page.tsx` | Copy tighten |
| `next.config.ts` | www redirect |
| `app/icon.tsx` | **New** |
| `app/opengraph-image.tsx` | Brand alignment |

---

## Vercel checklist (before/after deploy)

1. `NEXT_PUBLIC_SITE_URL` = `https://www.ivoridigitals.com`
2. `ADMIN_PASSWORD` = strong value (no trailing newline)
3. Supabase URL without `/rest/v1`
4. Redeploy from `main`
5. Test: https://www.ivoridigitals.com/studio-ops/login

---

## Risks

| Risk | Level | Mitigation |
|------|-------|------------|
| Wrong ADMIN_PASSWORD in env | Medium | Verify login post-deploy |
| www redirect loop | Low | Only apex → www |
| Rate limit during testing | Low | Wait 60s between attempts |

---

## Remaining optional

- Custom `ADMIN_PATH` for extra obscurity
- Lighthouse run on production URL
- Harmonize `/local-payment` styling
- Plausible analytics

---

## Smoke test after deploy

- [ ] Homepage loads (www)
- [ ] Contact form submits
- [ ] `/studio-ops/login` → sign in → inquiries load
- [ ] `/admin` returns 404
- [ ] Social preview shows OG image
