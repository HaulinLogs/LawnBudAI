/**
 * Lawn zone models matching Supabase schema
 */

export interface LawnZone {
  id: string;
  user_id: string;
  name: string;
  size_sqft?: number | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Form submission payload for creating/updating a zone
 */
export interface LawnZoneInput {
  name: string;
  size_sqft?: number | null;
  notes?: string | null;
}

/**
 * Per-zone activity summary for dashboard display
 */
export interface ZoneActivity {
  zone: LawnZone;
  lastMowedDate: string | null;
  lastWateredDate: string | null;
  lastFertilizedDate: string | null;
  lastSeededDate: string | null;
}
