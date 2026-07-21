-- =============================================================================
-- Ivori Digitals — Production database v2 (single run)
-- Supersedes ivori-production.sql for new deployments and migrations.
-- Paste entire file into Supabase SQL Editor → Run once.
--
-- Safe on: fresh projects AND existing databases with schema drift.
-- =============================================================================

create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- Helpers
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
-- Studio inquiries (contact form + /studio-ops/inquiries)
-- -----------------------------------------------------------------------------
create table if not exists public.studio_inquiries (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Core contact
alter table public.studio_inquiries add column if not exists brand text;
alter table public.studio_inquiries add column if not exists company_name text;
alter table public.studio_inquiries add column if not exists about text;
alter table public.studio_inquiries add column if not exists needs text;
alter table public.studio_inquiries add column if not exists contact text;
alter table public.studio_inquiries add column if not exists goals text;

-- Qualification
alter table public.studio_inquiries add column if not exists project_type text;
alter table public.studio_inquiries add column if not exists project_stage text;
alter table public.studio_inquiries add column if not exists budget_range text;
alter table public.studio_inquiries add column if not exists timeline text;
alter table public.studio_inquiries add column if not exists pain_points text;
alter table public.studio_inquiries add column if not exists revenue_band text;

-- Channels
alter table public.studio_inquiries add column if not exists preferred_contact_method text;
alter table public.studio_inquiries add column if not exists whatsapp text;
alter table public.studio_inquiries add column if not exists instagram text;

-- Ops
alter table public.studio_inquiries add column if not exists status text;
alter table public.studio_inquiries add column if not exists priority text;
alter table public.studio_inquiries add column if not exists notes text;
alter table public.studio_inquiries add column if not exists archived boolean;
alter table public.studio_inquiries add column if not exists tags text[];
alter table public.studio_inquiries add column if not exists assigned_to text;
alter table public.studio_inquiries add column if not exists source text;
alter table public.studio_inquiries add column if not exists region text;
alter table public.studio_inquiries add column if not exists last_contacted_at timestamptz;
alter table public.studio_inquiries add column if not exists internal_summary text;
alter table public.studio_inquiries add column if not exists follow_up_date date;
alter table public.studio_inquiries add column if not exists lead_score integer;
alter table public.studio_inquiries add column if not exists activity_log jsonb;
-- v1 installs only had id + created_at; CREATE TABLE IF NOT EXISTS skips adding updated_at
alter table public.studio_inquiries add column if not exists updated_at timestamptz;

-- Legacy drift: country → region
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
update public.studio_inquiries set archived = false where archived is null;
update public.studio_inquiries set lead_score = 0 where lead_score is null;
update public.studio_inquiries set tags = '{}'::text[] where tags is null;
update public.studio_inquiries
set updated_at = coalesce(updated_at, created_at, now())
where updated_at is null;

alter table public.studio_inquiries alter column updated_at set default now();

alter table public.studio_inquiries alter column status set default 'new';
alter table public.studio_inquiries alter column priority set default 'normal';
alter table public.studio_inquiries alter column source set default 'contact';
alter table public.studio_inquiries alter column activity_log set default '[]'::jsonb;
alter table public.studio_inquiries alter column archived set default false;
alter table public.studio_inquiries alter column lead_score set default 0;
alter table public.studio_inquiries alter column tags set default '{}'::text[];

alter table public.studio_inquiries alter column status set not null;
alter table public.studio_inquiries alter column priority set not null;
alter table public.studio_inquiries alter column source set not null;
alter table public.studio_inquiries alter column activity_log set not null;
alter table public.studio_inquiries alter column archived set not null;
alter table public.studio_inquiries alter column lead_score set not null;
alter table public.studio_inquiries alter column created_at set not null;

do $$
begin
  alter table public.studio_inquiries alter column updated_at set not null;
exception
  when others then null;
end $$;

drop trigger if exists studio_inquiries_updated_at on public.studio_inquiries;
create trigger studio_inquiries_updated_at
  before update on public.studio_inquiries
  for each row execute function public.update_updated_at();

drop index if exists studio_inquiries_created_at_idx;
create index studio_inquiries_created_at_idx on public.studio_inquiries (created_at desc);

drop index if exists studio_inquiries_status_idx;
create index studio_inquiries_status_idx on public.studio_inquiries (status);

drop index if exists studio_inquiries_priority_idx;
create index studio_inquiries_priority_idx on public.studio_inquiries (priority);

drop index if exists studio_inquiries_status_priority_idx;
create index studio_inquiries_status_priority_idx on public.studio_inquiries (status, priority);

drop index if exists studio_inquiries_archived_idx;
create index studio_inquiries_archived_idx on public.studio_inquiries (archived);

drop index if exists studio_inquiries_follow_up_idx;
create index studio_inquiries_follow_up_idx on public.studio_inquiries (follow_up_date);

drop index if exists studio_inquiries_lead_score_idx;
create index studio_inquiries_lead_score_idx on public.studio_inquiries (lead_score desc);

drop index if exists studio_inquiries_assigned_idx;
create index studio_inquiries_assigned_idx on public.studio_inquiries (assigned_to);

drop index if exists studio_inquiries_tags_gin_idx;
create index studio_inquiries_tags_gin_idx on public.studio_inquiries using gin (tags);

alter table public.studio_inquiries enable row level security;

drop policy if exists "Service role full access on studio_inquiries" on public.studio_inquiries;
create policy "Service role full access on studio_inquiries"
  on public.studio_inquiries for all using (true) with check (true);

-- -----------------------------------------------------------------------------
-- Inquiry activity log (timeline; complements activity_log jsonb)
-- -----------------------------------------------------------------------------
create table if not exists public.inquiry_activity_log (
  id         uuid primary key default gen_random_uuid(),
  inquiry_id uuid not null references public.studio_inquiries (id) on delete cascade,
  action     text not null,
  actor      text not null default 'system',
  metadata   jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

drop index if exists inquiry_activity_log_inquiry_idx;
create index inquiry_activity_log_inquiry_idx on public.inquiry_activity_log (inquiry_id, created_at desc);

alter table public.inquiry_activity_log enable row level security;

drop policy if exists "Service role full access on inquiry_activity_log" on public.inquiry_activity_log;
create policy "Service role full access on inquiry_activity_log"
  on public.inquiry_activity_log for all using (true) with check (true);

-- -----------------------------------------------------------------------------
-- Admin settings (site + feature toggles)
-- -----------------------------------------------------------------------------
create table if not exists public.admin_settings (
  key         text primary key,
  value       jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

drop trigger if exists admin_settings_updated_at on public.admin_settings;
create trigger admin_settings_updated_at
  before update on public.admin_settings
  for each row execute function public.update_updated_at();

insert into public.admin_settings (key, value)
values
  ('site', '{"maintenance": false}'::jsonb),
  ('whatsapp', '{"channel": "footer", "enabled": true}'::jsonb),
  ('seo', '{}'::jsonb),
  ('features', '{"notes_public": true}'::jsonb)
on conflict (key) do nothing;

alter table public.admin_settings enable row level security;

drop policy if exists "Service role full access on admin_settings" on public.admin_settings;
create policy "Service role full access on admin_settings"
  on public.admin_settings for all using (true) with check (true);

-- -----------------------------------------------------------------------------
-- Admin audit / security log
-- -----------------------------------------------------------------------------
create table if not exists public.admin_audit_log (
  id          uuid primary key default gen_random_uuid(),
  event_type  text not null,
  path        text,
  ip_hash     text,
  metadata    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

drop index if exists admin_audit_log_created_idx;
create index admin_audit_log_created_idx on public.admin_audit_log (created_at desc);

drop index if exists admin_audit_log_event_idx;
create index admin_audit_log_event_idx on public.admin_audit_log (event_type);

alter table public.admin_audit_log enable row level security;

drop policy if exists "Service role full access on admin_audit_log" on public.admin_audit_log;
create policy "Service role full access on admin_audit_log"
  on public.admin_audit_log for all using (true) with check (true);

-- -----------------------------------------------------------------------------
-- Leads pipeline
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

update public.leads set lead_score = 0 where lead_score is null;
update public.leads set status = 'new' where status is null;
update public.leads set ai_assessment = '{}'::jsonb where ai_assessment is null;
update public.leads set outreach_copy = '{}'::jsonb where outreach_copy is null;
update public.leads set store_url = coalesce(store_url, '') where store_url is null;

alter table public.leads alter column lead_score set default 0;
alter table public.leads alter column status set default 'new';
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
  on public.leads for all using (true) with check (true);

-- -----------------------------------------------------------------------------
-- Orders + audits
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

update public.orders set currency = 'usd' where currency is null;
update public.orders set region = 'international' where region is null;
update public.orders set tier = 'starter' where tier is null;
update public.orders set status = 'pending_intake' where status is null;
update public.orders set intake_token = gen_random_uuid()::text where intake_token is null;

alter table public.orders alter column currency set default 'usd';
alter table public.orders alter column region set default 'international';
alter table public.orders alter column tier set default 'starter';
alter table public.orders alter column status set default 'pending_intake';

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'orders_payment_id_key') then
    alter table public.orders add constraint orders_payment_id_key unique (payment_id);
  end if;
exception when others then null;
end $$;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'orders_intake_token_key') then
    alter table public.orders add constraint orders_intake_token_key unique (intake_token);
  end if;
exception when others then null;
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
  if not exists (select 1 from pg_constraint where conname = 'audits_order_id_fkey') then
    alter table public.audits
      add constraint audits_order_id_fkey
      foreign key (order_id) references public.orders (id) on delete cascade;
  end if;
exception when others then null;
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
-- Done. Tables:
-- studio_inquiries, inquiry_activity_log, admin_settings, admin_audit_log,
-- leads, orders, audits
-- -----------------------------------------------------------------------------
