-- Phase 3.1+: Lawn Care Events Schema
-- Tracks mowing, watering, and fertilizing events
-- Run this in Supabase SQL Editor after RBAC schema is applied

-- ============================================================================
-- MOW_EVENTS TABLE
-- ============================================================================
-- Records lawn mowing events with height measurements

CREATE TABLE IF NOT EXISTS mow_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  height_inches DECIMAL(5,2) NOT NULL
    CHECK (height_inches > 0 AND height_inches <= 6),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date) -- One mow event per day per user
);

-- Enable RLS on mow_events
ALTER TABLE mow_events ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own mow events
CREATE POLICY "Users read own mow events"
  ON mow_events FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can create their own mow events
CREATE POLICY "Users create own mow events"
  ON mow_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own mow events
CREATE POLICY "Users update own mow events"
  ON mow_events FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own mow events
CREATE POLICY "Users delete own mow events"
  ON mow_events FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_mow_events_user_id ON mow_events(user_id);
CREATE INDEX idx_mow_events_date ON mow_events(date);
CREATE INDEX idx_mow_events_user_date ON mow_events(user_id, date DESC);
CREATE INDEX idx_mow_events_created_at ON mow_events(created_at DESC);

-- ============================================================================
-- WATER_EVENTS TABLE
-- ============================================================================
-- Records lawn watering events with amount and source tracking

CREATE TABLE IF NOT EXISTS water_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  amount_inches DECIMAL(4,2) NOT NULL
    CHECK (amount_inches > 0 AND amount_inches <= 3),
  source TEXT NOT NULL DEFAULT 'sprinkler'
    CHECK (source IN ('sprinkler', 'manual', 'rain')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date, source) -- One watering per day per source per user
);

-- Enable RLS on water_events
ALTER TABLE water_events ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own water events
CREATE POLICY "Users read own water events"
  ON water_events FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can create their own water events
CREATE POLICY "Users create own water events"
  ON water_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own water events
CREATE POLICY "Users update own water events"
  ON water_events FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own water events
CREATE POLICY "Users delete own water events"
  ON water_events FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_water_events_user_id ON water_events(user_id);
CREATE INDEX idx_water_events_date ON water_events(date);
CREATE INDEX idx_water_events_source ON water_events(source);
CREATE INDEX idx_water_events_user_date ON water_events(user_id, date DESC);
CREATE INDEX idx_water_events_created_at ON water_events(created_at DESC);

-- ============================================================================
-- FERTILIZER_EVENTS TABLE
-- ============================================================================
-- Records lawn fertilizer application events with type tracking

CREATE TABLE IF NOT EXISTS fertilizer_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  amount_lbs DECIMAL(6,2) NOT NULL
    CHECK (amount_lbs > 0 AND amount_lbs <= 100),
  type TEXT NOT NULL DEFAULT 'nitrogen'
    CHECK (type IN ('nitrogen', 'phosphorus', 'potassium', 'npk', 'organic', 'liquid', 'granular')),
  application_method TEXT DEFAULT 'spreader'
    CHECK (application_method IN ('spreader', 'spray', 'liquid', 'granular')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date) -- One fertilizer application per day per user
);

-- Enable RLS on fertilizer_events
ALTER TABLE fertilizer_events ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own fertilizer events
CREATE POLICY "Users read own fertilizer events"
  ON fertilizer_events FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can create their own fertilizer events
CREATE POLICY "Users create own fertilizer events"
  ON fertilizer_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own fertilizer events
CREATE POLICY "Users update own fertilizer events"
  ON fertilizer_events FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own fertilizer events
CREATE POLICY "Users delete own fertilizer events"
  ON fertilizer_events FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_fertilizer_events_user_id ON fertilizer_events(user_id);
CREATE INDEX idx_fertilizer_events_date ON fertilizer_events(date);
CREATE INDEX idx_fertilizer_events_type ON fertilizer_events(type);
CREATE INDEX idx_fertilizer_events_user_date ON fertilizer_events(user_id, date DESC);
CREATE INDEX idx_fertilizer_events_created_at ON fertilizer_events(created_at DESC);

-- ============================================================================
-- VIEWS: Event Statistics and Summaries
-- ============================================================================

-- View: Mowing statistics (days since, average height, count)
CREATE OR REPLACE VIEW mowing_stats AS
SELECT
  user_id,
  COUNT(*) as total_events,
  MAX(date) as last_mow_date,
  (CURRENT_DATE - MAX(date)) as days_since_mow,
  ROUND(AVG(height_inches)::numeric, 2) as avg_height_inches,
  MIN(height_inches) as min_height_inches,
  MAX(height_inches) as max_height_inches
FROM mow_events
GROUP BY user_id;

-- View: Watering statistics (days since, total amount, by source)
CREATE OR REPLACE VIEW watering_stats AS
SELECT
  user_id,
  COUNT(*) as total_events,
  MAX(date) as last_water_date,
  (CURRENT_DATE - MAX(date)) as days_since_water,
  ROUND(SUM(amount_inches)::numeric, 2) as total_amount_inches,
  ROUND(AVG(amount_inches)::numeric, 2) as avg_amount_inches,
  ROUND(
    SUM(CASE WHEN source = 'sprinkler' THEN amount_inches ELSE 0 END)::numeric,
    2
  ) as sprinkler_total,
  ROUND(
    SUM(CASE WHEN source = 'manual' THEN amount_inches ELSE 0 END)::numeric,
    2
  ) as manual_total,
  ROUND(
    SUM(CASE WHEN source = 'rain' THEN amount_inches ELSE 0 END)::numeric,
    2
  ) as rain_total,
  COUNT(CASE WHEN source = 'sprinkler' THEN 1 END) as sprinkler_count,
  COUNT(CASE WHEN source = 'manual' THEN 1 END) as manual_count,
  COUNT(CASE WHEN source = 'rain' THEN 1 END) as rain_count
FROM water_events
GROUP BY user_id;

-- View: Fertilizer statistics (total applied, by type)
CREATE OR REPLACE VIEW fertilizer_stats AS
SELECT
  user_id,
  COUNT(*) as total_events,
  MAX(date) as last_fertilizer_date,
  (CURRENT_DATE - MAX(date)) as days_since_fertilizer,
  ROUND(SUM(amount_lbs)::numeric, 2) as total_amount_lbs,
  ROUND(AVG(amount_lbs)::numeric, 2) as avg_amount_lbs,
  COUNT(DISTINCT type) as fertilizer_types_used,
  MODE() WITHIN GROUP (ORDER BY type) as most_used_type
FROM fertilizer_events
GROUP BY user_id;

-- View: Monthly activity summary (all lawn care activities)
CREATE OR REPLACE VIEW monthly_activity_summary AS
SELECT
  DATE_TRUNC('month', CURRENT_DATE)::DATE as month,
  'mowing' as activity_type,
  user_id,
  COUNT(*) as event_count
FROM mow_events
WHERE date >= DATE_TRUNC('month', CURRENT_DATE)::DATE
GROUP BY user_id, month
UNION ALL
SELECT
  DATE_TRUNC('month', CURRENT_DATE)::DATE as month,
  'watering' as activity_type,
  user_id,
  COUNT(*) as event_count
FROM water_events
WHERE date >= DATE_TRUNC('month', CURRENT_DATE)::DATE
GROUP BY user_id, month
UNION ALL
SELECT
  DATE_TRUNC('month', CURRENT_DATE)::DATE as month,
  'fertilizing' as activity_type,
  user_id,
  COUNT(*) as event_count
FROM fertilizer_events
WHERE date >= DATE_TRUNC('month', CURRENT_DATE)::DATE
GROUP BY user_id, month;

-- ============================================================================
-- RPC FUNCTIONS: Business Logic
-- ============================================================================

-- Function: Get days since last mowing (safe for client calls)
CREATE OR REPLACE FUNCTION get_days_since_mow(p_user_id UUID)
RETURNS INTEGER LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT COALESCE((CURRENT_DATE - MAX(date))::INTEGER, NULL)
  FROM mow_events
  WHERE user_id = p_user_id;
$$;

-- Function: Get days since last watering (safe for client calls)
CREATE OR REPLACE FUNCTION get_days_since_water(p_user_id UUID)
RETURNS INTEGER LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT COALESCE((CURRENT_DATE - MAX(date))::INTEGER, NULL)
  FROM water_events
  WHERE user_id = p_user_id;
$$;

-- Function: Get average mowing height (safe for client calls)
CREATE OR REPLACE FUNCTION get_avg_mowing_height(p_user_id UUID)
RETURNS DECIMAL LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT ROUND(AVG(height_inches)::numeric, 2)
  FROM mow_events
  WHERE user_id = p_user_id;
$$;

-- Function: Get total watering amount this month (safe for client calls)
CREATE OR REPLACE FUNCTION get_monthly_water_total(p_user_id UUID)
RETURNS DECIMAL LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT ROUND(SUM(amount_inches)::numeric, 2)
  FROM water_events
  WHERE user_id = p_user_id
  AND date >= DATE_TRUNC('month', CURRENT_DATE)::DATE;
$$;

-- Function: Get watering breakdown by source this month (safe for client calls)
CREATE OR REPLACE FUNCTION get_water_source_breakdown(p_user_id UUID)
RETURNS TABLE (
  source TEXT,
  amount_inches DECIMAL,
  count INTEGER
) LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT
    source,
    ROUND(SUM(amount_inches)::numeric, 2),
    COUNT(*)::INTEGER
  FROM water_events
  WHERE user_id = p_user_id
  AND date >= DATE_TRUNC('month', CURRENT_DATE)::DATE
  GROUP BY source
  ORDER BY amount_inches DESC;
$$;
