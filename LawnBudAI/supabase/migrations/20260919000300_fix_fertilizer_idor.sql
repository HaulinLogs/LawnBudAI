-- Security fix: the same two defects as #73 and #75, in the fertilizer objects.
-- Both were introduced by 20260221120000_fertilizer_mvp_enhancements.sql and are
-- byte-for-byte the same pattern as get_days_since_mow and mowing_stats.

-- ============================================================================
-- get_fertilizer_breakdown (same IDOR as #73)
-- ============================================================================
-- SECURITY DEFINER bypasses RLS on fertilizer_events, and the target user came
-- from a caller-supplied argument that was never checked against auth.uid(), so
-- any authenticated user could read any other user's fertilizer history.
DROP FUNCTION IF EXISTS public.get_fertilizer_breakdown(uuid);
DROP FUNCTION IF EXISTS public.get_fertilizer_breakdown();

CREATE FUNCTION public.get_fertilizer_breakdown()
RETURNS TABLE (
  application_form text,
  application_method text,
  count integer,
  avg_nitrogen_pct decimal,
  avg_phosphorus_pct decimal,
  avg_potassium_pct decimal
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT
    application_form,
    application_method,
    COUNT(*)::integer,
    ROUND(AVG(nitrogen_pct)::numeric, 2),
    ROUND(AVG(phosphorus_pct)::numeric, 2),
    ROUND(AVG(potassium_pct)::numeric, 2)
  FROM public.fertilizer_events
  WHERE user_id = (SELECT auth.uid())
  GROUP BY application_form, application_method
  ORDER BY count DESC;
$$;

REVOKE ALL ON FUNCTION public.get_fertilizer_breakdown() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_fertilizer_breakdown() TO authenticated;

-- ============================================================================
-- fertilizer_stats (same RLS bypass as #75)
-- ============================================================================
-- Without security_invoker the view runs as its owner, so it returned one row
-- per user in the system rather than just the caller's.
DROP VIEW IF EXISTS public.fertilizer_stats;

CREATE VIEW public.fertilizer_stats
WITH (security_invoker = on) AS
SELECT
  user_id,
  COUNT(*) AS total_events,
  MAX(date) AS last_fertilizer_date,
  (CURRENT_DATE - MAX(date)) AS days_since_fertilizer,
  ROUND(SUM(amount_lbs_per_1000sqft)::numeric, 2) AS total_amount_lbs_per_1000sqft,
  ROUND(AVG(amount_lbs_per_1000sqft)::numeric, 2) AS avg_amount_lbs_per_1000sqft,
  ROUND(AVG(nitrogen_pct)::numeric, 2) AS avg_nitrogen_pct,
  ROUND(AVG(phosphorus_pct)::numeric, 2) AS avg_phosphorus_pct,
  ROUND(AVG(potassium_pct)::numeric, 2) AS avg_potassium_pct
FROM public.fertilizer_events
GROUP BY user_id;

REVOKE ALL ON public.fertilizer_stats FROM anon;
GRANT SELECT ON public.fertilizer_stats TO authenticated;
