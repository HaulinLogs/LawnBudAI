-- Phase 3.6: Link lawn events to zones
-- Adds optional zone_id FK to mow_events, water_events, fertilizer_events, and seed_events.
-- NULL zone_id means the event is not associated with a specific zone (whole lawn).

DO $$
BEGIN
  -- mow_events
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'mow_events' AND column_name = 'zone_id'
  ) THEN
    alter table public.mow_events
      add column zone_id uuid references public.lawn_zones(id) on delete set null;

    create index idx_mow_events_zone_id on public.mow_events(zone_id);
  END IF;

  -- water_events
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'water_events' AND column_name = 'zone_id'
  ) THEN
    alter table public.water_events
      add column zone_id uuid references public.lawn_zones(id) on delete set null;

    create index idx_water_events_zone_id on public.water_events(zone_id);
  END IF;

  -- fertilizer_events
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'fertilizer_events' AND column_name = 'zone_id'
  ) THEN
    alter table public.fertilizer_events
      add column zone_id uuid references public.lawn_zones(id) on delete set null;

    create index idx_fertilizer_events_zone_id on public.fertilizer_events(zone_id);
  END IF;

  -- seed_events
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'seed_events' AND column_name = 'zone_id'
  ) THEN
    alter table public.seed_events
      add column zone_id uuid references public.lawn_zones(id) on delete set null;

    create index idx_seed_events_zone_id on public.seed_events(zone_id);
  END IF;
END $$;
