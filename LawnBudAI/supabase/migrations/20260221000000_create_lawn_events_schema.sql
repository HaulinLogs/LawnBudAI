-- Phase 3.1: Lawn Care Events Schema
-- Tracks mowing, watering, and fertilizing events
-- Auto-applied via supabase db push during deployment

-- ============================================================================
-- MOW_EVENTS TABLE
-- ============================================================================
-- Records lawn mowing events with height measurements

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

create policy "Users read own mow events"
  on public.mow_events for select
  using (auth.uid() = user_id);

create policy "Users create own mow events"
  on public.mow_events for insert
  with check (auth.uid() = user_id);

create policy "Users update own mow events"
  on public.mow_events for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users delete own mow events"
  on public.mow_events for delete
  using (auth.uid() = user_id);

create index idx_mow_events_user_id on public.mow_events(user_id);
create index idx_mow_events_date on public.mow_events(date);
create index idx_mow_events_user_date on public.mow_events(user_id, date desc);
create index idx_mow_events_created_at on public.mow_events(created_at desc);

-- ============================================================================
-- WATER_EVENTS TABLE
-- ============================================================================
-- Records lawn watering events with amount and source tracking

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

create policy "Users read own water events"
  on public.water_events for select
  using (auth.uid() = user_id);

create policy "Users create own water events"
  on public.water_events for insert
  with check (auth.uid() = user_id);

create policy "Users update own water events"
  on public.water_events for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users delete own water events"
  on public.water_events for delete
  using (auth.uid() = user_id);

create index idx_water_events_user_id on public.water_events(user_id);
create index idx_water_events_date on public.water_events(date);
create index idx_water_events_source on public.water_events(source);
create index idx_water_events_user_date on public.water_events(user_id, date desc);
create index idx_water_events_created_at on public.water_events(created_at desc);

-- ============================================================================
-- FERTILIZER_EVENTS TABLE
-- ============================================================================
-- Records lawn fertilizer application events with type tracking

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

create policy "Users read own fertilizer events"
  on public.fertilizer_events for select
  using (auth.uid() = user_id);

create policy "Users create own fertilizer events"
  on public.fertilizer_events for insert
  with check (auth.uid() = user_id);

create policy "Users update own fertilizer events"
  on public.fertilizer_events for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users delete own fertilizer events"
  on public.fertilizer_events for delete
  using (auth.uid() = user_id);

create index idx_fertilizer_events_user_id on public.fertilizer_events(user_id);
create index idx_fertilizer_events_date on public.fertilizer_events(date);
create index idx_fertilizer_events_type on public.fertilizer_events(type);
create index idx_fertilizer_events_user_date on public.fertilizer_events(user_id, date desc);
create index idx_fertilizer_events_created_at on public.fertilizer_events(created_at desc);

-- ============================================================================
-- VIEWS: Event Statistics and Summaries
-- ============================================================================

create or replace view public.mowing_stats as
select
  user_id,
  count(*) as total_events,
  max(date) as last_mow_date,
  (current_date - max(date)) as days_since_mow,
  round(avg(height_inches)::numeric, 2) as avg_height_inches,
  min(height_inches) as min_height_inches,
  max(height_inches) as max_height_inches
from public.mow_events
group by user_id;

create or replace view public.watering_stats as
select
  user_id,
  count(*) as total_events,
  max(date) as last_water_date,
  (current_date - max(date)) as days_since_water,
  round(sum(amount_inches)::numeric, 2) as total_amount_inches,
  round(avg(amount_inches)::numeric, 2) as avg_amount_inches,
  round(sum(case when source = 'sprinkler' then amount_inches else 0 end)::numeric, 2) as sprinkler_total,
  round(sum(case when source = 'manual' then amount_inches else 0 end)::numeric, 2) as manual_total,
  round(sum(case when source = 'rain' then amount_inches else 0 end)::numeric, 2) as rain_total,
  count(case when source = 'sprinkler' then 1 end) as sprinkler_count,
  count(case when source = 'manual' then 1 end) as manual_count,
  count(case when source = 'rain' then 1 end) as rain_count
from public.water_events
group by user_id;

create or replace view public.fertilizer_stats as
select
  user_id,
  count(*) as total_events,
  max(date) as last_fertilizer_date,
  (current_date - max(date)) as days_since_fertilizer,
  round(sum(amount_lbs)::numeric, 2) as total_amount_lbs,
  round(avg(amount_lbs)::numeric, 2) as avg_amount_lbs,
  count(distinct type) as fertilizer_types_used,
  mode() within group (order by type) as most_used_type
from public.fertilizer_events
group by user_id;

create or replace view public.monthly_activity_summary as
select
  date_trunc('month', current_date)::date as month,
  'mowing'::text as activity_type,
  user_id,
  count(*) as event_count
from public.mow_events
where date >= date_trunc('month', current_date)::date
group by user_id, month
union all
select
  date_trunc('month', current_date)::date as month,
  'watering'::text as activity_type,
  user_id,
  count(*) as event_count
from public.water_events
where date >= date_trunc('month', current_date)::date
group by user_id, month
union all
select
  date_trunc('month', current_date)::date as month,
  'fertilizing'::text as activity_type,
  user_id,
  count(*) as event_count
from public.fertilizer_events
where date >= date_trunc('month', current_date)::date
group by user_id, month;

-- ============================================================================
-- RPC FUNCTIONS: Business Logic
-- ============================================================================

create or replace function public.get_days_since_mow(p_user_id uuid)
returns integer language sql stable security definer as $$
  select coalesce((current_date - max(date))::integer, null)
  from public.mow_events
  where user_id = p_user_id;
$$;

create or replace function public.get_days_since_water(p_user_id uuid)
returns integer language sql stable security definer as $$
  select coalesce((current_date - max(date))::integer, null)
  from public.water_events
  where user_id = p_user_id;
$$;

create or replace function public.get_avg_mowing_height(p_user_id uuid)
returns decimal language sql stable security definer as $$
  select round(avg(height_inches)::numeric, 2)
  from public.mow_events
  where user_id = p_user_id;
$$;

create or replace function public.get_monthly_water_total(p_user_id uuid)
returns decimal language sql stable security definer as $$
  select round(sum(amount_inches)::numeric, 2)
  from public.water_events
  where user_id = p_user_id
  and date >= date_trunc('month', current_date)::date;
$$;

create or replace function public.get_water_source_breakdown(p_user_id uuid)
returns table (
  source text,
  amount_inches decimal,
  count integer
) language sql stable security definer as $$
  select
    source,
    round(sum(amount_inches)::numeric, 2),
    count(*)::integer
  from public.water_events
  where user_id = p_user_id
  and date >= date_trunc('month', current_date)::date
  group by source
  order by amount_inches desc;
$$;
