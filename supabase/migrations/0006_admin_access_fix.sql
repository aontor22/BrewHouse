-- BrewHouse admin access troubleshooting/fix
-- Run this after creating the admin account.

-- 1) Check which auth users are connected to profiles:
select u.id, u.email, p.full_name, p.role
from auth.users u
left join public.profiles p on p.id = u.id
order by u.created_at desc;

-- 2) Replace admin@example.com with your admin login email, then run this block:
-- insert into public.profiles (id, full_name, role)
-- select id, coalesce(raw_user_meta_data->>'full_name', email), 'admin'
-- from auth.users
-- where email = 'admin@example.com'
-- on conflict (id) do update
-- set role = 'admin',
--     full_name = coalesce(public.profiles.full_name, excluded.full_name);

-- 3) Keep staff/admin checks simple and stable.
create or replace function public.is_staff()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and lower(trim(role)) in ('staff', 'admin')
  );
$$;
