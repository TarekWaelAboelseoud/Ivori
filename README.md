# Ivori Digitals

Website for [Ivori Digitals](https://ivoridigitals.com) — an operator-led ecommerce growth studio based in Cairo, Egypt.

Built with Next.js 16 (App Router), Tailwind CSS v4, TypeScript.

## Setup

Copy the example env file and fill in your values:

```bash
cp .env.local.example .env.local
```

Required env variables:

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | WhatsApp number for contact links (digits only, e.g. `201012345678`) |
| `NEXT_PUBLIC_APP_URL` | Deployed URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (admin APIs) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL only (`https://REF.supabase.co`, no `/rest/v1`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `ANTHROPIC_API_KEY` | Claude API key for audit generation |
| `RESEND_API_KEY` | Resend for transactional email |
| `LEMONSQUEEZY_API_KEY` | LemonSqueezy for online checkout |
| `ADMIN_PASSWORD` | Studio console password (use a strong unique value in production) |
| `SESSION_SECRET` | Signs per-user admin and client account sessions (`/login`, `/portal`). Required in production — see `docs/need-to-know/VERCEL_ENV_SETUP.md` |
| `MFA_ENCRYPTION_KEY` | Encrypts MFA/TOTP secrets at rest. Required for MFA setup at `/studio-ops/account` to work at all |
| `ADMIN_PATH` | Optional. Hidden console path (default `/studio-ops`) |
| `ADMIN_API_PATH` | Optional. Console API path (default `/api/studio-ops`) |
| `UPSTASH_REDIS_REST_URL` | Optional. Enables durable rate limiting across serverless instances (falls back to in-memory if unset) |
| `UPSTASH_REDIS_REST_TOKEN` | Optional. Paired with the URL above |

## Documentation

- [`docs/need-to-know/`](./docs/need-to-know/README.md) — deployment, env setup, database, brand/design systems, roadmaps
- [`docs/archive/`](./docs/archive/README.md) — historical build reports, kept for reference only
- [`supabase/README.md`](./supabase/README.md) — database schema

## Development

```bash
npm install
npm run dev
```

## Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Styling**: Tailwind CSS v4
- **Checkout**: LemonSqueezy
- **Database**: Supabase (leads + audit storage)
- **Email**: Resend
- **AI**: Claude API (audit generation)
- **Languages**: English (`/`) and Arabic (`/ar`, RTL)
