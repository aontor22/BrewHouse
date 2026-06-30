-- ============================================================
-- BrewHouse Database Schema
-- Run via: supabase db push
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  phone text,
  avatar_url text,
  loyalty_points integer not null default 0,
  loyalty_stamps integer not null default 0,
  role text not null default 'customer' check (role in ('customer', 'staff', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create profile when a user signs up
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (new.id, new.raw_user_meta_data->>'full_name', new.phone);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- MENU ITEMS
-- ============================================================
create table public.menu_items (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  price numeric(10,2) not null,
  category text not null check (category in ('Hot', 'Cold', 'Food')),
  emoji text,
  image_url text,
  is_available boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ============================================================
-- FAVOURITES (saved items per user)
-- ============================================================
create table public.favourites (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  menu_item_id uuid references public.menu_items(id) on delete cascade not null,
  customisation text,
  created_at timestamptz not null default now(),
  unique(user_id, menu_item_id)
);

-- ============================================================
-- ORDERS
-- ============================================================
create table public.orders (
  id uuid primary key default uuid_generate_v4(),
  order_number text not null unique,
  user_id uuid references public.profiles(id) on delete cascade not null,
  status text not null default 'pending' check (
    status in ('pending', 'confirmed', 'brewing', 'ready', 'completed', 'cancelled')
  ),
  subtotal numeric(10,2) not null,
  tax numeric(10,2) not null,
  total numeric(10,2) not null,
  payment_status text not null default 'unpaid' check (
    payment_status in ('unpaid', 'paid', 'refunded', 'failed')
  ),
  stripe_payment_intent_id text,
  points_earned integer default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-generate order numbers like #2847
create sequence public.order_number_seq start 2800;

create function public.generate_order_number()
returns trigger as $$
begin
  new.order_number := '#' || nextval('public.order_number_seq');
  return new;
end;
$$ language plpgsql;

create trigger set_order_number
  before insert on public.orders
  for each row execute procedure public.generate_order_number();

-- ============================================================
-- ORDER ITEMS
-- ============================================================
create table public.order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references public.orders(id) on delete cascade not null,
  menu_item_id uuid references public.menu_items(id) not null,
  name text not null, -- snapshot in case menu item changes later
  price numeric(10,2) not null, -- snapshot
  quantity integer not null default 1,
  customisation text
);

-- ============================================================
-- REWARDS (redeemable catalogue)
-- ============================================================
create table public.rewards (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  points_cost integer not null,
  emoji text,
  is_active boolean not null default true
);

-- ============================================================
-- REWARD REDEMPTIONS
-- ============================================================
create table public.redemptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  reward_id uuid references public.rewards(id) not null,
  points_spent integer not null,
  redeemed_at timestamptz not null default now(),
  used boolean not null default false
);

-- ============================================================
-- INDEXES
-- ============================================================
create index idx_orders_user_id on public.orders(user_id);
create index idx_orders_status on public.orders(status);
create index idx_orders_created_at on public.orders(created_at desc);
create index idx_order_items_order_id on public.order_items(order_id);
create index idx_favourites_user_id on public.favourites(user_id);
create index idx_menu_items_category on public.menu_items(category);

-- ============================================================
-- updated_at triggers
-- ============================================================
create function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at before update on public.profiles
  for each row execute procedure public.set_updated_at();

create trigger orders_updated_at before update on public.orders
  for each row execute procedure public.set_updated_at();
