-- Ivori Studio OS v3
-- Safe/idempotent production expansion. Does not delete or alter studio_inquiries.

create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'ops_item_category') then
    create type ops_item_category as enum (
      'leads',
      'clients',
      'high_priority',
      'finance',
      'domain_hosting',
      'content',
      'partnerships',
      'outreach',
      'internal_ops',
      'automation',
      'receipts'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'ops_item_status') then
    create type ops_item_status as enum ('open', 'in_progress', 'waiting', 'blocked', 'done', 'archived');
  end if;

  if not exists (select 1 from pg_type where typname = 'ops_item_priority') then
    create type ops_item_priority as enum ('low', 'normal', 'high', 'urgent');
  end if;

  if not exists (select 1 from pg_type where typname = 'admin_user_role') then
    create type admin_user_role as enum ('owner', 'admin', 'operator', 'finance', 'content', 'viewer');
  end if;

  if not exists (select 1 from pg_type where typname = 'admin_user_status') then
    create type admin_user_status as enum ('active', 'invited', 'disabled');
  end if;
end $$;

create table if not exists public.ops_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category ops_item_category not null,
  status ops_item_status not null default 'open',
  priority ops_item_priority not null default 'normal',
  owner_id uuid null,
  owner_name text null,
  source text null,
  related_email text null,
  related_url text null,
  due_at timestamptz null,
  completed_at timestamptz null,
  archived boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  role admin_user_role not null default 'operator',
  status admin_user_status not null default 'active',
  permissions jsonb not null default '{}'::jsonb,
  last_seen_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ops_activity_log (
  id uuid primary key default gen_random_uuid(),
  actor_email text null,
  action text not null,
  entity_type text not null,
  entity_id uuid null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists ops_items_set_updated_at on public.ops_items;
create trigger ops_items_set_updated_at
before update on public.ops_items
for each row execute function public.set_updated_at();

drop trigger if exists admin_users_set_updated_at on public.admin_users;
create trigger admin_users_set_updated_at
before update on public.admin_users
for each row execute function public.set_updated_at();

create index if not exists ops_items_category_idx on public.ops_items (category);
create index if not exists ops_items_status_idx on public.ops_items (status);
create index if not exists ops_items_priority_idx on public.ops_items (priority);
create index if not exists ops_items_due_at_idx on public.ops_items (due_at);
create index if not exists ops_items_archived_idx on public.ops_items (archived);
create index if not exists ops_items_category_status_idx on public.ops_items (category, status) where archived = false;
create index if not exists admin_users_email_idx on public.admin_users (lower(email));
create index if not exists admin_users_role_status_idx on public.admin_users (role, status);
create index if not exists ops_activity_log_entity_idx on public.ops_activity_log (entity_type, entity_id);
create index if not exists ops_activity_log_created_at_idx on public.ops_activity_log (created_at desc);

alter table public.ops_items enable row level security;
alter table public.admin_users enable row level security;
alter table public.ops_activity_log enable row level security;

drop policy if exists "No public ops_items access" on public.ops_items;
create policy "No public ops_items access"
on public.ops_items
for all
using (false)
with check (false);

drop policy if exists "No public admin_users access" on public.admin_users;
create policy "No public admin_users access"
on public.admin_users
for all
using (false)
with check (false);

drop policy if exists "No public ops_activity_log access" on public.ops_activity_log;
create policy "No public ops_activity_log access"
on public.ops_activity_log
for all
using (false)
with check (false);

do $$
begin
  if to_regclass('public.admin_settings') is not null then
    insert into public.admin_settings (key, value)
    values
      ('company_mode', '"studio_ops_foundation"'::jsonb),
      ('default_owner', 'null'::jsonb),
      ('internal_email_aliases', '[]'::jsonb),
      ('notification_preferences', '{}'::jsonb),
      ('ops_categories_enabled', '["leads","clients","high_priority","finance","domain_hosting","content","partnerships","outreach","internal_ops","automation","receipts"]'::jsonb)
    on conflict (key) do nothing;
  end if;
end $$;
