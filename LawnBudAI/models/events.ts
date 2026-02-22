/**
 * Lawn care event models matching Supabase schema
 */

export interface MowEvent {
  id: string;
  user_id: string;
  date: string; // DATE format: YYYY-MM-DD
  height_inches: number;
  notes?: string;
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
  created_at: string;
  updated_at: string;
}

export type FertilizerType = 'nitrogen' | 'phosphorus' | 'potassium' | 'npk' | 'organic' | 'liquid' | 'granular';
export type ApplicationMethod = 'spreader' | 'spray' | 'liquid' | 'granular';

export interface FertilizerEvent {
  id: string;
  user_id: string;
  date: string; // DATE format: YYYY-MM-DD
  amount_lbs: number;
  type: FertilizerType;
  application_method: ApplicationMethod;
  notes?: string;
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
}

export interface WaterEventInput {
  date: string;
  amount_inches: number;
  source: 'sprinkler' | 'manual' | 'rain';
  notes?: string;
}

export interface FertilizerEventInput {
  date: string;
  amount_lbs: number;
  type: FertilizerType;
  application_method: ApplicationMethod;
  notes?: string;
}
