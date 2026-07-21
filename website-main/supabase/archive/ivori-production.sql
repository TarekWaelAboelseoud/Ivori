-- =============================================================================
-- Ivori Digitals — Production database (single run)
-- Paste entire file into Supabase SQL Editor → Run once.
--
-- Safe on: fresh projects AND existing databases with schema drift.
-- Pattern: create shell (if missing) → add every column → migrate drift → indexes → RLS
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 0. Extensions (Supabase includes pgcrypto; gen_random_uuid lives in pgcrypto)
-- -----------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. Shared helpers
-- -----------------------------------------------------------------------------
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- 2. Studio inquiries (contact form + /admin/inquiries)
-- App fields: brand, about, needs, contact, status, priority, notes, region, source, activity_log
-- -----------------------------------------------------------------------------
create table if not exists public.studio_inquiries (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

alter table public.studio_inquiries add column if not exists brand text;
alter table public.studio_inquiries add column if not exists about text;
alter table public.studio_inquiries add column if not exists needs text;
alter table public.studio_inquiries add column if not exists contact text;
alter table public.studio_inquiries add column if not exists status text;
alter table public.studio_inquiries add column if not exists priority text;
alter table public.studio_inquiries add column if not exists notes text;
alter table public.studio_inquiries add column if not exists region text;
alter table public.studio_inquiries add column if not exists source text;
alter table public.studio_inquiries add column if not exists activity_log jsonb;

-- Legacy drift: some installs used "country" on inquiries; app uses "region"
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'studio_inquiries' and column_name = 'country'
  ) then
    if not exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'studio_inquiries' and column_name = 'region'
    ) then
      alter table public.studio_inquiries rename column country to region;
    else
      update public.studio_inquiries
      set region = coalesce(region, country)
      where region is null and country is not null;
    end if;
  end if;
end $$;

update public.studio_inquiries set status = 'new' where status is null;
update public.studio_inquiries set priority = 'normal' where priority is null;
update public.studio_inquiries set source = 'contact' where source is null;
update public.studio_inquiries set activity_log = '[]'::jsonb where activity_log is null;

alter table public.studio_inquiries alter column status set default 'new';
alter table public.studio_inquiries alter column priority set default 'normal';
alter table public.studio_inquiries alter column source set default 'contact';
alter table public.studio_inquiries alter column activity_log set default '[]'::jsonb;

alter table public.studio_inquiries alter column status set not null;
alter table public.studio_inquiries alter column priority set not null;
alter table public.studio_inquiries alter column source set not null;
alter table public.studio_inquiries alter column activity_log set not null;
alter table public.studio_inquiries alter column created_at set not null;

-- contact required for new rows (nullable OK for legacy rows missing contact)
do $$
begin
  if not exists (
    select 1 from public.studio_inquiries where contact is null limit 1
  ) then
    alter table public.studio_inquiries alter column contact set not null;
  end if;
exception
  when others then null;
end $$;

drop index if exists studio_inquiries_created_at_idx;
create index studio_inquiries_created_at_idx on public.studio_inquiries (created_at desc);

drop index if exists studio_inquiries_status_idx;
create index studio_inquiries_status_idx on public.studio_inquiries (status);

drop index if exists studio_inquiries_priority_idx;
create index studio_inquiries_priority_idx on public.studio_inquiries (priority);

drop index if exists studio_inquiries_status_priority_idx;
create index studio_inquiries_status_priority_idx on public.studio_inquiries (status, priority);

alter table public.studio_inquiries enable row level security;

drop policy if exists "Service role full access on studio_inquiries" on public.studio_inquiries;
create policy "Service role full access on studio_inquiries"
  on public.studio_inquiries for all
  using (true)
  with check (true);

-- -----------------------------------------------------------------------------
-- 3. Outbound leads pipeline (/admin/leads)
-- App fields: brand_name, store_url, country, niche, contacts, scores, status, source, notes, …
-- -----------------------------------------------------------------------------
create table if not exists public.leads (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.leads add column if not exists brand_name text;
alter table public.leads add column if not exists store_url text;
alter table public.leads add column if not exists country text;
alter table public.leads add column if not exists niche text;
alter table public.leads add column if not exists contact_email text;
alter table public.leads add column if not exists contact_name text;
alter table public.leads add column if not exists contact_instagram text;
alter table public.leads add column if not exists lead_score integer;
alter table public.leads add column if not exists cro_opportunity_score integer;
alter table public.leads add column if not exists ad_activity text;
alter table public.leads add column if not exists implementation_opportunity text;
alter table public.leads add column if not exists status text;
alter table public.leads add column if not exists contacted_at timestamptz;
alter table public.leads add column if not exists last_followup_at timestamptz;
alter table public.leads add column if not exists won_at timestamptz;
alter table public.leads add column if not exists ai_assessment jsonb;
alter table public.leads add column if not exists outreach_copy jsonb;
alter table public.leads add column if not exists notes text;
alter table public.leads add column if not exists source text;

-- Legacy drift: region-only leads tables → copy into country (app reads country)
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'leads' and column_name = 'region'
  ) then
    if not exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'leads' and column_name = 'country'
    ) then
      alter table public.leads rename column region to country;
    else
      update public.leads
      set country = coalesce(country, region)
      where country is null and region is not null;
    end if;
  end if;
end $$;

update public.leads set lead_score = 0 where lead_score is null;
update public.leads set status = 'new' where status is null;
update public.leads set ai_assessment = '{}'::jsonb where ai_assessment is null;
update public.leads set outreach_copy = '{}'::jsonb where outreach_copy is null;
update public.leads set store_url = coalesce(store_url, '') where store_url is null;

alter table public.leads alter column lead_score set default 0;
alter table public.leads alter column status set default 'new';
alter table public.leads alter column ai_assessment set default '{}'::jsonb;
alter table public.leads alter column outreach_copy set default '{}'::jsonb;
alter table public.leads alter column status set not null;

drop index if exists leads_status_idx;
create index leads_status_idx on public.leads (status);

drop index if exists leads_country_idx;
create index leads_country_idx on public.leads (country);

drop index if exists leads_lead_score_idx;
create index leads_lead_score_idx on public.leads (lead_score desc);

drop trigger if exists leads_updated_at on public.leads;
create trigger leads_updated_at
  before update on public.leads
  for each row execute function public.update_updated_at();

alter table public.leads enable row level security;

drop policy if exists "Service role full access on leads" on public.leads;
create policy "Service role full access on leads"
  on public.leads for all
  using (true)
  with check (true);

-- -----------------------------------------------------------------------------
-- 4. Audit orders + audits (/admin/queue, checkout, intake)
-- App: orders.region (not country), orders.status, tier, intake_token, …
-- -----------------------------------------------------------------------------
create table if not exists public.orders (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.orders add column if not exists payment_id text;
alter table public.orders add column if not exists email text;
alter table public.orders add column if not exists amount_cents integer;
alter table public.orders add column if not exists currency text;
alter table public.orders add column if not exists region text;
alter table public.orders add column if not exists tier text;
alter table public.orders add column if not exists status text;
alter table public.orders add column if not exists intake_token text;

-- Legacy drift: country on orders → region
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'orders' and column_name = 'country'
  ) then
    if not exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'orders' and column_name = 'region'
    ) then
      alter table public.orders rename column country to region;
    else
      update public.orders
      set region = coalesce(region, country)
      where region is null and country is not null;
    end if;
  end if;
end $$;

update public.orders set currency = 'usd' where currency is null;
update public.orders set region = 'international' where region is null;
update public.orders set tier = 'starter' where tier is null;
update public.orders set status = 'pending_intake' where status is null;
update public.orders set intake_token = gen_random_uuid()::text where intake_token is null;

alter table public.orders alter column currency set default 'usd';
alter table public.orders alter column region set default 'international';
alter table public.orders alter column tier set default 'starter';
alter table public.orders alter column status set default 'pending_intake';

-- Unique constraints (only if no duplicates)
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'orders_payment_id_key'
  ) then
    alter table public.orders add constraint orders_payment_id_key unique (payment_id);
  end if;
exception
  when others then null;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'orders_intake_token_key'
  ) then
    alter table public.orders add constraint orders_intake_token_key unique (intake_token);
  end if;
exception
  when others then null;
end $$;

drop index if exists orders_email_idx;
create index orders_email_idx on public.orders (email);

drop index if exists orders_status_idx;
create index orders_status_idx on public.orders (status);

drop index if exists orders_intake_token_idx;
create index orders_intake_token_idx on public.orders (intake_token);

drop trigger if exists orders_updated_at on public.orders;
create trigger orders_updated_at
  before update on public.orders
  for each row execute function public.update_updated_at();

alter table public.orders enable row level security;

drop policy if exists "Service role full access on orders" on public.orders;
create policy "Service role full access on orders"
  on public.orders for all using (true) with check (true);

-- Audits (child of orders)
create table if not exists public.audits (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.audits add column if not exists order_id uuid;
alter table public.audits add column if not exists store_url text;
alter table public.audits add column if not exists intake_data jsonb;
alter table public.audits add column if not exists ai_report jsonb;
alter table public.audits add column if not exists reviewer_notes text;
alter table public.audits add column if not exists pdf_url text;
alter table public.audits add column if not exists upsell_sent boolean;
alter table public.audits add column if not exists delivered_at timestamptz;

update public.audits set intake_data = '{}'::jsonb where intake_data is null;
update public.audits set ai_report = '{}'::jsonb where ai_report is null;
update public.audits set upsell_sent = false where upsell_sent is null;

alter table public.audits alter column intake_data set default '{}'::jsonb;
alter table public.audits alter column ai_report set default '{}'::jsonb;
alter table public.audits alter column upsell_sent set default false;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'audits_order_id_fkey'
  ) then
    alter table public.audits
      add constraint audits_order_id_fkey
      foreign key (order_id) references public.orders (id) on delete cascade;
  end if;
exception
  when others then null;
end $$;

drop index if exists audits_order_id_idx;
create index audits_order_id_idx on public.audits (order_id);

drop trigger if exists audits_updated_at on public.audits;
create trigger audits_updated_at
  before update on public.audits
  for each row execute function public.update_updated_at();

alter table public.audits enable row level security;

drop policy if exists "Service role full access on audits" on public.audits;
create policy "Service role full access on audits"
  on public.audits for all using (true) with check (true);

-- -----------------------------------------------------------------------------
-- Done. Tables: studio_inquiries, leads, orders, audits
-- -----------------------------------------------------------------------------
