-- Migration 0006: Remove Stripe references, update status flow
-- Run this after 0001-0005 in Supabase SQL Editor.

-- Update orders status check to use correct MVP flow:
-- pending → accepted → preparing → ready → completed
alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check check (
  status in ('pending', 'accepted', 'preparing', 'ready', 'completed', 'cancelled')
);

-- Make stripe_payment_intent_id nullable (it already is, but make it explicit)
-- No new columns needed — payment method is stored in orders.notes

-- Ensure payment_status supports manual confirmation
alter table public.orders drop constraint if exists orders_payment_status_check;
alter table public.orders add constraint orders_payment_status_check check (
  payment_status in ('unpaid', 'paid', 'refunded')
);

-- Allow staff to mark payment as paid
drop policy if exists "Staff can mark payment paid" on public.orders;
create policy "Staff can mark payment paid"
  on public.orders for update
  using (public.is_staff())
  with check (public.is_staff());
