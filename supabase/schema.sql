-- Serenity – database schema
-- Safe to run multiple times (idempotent).

-- 1. Profiles table -------------------------------------------------------
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  stripe_customer_id text unique,
  stripe_subscription_id text,
  subscription_status text not null default 'free',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Add columns if upgrading an older install
alter table public.profiles add column if not exists stripe_subscription_id text;
alter table public.profiles add column if not exists updated_at timestamptz not null default now();

-- Webhooks look up profiles by customer id on every Stripe event.
create index if not exists profiles_stripe_customer_id_idx
  on public.profiles (stripe_customer_id);

-- 2. Row Level Security ---------------------------------------------------
alter table public.profiles enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Note: inserts happen via the security-definer trigger below, and the
-- service role (used by the Stripe webhook) bypasses RLS entirely.

-- 3. Auto-create a profile row when a user signs up -----------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4. Keep updated_at fresh ------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute procedure public.touch_updated_at();
