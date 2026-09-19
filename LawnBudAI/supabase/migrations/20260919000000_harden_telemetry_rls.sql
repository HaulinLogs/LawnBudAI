-- Security fix: telemetry_events RLS and telemetry dashboard views
-- Addresses #71 (anonymous read of all telemetry), #72 (forged telemetry inserts)
-- and the telemetry half of #75 (views bypassing RLS).
--
-- telemetry_events, security_events and the dashboard views were applied by hand
-- from database/telemetry-schema.sql, which is not part of the migration history.
-- That file also contains `CREATE VIEW IF NOT EXISTS`, which is not valid Postgres
-- and aborts the script, so some of these objects may not exist in a given
-- environment. Every statement below is therefore guarded on the object existing.
-- See #80 for folding those files into the migration history properly.

-- ============================================================================
-- TELEMETRY_EVENTS
-- ============================================================================
DO $$
BEGIN
  IF to_regclass('public.telemetry_events') IS NULL THEN
    RAISE NOTICE 'public.telemetry_events not present, skipping policy fixes';
    RETURN;
  END IF;

  ALTER TABLE public.telemetry_events ENABLE ROW LEVEL SECURITY;

  -- #71: the previous SELECT policy was
  --   USING (auth.uid() = user_id OR auth.uid() IS NULL)
  -- auth.uid() is NULL for every request made without a session, so the second
  -- disjunct made the policy TRUE for all rows. The anon key is published in the
  -- web bundle, so this exposed every user's activity log to the internet.
  DROP POLICY IF EXISTS "Users view own telemetry" ON public.telemetry_events;
  CREATE POLICY "Users view own telemetry"
    ON public.telemetry_events FOR SELECT
    TO authenticated
    USING ((SELECT auth.uid()) = user_id);

  -- #72: the previous INSERT policy was WITH CHECK (true), which accepted a row
  -- from any caller with any user_id, allowing attribution of forged activity to
  -- arbitrary users.
  DROP POLICY IF EXISTS "App inserts telemetry" ON public.telemetry_events;
  DROP POLICY IF EXISTS "Users insert own telemetry" ON public.telemetry_events;
  CREATE POLICY "Users insert own telemetry"
    ON public.telemetry_events FOR INSERT
    TO authenticated
    WITH CHECK ((SELECT auth.uid()) = user_id);

  REVOKE ALL ON public.telemetry_events FROM anon;
END $$;

-- ============================================================================
-- SECURITY_EVENTS
-- ============================================================================
-- Keep the admin-only read from database/rbac-schema.sql, but make sure anon has
-- no grant at all. Writes stay closed to clients; see #79 for routing them
-- through a service-role Edge Function.
DO $$
BEGIN
  IF to_regclass('public.security_events') IS NULL THEN
    RAISE NOTICE 'public.security_events not present, skipping';
    RETURN;
  END IF;

  ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
  REVOKE ALL ON public.security_events FROM anon;
END $$;

-- ============================================================================
-- DASHBOARD VIEWS
-- ============================================================================
-- #75: a view runs with its owner's privileges unless security_invoker is set,
-- which means RLS on the underlying table is not applied to the caller. These
-- views aggregate telemetry_events and security_events and are reachable over
-- PostgREST, so without this they hand every user the whole table.
-- security_invoker requires Postgres 15+ (Supabase default since 2023).
DO $$
DECLARE
  v_view text;
BEGIN
  FOREACH v_view IN ARRAY ARRAY[
    'daily_active_users',
    'feature_usage_stats',
    'auth_security_summary',
    'security_events_summary',
    'performance_percentiles'
  ]
  LOOP
    IF to_regclass('public.' || v_view) IS NOT NULL THEN
      EXECUTE format('ALTER VIEW public.%I SET (security_invoker = on)', v_view);
      -- These are operator dashboards, not user-facing data. Serve them through
      -- an admin-authenticated Edge Function rather than the public API.
      EXECUTE format('REVOKE ALL ON public.%I FROM anon, authenticated', v_view);
    ELSE
      RAISE NOTICE 'view public.% not present, skipping', v_view;
    END IF;
  END LOOP;
END $$;
