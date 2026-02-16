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
  amount_gallons: number;
  source: 'sprinkler' | 'manual' | 'rain';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface FertilizerEvent {
  id: string;
  user_id: string;
  date: string; // DATE format: YYYY-MM-DD
  type: 'nitrogen' | 'phosphorus' | 'potassium' | 'balanced';
  amount_lbs: number;
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
  amount_gallons: number;
  source: 'sprinkler' | 'manual' | 'rain';
  notes?: string;
}

export interface FertilizerEventInput {
  date: string;
  type: 'nitrogen' | 'phosphorus' | 'potassium' | 'balanced';
  amount_lbs: number;
  notes?: string;
}
