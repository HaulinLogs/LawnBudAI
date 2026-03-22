-- Phase 3.5: Seed Events Schema
-- Records overseeding events so the app can track germination progress,
-- show watering reminders, and build a seeding history.

-- ============================================================================
-- SEED_EVENTS
-- ============================================================================
create table if not exists public.seed_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  grass_seed_type text not null default 'unknown' check (
    grass_seed_type in (
      'kentucky_bluegrass',
      'tall_fescue',
      'perennial_ryegrass',
      'fine_fescue',
      'bermudagrass',
      'zoysiagrass',
      'st_augustine',
      'centipede',
      'annual_ryegrass',
      'mixed',
      'unknown'
    )
  ),
  area_sqft integer check (area_sqft > 0),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, date)
);

alter table public.seed_events enable row level security;

DO $$
BEGIN
  -- RLS Policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users read own seed events') THEN
    create policy "Users read own seed events"
      on public.seed_events for select
      using (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users create own seed events') THEN
    create policy "Users create own seed events"
      on public.seed_events for insert
      with check (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users update own seed events') THEN
    create policy "Users update own seed events"
      on public.seed_events for update
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users delete own seed events') THEN
    create policy "Users delete own seed events"
      on public.seed_events for delete
      using (auth.uid() = user_id);
  END IF;

  -- Indexes
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_seed_events_user_id') THEN
    create index idx_seed_events_user_id on public.seed_events(user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_seed_events_user_date') THEN
    create index idx_seed_events_user_date on public.seed_events(user_id, date desc);
  END IF;
END $$;
