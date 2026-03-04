import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useSupabaseUser } from '@/hooks/useSupabaseUser';

interface UserPreferences {
  id?: string;
  city: string;
  state: string;
  timezone?: string;
  grass_type: string;
  lawn_size_sqft: number | null;
}

export function useUserPreferences() {
  const [prefs, setPrefs] = useState<UserPreferences>({
    city: 'Madison',
    state: 'WI',
    timezone: 'America/Chicago',
    grass_type: 'cool_season',
    lawn_size_sqft: null
  });
  const [loading, setLoading] = useState(true);
  const { user, loading: userLoading } = useSupabaseUser();

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        if (!user) {
          console.log('No authenticated user');
          setLoading(false);
          return;
        }

        console.log('Fetching preferences for user:', user.id);
        const { data, error } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching preferences:', error);
          return;
        }

        if (data) {
          console.log('User preferences found:', data);
          setPrefs({
            id: data.id,
            city: data.city || 'Madison',
            state: data.state || 'WI',
            timezone: data.timezone || 'America/Chicago',
            grass_type: data.grass_type || 'cool_season',
            lawn_size_sqft: data.lawn_size_sqft || null,
          });
        } else {
          console.log('No preferences found, using defaults');
          // Auto-create default preferences for this user (database trigger will also handle this)
          const { error: insertError } = await supabase.from('user_preferences').insert({
            user_id: user.id,
            city: 'Madison',
            state: 'WI',
            timezone: 'America/Chicago',
            grass_type: 'cool_season',
          });
          if (insertError) {
            console.error('Error creating default preferences:', insertError);
          }
        }
      } catch (err) {
        console.error('Error in useUserPreferences:', err);
      } finally {
        setLoading(false);
      }
    };

    if (userLoading) {
      return;
    }

    if (user) {
      fetchPreferences();
    } else {
      setLoading(false);
    }
  }, [user, userLoading]);

  const save = async (updates: Partial<UserPreferences>) => {
    try {
      if (!user) return;

      const { error } = await supabase.from('user_preferences').upsert(
        {
          ...(prefs.id ? { id: prefs.id } : {}),
          user_id: user.id,
          ...updates,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' },
      );

      if (error) {
        console.error('Error saving preferences:', error);
        throw error;
      }

      setPrefs(p => ({ ...p, ...updates }));
      console.log('Preferences saved:', updates);
    } catch (err) {
      console.error('Error saving preferences:', err);
      throw err;
    }
  };

  return { prefs, loading, save };
}
