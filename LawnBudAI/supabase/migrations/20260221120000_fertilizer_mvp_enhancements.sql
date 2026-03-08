-- Phase 3.3: Fertilizer MVP Enhancements
-- Refactors fertilizer_events table to support industry-standard measurements and N-P-K tracking

-- ============================================================================
-- ALTER FERTILIZER_EVENTS TABLE
-- ============================================================================

-- Step 1: Add new columns safely
ALTER TABLE public.fertilizer_events
ADD COLUMN IF NOT EXISTS nitrogen_pct decimal(5,2) default 0 check (nitrogen_pct >= 0 and nitrogen_pct <= 100),
ADD COLUMN IF NOT EXISTS phosphorus_pct decimal(5,2) default 0 check (phosphorus_pct >= 0 and phosphorus_pct <= 100),
ADD COLUMN IF NOT EXISTS potassium_pct decimal(5,2) default 0 check (potassium_pct >= 0 and potassium_pct <= 100),
ADD COLUMN IF NOT EXISTS application_form text check (application_form in ('liquid', 'granular')),
ADD COLUMN IF NOT EXISTS amount_lbs_per_1000sqft decimal(6,2);

-- Step 3 & 4: Data Migration (Safe to run multiple times due to WHERE clauses)
UPDATE public.fertilizer_events
SET amount_lbs_per_1000sqft = amount_lbs / 10.0
WHERE amount_lbs_per_1000sqft IS NULL AND amount_lbs IS NOT NULL;

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
WHERE (nitrogen_pct = 0 OR nitrogen_pct IS NULL) 
  AND (phosphorus_pct = 0 OR phosphorus_pct IS NULL) 
  AND (potassium_pct = 0 OR potassium_pct IS NULL);

-- Step 5 & 6: Constraints (Using DO block to prevent "already exists" errors)
DO $$ 
BEGIN
    -- Amount Check
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fert_amount_lbs_per_1000sqft_check') THEN
        ALTER TABLE public.fertilizer_events ADD CONSTRAINT fert_amount_lbs_per_1000sqft_check CHECK (amount_lbs_per_1000sqft > 0 and amount_lbs_per_1000sqft <= 20);
    END IF;

    -- Method Check (Drop and Re-add is safe here)
    ALTER TABLE public.fertilizer_events DROP CONSTRAINT IF EXISTS fertilizer_events_application_method_check;
    ALTER TABLE public.fertilizer_events ADD CONSTRAINT fertilizer_events_application_method_check CHECK (application_method in ('broadcast', 'spot', 'edge', 'custom'));
END $$;

-- Step 7-9: Defaults and Not Null
UPDATE public.fertilizer_events SET application_method = 'broadcast' WHERE application_method IS NULL;
UPDATE public.fertilizer_events SET application_form = 'granular' WHERE application_form IS NULL;

ALTER TABLE public.fertilizer_events 
  ALTER COLUMN application_method SET NOT NULL,
  ALTER COLUMN application_method SET DEFAULT 'broadcast',
  ALTER COLUMN application_form SET NOT NULL,
  ALTER COLUMN application_form SET DEFAULT 'granular';

-- Step 12: Indexes (Safe with IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_fertilizer_events_application_form ON public.fertilizer_events(application_form);
CREATE INDEX IF NOT EXISTS idx_fertilizer_events_application_method ON public.fertilizer_events(application_method);

-- ============================================================================
-- VIEWS & FUNCTIONS (Always safe with OR REPLACE)
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
  ROUND(AVG(potassium_pct)::numeric, 2) as avg_potassium_pct
FROM public.fertilizer_events
GROUP BY user_id;

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
    COUNT(*)::integer,
    ROUND(AVG(nitrogen_pct)::numeric, 2),
    ROUND(AVG(phosphorus_pct)::numeric, 2),
    ROUND(AVG(potassium_pct)::numeric, 2)
  FROM public.fertilizer_events
  WHERE user_id = p_user_id
  GROUP BY application_form, application_method
  ORDER BY count DESC;
$$;
