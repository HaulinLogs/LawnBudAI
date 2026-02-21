-- Phase 3.3: Fertilizer MVP Enhancements
-- Refactors fertilizer_events table to support industry-standard measurements and N-P-K tracking
-- Transforms from simple type-based tracking to comprehensive nutrient and application tracking

-- ============================================================================
-- ALTER FERTILIZER_EVENTS TABLE
-- ============================================================================

-- Step 1: Add new columns for N-P-K tracking and application form
ALTER TABLE public.fertilizer_events
ADD COLUMN IF NOT EXISTS nitrogen_pct decimal(5,2) default 0 check (nitrogen_pct >= 0 and nitrogen_pct <= 100),
ADD COLUMN IF NOT EXISTS phosphorus_pct decimal(5,2) default 0 check (phosphorus_pct >= 0 and phosphorus_pct <= 100),
ADD COLUMN IF NOT EXISTS potassium_pct decimal(5,2) default 0 check (potassium_pct >= 0 and potassium_pct <= 100),
ADD COLUMN IF NOT EXISTS application_form text check (application_form in ('liquid', 'granular'));

-- Step 2: Rename amount_lbs to amount_lbs_per_1000sqft
-- PostgreSQL doesn't support direct column rename in a single statement with constraints,
-- so we do it in steps
ALTER TABLE public.fertilizer_events
ADD COLUMN IF NOT EXISTS amount_lbs_per_1000sqft decimal(6,2);

-- Step 3: Migrate existing data from amount_lbs to amount_lbs_per_1000sqft
-- (divide by 10 to convert from total lbs to lbs per 1000 sqft, assuming ~10k sqft average lawn)
UPDATE public.fertilizer_events
SET amount_lbs_per_1000sqft = amount_lbs / 10.0
WHERE amount_lbs_per_1000sqft IS NULL AND amount_lbs IS NOT NULL;

-- Step 4: Migrate type values to N-P-K ratios and application form
-- This preserves historical data by mapping legacy types to reasonable N-P-K compositions
UPDATE public.fertilizer_events
SET
  nitrogen_pct = CASE
    WHEN type = 'nitrogen' THEN 29.0
    WHEN type = 'phosphorus' THEN 5.0
    WHEN type = 'potassium' THEN 5.0
    WHEN type = 'balanced' THEN 10.0
    ELSE 0.0
  END,
  phosphorus_pct = CASE
    WHEN type = 'nitrogen' THEN 3.0
    WHEN type = 'phosphorus' THEN 20.0
    WHEN type = 'potassium' THEN 5.0
    WHEN type = 'balanced' THEN 10.0
    ELSE 0.0
  END,
  potassium_pct = CASE
    WHEN type = 'nitrogen' THEN 3.0
    WHEN type = 'phosphorus' THEN 5.0
    WHEN type = 'potassium' THEN 19.0
    WHEN type = 'balanced' THEN 10.0
    ELSE 0.0
  END,
  application_form = CASE
    WHEN type IN ('liquid', 'spray') THEN 'liquid'
    WHEN type IN ('granular', 'spreader') THEN 'granular'
    ELSE 'granular'
  END
WHERE nitrogen_pct = 0 AND phosphorus_pct = 0 AND potassium_pct = 0;

-- Step 5: Add constraint to amount_lbs_per_1000sqft
ALTER TABLE public.fertilizer_events
ADD CONSTRAINT fert_amount_lbs_per_1000sqft_check CHECK (amount_lbs_per_1000sqft > 0 and amount_lbs_per_1000sqft <= 20);

-- Step 6: Update application_method constraint to support new methods
ALTER TABLE public.fertilizer_events
DROP CONSTRAINT IF EXISTS fertilizer_events_application_method_check;

ALTER TABLE public.fertilizer_events
ADD CONSTRAINT fertilizer_events_application_method_check
CHECK (application_method in ('broadcast', 'spot', 'edge', 'custom'));

-- Step 7: Set default values for application_method if NULL
UPDATE public.fertilizer_events
SET application_method = 'broadcast'
WHERE application_method IS NULL;

-- Step 8: Make application_method NOT NULL
ALTER TABLE public.fertilizer_events
ALTER COLUMN application_method SET NOT NULL,
ALTER COLUMN application_method SET DEFAULT 'broadcast';

-- Step 9: Make application_form NOT NULL
ALTER TABLE public.fertilizer_events
ALTER COLUMN application_form SET NOT NULL,
ALTER COLUMN application_form SET DEFAULT 'granular';

-- Step 10: Drop old amount_lbs column (keep for backward compatibility if needed, but no longer used)
-- ALTER TABLE public.fertilizer_events DROP COLUMN IF EXISTS amount_lbs;
-- NOTE: Commenting out column drop to maintain backward compatibility during transition

-- Step 11: Drop type column (legacy, no longer needed)
-- ALTER TABLE public.fertilizer_events DROP COLUMN IF EXISTS type;
-- NOTE: Commenting out column drop to maintain backward compatibility during transition

-- Step 12: Create new indexes for optimized queries
CREATE INDEX IF NOT EXISTS idx_fertilizer_events_application_form
  ON public.fertilizer_events(application_form);

CREATE INDEX IF NOT EXISTS idx_fertilizer_events_application_method
  ON public.fertilizer_events(application_method);

-- ============================================================================
-- UPDATE VIEWS FOR MVP STATISTICS
-- ============================================================================

CREATE OR REPLACE VIEW public.fertilizer_stats AS
SELECT
  user_id,
  COUNT(*) as total_events,
  MAX(date) as last_fertilizer_date,
  (CURRENT_DATE - MAX(date)) as days_since_fertilizer,
  ROUND(SUM(amount_lbs_per_1000sqft)::numeric, 2) as total_amount_lbs_per_1000sqft,
  ROUND(AVG(amount_lbs_per_1000sqft)::numeric, 2) as avg_amount_lbs_per_1000sqft,
  ROUND(AVG(nitrogen_pct)::numeric, 2) as avg_nitrogen_pct,
  ROUND(AVG(phosphorus_pct)::numeric, 2) as avg_phosphorus_pct,
  ROUND(AVG(potassium_pct)::numeric, 2) as avg_potassium_pct,
  COUNT(CASE WHEN application_form = 'liquid' THEN 1 END) as liquid_count,
  COUNT(CASE WHEN application_form = 'granular' THEN 1 END) as granular_count,
  COUNT(CASE WHEN application_method = 'broadcast' THEN 1 END) as broadcast_count,
  COUNT(CASE WHEN application_method = 'spot' THEN 1 END) as spot_count,
  COUNT(CASE WHEN application_method = 'edge' THEN 1 END) as edge_count,
  COUNT(CASE WHEN application_method = 'custom' THEN 1 END) as custom_count
FROM public.fertilizer_events
GROUP BY user_id;

-- ============================================================================
-- RPC FUNCTIONS FOR MVP QUERIES
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_fertilizer_breakdown(p_user_id uuid)
RETURNS TABLE (
  application_form text,
  application_method text,
  count integer,
  avg_nitrogen_pct decimal,
  avg_phosphorus_pct decimal,
  avg_potassium_pct decimal
) LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT
    application_form,
    application_method,
    COUNT(*)::integer as count,
    ROUND(AVG(nitrogen_pct)::numeric, 2) as avg_nitrogen,
    ROUND(AVG(phosphorus_pct)::numeric, 2) as avg_phosphorus,
    ROUND(AVG(potassium_pct)::numeric, 2) as avg_potassium
  FROM public.fertilizer_events
  WHERE user_id = p_user_id
  GROUP BY application_form, application_method
  ORDER BY count DESC;
$$;

CREATE OR REPLACE FUNCTION public.get_avg_fertilizer_npk(p_user_id uuid)
RETURNS TABLE (
  avg_nitrogen_pct decimal,
  avg_phosphorus_pct decimal,
  avg_potassium_pct decimal
) LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT
    ROUND(AVG(nitrogen_pct)::numeric, 2) as avg_nitrogen,
    ROUND(AVG(phosphorus_pct)::numeric, 2) as avg_phosphorus,
    ROUND(AVG(potassium_pct)::numeric, 2) as avg_potassium
  FROM public.fertilizer_events
  WHERE user_id = p_user_id;
$$;
