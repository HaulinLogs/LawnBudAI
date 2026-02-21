# Events Schema Migration Runbook

This document provides step-by-step instructions for applying the lawn care events schema to your Supabase database.

## Prerequisites

- ✅ Supabase project created
- ✅ RBAC schema applied (`database/rbac-schema.sql`)
- ✅ Access to Supabase SQL Editor

## What Gets Created

This migration creates the following tables:
- `mow_events` - Records lawn mowing with height measurements
- `water_events` - Records watering with source tracking (sprinkler/manual/rain)
- `fertilizer_events` - Records fertilizer applications with type tracking

Each table includes:
- Row Level Security (RLS) policies for user data isolation
- Indexes for query performance
- Constraints for data validation (e.g., height range 0-6 inches)
- Timestamp tracking (created_at, updated_at)

## Step-by-Step Setup

### 1. Open Supabase SQL Editor

1. Go to your Supabase project dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New query** or **New query (Beta)**

### 2. Copy and Paste the Schema

1. Copy the entire contents of `database/events-schema.sql`
2. Paste into the SQL editor
3. Review the SQL (optional, but recommended)

### 3. Execute the Migration

Click **Run** or press `Ctrl+Enter` (or `Cmd+Enter` on Mac)

Expected output:
```
CREATE TABLE
CREATE POLICY
CREATE POLICY
CREATE POLICY
CREATE POLICY
CREATE INDEX
...
(multiple statements executed successfully)
```

### 4. Verify the Schema Was Created

In Supabase, navigate to **Database** → **Tables** and verify:
- `mow_events` exists with correct columns
- `water_events` exists with correct columns
- `fertilizer_events` exists with correct columns

All three tables should be visible with green checkmarks.

### 5. Test RLS Policies

To verify RLS policies are working:

```sql
-- Test that a user can only see their own events (should return 0 rows)
SELECT * FROM mow_events WHERE user_id != auth.uid();

-- This should work (returns user's own events, or empty if none exist)
SELECT * FROM mow_events WHERE user_id = auth.uid();
```

## Schema Overview

### mow_events Table

```
Columns:
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key → auth.users, NOT NULL)
- date (DATE, NOT NULL)
- height_inches (DECIMAL 0-6, NOT NULL)
- notes (TEXT, optional)
- created_at (TIMESTAMPTZ, auto)
- updated_at (TIMESTAMPTZ, auto)

Constraints:
- One mow per date per user (UNIQUE user_id, date)
- Height validation: 0 < height <= 6

RLS Policies:
- SELECT: Users can read their own events
- INSERT: Users can create their own events
- UPDATE: Users can update their own events
- DELETE: Users can delete their own events
```

### water_events Table

```
Columns:
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key → auth.users, NOT NULL)
- date (DATE, NOT NULL)
- amount_inches (DECIMAL 0-3, NOT NULL)
- source (TEXT: sprinkler|manual|rain, NOT NULL)
- notes (TEXT, optional)
- created_at (TIMESTAMPTZ, auto)
- updated_at (TIMESTAMPTZ, auto)

Constraints:
- One water event per date per source per user
- Amount validation: 0 < amount <= 3
- Source must be one of: sprinkler, manual, rain

RLS Policies:
- SELECT: Users can read their own events
- INSERT: Users can create their own events
- UPDATE: Users can update their own events
- DELETE: Users can delete their own events
```

### fertilizer_events Table

```
Columns:
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key → auth.users, NOT NULL)
- date (DATE, NOT NULL)
- amount_lbs (DECIMAL 0-100, NOT NULL)
- type (TEXT: nitrogen|phosphorus|potassium|npk|organic|liquid|granular, NOT NULL)
- application_method (TEXT: spreader|spray|liquid|granular, optional)
- notes (TEXT, optional)
- created_at (TIMESTAMPTZ, auto)
- updated_at (TIMESTAMPTZ, auto)

Constraints:
- One fertilizer application per date per user
- Amount validation: 0 < amount <= 100
- Type must be one of valid fertilizer types

RLS Policies:
- SELECT: Users can read their own events
- INSERT: Users can create their own events
- UPDATE: Users can update their own events
- DELETE: Users can delete their own events
```

## Views Created

### Statistics Views

The migration includes several views for analyzing event data:

1. **mowing_stats** - Aggregates mowing data per user
   - Returns: days_since_mow, avg_height, total_events, etc.

2. **watering_stats** - Aggregates watering data per user
   - Breaks down by source (sprinkler/manual/rain)
   - Returns: days_since_water, totals by source, etc.

3. **fertilizer_stats** - Aggregates fertilizer data per user
   - Returns: days_since_fertilizer, total_amount_lbs, types used, etc.

4. **monthly_activity_summary** - Current month activity for all users
   - Shows event counts by activity type

### Available RPC Functions

1. **get_days_since_mow(user_id)** → INTEGER
   - Returns days since last mowing, or NULL if no mows recorded

2. **get_days_since_water(user_id)** → INTEGER
   - Returns days since last watering, or NULL if no waters recorded

3. **get_avg_mowing_height(user_id)** → DECIMAL
   - Returns average mowing height across all events

4. **get_monthly_water_total(user_id)** → DECIMAL
   - Returns total watering amount for current month

5. **get_water_source_breakdown(user_id)** → TABLE
   - Returns watering breakdown by source (sprinkler/manual/rain)

## Usage in Application

### TypeScript Models

These tables are already referenced in your TypeScript code:
- `/models/mow-event.ts`
- `/models/water-event.ts`
- `/models/fertilizer-event.ts`

### Hooks

The following hooks interact with these tables:
- `useMowEvents()` - CRUD operations for mow_events
- `useWaterEvents()` - CRUD operations for water_events
- `useFertilizerEvents()` (planned) - CRUD operations for fertilizer_events

### Example: Creating a Mow Event

```typescript
// From useMowEvents hook
const { addEvent } = useMowEvents();

await addEvent({
  date: '2024-02-21',
  height_inches: 2.5,
  notes: 'Mowed with new blades'
});
// Automatically inserts with current user_id via RLS
```

## Testing the Schema

After migration, test with these queries:

### Test Insert (as authenticated user)

```sql
INSERT INTO mow_events (user_id, date, height_inches, notes)
VALUES (auth.uid(), '2024-02-21', 2.5, 'Test mow')
RETURNING *;
```

### Test Select (should only see own events)

```sql
SELECT id, date, height_inches, notes
FROM mow_events
ORDER BY date DESC
LIMIT 5;
```

### Test Update

```sql
UPDATE mow_events
SET height_inches = 3.0, notes = 'Updated'
WHERE id = 'YOUR_EVENT_ID'
AND user_id = auth.uid()
RETURNING *;
```

### Test Delete

```sql
DELETE FROM mow_events
WHERE id = 'YOUR_EVENT_ID'
AND user_id = auth.uid()
RETURNING *;
```

### Test Statistics View

```sql
SELECT * FROM mowing_stats WHERE user_id = auth.uid();
```

## Rollback Instructions (If Needed)

If you need to remove the schema:

```sql
-- Drop views first (depends on tables)
DROP VIEW IF EXISTS monthly_activity_summary CASCADE;
DROP VIEW IF EXISTS fertilizer_stats CASCADE;
DROP VIEW IF EXISTS watering_stats CASCADE;
DROP VIEW IF EXISTS mowing_stats CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS get_water_source_breakdown(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_monthly_water_total(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_avg_mowing_height(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_days_since_water(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_days_since_mow(UUID) CASCADE;

-- Drop tables (RLS policies drop automatically)
DROP TABLE IF EXISTS fertilizer_events CASCADE;
DROP TABLE IF EXISTS water_events CASCADE;
DROP TABLE IF EXISTS mow_events CASCADE;
```

## Troubleshooting

### "CREATE TABLE" Error

**Problem**: `ERROR: relation "mow_events" already exists`

**Solution**: This is fine - it means the table is already created. You can run the script again without issues as we use `CREATE TABLE IF NOT EXISTS`.

### RLS Policy Error

**Problem**: `ERROR: Relation does not exist`

**Solution**: Ensure RBAC schema has been applied first, as some RLS policies reference user_roles table.

### Foreign Key Error

**Problem**: `ERROR: Key (user_id)=(...)`` is not present in table "public.auth.users"`

**Solution**: This shouldn't happen with normal usage. If it does, verify the user exists in Supabase Authentication.

### Index Error

**Problem**: `ERROR: duplicate key value violates unique constraint`

**Solution**: There's already an event for that date. Either:
- Use a different date, or
- Update the existing event instead of inserting

## Performance Notes

The schema includes indexes for common queries:
- `idx_*_user_id` - Filters by user (used in all RLS policies)
- `idx_*_date` - Filters by date (used in monthly rollups)
- `idx_*_user_date` - Combined index for user + date queries

Queries should be very fast even with thousands of events per user.

## Next Steps

1. ✅ Apply this migration to your Supabase database
2. Update environment variables with Supabase credentials (already done)
3. Update E2E tests with valid test user credentials (see E2E_SETUP.md)
4. Run `yarn test:playwright` to verify events are created/retrieved correctly
5. Implement fertilizer screen UI (currently scaffolded in Phase 3.3)

## Questions?

Refer to:
- Supabase RLS documentation: https://supabase.com/docs/guides/auth/row-level-security
- PostgreSQL constraints: https://www.postgresql.org/docs/current/ddl-constraints.html
- Project CLAUDE.md for architecture overview
