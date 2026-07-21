-- Ivori Studio OS v4
-- Idempotent production upgrade. Preserves v3 data and existing inquiry tables.

create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'ops_item_category') then
    create type ops_item_category as enum ('leads','clients','high_priority','finance','domain_hosting','content','partnerships','outreach','internal_ops','automation','receipts');
  end if;
  if not exists (select 1 from pg_type where typname = 'ops_item_status') then
    create type ops_item_status as enum ('open','in_progress','waiting','blocked','done','archived');
  end if;
  if not exists (select 1 from pg_type where typname = 'ops_item_priority') then
    create type ops_item_priority as enum ('low','normal','high','urgent');
  end if;
  if not exists (select 1 from pg_type where typname = 'admin_user_role') then
    create type admin_user_role as enum ('owner','admin','operator','finance','content','viewer','hr');
  end if;
  if not exists (select 1 from pg_type where typname = 'admin_user_status') then
    create type admin_user_status as enum ('active','invited','disabled');
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'finance_record_type') then
    create type finance_record_type as enum ('invoice','payment','expense','refund','subscription','tax','payroll','other');
  end if;
  if not exists (select 1 from pg_type where typname = 'finance_record_status') then
    create type finance_record_status as enum ('draft','sent','pending','paid','overdue','cancelled');
  end if;
  if not exists (select 1 from pg_type where typname = 'receipt_category') then
    create type receipt_category as enum ('software','ads','production','domain_hosting','contractor','travel','office','equipment','client_expense','general');
  end if;
  if not exists (select 1 from pg_type where typname = 'receipt_status') then
    create type receipt_status as enum ('unreviewed','reviewed','reimbursed','archived');
  end if;
  if not exists (select 1 from pg_type where typname = 'client_status') then
    create type client_status as enum ('prospect','active','paused','completed','lost');
  end if;
  if not exists (select 1 from pg_type where typname = 'client_tier') then
    create type client_tier as enum ('starter','standard','premium','flagship');
  end if;
  if not exists (select 1 from pg_type where typname = 'recurring_interval') then
    create type recurring_interval as enum ('none','monthly','quarterly','annual');
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

create table if not exists public.finance_records (
  id uuid primary key default gen_random_uuid(),
  type finance_record_type not null,
  status finance_record_status not null default 'draft',
  client_name text,
  client_email text,
  title text not null,
  description text,
  amount numeric(12,2) not null default 0,
  currency text not null default 'USD',
  due_at timestamptz,
  paid_at timestamptz,
  related_ops_item_id uuid null,
  related_inquiry_id uuid null,
  receipt_url text,
  invoice_url text,
  recurring_interval recurring_interval null,
  next_invoice_at timestamptz null,
  billing_notes text null,
  auto_generate boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.receipts (
  id uuid primary key default gen_random_uuid(),
  vendor text,
  title text not null,
  category receipt_category not null default 'general',
  amount numeric(12,2) not null default 0,
  currency text not null default 'USD',
  payment_method text,
  purchased_at date,
  status receipt_status not null default 'unreviewed',
  client_name text,
  project_name text,
  file_url text,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  company text,
  website text,
  region text,
  status client_status not null default 'prospect',
  tier client_tier not null default 'standard',
  monthly_value numeric(12,2) not null default 0,
  currency text not null default 'USD',
  owner_name text,
  started_at date,
  next_follow_up_at timestamptz,
  recurring_interval recurring_interval null default 'monthly',
  next_invoice_at timestamptz null,
  billing_notes text null,
  auto_generate boolean not null default false,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.finance_records add column if not exists recurring_interval recurring_interval null;
alter table public.finance_records add column if not exists next_invoice_at timestamptz null;
alter table public.finance_records add column if not exists billing_notes text null;
alter table public.finance_records add column if not exists auto_generate boolean not null default false;

alter table public.clients add column if not exists recurring_interval recurring_interval null default 'monthly';
alter table public.clients add column if not exists next_invoice_at timestamptz null;
alter table public.clients add column if not exists billing_notes text null;
alter table public.clients add column if not exists auto_generate boolean not null default false;

do $$
begin
  if exists (select 1 from pg_type where typname = 'admin_user_role') then
    alter type admin_user_role add value if not exists 'hr';
  end if;
end $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists finance_records_set_updated_at on public.finance_records;
create trigger finance_records_set_updated_at before update on public.finance_records for each row execute function public.set_updated_at();

drop trigger if exists ops_items_set_updated_at on public.ops_items;
create trigger ops_items_set_updated_at before update on public.ops_items for each row execute function public.set_updated_at();

drop trigger if exists admin_users_set_updated_at on public.admin_users;
create trigger admin_users_set_updated_at before update on public.admin_users for each row execute function public.set_updated_at();

drop trigger if exists receipts_set_updated_at on public.receipts;
create trigger receipts_set_updated_at before update on public.receipts for each row execute function public.set_updated_at();

drop trigger if exists clients_set_updated_at on public.clients;
create trigger clients_set_updated_at before update on public.clients for each row execute function public.set_updated_at();

create index if not exists finance_records_status_idx on public.finance_records (status);
create index if not exists finance_records_type_idx on public.finance_records (type);
create index if not exists finance_records_due_at_idx on public.finance_records (due_at);
create index if not exists finance_records_client_email_idx on public.finance_records (lower(client_email));
create index if not exists finance_records_created_at_idx on public.finance_records (created_at desc);
create index if not exists finance_records_next_invoice_at_idx on public.finance_records (next_invoice_at);

create index if not exists ops_items_category_idx on public.ops_items (category);
create index if not exists ops_items_status_idx on public.ops_items (status);
create index if not exists ops_items_priority_idx on public.ops_items (priority);
create index if not exists ops_items_due_at_idx on public.ops_items (due_at);
create index if not exists ops_items_archived_idx on public.ops_items (archived);
create index if not exists admin_users_email_idx on public.admin_users (lower(email));
create index if not exists admin_users_role_status_idx on public.admin_users (role, status);
create index if not exists ops_activity_log_entity_idx on public.ops_activity_log (entity_type, entity_id);
create index if not exists ops_activity_log_created_at_idx on public.ops_activity_log (created_at desc);

create index if not exists receipts_status_idx on public.receipts (status);
create index if not exists receipts_category_idx on public.receipts (category);
create index if not exists receipts_purchased_at_idx on public.receipts (purchased_at desc);
create index if not exists receipts_created_at_idx on public.receipts (created_at desc);

create index if not exists clients_status_idx on public.clients (status);
create index if not exists clients_tier_idx on public.clients (tier);
create index if not exists clients_email_idx on public.clients (lower(email));
create index if not exists clients_next_follow_up_at_idx on public.clients (next_follow_up_at);
create index if not exists clients_next_invoice_at_idx on public.clients (next_invoice_at);
create index if not exists clients_created_at_idx on public.clients (created_at desc);

alter table public.finance_records enable row level security;
alter table public.receipts enable row level security;
alter table public.clients enable row level security;
alter table public.ops_items enable row level security;
alter table public.admin_users enable row level security;
alter table public.ops_activity_log enable row level security;

drop policy if exists "No public finance_records access" on public.finance_records;
create policy "No public finance_records access" on public.finance_records for all using (false) with check (false);

drop policy if exists "No public receipts access" on public.receipts;
create policy "No public receipts access" on public.receipts for all using (false) with check (false);

drop policy if exists "No public clients access" on public.clients;
create policy "No public clients access" on public.clients for all using (false) with check (false);

drop policy if exists "No public ops_items access" on public.ops_items;
create policy "No public ops_items access" on public.ops_items for all using (false) with check (false);

drop policy if exists "No public admin_users access" on public.admin_users;
create policy "No public admin_users access" on public.admin_users for all using (false) with check (false);

drop policy if exists "No public ops_activity_log access" on public.ops_activity_log;
create policy "No public ops_activity_log access" on public.ops_activity_log for all using (false) with check (false);

do $$
begin
  if to_regclass('public.admin_settings') is not null then
    insert into public.admin_settings (key, value)
    values
      ('default_admin_roles', '["owner","admin","operator","finance","content","viewer","hr"]'::jsonb),
      ('default_receipt_categories', '["software","ads","production","domain_hosting","contractor","travel","office","equipment","client_expense","general"]'::jsonb),
      ('default_finance_types', '["invoice","payment","expense","refund","subscription","tax","payroll","other"]'::jsonb),
      ('billing_automation_mode', '"manual_foundation"'::jsonb)
    on conflict (key) do update set value = excluded.value, updated_at = now();
  end if;
end $$;
