# Grass Recommendations Improvement Plan

**Status:** Waiting on overseeding changes from parallel agent before implementation begins.
**Goal:** Replace agronomist jargon with consumer-friendly language matching real seed bag terminology,
add grass variety selection, and layer in soil + sunlight conditions to drive better advice.

---

## Context & Current State

### Where "Cool Season / Warm Season" Comes From

The root type is defined at `lib/lawnAdvice.ts:22`:
```typescript
export type GrassType = 'cool_season' | 'warm_season' | 'mixed';
```

This internal enum surfaces directly in the UI at `app/(tabs)/settings.tsx:149-153` where the raw
value is just formatted with spaces: `cool_season` → "Cool Season". There is no translation layer.

The same type propagates through:
- `hooks/useUserPreferences.ts:10,19,55` — stored/retrieved from Supabase
- `app/(auth)/sign-up.tsx:86` — default value on account creation
- `services/usdaZone.ts:35` — zone-to-grass-type recommendation
- `hooks/useTodo.ts:13` — advice generation
- `screens/HomeScreen.tsx:28` — recommendation display
- `screens/FertilizerScreen.tsx:125` — fertilizer advisory

### What the Overseeding Agent Is Likely Changing

Before implementing anything here, review the overseeding PR for changes to:
- `lib/lawnAdvice.ts` — `overseedingWindows`, `getOverseedingReminder()`, or nearby types
- `GrassType` definition — if the other agent adds new varieties or changes the type
- `OverseedingReminder` interface — urgency levels, text fields
- Any new data structures for variety-level overseeding windows

**Merge and review those changes first.** This plan assumes `GrassType` and the advice engine
structure are stable before we start. If the overseeding agent changes the `GrassType` union,
adjust Phase 1 of this plan accordingly.

---

## What Consumers Actually See (Seed Bag Research)

Real product terminology from Scotts, Pennington, Jonathan Green, GreenView:

| Brand / Product | Grass(es) Inside | Sun Label |
|---|---|---|
| Scotts Turf Builder Sun & Shade Mix | Tall Fescue + KBG + Perennial Rye | Sun & Shade |
| Scotts Turf Builder Dense Shade | Creeping Red Fescue + Chewings Fescue | Dense Shade |
| Scotts Turf Builder Kentucky Bluegrass | Kentucky Bluegrass | Full Sun |
| Pennington Smart Seed Sun & Shade | Tall Fescue + KBG + Perennial Rye | Sun & Shade |
| Pennington Smart Seed Dense Shade | Fine Fescue blend | Dense Shade |
| Pennington Bermudagrass | Bermudagrass | Full Sun |
| Jonathan Green Black Beauty Ultra | Tall Fescue + KBG + Perennial Rye | Sun & Shade |
| Jonathan Green Dense Shade | Fine Fescue blend | Dense Shade |
| GreenView Fairway Formula | Tall Fescue + KBG + Rye | Sun & Shade |
| Scotts EZ Seed Bermudagrass | Bermudagrass | Full Sun |
| Scotts EZ Seed Zoysia | Zoysia | Full Sun |

**Key observation:** "Sun & Shade" is the most common label category. Most homeowners buy one of
three things: Full Sun, Sun & Shade, or Dense Shade. Grass variety is secondary on the bag.

---

## Planned Data Structures

### New: `SunExposure` type

```typescript
// Consumer-facing label matching seed bag categories
export type SunExposure = 'full_sun' | 'sun_and_shade' | 'dense_shade';
```

### New: `SoilType` type

```typescript
export type SoilType = 'sandy' | 'loamy' | 'clay';
```

### New: `GrassVariety` interface

```typescript
export interface GrassVariety {
  id: string;                    // e.g. 'kentucky_bluegrass'
  displayName: string;           // e.g. 'Kentucky Bluegrass'
  grassType: GrassType;          // maps to existing cool/warm/mixed for advice engine
  sunExposure: SunExposure[];    // which sunlight categories this variety suits
  soilPreference: SoilType[];    // which soils it thrives in
  regions: string[];             // USDA climate categories: 'cold' | 'cool' | 'transition' | 'warm' | 'tropical'
  mowHeightRange: [number, number]; // inches [min, max]
  description: string;           // 1-2 sentences, plain English
  storeTip: string;              // "Look for bags labeled 'Sun & Shade' — most contain Tall Fescue"
  exampleProducts: string[];     // e.g. ['Scotts Turf Builder Sun & Shade', 'Pennington Smart Seed Sun & Shade']
}
```

### Extended: `UserPreferences` interface

Add two new optional fields to `hooks/useUserPreferences.ts`:

```typescript
interface UserPreferences {
  id?: string;
  city: string;
  state: string;
  timezone?: string;
  grass_type: string;          // existing — keep for backwards compat
  grass_variety?: string;      // NEW: e.g. 'tall_fescue'
  sun_exposure?: SunExposure;  // NEW: 'full_sun' | 'sun_and_shade' | 'dense_shade'
  soil_type?: SoilType;        // NEW: 'sandy' | 'loamy' | 'clay'
  lawn_size_sqft: number | null;
}
```

---

## Database Changes Required

New columns on `user_preferences` table in Supabase:

```sql
ALTER TABLE user_preferences
  ADD COLUMN grass_variety text,
  ADD COLUMN sun_exposure text CHECK (sun_exposure IN ('full_sun', 'sun_and_shade', 'dense_shade')),
  ADD COLUMN soil_type text CHECK (soil_type IN ('sandy', 'loamy', 'clay'));
```

Migration file: `supabase/migrations/YYYYMMDDHHMMSS_add_grass_variety_fields.sql`

---

## Implementation Phases

---

### Phase 1 — Grass Variety Data Layer (no UI, no DB)
**Files:** `lib/lawnAdvice.ts`, new `lib/grassVarieties.ts`
**Depends on:** Overseeding PR merged and reviewed

Create a new file `lib/grassVarieties.ts` with the full variety catalog. Keep it separate from
`lawnAdvice.ts` to avoid that file growing further. Export the varieties array and helper functions.

**Varieties to include:**

Cool-season (regions: cold, cool, transition):
| id | displayName | Sun | Soil | Mow height |
|---|---|---|---|---|
| `kentucky_bluegrass` | Kentucky Bluegrass | full_sun | loamy, clay | 2.5–3.5" |
| `tall_fescue` | Tall Fescue | sun_and_shade | loamy, clay, sandy | 3–4" |
| `perennial_ryegrass` | Perennial Ryegrass | full_sun, sun_and_shade | loamy | 2.5–3.5" |
| `fine_fescue` | Fine Fescue (Shade Mix) | sun_and_shade, dense_shade | sandy, loamy | 3.5–4.5" |
| `creeping_red_fescue` | Creeping Red Fescue | dense_shade | sandy, loamy | 3.5–4.5" |

Warm-season (regions: transition, warm, tropical):
| id | displayName | Sun | Soil | Mow height |
|---|---|---|---|---|
| `bermuda` | Bermudagrass | full_sun | loamy, sandy | 0.5–1.5" |
| `zoysia` | Zoysia Grass | full_sun, sun_and_shade | loamy, clay | 1–2" |
| `st_augustine` | St. Augustine Grass | sun_and_shade, dense_shade | loamy, sandy | 3.5–4" |
| `centipede` | Centipede Grass | full_sun, sun_and_shade | sandy, loamy | 1.5–2" |
| `buffalo_grass` | Buffalo Grass | full_sun | loamy, clay | 2–3" |

**Helper functions to add:**

```typescript
// Returns varieties appropriate for a given zone climate category + sun exposure
getVarietiesForZone(climateCategory: string, sunExposure?: SunExposure): GrassVariety[]

// Returns the GrassType (cool/warm/mixed) for a variety — used to bridge into existing advice engine
getGrassTypeForVariety(varietyId: string): GrassType

// Returns the mowing height range for a specific variety
getMowHeightForVariety(varietyId: string): [number, number] | null
```

**Bridge to existing advice engine:**
`getGrassTypeForVariety()` maps variety → GrassType so all existing advice functions
(`getMowingAdvice`, `getWateringAdvice`, `getFertilizerAdvisory`) continue to work unchanged.
The variety layer sits on top; the existing engine is not modified in this phase.

---

### Phase 2 — Sun Exposure Onboarding Question
**Files:** `app/(auth)/sign-up.tsx`, `hooks/useUserPreferences.ts`
**Depends on:** Phase 1 complete, DB migration deployed

Add a sun exposure selector as step 2 of sign-up, after email/password, before account creation.

**UI:** Three option cards with icons and plain-English labels:

```
☀️  Full Sun         "6+ hours of direct sunlight daily"
⛅  Sun & Shade      "4–6 hours, or dappled light under trees"
🌑  Mostly Shade     "Less than 4 hours — dense tree cover or north-facing"
```

This maps directly to how Scotts and Pennington label their seed bags. When someone picks
"Sun & Shade" in the app, they can walk into a store and grab the "Sun & Shade" bag.

**Default:** `sun_and_shade` (most common for suburban lawns)

**Saving:** Store `sun_exposure` in the `user_preferences` insert at `sign-up.tsx:83`.

---

### Phase 3 — Replace Settings Grass Type Toggle
**Files:** `app/(tabs)/settings.tsx`
**Depends on:** Phase 1 complete, DB migration deployed

Replace the 3-button `cool_season / warm_season / mixed` toggle with two separate pickers:

**Section 1 — Sunlight (if not set during sign-up):**
Same 3-option card layout as sign-up onboarding.

**Section 2 — Grass Variety:**
A scrollable list of varieties filtered to the user's USDA zone + selected sun exposure.
Each variety card shows:
- Display name (e.g., "Tall Fescue")
- Sun tolerance badge
- Mow height range
- Store tip ("Look for 'Sun & Shade' bags at Home Depot or Lowe's")

The selected variety's `grassType` is saved to `grass_type` in `user_preferences` so the
existing advice engine continues to work without modification.

**Backwards compatibility:**
If `grass_variety` is null (existing users), fall back to current `grass_type` value.
No existing functionality breaks.

---

### Phase 4 — Soil Type Selection
**Files:** `app/(tabs)/settings.tsx`, `hooks/useUserPreferences.ts`
**Depends on:** Phase 3 complete

Add soil type question to the Settings screen after grass variety:

```
🏖️  Sandy     "Drains quickly, dries out fast"
🌱  Loamy      "Dark, crumbly — ideal lawn soil"
🏗️  Clay       "Heavy, sticky when wet, hard when dry"
```

**Default:** `loamy`

**How soil_type improves advice:**

| Soil | Watering | Fertilizer |
|---|---|---|
| Sandy | +1 watering session/week | Lighter, more frequent applications |
| Loamy | Standard schedule | Standard schedule |
| Clay | –1 watering session/week | Standard but aerating recommended in fall |

This affects the text in `getWateringAdvice()` and `getFertilizerAdvice()`. The functions will
need a `soilType?: SoilType` optional parameter. Existing callers without the param get current
behavior (no breaking change).

---

### Phase 5 — Variety-Specific Mowing Heights
**Files:** `lib/lawnAdvice.ts`, `screens/HomeScreen.tsx` or wherever mowing advice is displayed
**Depends on:** Phase 1 complete

Currently all "cool season" grasses show "2.5–3.5 inches" mowing guidance. With variety data
available, mowing advice can be specific:

- Kentucky Bluegrass: 2.5–3.5"
- Tall Fescue: 3–4"
- Fine Fescue / Shade Mix: 3.5–4.5"
- Bermudagrass: 0.5–1.5"
- Zoysia: 1–2"
- St. Augustine: 3.5–4"
- Centipede: 1.5–2"

When a user has `grass_variety` set, override the generic height range in the mowing advice card.
Fall back to grass_type-level advice when variety is not set.

---

### Phase 6 — "What to Buy at the Store" Feature
**Files:** New component `components/StoreTipCard.tsx`, `screens/HomeScreen.tsx`
**Depends on:** Phase 1, Phase 3 complete

When it is overseeding season (the existing `getOverseedingReminder()` returns non-null), show
a "What to look for at the store" card:

```
🛒  What to Buy
Based on your lawn: Tall Fescue (Sun & Shade)

Look for bags labeled "Sun & Shade Mix" — most contain
Tall Fescue blended with Kentucky Bluegrass and Ryegrass.

Popular options:
• Scotts Turf Builder Sun & Shade Mix
• Pennington Smart Seed Sun & Shade
• Jonathan Green Black Beauty Ultra
```

This bridges the gap between in-app advice and a hardware store visit. The `exampleProducts`
and `storeTip` fields in `GrassVariety` populate this card.

**Note:** Do not include prices or retailer-specific links — that content goes stale. Brand and
product names only.

---

## Files That Will Change

| File | Change Type | Phase |
|---|---|---|
| `lib/grassVarieties.ts` | **New file** — variety catalog + helper functions | 1 |
| `lib/lawnAdvice.ts` | Add optional `soilType` param to watering/fertilizer fns | 4 |
| `hooks/useUserPreferences.ts` | Add `grass_variety`, `sun_exposure`, `soil_type` fields | 2 |
| `app/(auth)/sign-up.tsx` | Add sun exposure step to sign-up form | 2 |
| `app/(tabs)/settings.tsx` | Replace grass type toggle; add sun/soil pickers | 3, 4 |
| `screens/HomeScreen.tsx` | Use variety-specific mow height; show store tip card in season | 5, 6 |
| `components/StoreTipCard.tsx` | **New file** — store recommendation card | 6 |
| `supabase/migrations/...sql` | Add `grass_variety`, `sun_exposure`, `soil_type` columns | 2 |
| `types/database.types.ts` | Regenerate after migration | 2 |

---

## Files That Must NOT Change (Until Overseeding PR Is Merged)

- `lib/lawnAdvice.ts` — wait to see what the overseeding agent changes
- `services/usdaZone.ts` — no changes planned

---

## Tests Required (TDD — Write Before Implementing)

### `__tests__/lib/grassVarieties.test.ts` (Phase 1)
- `getVarietiesForZone('cool', 'full_sun')` returns only full-sun varieties
- `getVarietiesForZone('warm', 'dense_shade')` returns St. Augustine
- `getGrassTypeForVariety('bermuda')` returns `'warm_season'`
- `getMowHeightForVariety('bermuda')` returns `[0.5, 1.5]`
- All varieties have required fields (displayName, mowHeightRange, storeTip)

### `__tests__/hooks/useUserPreferences.test.ts` (Phase 2 additions)
- Saves `sun_exposure` to Supabase
- Saves `soil_type` to Supabase
- Saves `grass_variety` to Supabase
- Falls back to `cool_season` grass_type when `grass_variety` is null

### `__tests__/lib/lawnAdvice-soil.test.ts` (Phase 4)
- Sandy soil watering advice differs from clay soil advice
- Loamy soil returns same text as current baseline (no regression)

---

## Quality Gates Before Each Phase Push

Per `RULES.md` and `.github/workflows/pre-deployment-gates.yml`:

```bash
yarn types:check
yarn lint:ci
yarn testFinal
yarn test:coverage
yarn validate:schema
```

All must pass with 0 warnings before pushing.

---

## Decisions Deferred Until Overseeding PR Is Reviewed

1. **Does the overseeding agent change `GrassType`?**
   If new varieties or a `grass_variety` field are added there, merge their approach with Phase 1
   of this plan rather than creating a parallel system.

2. **Does the overseeding agent add variety-specific overseeding windows?**
   If yes, the `storeTip` in Phase 6 should pull the variety-specific seed type for overseeding
   (e.g., "use perennial ryegrass for winter overseed on Bermuda") from that data rather than
   hardcoding it here.

3. **Does the overseeding agent change the `OverseedingReminder` interface?**
   Phase 6's store tip card hooks into the overseeding reminder to know when to display.
   If urgency levels or the interface shape changes, update Phase 6 accordingly.

---

## Summary: Priority Order When Ready to Implement

1. **Merge and review overseeding PR** — read the diff carefully before touching anything
2. **Phase 1** — grass variety data layer (pure logic, no UI, easiest to test)
3. **DB migration** — deploy new columns before UI changes
4. **Phase 2** — sun exposure at sign-up (biggest UX impact, low risk)
5. **Phase 3** — replace settings toggle (visible improvement users will notice immediately)
6. **Phase 4** — soil type (adds depth without requiring UI rework)
7. **Phase 5** — variety-specific mow heights (quality-of-life improvement)
8. **Phase 6** — store tip card (completes the "education" goal)
