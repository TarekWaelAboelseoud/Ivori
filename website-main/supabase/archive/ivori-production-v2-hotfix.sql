-- Run this ONLY if v2 failed with: column "updated_at" of relation "studio_inquiries" does not exist
-- Then re-run the full ivori-production-v2.sql from the top (idempotent).

alter table public.studio_inquiries add column if not exists updated_at timestamptz;

update public.studio_inquiries
set updated_at = coalesce(updated_at, created_at, now())
where updated_at is null;

alter table public.studio_inquiries alter column updated_at set default now();

drop trigger if exists studio_inquiries_updated_at on public.studio_inquiries;
create trigger studio_inquiries_updated_at
  before update on public.studio_inquiries
  for each row execute function public.update_updated_at();
