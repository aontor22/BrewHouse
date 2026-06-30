-- BrewHouse manual payment + admin/customer split support
-- Run this after 0001-0004 in Supabase SQL Editor.

-- Allow orders from locally bundled menu items when Supabase menu seed was not used.
alter table public.order_items alter column menu_item_id drop not null;

-- Make manual payment methods visible via orders.notes, and keep payment_status flexible.
alter table public.orders drop constraint if exists orders_payment_status_check;
alter table public.orders add constraint orders_payment_status_check check (
  payment_status in ('unpaid', 'pending', 'paid', 'refunded', 'failed')
);

-- Optional helper: after creating/logging into the admin account once, replace the email below and run it.
-- update public.profiles set role = 'admin' where id = (
--   select id from auth.users where email = 'admin@example.com' limit 1
-- );
