# Need to know

Living documentation — things that are still true and still relevant.
Historical write-ups from past work sessions live in `../archive/` instead.

| File | What it's for |
|---|---|
| [DEPLOYMENT.md](./DEPLOYMENT.md) | How to deploy: domains, Vercel alias setup, running the database schema, post-deploy smoke test |
| [VERCEL_ENV_SETUP.md](./VERCEL_ENV_SETUP.md) | Every environment variable the app needs, where to get it, common misconfigurations |
| [OPS_DATABASE_SCHEMA.md](./OPS_DATABASE_SCHEMA.md) | What the `ops_items` table is for and its planned metadata fields (see `supabase/README.md` for the full schema) |
| [USER_ROLES_ROADMAP.md](./USER_ROLES_ROADMAP.md) | Current shared-password admin auth, and the planned path to per-user login + role enforcement |
| [GMAIL_WORKFLOW_FUTURE_PLAN.md](./GMAIL_WORKFLOW_FUTURE_PLAN.md) | Not-yet-built plan for mapping inbox email into `ops_items` categories |
| [BRAND_SYSTEM.md](./BRAND_SYSTEM.md) | Brand voice, tone, and content guidelines (formerly `content-system/ivori-brand-system.md`) |
| [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) | Visual design tokens and system (formerly `design-system/MASTER.md`) |
| [AGENTS.md](./AGENTS.md) | Instructions for AI coding agents working in this repo |
| [CLAUDE.md](./CLAUDE.md) | Instructions specifically for Claude / Claude Code working in this repo |

For the main project overview, see the [root README](../../README.md).
For the database schema itself, see [`supabase/README.md`](../../supabase/README.md).
