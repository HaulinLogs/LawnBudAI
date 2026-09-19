-- Phase 2.0: RBAC + Rate Limiting Schema
-- Run this in Supabase SQL Editor after Phase 1 is complete

-- ============================================================================
-- USER_ROLES TABLE
-- ============================================================================
-- Stores user roles: 'user' (free), 'premium' (paid), 'admin' (internal)

CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'user'
    CHECK (role IN ('user', 'premium', 'admin')),
  granted_at TIMESTAMPTZ DEFAULT now(),
  granted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on user_roles
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own role
CREATE POLICY "Users read own role"
  ON user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Only service_role (backend) can write roles
CREATE POLICY "Service role manages roles"
  ON user_roles FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================================
-- RATE LIMIT COUNTERS TABLE
-- ============================================================================
-- Tracks API calls per endpoint per hour

CREATE TABLE rate_limit_counters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  endpoint TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  request_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, endpoint, window_start)
);

-- Enable RLS on rate_limit_counters
ALTER TABLE rate_limit_counters ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own counters
CREATE POLICY "Users read own counters"
  ON rate_limit_counters FOR SELECT
  USING (auth.uid() = user_id);

-- No client write policy: counters are written only by the SECURITY DEFINER
-- function below, which bypasses RLS. A "FOR INSERT ... USING" policy is also
-- invalid SQL -- Postgres requires WITH CHECK for INSERT -- and aborts this
-- script at that point (#80).

-- ============================================================================
-- RPC FUNCTION: check_and_increment_rate_limit
-- ============================================================================
-- Atomically checks and increments rate limit counter
-- Returns: { allowed: boolean, current_count: int, limit: int, window_start: timestamptz }
--
-- The caller passes only the endpoint. Identity comes from auth.uid() and the
-- limit is resolved from user_roles, because a client-supplied p_limit lets the
-- caller grant themselves an unlimited budget and a client-supplied p_user_id
-- lets them exhaust someone else's (#74).

CREATE OR REPLACE FUNCTION check_and_increment_rate_limit(
  p_endpoint TEXT
) RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER
SET search_path = '' AS $$
DECLARE
  v_user   UUID := (SELECT auth.uid());
  v_role   TEXT;
  v_limit  INTEGER;
  v_window TIMESTAMPTZ := date_trunc('hour', now());
  v_count  INTEGER;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'not authenticated' USING ERRCODE = '28000';
  END IF;

  SELECT role INTO v_role FROM public.user_roles WHERE user_id = v_user;

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
    'allowed', v_count <= v_limit,
    'current_count', v_count,
    'limit', v_limit,
    'window_start', v_window
  );
END;
$$;

REVOKE ALL ON FUNCTION check_and_increment_rate_limit(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION check_and_increment_rate_limit(TEXT) TO authenticated;

-- ============================================================================
-- RPC FUNCTION: get_user_role
-- ============================================================================
-- Returns the current user's role (safe for client to call)

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT role FROM user_roles WHERE user_id = auth.uid()
$$;

-- ============================================================================
-- TRIGGER: Auto-assign default 'user' role on sign-up
-- ============================================================================
-- When a new user is created in auth.users, automatically assign 'user' role

CREATE OR REPLACE FUNCTION assign_default_role()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE assign_default_role();

-- ============================================================================
-- UPDATE SECURITY_EVENTS RLS FOR ADMIN-ONLY ACCESS
-- ============================================================================
-- Only admins can view security events (if table exists from Phase 1)

DROP POLICY IF EXISTS "Service role manages security events" ON security_events;

CREATE POLICY "Admins read security events"
  ON security_events FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_rate_limit_counters_user_id ON rate_limit_counters(user_id);
CREATE INDEX idx_rate_limit_counters_endpoint ON rate_limit_counters(endpoint);
CREATE INDEX idx_rate_limit_counters_window ON rate_limit_counters(window_start);
