/**
 * Lawn care event models matching Supabase schema
 */

export interface MowEvent {
  id: string;
  user_id: string;
  date: string; // DATE format: YYYY-MM-DD
  height_inches: number;
  notes?: string;
  zone_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface WaterEvent {
  id: string;
  user_id: string;
  date: string; // DATE format: YYYY-MM-DD
  amount_inches: number;
  source: 'sprinkler' | 'manual' | 'rain';
  notes?: string;
  zone_id?: string | null;
  created_at: string;
  updated_at: string;
}

export type ApplicationForm = 'granular' | 'liquid';
export type ApplicationMethod = 'broadcast' | 'spot' | 'edge' | 'custom' | 'spray';

export interface FertilizerEvent {
  id: string;
  user_id: string;
  date: string; // DATE format: YYYY-MM-DD
  amount_lbs: number;
  nitrogen_pct: number;
  phosphorus_pct: number;
  potassium_pct: number;
  application_form: ApplicationForm;
  application_method: ApplicationMethod;
  notes?: string;
  zone_id?: string | null;
  created_at: string;
  updated_at: string;
}

export type GrassSeedType =
  | 'kentucky_bluegrass'
  | 'tall_fescue'
  | 'perennial_ryegrass'
  | 'fine_fescue'
  | 'bermudagrass'
  | 'zoysiagrass'
  | 'st_augustine'
  | 'centipede'
  | 'annual_ryegrass'
  | 'mixed'
  | 'unknown';

export interface SeedEvent {
  id: string;
  user_id: string;
  date: string; // DATE format: YYYY-MM-DD
  grass_seed_type: GrassSeedType;
  area_sqft?: number;
  notes?: string;
  zone_id?: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Form submission payloads (without id, user_id, timestamps - those are server-generated)
 */

export interface MowEventInput {
  date: string;
  height_inches: number;
  notes?: string;
  zone_id?: string | null;
}

export interface WaterEventInput {
  date: string;
  amount_inches: number;
  source: 'sprinkler' | 'manual' | 'rain';
  notes?: string;
  zone_id?: string | null;
}

export interface FertilizerEventInput {
  date: string;
  amount_lbs: number;
  nitrogen_pct: number;
  phosphorus_pct: number;
  potassium_pct: number;
  application_form: ApplicationForm;
  application_method: ApplicationMethod;
  notes?: string;
  zone_id?: string | null;
}

export interface SeedEventInput {
  date: string;
  grass_seed_type: GrassSeedType;
  area_sqft?: number;
  notes?: string;
  zone_id?: string | null;
}
