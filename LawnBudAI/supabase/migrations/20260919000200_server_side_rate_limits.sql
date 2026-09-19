-- Security fix: rate limiting was entirely client-controlled
-- Addresses #74.
--
-- The previous signature was check_and_increment_rate_limit(p_user_id, p_endpoint, p_limit)
-- and the body simply returned `v_count <= p_limit`. Both the identity and the
-- limit came from the caller, so a client could pass an arbitrarily large limit
-- to never be throttled, or pass someone else's UUID to burn their quota.
--
-- user_roles and rate_limit_counters come from database/rbac-schema.sql, which is
-- hand-applied and aborts partway through on an invalid INSERT policy, so the
-- table-dependent statements here are guarded. See #80.

-- ============================================================================
-- rate_limit_counters: repair the invalid INSERT policy
-- ============================================================================
-- Postgres rejects USING on an INSERT policy ("only WITH CHECK expression
-- allowed for INSERT"), which is where database/rbac-schema.sql aborts. Writes
-- are performed by the SECURITY DEFINER function below, so clients need no
-- write policy at all; they keep read access to their own counters for UI.
DO $$
BEGIN
  IF to_regclass('public.rate_limit_counters') IS NULL THEN
    RAISE NOTICE 'public.rate_limit_counters not present, skipping policy fixes';
    RETURN;
  END IF;

  ALTER TABLE public.rate_limit_counters ENABLE ROW LEVEL SECURITY;

  DROP POLICY IF EXISTS "Service role manages counters" ON public.rate_limit_counters;

  DROP POLICY IF EXISTS "Users read own counters" ON public.rate_limit_counters;
  CREATE POLICY "Users read own counters"
    ON public.rate_limit_counters FOR SELECT
    TO authenticated
    USING ((SELECT auth.uid()) = user_id);

  REVOKE ALL ON public.rate_limit_counters FROM anon;
END $$;

-- ============================================================================
-- check_and_increment_rate_limit
-- ============================================================================
DROP FUNCTION IF EXISTS public.check_and_increment_rate_limit(uuid, text, integer);
DROP FUNCTION IF EXISTS public.check_and_increment_rate_limit(text);

CREATE FUNCTION public.check_and_increment_rate_limit(p_endpoint text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user   uuid := (SELECT auth.uid());
  v_role   text;
  v_limit  integer;
  v_window timestamptz := date_trunc('hour', now());
  v_count  integer;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'not authenticated' USING ERRCODE = '28000';
  END IF;

  IF p_endpoint IS NULL OR length(trim(p_endpoint)) = 0 THEN
    RAISE EXCEPTION 'endpoint is required' USING ERRCODE = '22023';
  END IF;

  SELECT role INTO v_role
  FROM public.user_roles
  WHERE user_id = v_user;

  v_limit := CASE coalesce(v_role, 'user')
               WHEN 'admin'   THEN 999999
               WHEN 'premium' THEN 1000
               ELSE 100
             END;

  INSERT INTO public.rate_limit_counters AS rlc (user_id, endpoint, window_start, request_count)
  VALUES (v_user, p_endpoint, v_window, 1)
  ON CONFLICT (user_id, endpoint, window_start)
  DO UPDATE SET request_count = rlc.request_count + 1
  RETURNING rlc.request_count INTO v_count;

  RETURN json_build_object(
    'allowed',       v_count <= v_limit,
    'current_count', v_count,
    'limit',         v_limit,
    'window_start',  v_window
  );
END;
$$;

REVOKE ALL ON FUNCTION public.check_and_increment_rate_limit(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.check_and_increment_rate_limit(text) TO authenticated;
