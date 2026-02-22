import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

let cachedUser: User | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function useSupabaseUser() {
  const [user, setUser] = useState<User | null>(cachedUser);
  const [loading, setLoading] = useState(!cachedUser);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const now = Date.now();

    // Return cached user if still valid
    if (cachedUser && (now - cacheTimestamp) < CACHE_TTL) {
      setUser(cachedUser);
      setLoading(false);
      return;
    }

    // Fetch fresh user
    const fetchUser = async () => {
      try {
        const { data: { user: fetchedUser }, error: fetchError } = await supabase.auth.getUser();
        if (fetchError) throw fetchError;

        cachedUser = fetchedUser;
        cacheTimestamp = Date.now();
        setUser(fetchedUser);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        cachedUser = session.user;
        cacheTimestamp = Date.now();
        setUser(session.user);
      } else {
        cachedUser = null;
        cacheTimestamp = 0;
        setUser(null);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  return { user, loading, error };
}
