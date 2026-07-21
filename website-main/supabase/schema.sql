-- =============================================================================
-- Ivori Digitals — Consolidated database schema (single source of truth)
--
-- This file REPLACES the following historical migration files, which are now
-- superseded and moved to supabase/archive/ for reference only:
--   ivori-production.sql, ivori-production-v2.sql, ivori-production-v2-hotfix.sql,
--   ivori-ops-v3.sql, ivori-ops-v4.sql, ivori-ops-v5.sql, ivori-ops-v6.sql
--
-- Usage: paste this entire file into the Supabase SQL Editor and run once.
-- Safe on: fresh projects. Idempotent: safe to re-run on a database that
-- already has this exact schema (uses IF NOT EXISTS / ON CONFLICT throughout).
--
-- NOT a general-purpose "fix schema drift" script like the old files were —
-- it assumes you're either starting fresh, or already ran the 7 files above
-- in order (which is the only supported prior state). If you're not sure
-- which state your database is in, check first instead of running this blind.
--
-- Verified: this file was built by actually running the 7 legacy files above
-- against a real Postgres instance, dumping the resulting schema, and
-- reorganizing/cleaning it — it is not hand-guessed.
--
-- Changes made during consolidation (see README.md in this folder for why):
--   1. RLS policies unified to deny-all ("using (false)") on every table.
--      The app only ever connects with the service role key, which bypasses
--      RLS entirely — so this changes nothing about how the app behaves, it
--      just closes the gap that existed if the anon key were ever accidentally
--      used (5 tables previously had "using (true)", i.e. no protection at all).
--   2. Merged two duplicate trigger functions (update_updated_at / set_updated_at
--      — byte-for-byte identical) into one: set_updated_at().
--   3. Removed 3 duplicate indexes that were created twice under different
--      names (idx_finance_records_status, idx_finance_records_type,
--      idx_receipts_status all duplicated an existing index on the same column).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 0. Extensions
-- -----------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. Enum types
-- -----------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'ops_item_category') then
    create type public.ops_item_category as enum (
      'leads', 'clients', 'high_priority', 'finance', 'domain_hosting',
      'content', 'partnerships', 'outreach', 'internal_ops', 'automation', 'receipts'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'ops_item_status') then
    create type public.ops_item_status as enum ('open', 'in_progress', 'waiting', 'blocked', 'done', 'archived');
  end if;

  if not exists (select 1 from pg_type where typname = 'ops_item_priority') then
    create type public.ops_item_priority as enum ('low', 'normal', 'high', 'urgent');
  end if;

  if not exists (select 1 from pg_type where typname = 'admin_user_role') then
    create type public.admin_user_role as enum (
      'owner', 'admin', 'operator', 'finance', 'content', 'viewer', 'hr',
      'administrator', 'operations', 'sales', 'content_studio'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'admin_user_status') then
    create type public.admin_user_status as enum ('active', 'invited', 'disabled');
  end if;

  if not exists (select 1 from pg_type where typname = 'finance_record_type') then
    create type public.finance_record_type as enum (
      'invoice', 'payment', 'expense', 'refund', 'subscription', 'tax', 'payroll', 'other'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'finance_record_status') then
    create type public.finance_record_status as enum (
      'draft', 'sent', 'pending', 'paid', 'overdue', 'cancelled', 'unpaid', 'partial'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'receipt_category') then
    create type public.receipt_category as enum (
      'software', 'ads', 'production', 'domain_hosting', 'contractor',
      'travel', 'office', 'equipment', 'client_expense', 'general'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'receipt_status') then
    create type public.receipt_status as enum ('unreviewed', 'reviewed', 'reimbursed', 'archived');
  end if;

  if not exists (select 1 from pg_type where typname = 'client_status') then
    create type public.client_status as enum ('prospect', 'active', 'paused', 'completed', 'lost');
  end if;

  if not exists (select 1 from pg_type where typname = 'client_tier') then
    create type public.client_tier as enum ('starter', 'standard', 'premium', 'flagship');
  end if;

  if not exists (select 1 from pg_type where typname = 'recurring_interval') then
    create type public.recurring_interval as enum ('none', 'monthly', 'quarterly', 'annual');
  end if;
end $$;

-- -----------------------------------------------------------------------------
-- 2. Shared trigger function (single copy — see consolidation note above)
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =============================================================================
-- 3. PUBLIC SITE DOMAIN — inquiries, leads, orders, audits
-- =============================================================================

create table if not exists public.studio_inquiries (
  id                        uuid primary key default gen_random_uuid(),
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now(),
  brand                     text,
  company_name              text,
  about                     text,
  needs                     text,
  contact                   text not null,
  goals                     text,
  project_type              text,
  project_stage             text,
  budget_range              text,
  timeline                  text,
  pain_points               text,
  revenue_band              text,
  preferred_contact_method  text,
  whatsapp                  text,
  instagram                 text,
  status                    text not null default 'new',
  priority                  text not null default 'normal',
  notes                     text,
  archived                  boolean not null default false,
  tags                      text[] default '{}'::text[],
  assigned_to               text,
  source                    text not null default 'contact',
  region                    text,
  country                   text,
  city                      text,
  owner_id                  uuid,
  company_id                uuid,
  contact_id                uuid,
  last_contacted_at         timestamptz,
  internal_summary          text,
  follow_up_date            date,
  lead_score                integer not null default 0,
  archived_at               timestamptz,
  activity_log              jsonb not null default '[]'::jsonb
);

create table if not exists public.inquiry_activity_log (
  id         uuid primary key default gen_random_uuid(),
  inquiry_id uuid not null references public.studio_inquiries (id) on delete cascade,
  action     text not null,
  actor      text not null default 'system',
  metadata   jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.leads (
  id                          uuid primary key default gen_random_uuid(),
  created_at                  timestamptz default now(),
  updated_at                  timestamptz default now(),
  brand_name                  text,
  store_url                   text,
  country                     text,
  niche                       text,
  contact_email               text,
  contact_name                text,
  contact_instagram           text,
  lead_score                  integer default 0,
  cro_opportunity_score        integer,
  ad_activity                  text,
  implementation_opportunity   text,
  status                       text not null default 'new',
  contacted_at                 timestamptz,
  last_followup_at             timestamptz,
  won_at                       timestamptz,
  ai_assessment                jsonb default '{}'::jsonb,
  outreach_copy                jsonb default '{}'::jsonb,
  notes                        text,
  source                       text
);

create table if not exists public.orders (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),
  payment_id    text,
  email         text,
  amount_cents  integer,
  currency      text default 'usd',
  region        text default 'international',
  tier          text default 'starter',
  status        text default 'pending_intake',
  intake_token  text,
  customer_id   uuid,
  constraint orders_payment_id_key unique (payment_id),
  constraint orders_intake_token_key unique (intake_token)
);

-- Safe on databases that already had orders before client accounts existed
alter table public.orders add column if not exists customer_id uuid;

create table if not exists public.customers (
  id                 uuid primary key default gen_random_uuid(),
  email              text unique not null,
  password_hash      text not null,
  name               text,
  phone              text,
  status             text not null default 'active' check (status in ('active', 'disabled')),
  email_verified_at  timestamptz,
  last_login_at      timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- Safe on databases that already had customers before email verification existed
alter table public.customers add column if not exists email_verified_at timestamptz;

-- Shared by both admin_users and customers: password reset links and
-- customer email verification links. token_hash stores a SHA-256 hash of
-- the opaque token that was actually emailed — the raw token is never
-- persisted, matching how passwords are stored.
create table if not exists public.verification_tokens (
  id           uuid primary key default gen_random_uuid(),
  account_type text not null check (account_type in ('admin', 'customer')),
  account_id   uuid not null,
  purpose      text not null check (purpose in ('password_reset', 'email_verification')),
  token_hash   text not null unique,
  expires_at   timestamptz not null,
  used_at      timestamptz,
  created_at   timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'orders_customer_id_fkey'
  ) then
    alter table public.orders
      add constraint orders_customer_id_fkey
      foreign key (customer_id) references public.customers (id) on delete set null;
  end if;
end $$;

create table if not exists public.audits (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),
  order_id        uuid references public.orders (id) on delete cascade,
  store_url       text,
  intake_data     jsonb default '{}'::jsonb,
  ai_report       jsonb default '{}'::jsonb,
  reviewer_notes  text,
  pdf_url         text,
  upsell_sent     boolean default false,
  delivered_at    timestamptz
);

-- =============================================================================
-- 4. ADMIN CORE DOMAIN — settings, audit log, users, ops items, RBAC
-- =============================================================================

create table if not exists public.admin_settings (
  key         text primary key,
  value       jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

create table if not exists public.admin_audit_log (
  id          uuid primary key default gen_random_uuid(),
  event_type  text not null,
  path        text,
  ip_hash     text,
  metadata    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

create table if not exists public.admin_users (
  id             uuid primary key default gen_random_uuid(),
  email          text unique not null,
  name           text,
  role           public.admin_user_role not null default 'operator',
  status         public.admin_user_status not null default 'active',
  permissions    jsonb not null default '{}'::jsonb,
  password_hash  text,
  totp_secret    text,
  totp_enabled   boolean not null default false,
  backup_codes   jsonb not null default '[]'::jsonb,
  last_seen_at   timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- Safe on databases that already had admin_users before per-user login existed
alter table public.admin_users add column if not exists password_hash text;

-- Safe on databases that already had admin_users before MFA existed
alter table public.admin_users add column if not exists totp_secret text;
alter table public.admin_users add column if not exists totp_enabled boolean not null default false;
alter table public.admin_users add column if not exists backup_codes jsonb not null default '[]'::jsonb;

create table if not exists public.admin_role_permissions (
  role        text primary key,
  permissions jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.ops_items (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  description   text,
  category      public.ops_item_category not null,
  status        public.ops_item_status not null default 'open',
  priority      public.ops_item_priority not null default 'normal',
  owner_id      uuid,
  owner_name    text,
  source        text,
  related_email text,
  related_url   text,
  due_at        timestamptz,
  completed_at  timestamptz,
  archived      boolean not null default false,
  metadata      jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists public.ops_activity_log (
  id           uuid primary key default gen_random_uuid(),
  actor_email  text,
  action       text not null,
  entity_type  text not null,
  entity_id    uuid,
  details      jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now()
);

-- =============================================================================
-- 5. CRM DOMAIN — companies, contacts, client timeline
-- =============================================================================

create table if not exists public.companies (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  industry      text,
  region        text,
  website       text,
  instagram     text,
  shopify_url   text,
  status        text not null default 'lead'
                check (status in ('lead', 'active', 'paused', 'churned', 'archived')),
  notes         text,
  archived      boolean not null default false,
  archived_at   timestamptz,
  metadata      jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists public.contacts (
  id                 uuid primary key default gen_random_uuid(),
  company_id         uuid references public.companies (id) on delete set null,
  name               text,
  role               text,
  email              text,
  phone              text,
  whatsapp           text,
  preferred_channel  text,
  notes              text,
  archived           boolean not null default false,
  archived_at        timestamptz,
  metadata           jsonb not null default '{}'::jsonb,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create table if not exists public.client_timeline (
  id                  uuid primary key default gen_random_uuid(),
  company_id          uuid references public.companies (id) on delete cascade,
  contact_id          uuid references public.contacts (id) on delete set null,
  inquiry_id          uuid,
  finance_record_id   uuid,
  stage               text not null
                      check (stage in ('inquiry', 'audit', 'proposal', 'invoice', 'active_client', 'note')),
  title               text not null,
  notes               text,
  metadata            jsonb not null default '{}'::jsonb,
  created_at          timestamptz not null default now()
);

-- Foreign keys from studio_inquiries into the CRM domain (added here since
-- companies/contacts must exist first)
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'studio_inquiries_company_id_fkey') then
    alter table public.studio_inquiries
      add constraint studio_inquiries_company_id_fkey
      foreign key (company_id) references public.companies (id) on delete set null;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'studio_inquiries_contact_id_fkey') then
    alter table public.studio_inquiries
      add constraint studio_inquiries_contact_id_fkey
      foreign key (contact_id) references public.contacts (id) on delete set null;
  end if;
end $$;

-- =============================================================================
-- 6. FINANCE DOMAIN — finance records, receipts, clients
-- =============================================================================

create table if not exists public.finance_records (
  id                    uuid primary key default gen_random_uuid(),
  type                  public.finance_record_type not null,
  status                public.finance_record_status not null default 'draft',
  client_name           text,
  client_email          text,
  title                 text not null,
  description           text,
  amount                numeric(12, 2) not null default 0,
  paid_amount           numeric(12, 2) not null default 0,
  balance_due           numeric(12, 2) generated always as (amount - paid_amount) stored,
  currency              text not null default 'EGP',
  due_at                timestamptz,
  paid_at               timestamptz,
  related_ops_item_id   uuid,
  related_inquiry_id    uuid,
  receipt_url           text,
  invoice_url           text,
  recurring_interval    public.recurring_interval,
  next_invoice_at       timestamptz,
  billing_notes         text,
  auto_generate         boolean not null default false,
  company_id            uuid references public.companies (id) on delete set null,
  contact_id            uuid references public.contacts (id) on delete set null,
  metadata              jsonb not null default '{}'::jsonb,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create table if not exists public.receipts (
  id                 uuid primary key default gen_random_uuid(),
  vendor             text,
  title              text not null,
  category           public.receipt_category not null default 'general',
  amount             numeric(12, 2) not null default 0,
  currency           text not null default 'EGP',
  payment_method     text,
  purchased_at       date,
  status             public.receipt_status not null default 'unreviewed',
  client_name        text,
  project_name       text,
  file_url           text,
  notes              text,
  company_id         uuid references public.companies (id) on delete set null,
  finance_record_id  uuid references public.finance_records (id) on delete set null,
  metadata           jsonb not null default '{}'::jsonb,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create table if not exists public.clients (
  id                    uuid primary key default gen_random_uuid(),
  name                  text not null,
  email                 text,
  company                text,
  website               text,
  region                text,
  status                public.client_status not null default 'prospect',
  tier                  public.client_tier not null default 'standard',
  monthly_value         numeric(12, 2) not null default 0,
  currency              text not null default 'EGP',
  owner_name            text,
  started_at            date,
  next_follow_up_at     timestamptz,
  recurring_interval    public.recurring_interval default 'monthly',
  next_invoice_at       timestamptz,
  billing_notes         text,
  auto_generate         boolean not null default false,
  notes                 text,
  metadata              jsonb not null default '{}'::jsonb,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- =============================================================================
-- 7. Triggers (all tables with updated_at use the single shared function)
-- =============================================================================
do $$
declare
  t text;
begin
  foreach t in array array[
    'studio_inquiries', 'leads', 'orders', 'audits',
    'admin_settings', 'admin_users', 'admin_role_permissions',
    'ops_items', 'companies', 'contacts',
    'finance_records', 'receipts', 'clients', 'customers'
  ]
  loop
    execute format(
      'drop trigger if exists %I_set_updated_at on public.%I;
       create trigger %I_set_updated_at before update on public.%I
       for each row execute function public.set_updated_at();',
      t, t, t, t
    );
  end loop;
end $$;

-- =============================================================================
-- 8. Indexes
-- =============================================================================

-- studio_inquiries
create index if not exists studio_inquiries_created_at_idx     on public.studio_inquiries (created_at desc);
create index if not exists studio_inquiries_status_idx         on public.studio_inquiries (status);
create index if not exists studio_inquiries_priority_idx       on public.studio_inquiries (priority);
create index if not exists studio_inquiries_status_priority_idx on public.studio_inquiries (status, priority);
create index if not exists studio_inquiries_archived_idx       on public.studio_inquiries (archived);
create index if not exists studio_inquiries_follow_up_idx      on public.studio_inquiries (follow_up_date);
create index if not exists studio_inquiries_lead_score_idx     on public.studio_inquiries (lead_score desc);
create index if not exists studio_inquiries_assigned_idx       on public.studio_inquiries (assigned_to);
create index if not exists studio_inquiries_source_idx         on public.studio_inquiries (source);
create index if not exists studio_inquiries_owner_id_idx       on public.studio_inquiries (owner_id);
create index if not exists studio_inquiries_company_id_idx     on public.studio_inquiries (company_id);
create index if not exists studio_inquiries_tags_gin_idx       on public.studio_inquiries using gin (tags);

-- inquiry_activity_log
create index if not exists inquiry_activity_log_inquiry_idx on public.inquiry_activity_log (inquiry_id, created_at desc);

-- leads
create index if not exists leads_status_idx     on public.leads (status);
create index if not exists leads_country_idx    on public.leads (country);
create index if not exists leads_lead_score_idx on public.leads (lead_score desc);

-- orders
create index if not exists orders_email_idx        on public.orders (email);
create index if not exists orders_status_idx       on public.orders (status);
create index if not exists orders_intake_token_idx on public.orders (intake_token);
create index if not exists orders_customer_id_idx on public.orders (customer_id);

-- customers
create index if not exists customers_email_idx      on public.customers (lower(email));
create index if not exists customers_status_idx     on public.customers (status);
create index if not exists customers_created_at_idx on public.customers (created_at desc);

-- verification_tokens
create index if not exists verification_tokens_token_hash_idx on public.verification_tokens (token_hash);
create index if not exists verification_tokens_account_idx    on public.verification_tokens (account_type, account_id, purpose);
create index if not exists verification_tokens_expires_at_idx on public.verification_tokens (expires_at);

-- audits
create index if not exists audits_order_id_idx on public.audits (order_id);

-- admin_audit_log
create index if not exists admin_audit_log_created_idx on public.admin_audit_log (created_at desc);
create index if not exists admin_audit_log_event_idx   on public.admin_audit_log (event_type);

-- admin_users
create index if not exists admin_users_email_idx       on public.admin_users (lower(email));
create index if not exists admin_users_role_status_idx on public.admin_users (role, status);

-- ops_items
create index if not exists ops_items_category_idx        on public.ops_items (category);
create index if not exists ops_items_status_idx           on public.ops_items (status);
create index if not exists ops_items_priority_idx          on public.ops_items (priority);
create index if not exists ops_items_due_at_idx            on public.ops_items (due_at);
create index if not exists ops_items_archived_idx          on public.ops_items (archived);
create index if not exists ops_items_category_status_idx   on public.ops_items (category, status) where archived = false;

-- ops_activity_log
create index if not exists ops_activity_log_entity_idx     on public.ops_activity_log (entity_type, entity_id);
create index if not exists ops_activity_log_created_at_idx on public.ops_activity_log (created_at desc);

-- companies
create index if not exists companies_status_idx   on public.companies (status);
create index if not exists companies_name_idx     on public.companies (lower(name));
create index if not exists companies_archived_idx on public.companies (archived);

-- contacts
create index if not exists contacts_company_id_idx on public.contacts (company_id);
create index if not exists contacts_email_idx      on public.contacts (lower(email));
create index if not exists contacts_archived_idx   on public.contacts (archived);

-- client_timeline
create index if not exists client_timeline_company_id_idx on public.client_timeline (company_id, created_at desc);

-- finance_records (each column indexed exactly once — see consolidation note)
create index if not exists finance_records_status_idx           on public.finance_records (status);
create index if not exists finance_records_type_idx             on public.finance_records (type);
create index if not exists finance_records_due_at_idx            on public.finance_records (due_at);
create index if not exists finance_records_client_email_idx      on public.finance_records (lower(client_email));
create index if not exists finance_records_created_at_idx        on public.finance_records (created_at desc);
create index if not exists finance_records_next_invoice_at_idx    on public.finance_records (next_invoice_at);
create index if not exists finance_records_company_id_idx        on public.finance_records (company_id);

-- receipts (each column indexed exactly once — see consolidation note)
create index if not exists receipts_status_idx            on public.receipts (status);
create index if not exists receipts_category_idx          on public.receipts (category);
create index if not exists receipts_purchased_at_idx      on public.receipts (purchased_at desc);
create index if not exists receipts_created_at_idx        on public.receipts (created_at desc);
create index if not exists receipts_company_id_idx        on public.receipts (company_id);
create index if not exists receipts_finance_record_id_idx on public.receipts (finance_record_id);

-- clients
create index if not exists clients_status_idx            on public.clients (status);
create index if not exists clients_tier_idx              on public.clients (tier);
create index if not exists clients_email_idx             on public.clients (lower(email));
create index if not exists clients_next_follow_up_at_idx on public.clients (next_follow_up_at);
create index if not exists clients_next_invoice_at_idx   on public.clients (next_invoice_at);
create index if not exists clients_created_at_idx        on public.clients (created_at desc);

-- =============================================================================
-- 9. Row-level security — deny-all everywhere (see consolidation note above)
--
-- The application connects exclusively through the service role key
-- (lib/supabase-server.ts), which bypasses RLS by design. These policies exist
-- as a defense-in-depth backstop: if the anon/public key were ever
-- accidentally wired up to a client-side call, it would see nothing, rather
-- than everything. All authorization actually happens in application code
-- (lib/admin/permissions.ts, session checks).
-- =============================================================================
do $$
declare
  t text;
begin
  foreach t in array array[
    'studio_inquiries', 'inquiry_activity_log', 'leads', 'orders', 'audits',
    'admin_settings', 'admin_audit_log', 'admin_users', 'admin_role_permissions',
    'ops_items', 'ops_activity_log',
    'companies', 'contacts', 'client_timeline',
    'finance_records', 'receipts', 'clients', 'customers', 'verification_tokens'
  ]
  loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('drop policy if exists "No public access" on public.%I;', t);
    execute format(
      'create policy "No public access" on public.%I for all using (false) with check (false);',
      t
    );
  end loop;
end $$;

-- =============================================================================
-- 10. Seed data (idempotent — safe to re-run)
-- =============================================================================

insert into public.admin_settings (key, value)
values
  ('site', '{"maintenance": false}'::jsonb),
  ('whatsapp', '{"channel": "footer", "enabled": true}'::jsonb),
  ('seo', '{}'::jsonb),
  ('features', '{"notes_public": true}'::jsonb),
  ('company_mode', '"studio_ops_foundation"'::jsonb),
  ('default_owner', 'null'::jsonb),
  ('internal_email_aliases', '[]'::jsonb),
  ('notification_preferences', '{}'::jsonb),
  ('ops_categories_enabled',
    '["leads","clients","high_priority","finance","domain_hosting","content","partnerships","outreach","internal_ops","automation","receipts"]'::jsonb),
  ('default_admin_roles',
    '["owner","admin","operator","finance","content","viewer","hr"]'::jsonb),
  ('default_receipt_categories',
    '["software","ads","production","domain_hosting","contractor","travel","office","equipment","client_expense","general"]'::jsonb),
  ('default_finance_types',
    '["invoice","payment","expense","refund","subscription","tax","payroll","other"]'::jsonb),
  ('billing_automation_mode', '"manual_foundation"'::jsonb),
  ('company', jsonb_build_object(
    'display_name', 'Ivori Digitals',
    'legal_name', 'Ivori Digitals',
    'website', 'https://www.ivoridigitals.com',
    'email', 'hello@ivoridigitals.com',
    'phone', '',
    'whatsapp', '',
    'address', 'Cairo, Egypt',
    'region', 'Egypt & MENA',
    'vat_number', '',
    'default_currency', 'EGP',
    'invoice_prefix', 'IV',
    'payment_instructions', 'Payment via bank transfer, InstaPay, or Vodafone Cash. Reference the invoice number on all transfers.',
    'invoice_footer', 'Thank you for your business. Ivori Digitals — premium ecommerce growth studio.',
    'bank_notes', ''
  ))
on conflict (key) do nothing;

insert into public.admin_role_permissions (role, permissions)
values
  ('administrator', '{"all":true}'::jsonb),
  ('finance', '{"command":["read"],"clients":["read"],"finance":["read","write"],"receipts":["read","write"]}'::jsonb),
  ('operations', '{"command":["read"],"inquiries":["read","write"],"clients":["read","write"],"studio":["read","write"]}'::jsonb),
  ('sales', '{"command":["read"],"inquiries":["read","write"],"clients":["read","write"]}'::jsonb),
  ('content_studio', '{"command":["read"],"studio":["read","write"],"clients":["read"]}'::jsonb),
  ('viewer', '{"command":["read"],"inquiries":["read"],"clients":["read"],"studio":["read"]}'::jsonb)
on conflict (role) do nothing;

-- =============================================================================
-- Done. 19 tables: studio_inquiries, inquiry_activity_log, leads, orders, audits,
-- admin_settings, admin_audit_log, admin_users, admin_role_permissions,
-- ops_items, ops_activity_log, companies, contacts, client_timeline,
-- finance_records, receipts, clients, customers, verification_tokens
-- =============================================================================
