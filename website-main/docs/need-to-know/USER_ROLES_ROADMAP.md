# User Roles Roadmap

## Current Phase

- Shared studio password (`/studio-ops/login`) still works, unchanged.
- **New:** per-admin-user login now also works, alongside the shared password
  (not instead of it). Log in with an email + password at `/login`, or set a
  password for someone in `/studio-ops/users` → "Set password".
- Role permissions are now enforced per logged-in person when using per-user
  login — `getCurrentAdminRole()` reads the role from the signed-in user's
  `admin_users` row. The shared-password login still falls back to the old
  env-var-based role (`ADMIN_ROLE`), since there's no individual identity
  behind it.
- `/login` also handles client account signup/login (see below) — same page,
  different destination depending on whether the email matches an admin
  account or a client account.

## Roles

- `owner`: full business and security control.
- `admin`: operational admin access.
- `operator`: default internal operator.
- `finance`: finance and receipts ownership.
- `content`: content workflow ownership.
- `viewer`: read-only future role.

## Migration Path

1. ~~Keep current shared password while collecting admin user records.~~ Done.
2. ~~Add per-user email + password login behind `/login`.~~ Done — custom auth
   (bcrypt + signed cookies), not Supabase Auth, to match the rest of the
   app's auth pattern (see `lib/auth/`).
3. ~~Bind authenticated emails to `admin_users`.~~ Done.
4. ~~Enforce role permissions server-side in `/api/studio-ops/*`.~~ Done for
   per-user sessions; shared-password sessions still use the env-var role.
5. ~~Add MFA/TOTP for owner/admin roles.~~ Done — optional, self-service, per
   admin user at `/studio-ops/account`. Requires `MFA_ENCRYPTION_KEY` to be
   set. Not available to the shared-password login (no individual identity
   to attach it to) or to client accounts.
6. Deprecate shared password after owner/admin recovery paths are proven.
   **Not done** — intentionally kept running in parallel for now.

## Client accounts (new, adjacent to this roadmap)

- A separate `customers` table holds client account credentials — a fully
  separate identity space from `admin_users`, checked second in the combined
  `/login` flow.
- Client accounts can sign up at `/login` and see their linked orders at
  `/portal`. See `lib/auth/customers.ts` and `app/portal/`.
- Email verification (on signup, resend from the portal banner) and password
  reset (`/forgot-password` → `/reset-password`) both work for client
  accounts and admin users alike. Requires `RESEND_API_KEY` to actually send
  the emails — without it, requests still succeed but the email is skipped
  (logged server-side instead).

## Deferred

- HR profiles, employee onboarding, payroll, and granular permissions.
- Per-route role gates beyond the current protected admin boundary.
- SMS-based MFA (TOTP only for now).

