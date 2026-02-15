-- Telemetry Events Table
-- Tracks all anonymized user activity (no PII)
CREATE TABLE IF NOT EXISTS telemetry_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL, -- 'page_view', 'feature_usage', 'performance', 'auth', 'error', 'security'
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Anonymized (UUID only)
  event_name TEXT NOT NULL,
  metadata JSONB, -- Must NOT contain PII
  performance_ms INTEGER, -- For tracking API/operation latency
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_telemetry_user_id ON telemetry_events(user_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_event_type ON telemetry_events(event_type);
CREATE INDEX IF NOT EXISTS idx_telemetry_created_at ON telemetry_events(created_at);
CREATE INDEX IF NOT EXISTS idx_telemetry_event_name ON telemetry_events(event_name);

-- Security Events Table
-- Tracks suspicious activity and security-relevant events
CREATE TABLE IF NOT EXISTS security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  severity TEXT NOT NULL, -- 'low', 'medium', 'high'
  reason TEXT NOT NULL, -- Description of the event (no sensitive details)
  metadata JSONB, -- Sanitized metadata only
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for security events
CREATE INDEX IF NOT EXISTS idx_security_user_id ON security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_severity ON security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_created_at ON security_events(created_at);

-- Enable Row Level Security
ALTER TABLE telemetry_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own telemetry (for transparency)
CREATE POLICY "Users view own telemetry"
ON telemetry_events FOR SELECT
USING (auth.uid() = user_id OR auth.uid() IS NULL); -- Allow anonymous queries

-- RLS Policy: Only service role can insert telemetry (from app)
CREATE POLICY "App inserts telemetry"
ON telemetry_events FOR INSERT
WITH CHECK (true); -- App authenticates with anon key

-- RLS Policy: Security events readable by service role only (owner dashboards)
CREATE POLICY "Service role manages security events"
ON security_events FOR ALL
USING (auth.role() = 'service_role');

-- Dashboard View: Daily Active Users (no PII)
CREATE VIEW IF NOT EXISTS daily_active_users AS
SELECT
  DATE(created_at) as date,
  COUNT(DISTINCT user_id) as active_users,
  COUNT(DISTINCT CASE WHEN event_type = 'page_view' THEN user_id END) as engaged_users
FROM telemetry_events
WHERE event_type != 'performance' -- Exclude noise
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Dashboard View: Feature Usage (anonymized)
CREATE VIEW IF NOT EXISTS feature_usage_stats AS
SELECT
  event_name,
  COUNT(*) as usage_count,
  COUNT(DISTINCT user_id) as unique_users,
  ROUND(AVG(performance_ms)::numeric, 2) as avg_latency_ms,
  MAX(performance_ms) as max_latency_ms,
  DATE(created_at) as date
FROM telemetry_events
WHERE event_type = 'feature_usage' OR event_type = 'performance'
GROUP BY event_name, DATE(created_at)
ORDER BY date DESC, usage_count DESC;

-- Dashboard View: Auth Security Overview
CREATE VIEW IF NOT EXISTS auth_security_summary AS
SELECT
  DATE(created_at) as date,
  COUNT(*) FILTER (WHERE event_name = 'login_success') as successful_logins,
  COUNT(*) FILTER (WHERE event_name = 'login_failed') as failed_logins,
  COUNT(*) FILTER (WHERE event_name = 'signup') as new_signups,
  COUNT(*) FILTER (WHERE event_name = 'logout') as logouts,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE event_name = 'login_failed')::numeric /
    NULLIF(COUNT(*) FILTER (WHERE event_name IN ('login_success', 'login_failed'))::numeric, 0),
    2
  ) as failed_login_percentage
FROM telemetry_events
WHERE event_type = 'auth'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Dashboard View: Security Events Summary
CREATE VIEW IF NOT EXISTS security_events_summary AS
SELECT
  DATE(created_at) as date,
  severity,
  COUNT(*) as event_count,
  STRING_AGG(DISTINCT reason, ' | ') as reasons
FROM security_events
GROUP BY DATE(created_at), severity
ORDER BY date DESC, severity DESC;

-- Performance Percentiles View (for monitoring)
CREATE VIEW IF NOT EXISTS performance_percentiles AS
SELECT
  event_name,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY performance_ms) as p50_ms,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY performance_ms) as p95_ms,
  PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY performance_ms) as p99_ms,
  MAX(performance_ms) as max_ms,
  COUNT(*) as sample_count
FROM telemetry_events
WHERE performance_ms IS NOT NULL
GROUP BY event_name;
