-- Splinter fixes: 0003 Auth RLS InitPlan + 0011 Function Search Path Mutable
--
-- 0003: Replace bare auth.uid() in RLS policies with (select auth.uid()).
--       The bare call is re-evaluated for every row; wrapping it in a subquery
--       causes Postgres to evaluate it once per statement, improving performance
--       significantly on large tables.
--
-- 0011: Add SET search_path = '' to every SECURITY DEFINER function.
--       Without a pinned search_path, an attacker who can create objects in any
--       schema that appears earlier in the search path could shadow trusted
--       functions and have them executed with elevated privileges.
--       All table references in these functions already use the public. prefix,
--       so pinning the search_path to '' is safe.

-- ============================================================================
-- FIX 0003: mow_events RLS policies
-- ============================================================================
drop policy if exists "Users read own mow events"   on public.mow_events;
drop policy if exists "Users create own mow events" on public.mow_events;
drop policy if exists "Users update own mow events" on public.mow_events;
drop policy if exists "Users delete own mow events" on public.mow_events;

create policy "Users read own mow events"
  on public.mow_events for select
  using ((select auth.uid()) = user_id);

create policy "Users create own mow events"
  on public.mow_events for insert
  with check ((select auth.uid()) = user_id);

create policy "Users update own mow events"
  on public.mow_events for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users delete own mow events"
  on public.mow_events for delete
  using ((select auth.uid()) = user_id);

-- ============================================================================
-- FIX 0003: water_events RLS policies
-- ============================================================================
drop policy if exists "Users read own water events"   on public.water_events;
drop policy if exists "Users create own water events" on public.water_events;
drop policy if exists "Users update own water events" on public.water_events;
drop policy if exists "Users delete own water events" on public.water_events;

create policy "Users read own water events"
  on public.water_events for select
  using ((select auth.uid()) = user_id);

create policy "Users create own water events"
  on public.water_events for insert
  with check ((select auth.uid()) = user_id);

create policy "Users update own water events"
  on public.water_events for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users delete own water events"
  on public.water_events for delete
  using ((select auth.uid()) = user_id);

-- ============================================================================
-- FIX 0003: fertilizer_events RLS policies
-- ============================================================================
drop policy if exists "Users read own fertilizer events"   on public.fertilizer_events;
drop policy if exists "Users create own fertilizer events" on public.fertilizer_events;
drop policy if exists "Users update own fertilizer events" on public.fertilizer_events;
drop policy if exists "Users delete own fertilizer events" on public.fertilizer_events;

create policy "Users read own fertilizer events"
  on public.fertilizer_events for select
  using ((select auth.uid()) = user_id);

create policy "Users create own fertilizer events"
  on public.fertilizer_events for insert
  with check ((select auth.uid()) = user_id);

create policy "Users update own fertilizer events"
  on public.fertilizer_events for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users delete own fertilizer events"
  on public.fertilizer_events for delete
  using ((select auth.uid()) = user_id);

-- ============================================================================
-- FIX 0003: user_preferences RLS policies
-- ============================================================================
drop policy if exists "Users read own preferences"   on public.user_preferences;
drop policy if exists "Users update own preferences" on public.user_preferences;
drop policy if exists "Users insert own preferences" on public.user_preferences;

create policy "Users read own preferences"
  on public.user_preferences for select
  using ((select auth.uid()) = user_id);

create policy "Users update own preferences"
  on public.user_preferences for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users insert own preferences"
  on public.user_preferences for insert
  with check ((select auth.uid()) = user_id);

-- ============================================================================
-- FIX 0011: pin search_path on all SECURITY DEFINER functions
-- ============================================================================
create or replace function public.get_days_since_mow(p_user_id uuid)
returns integer language sql stable security definer set search_path = '' as $$
  select coalesce((current_date - max(date))::integer, null)
  from public.mow_events
  where user_id = p_user_id;
$$;

create or replace function public.get_days_since_water(p_user_id uuid)
returns integer language sql stable security definer set search_path = '' as $$
  select coalesce((current_date - max(date))::integer, null)
  from public.water_events
  where user_id = p_user_id;
$$;

create or replace function public.get_avg_mowing_height(p_user_id uuid)
returns decimal language sql stable security definer set search_path = '' as $$
  select round(avg(height_inches)::numeric, 2)
  from public.mow_events
  where user_id = p_user_id;
$$;

create or replace function public.get_monthly_water_total(p_user_id uuid)
returns decimal language sql stable security definer set search_path = '' as $$
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
) language sql stable security definer set search_path = '' as $$
  select
    source,
    round(sum(amount_inches)::numeric, 2) as total_amount,
    count(*)::integer
  from public.water_events
  where user_id = p_user_id
  and date >= date_trunc('month', current_date)::date
  group by source
  order by total_amount desc;
$$;

create or replace function public.create_user_preferences()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.user_preferences (user_id, city, state)
  values (new.id, 'Madison', 'WI')
  on conflict do nothing;
  return new;
end;
$$;

create or replace function public.get_fertilizer_breakdown(p_user_id uuid)
returns table (
  application_form text,
  application_method text,
  count integer,
  avg_nitrogen_pct decimal,
  avg_phosphorus_pct decimal,
  avg_potassium_pct decimal
) language sql stable security definer set search_path = '' as $$
  select
    application_form,
    application_method,
    count(*)::integer as count,
    round(avg(nitrogen_pct)::numeric, 2) as avg_nitrogen,
    round(avg(phosphorus_pct)::numeric, 2) as avg_phosphorus,
    round(avg(potassium_pct)::numeric, 2) as avg_potassium
  from public.fertilizer_events
  where user_id = p_user_id
  group by application_form, application_method
  order by count desc;
$$;

create or replace function public.get_avg_fertilizer_npk(p_user_id uuid)
returns table (
  avg_nitrogen_pct decimal,
  avg_phosphorus_pct decimal,
  avg_potassium_pct decimal
) language sql stable security definer set search_path = '' as $$
  select
    round(avg(nitrogen_pct)::numeric, 2) as avg_nitrogen,
    round(avg(phosphorus_pct)::numeric, 2) as avg_phosphorus,
    round(avg(potassium_pct)::numeric, 2) as avg_potassium
  from public.fertilizer_events
  where user_id = p_user_id;
$$;
