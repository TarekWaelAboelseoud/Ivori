# Security Hardening V3

Date: 2026-05-22

## Changes

- Isolated `/studio-ops/login` from the authenticated admin shell by moving protected console pages into a URL-preserving route group.
- Removed the production runtime diagnostic banner from the admin layout.
- Forced request-time rendering for admin login and admin shell routes with `connection()` plus route cache opt-outs.
- Replaced deterministic admin password-hash cookies with short-lived HMAC session tokens.
- Tightened admin cookie attributes to `HttpOnly`, `Secure` in production, `SameSite=Strict`, eight-hour max age, and exact root path for shared page/API auth.
- Added private no-store response headers to all `/api/studio-ops/*` JSON responses.
- Removed sensitive admin/API route hints from `robots.txt`.
- Added `/.well-known/security.txt`.

## Before

- `/studio-ops/login` rendered admin navigation and runtime diagnostics before authentication.
- Login HTML/RSC responses were prerendered and served from Vercel cache.
- Protected APIs could return `Cache-Control: public, max-age=0`.
- CSP allowed broad `connect-src https:` and broad external image/font loading.

## After

- `/studio-ops/login` renders only the minimal console login surface.
- Protected console layout renders only after middleware authentication.
- Admin/API responses carry `Cache-Control: private, no-store, no-cache, max-age=0, must-revalidate`.
- Admin/API responses carry `Vary: Cookie, Authorization` and `X-Robots-Tag: noindex, nofollow, noarchive`.
- CSP narrows `connect-src` to self plus configured Supabase origin and narrows images/fonts to self/data/blob.

## Remaining Acceptable Risks

- The login client bundle still necessarily knows the login POST endpoint.
- `unsafe-inline` remains for scripts/styles to preserve current Next.js hydration and styling behavior without a nonce pipeline.
- Admin cookie path remains `/` because both `/studio-ops/*` and `/api/studio-ops/*` need the same session.
