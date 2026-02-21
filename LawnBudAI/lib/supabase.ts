import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Validate environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '[Supabase] FATAL ERROR: Missing required environment variables!\n' +
    'Required variables:\n' +
    `  - EXPO_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✓ set' : '✗ MISSING'}\n` +
    `  - EXPO_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✓ set' : '✗ MISSING'}\n` +
    '\nThe app will not be able to connect to Supabase.\n' +
    'Please check GitHub Secrets configuration or .env file.'
  );
}

// Use localStorage on web, AsyncStorage on native
let authStorage: any;
if (Platform.OS === 'web') {
  authStorage = {
    getItem: (key: string) => Promise.resolve(typeof window !== 'undefined' ? window.localStorage.getItem(key) : null),
    setItem: (key: string, value: string) => {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, value);
      }
      return Promise.resolve();
    },
    removeItem: (key: string) => {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
      return Promise.resolve();
    },
  };
} else {
  authStorage = AsyncStorage;
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      storage: authStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);
