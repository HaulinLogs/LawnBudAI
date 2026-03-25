-- Migration: Add grass variety, sun exposure, and soil type fields
-- to user_preferences to support consumer-friendly grass recommendations.
--
-- These columns are all optional (nullable) to preserve backwards
-- compatibility with existing rows. The application falls back to
-- grass_type when grass_variety is null.

ALTER TABLE user_preferences
  ADD COLUMN IF NOT EXISTS grass_variety text,
  ADD COLUMN IF NOT EXISTS sun_exposure  text CHECK (sun_exposure IN ('full_sun', 'sun_and_shade', 'dense_shade')),
  ADD COLUMN IF NOT EXISTS soil_type     text CHECK (soil_type IN ('sandy', 'loamy', 'clay'));

-- Index for variety look-ups (used when filtering advice by variety)
CREATE INDEX IF NOT EXISTS idx_user_preferences_grass_variety
  ON user_preferences (grass_variety)
  WHERE grass_variety IS NOT NULL;
