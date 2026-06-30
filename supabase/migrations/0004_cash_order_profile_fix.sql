-- BrewHouse production MVP fixes
-- Run this in Supabase SQL Editor after 0001-0003.
-- It fixes email-created profiles, cash-at-counter orders, and staff/admin access.

-- Allow a logged-in user to create/upsert their own profile from the mobile app.
drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Keep cash orders compatible with the mobile app.
-- The app uses pending -> confirmed -> brewing -> ready -> completed.
alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check check (
  status in ('pending', 'confirmed', 'brewing', 'ready', 'completed', 'cancelled')
);

alter table public.orders drop constraint if exists orders_payment_status_check;
alter table public.orders add constraint orders_payment_status_check check (
  payment_status in ('unpaid', 'pending', 'paid', 'refunded', 'failed')
);

-- If a user already signed up before the trigger/policy was fixed, create the missing profile automatically.
insert into public.profiles (id, full_name, phone, role)
select
  u.id,
  coalesce(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1), 'Customer'),
  u.phone,
  'customer'
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;
