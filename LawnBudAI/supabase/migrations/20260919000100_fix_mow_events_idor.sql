-- Security fix: cross-tenant reads of mowing data
-- Addresses #73 (IDOR in get_days_since_mow) and the mowing_stats half of #75.

-- ============================================================================
-- #73: get_days_since_mow
-- ============================================================================
-- The previous definition was SECURITY DEFINER, which bypasses row level
-- security on mow_events, and took the target user as a caller-supplied
-- argument that was never compared to auth.uid(). Supabase exposes public
-- functions over PostgREST, so any authenticated user could read any other
-- user's mowing history by passing their UUID.
--
-- The function only ever needs the caller's own rows, so it runs as INVOKER and
-- lets the existing "Users read own mow events" policy do the filtering.
DROP FUNCTION IF EXISTS public.get_days_since_mow(uuid);
DROP FUNCTION IF EXISTS public.get_days_since_mow();

CREATE FUNCTION public.get_days_since_mow()
RETURNS integer
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT coalesce((current_date - max(date))::integer, NULL)
  FROM public.mow_events
  WHERE user_id = (SELECT auth.uid());
$$;

REVOKE ALL ON FUNCTION public.get_days_since_mow() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_days_since_mow() TO authenticated;

-- ============================================================================
-- #75: mowing_stats
-- ============================================================================
-- A view executes with its owner's privileges unless security_invoker is set,
-- so this aggregate over mow_events ignored RLS and returned one row per user
-- in the system to anyone who queried it. With security_invoker the underlying
-- policy applies and each caller sees only their own row.
-- Requires Postgres 15+ (Supabase default since 2023).
DROP VIEW IF EXISTS public.mowing_stats;

CREATE VIEW public.mowing_stats
WITH (security_invoker = on) AS
SELECT
  user_id,
  count(*) AS total_events,
  max(date) AS last_mow_date,
  (current_date - max(date)) AS days_since_mow,
  round(avg(height_inches)::numeric, 2) AS avg_height_inches
FROM public.mow_events
GROUP BY user_id;

REVOKE ALL ON public.mowing_stats FROM anon;
GRANT SELECT ON public.mowing_stats TO authenticated;
