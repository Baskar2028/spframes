-- Run this in Supabase SQL Editor. Replace admin email in the final insert flow by creating an Auth user first.
create extension if not exists pgcrypto;
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  service_name text not null,
  description text not null default '',
  price numeric(12,2) not null check (price > 0),
  active boolean not null default true,
  updated_at timestamptz not null default now()
);
create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  phone text not null,
  email text not null,
  service text not null,
  event_date date,
  message text not null,
  created_at timestamptz not null default now(),
  status text not null default 'pending',
  constraint enquiries_status_check check (status in ('pending', 'completed'))
);
alter table public.enquiries
  add column if not exists status text not null default 'pending';
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'enquiries_status_check'
      and conrelid = 'public.enquiries'::regclass
  ) then
    alter table public.enquiries
      add constraint enquiries_status_check
      check (status in ('pending', 'completed'));
  end if;
end;
$$;
create index if not exists enquiries_status_created_at_idx
  on public.enquiries(status, created_at desc);
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.services enable row level security;
alter table public.enquiries enable row level security;
alter table public.admin_users enable row level security;
drop policy if exists "Public can read active services" on public.services;
create policy "Public can read active services" on public.services for select using (active = true);
drop policy if exists "Admins can update services" on public.services;
create policy "Admins can update services" on public.services for update to authenticated using (exists(select 1 from public.admin_users a where a.user_id = auth.uid())) with check (exists(select 1 from public.admin_users a where a.user_id = auth.uid()));
drop policy if exists "Public can submit enquiries" on public.enquiries;
create policy "Public can submit enquiries" on public.enquiries for insert to anon, authenticated with check (char_length(customer_name) between 2 and 120 and char_length(message) >= 10);
drop policy if exists "Admins can read enquiries" on public.enquiries;
create policy "Admins can read enquiries" on public.enquiries for select to authenticated using (exists(select 1 from public.admin_users a where a.user_id = auth.uid()));
drop policy if exists "Admins can update booking status" on public.enquiries;
create policy "Admins can update booking status" on public.enquiries
  for update to authenticated
  using (exists(select 1 from public.admin_users a where a.user_id = auth.uid()))
  with check (
    status in ('pending', 'completed')
    and exists(select 1 from public.admin_users a where a.user_id = auth.uid())
  );
revoke update on public.enquiries from authenticated;
grant update (status) on public.enquiries to authenticated;
drop policy if exists "Admins can delete bookings" on public.enquiries;
create policy "Admins can delete bookings" on public.enquiries
  for delete to authenticated
  using (exists(select 1 from public.admin_users a where a.user_id = auth.uid()));
revoke delete on public.enquiries from anon, authenticated;
grant delete on public.enquiries to authenticated;
drop policy if exists "Admins can read own admin record" on public.admin_users;
create policy "Admins can read own admin record" on public.admin_users for select to authenticated using (user_id = auth.uid());
insert into public.services(slug,service_name,description,price) values
('wedding','Wedding Photography','Timeless coverage of your wedding day.',25000),
('prewedding','Prewedding Photography','Romantic, story-driven couple sessions.',12000),
('postwedding','Postwedding Photography','Relaxed couple portraits after the wedding.',15000),
('birthday','Birthday Photography','Candid coverage of birthday celebrations.',8000),
('yellow-festival','Yellow Festival Photography','Coverage of the yellow festival / puberty ceremony.',10000),
('baby-shower','Baby Shower Photography','Warm photographs of baby shower celebrations.',9000)
on conflict(slug) do nothing;
-- Create an Auth user in Supabase Dashboard > Authentication > Users.
-- Then add that user's UUID here, replacing the example:
-- insert into public.admin_users(user_id) values ('AUTH-USER-UUID-HERE');
-- Never put a Supabase service_role key in frontend code.
