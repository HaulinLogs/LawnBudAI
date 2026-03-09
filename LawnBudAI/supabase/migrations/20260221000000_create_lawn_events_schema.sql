-- Phase 3.1: Lawn Care Events Schema (Safe for Re-deployment)

-- ============================================================================
-- MOW_EVENTS
-- ============================================================================
create table if not exists public.mow_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  height_inches decimal(5,2) not null check (height_inches > 0 and height_inches <= 6),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, date)
);

alter table public.mow_events enable row level security;

DO $$ 
BEGIN
    -- Policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users read own mow events') THEN
        create policy "Users read own mow events" on public.mow_events for select using (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users create own mow events') THEN
        create policy "Users create own mow events" on public.mow_events for insert with check (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users update own mow events') THEN
        create policy "Users update own mow events" on public.mow_events for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users delete own mow events') THEN
        create policy "Users delete own mow events" on public.mow_events for delete using (auth.uid() = user_id);
    END IF;

    -- Indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_mow_events_user_id') THEN
        create index idx_mow_events_user_id on public.mow_events(user_id);
    END IF;
END $$;

-- ============================================================================
-- WATER_EVENTS
-- ============================================================================
create table if not exists public.water_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  amount_inches decimal(4,2) not null check (amount_inches > 0 and amount_inches <= 3),
  source text not null default 'sprinkler' check (source in ('sprinkler', 'manual', 'rain')),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, date, source)
);

alter table public.water_events enable row level security;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users read own water events') THEN
        create policy "Users read own water events" on public.water_events for select using (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users create own water events') THEN
        create policy "Users create own water events" on public.water_events for insert with check (auth.uid() = user_id);
    END IF;
END $$;

-- ============================================================================
-- FERTILIZER_EVENTS
-- ============================================================================
create table if not exists public.fertilizer_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  amount_lbs decimal(6,2) not null check (amount_lbs > 0 and amount_lbs <= 100),
  type text not null default 'nitrogen' check (type in ('nitrogen', 'phosphorus', 'potassium', 'npk', 'organic', 'liquid', 'granular')),
  application_method text default 'spreader' check (application_method in ('spreader', 'spray', 'liquid', 'granular')),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, date)
);

alter table public.fertilizer_events enable row level security;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users read own fertilizer events') THEN
        create policy "Users read own fertilizer events" on public.fertilizer_events for select using (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users create own fertilizer events') THEN
        create policy "Users create own fertilizer events" on public.fertilizer_events for insert with check (auth.uid() = user_id);
    END IF;
END $$;

-- ============================================================================
-- VIEWS & FUNCTIONS (Always use OR REPLACE)
-- ============================================================================
drop view public.mowing_stats if exists;

create or replace view public.mowing_stats as
select
  user_id,
  count(*) as total_events,
  max(date) as last_mow_date,
  (current_date - max(date)) as days_since_mow,
  round(avg(height_inches)::numeric, 2) as avg_height_inches
from public.mow_events
group by user_id;

drop function public.get_days_since_mow(uuid);

create or replace function public.get_days_since_mow(p_user_id uuid)
returns integer language sql stable security definer as $$
  select coalesce((current_date - max(date))::integer, null)
  from public.mow_events
  where user_id = p_user_id;
$$;
