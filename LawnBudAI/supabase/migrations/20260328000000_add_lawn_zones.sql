-- Phase 3.6: Lawn Zones Schema
-- Allows users to define named zones within their lawn (e.g. Front Yard, Back Yard)
-- so that mowing, watering, fertilizing, and seeding events can be tracked per zone.

-- ============================================================================
-- LAWN_ZONES
-- ============================================================================
create table if not exists public.lawn_zones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) >= 1 and char_length(name) <= 100),
  size_sqft integer check (size_sqft is null or size_sqft > 0),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, name)
);

alter table public.lawn_zones enable row level security;

DO $$
BEGIN
  -- RLS Policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users read own lawn zones') THEN
    create policy "Users read own lawn zones"
      on public.lawn_zones for select
      using (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users create own lawn zones') THEN
    create policy "Users create own lawn zones"
      on public.lawn_zones for insert
      with check (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users update own lawn zones') THEN
    create policy "Users update own lawn zones"
      on public.lawn_zones for update
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users delete own lawn zones') THEN
    create policy "Users delete own lawn zones"
      on public.lawn_zones for delete
      using (auth.uid() = user_id);
  END IF;

  -- Indexes
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_lawn_zones_user_id') THEN
    create index idx_lawn_zones_user_id on public.lawn_zones(user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_lawn_zones_user_name') THEN
    create index idx_lawn_zones_user_name on public.lawn_zones(user_id, name);
  END IF;
END $$;
