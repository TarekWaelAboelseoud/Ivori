-- Ivori Studio Ops v5
-- Surgical RBAC/customer/inquiry upgrade. Idempotent. Preserves existing data.

create extension if not exists pgcrypto;

do $$
begin
  if exists (select 1 from pg_type where typname = 'admin_user_role') then
    alter type admin_user_role add value if not exists 'administrator';
    alter type admin_user_role add value if not exists 'operations';
    alter type admin_user_role add value if not exists 'sales';
    alter type admin_user_role add value if not exists 'content_studio';
  end if;
  if exists (select 1 from pg_type where typname = 'finance_record_status') then
    alter type finance_record_status add value if not exists 'unpaid';
    alter type finance_record_status add value if not exists 'partial';
  end if;
end $$;

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  industry text,
  region text,
  website text,
  instagram text,
  shopify_url text,
  status text not null default 'lead' check (status in ('lead','active','paused','churned','archived')),
  notes text,
  archived boolean not null default false,
  archived_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete set null,
  name text,
  role text,
  email text,
  phone text,
  whatsapp text,
  preferred_channel text,
  notes text,
  archived boolean not null default false,
  archived_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.client_timeline (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete set null,
  inquiry_id uuid,
  finance_record_id uuid,
  stage text not null check (stage in ('inquiry','audit','proposal','invoice','active_client','note')),
  title text not null,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_role_permissions (
  role text primary key,
  permissions jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.studio_inquiries add column if not exists country text;
alter table public.studio_inquiries add column if not exists city text;
alter table public.studio_inquiries add column if not exists owner_id uuid;
alter table public.studio_inquiries add column if not exists company_id uuid references public.companies(id) on delete set null;
alter table public.studio_inquiries add column if not exists contact_id uuid references public.contacts(id) on delete set null;
alter table public.studio_inquiries add column if not exists archived_at timestamptz;

alter table public.finance_records add column if not exists company_id uuid references public.companies(id) on delete set null;
alter table public.finance_records add column if not exists contact_id uuid references public.contacts(id) on delete set null;
alter table public.finance_records add column if not exists paid_amount numeric(12,2) not null default 0;
alter table public.finance_records add column if not exists balance_due numeric(12,2) generated always as (amount - paid_amount) stored;

alter table public.receipts add column if not exists company_id uuid references public.companies(id) on delete set null;
alter table public.receipts add column if not exists finance_record_id uuid references public.finance_records(id) on delete set null;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists companies_set_updated_at on public.companies;
create trigger companies_set_updated_at before update on public.companies for each row execute function public.set_updated_at();

drop trigger if exists contacts_set_updated_at on public.contacts;
create trigger contacts_set_updated_at before update on public.contacts for each row execute function public.set_updated_at();

drop trigger if exists admin_role_permissions_set_updated_at on public.admin_role_permissions;
create trigger admin_role_permissions_set_updated_at before update on public.admin_role_permissions for each row execute function public.set_updated_at();

create index if not exists companies_status_idx on public.companies(status);
create index if not exists companies_name_idx on public.companies(lower(name));
create index if not exists companies_archived_idx on public.companies(archived);
create index if not exists contacts_company_id_idx on public.contacts(company_id);
create index if not exists contacts_email_idx on public.contacts(lower(email));
create index if not exists contacts_archived_idx on public.contacts(archived);
create index if not exists client_timeline_company_id_idx on public.client_timeline(company_id, created_at desc);
create index if not exists studio_inquiries_status_idx on public.studio_inquiries(status);
create index if not exists studio_inquiries_priority_idx on public.studio_inquiries(priority);
create index if not exists studio_inquiries_source_idx on public.studio_inquiries(source);
create index if not exists studio_inquiries_owner_id_idx on public.studio_inquiries(owner_id);
create index if not exists studio_inquiries_company_id_idx on public.studio_inquiries(company_id);
create index if not exists studio_inquiries_follow_up_idx on public.studio_inquiries(follow_up_date);
create index if not exists finance_records_company_id_idx on public.finance_records(company_id);
create index if not exists receipts_company_id_idx on public.receipts(company_id);
create index if not exists receipts_finance_record_id_idx on public.receipts(finance_record_id);

alter table public.companies enable row level security;
alter table public.contacts enable row level security;
alter table public.client_timeline enable row level security;
alter table public.admin_role_permissions enable row level security;

drop policy if exists "No public companies access" on public.companies;
create policy "No public companies access" on public.companies for all using (false) with check (false);
drop policy if exists "No public contacts access" on public.contacts;
create policy "No public contacts access" on public.contacts for all using (false) with check (false);
drop policy if exists "No public client_timeline access" on public.client_timeline;
create policy "No public client_timeline access" on public.client_timeline for all using (false) with check (false);
drop policy if exists "No public admin_role_permissions access" on public.admin_role_permissions;
create policy "No public admin_role_permissions access" on public.admin_role_permissions for all using (false) with check (false);

insert into public.admin_role_permissions(role, permissions)
values
  ('administrator', '{"all":true}'::jsonb),
  ('finance', '{"command":["read"],"clients":["read"],"finance":["read","write"],"receipts":["read","write"]}'::jsonb),
  ('operations', '{"command":["read"],"inquiries":["read","write"],"clients":["read","write"],"studio":["read","write"]}'::jsonb),
  ('sales', '{"command":["read"],"inquiries":["read","write"],"clients":["read","write"]}'::jsonb),
  ('content_studio', '{"command":["read"],"studio":["read","write"],"clients":["read"]}'::jsonb),
  ('viewer', '{"command":["read"],"inquiries":["read"],"clients":["read"],"studio":["read"]}'::jsonb)
on conflict (role) do update set permissions = excluded.permissions, updated_at = now();
