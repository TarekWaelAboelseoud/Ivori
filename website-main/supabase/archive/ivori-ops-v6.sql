-- Ivori Studio OS v6
-- EGP defaults, company settings seed, currency label migration.
--
-- MANUAL PRODUCTION STEP (required once):
--   1. Open Supabase → SQL Editor → New query
--   2. Paste this entire file and Run
--   3. Safe to re-run (idempotent)
--
-- SAFETY:
--   - Does NOT delete rows or change amount values
--   - Only changes currency column from 'USD' → 'EGP' (label only)
--   - Company settings merge via JSONB || (existing keys preserved)
--   - ALTER DEFAULT only affects new inserts

-- ─── 1. Default currency → EGP for new rows ───────────────────────────────
alter table if exists public.finance_records alter column currency set default 'EGP';
alter table if exists public.clients alter column currency set default 'EGP';
alter table if exists public.receipts alter column currency set default 'EGP';

-- ─── 2. Relabel existing USD rows to EGP (amounts unchanged) ──────────────
-- If you intentionally store USD amounts, skip these three lines.
update public.finance_records set currency = 'EGP' where currency = 'USD';
update public.clients set currency = 'EGP' where currency = 'USD';
update public.receipts set currency = 'EGP' where currency = 'USD';

-- ─── 3. Seed company settings for invoices (merge-safe upsert) ────────────
insert into public.admin_settings (key, value, updated_at)
values (
  'company',
  jsonb_build_object(
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
  ),
  now()
)
on conflict (key) do update set
  value = public.admin_settings.value || excluded.value,
  updated_at = now();

-- ─── 4. Indexes (create if missing) ───────────────────────────────────────
create index if not exists idx_finance_records_status on public.finance_records (status);
create index if not exists idx_finance_records_type on public.finance_records (type);
create index if not exists idx_receipts_status on public.receipts (status);
