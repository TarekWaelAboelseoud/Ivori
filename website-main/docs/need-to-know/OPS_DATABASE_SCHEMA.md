# Ops Database Schema

Tables live in `supabase/schema.sql` (see `supabase/README.md`). This doc
describes the `ops_items` table and its planned metadata convention — it no
longer refers to a specific migration file, since the schema was consolidated.

## Tables

- `ops_items`: generic internal operating queue items across leads, clients, finance, content, automation, receipts, and other categories.
- `admin_users`: user directory for role-based access (see `USER_ROLES_ROADMAP.md`).
- `ops_activity_log`: internal action log for ops CRUD and future automations.

## Safety

- RLS is enabled on all tables, deny-all by default.
- Server-side access uses the Supabase service role, which bypasses RLS.

## Future Metadata Fields

`ops_items.metadata` can store `gmail_thread_id`, `gmail_message_id`, `email_from`, `email_subject`, `email_label`, and `automation_source`.

