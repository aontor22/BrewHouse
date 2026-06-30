-- ============================================================
-- Row Level Security (RLS) Policies
-- ============================================================

alter table public.profiles enable row level security;
alter table public.menu_items enable row level security;
alter table public.favourites enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.rewards enable row level security;
alter table public.redemptions enable row level security;

-- ---------- Helper: check if current user is staff/admin ----------
create function public.is_staff()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('staff', 'admin')
  );
$$ language sql security definer stable;

-- ---------- PROFILES ----------
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id or public.is_staff());

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- ---------- MENU ITEMS (public read, staff write) ----------
create policy "Anyone can view available menu items"
  on public.menu_items for select
  using (is_available = true or public.is_staff());

create policy "Staff can manage menu items"
  on public.menu_items for all
  using (public.is_staff());

-- ---------- FAVOURITES ----------
create policy "Users manage their own favourites"
  on public.favourites for all
  using (auth.uid() = user_id);

-- ---------- ORDERS ----------
create policy "Users view their own orders"
  on public.orders for select
  using (auth.uid() = user_id or public.is_staff());

create policy "Users create their own orders"
  on public.orders for insert
  with check (auth.uid() = user_id);

create policy "Staff can update any order"
  on public.orders for update
  using (public.is_staff());

create policy "Users can cancel their own pending orders"
  on public.orders for update
  using (auth.uid() = user_id and status = 'pending');

-- ---------- ORDER ITEMS ----------
create policy "Users view items on their own orders"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
      and (orders.user_id = auth.uid() or public.is_staff())
    )
  );

create policy "Users insert items on their own orders"
  on public.order_items for insert
  with check (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
    )
  );

-- ---------- REWARDS (public read, staff write) ----------
create policy "Anyone can view active rewards"
  on public.rewards for select
  using (is_active = true or public.is_staff());

create policy "Staff can manage rewards"
  on public.rewards for all
  using (public.is_staff());

-- ---------- REDEMPTIONS ----------
create policy "Users manage their own redemptions"
  on public.redemptions for all
  using (auth.uid() = user_id or public.is_staff());
