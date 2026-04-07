import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { LawnZone, LawnZoneInput } from '@/models/zones';
import { useSupabaseUser } from '@/hooks/useSupabaseUser';

export function useLawnZones() {
  const [zones, setZones] = useState<LawnZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, loading: userLoading } = useSupabaseUser();

  const fetchZones = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user) throw new Error('Not authenticated');

      const { data, error: fetchError } = await supabase
        .from('lawn_zones')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true });

      if (fetchError) throw fetchError;
      setZones(data || []);
    } catch (err) {
      const message = err instanceof Error
        ? err.message
        : (err as { message?: string })?.message ?? 'Failed to fetch zones';
      setError(message);
      console.error('Error fetching lawn zones:', err);
    } finally {
      setLoading(false);
    }
  };

  const addZone = async (input: LawnZoneInput): Promise<LawnZone> => {
    try {
      if (!user) throw new Error('Not authenticated');

      const { data, error: insertError } = await supabase
        .from('lawn_zones')
        .insert([
          {
            user_id: user.id,
            name: input.name.trim(),
            size_sqft: input.size_sqft ?? null,
            notes: input.notes ?? null,
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      const newZone = data as LawnZone;
      setZones(prev => [newZone, ...prev].sort((a, b) => a.name.localeCompare(b.name)));
      return newZone;
    } catch (err) {
      const message = err instanceof Error
        ? err.message
        : (err as { message?: string })?.message ?? 'Failed to add zone';
      setError(message);
      console.error('Error adding lawn zone:', err);
      throw err;
    }
  };

  const deleteZone = async (zoneId: string): Promise<void> => {
    try {
      const { error: deleteError } = await supabase
        .from('lawn_zones')
        .delete()
        .eq('id', zoneId);

      if (deleteError) throw deleteError;

      setZones(prev => prev.filter(z => z.id !== zoneId));
    } catch (err) {
      const message = err instanceof Error
        ? err.message
        : (err as { message?: string })?.message ?? 'Failed to delete zone';
      setError(message);
      console.error('Error deleting lawn zone:', err);
      throw err;
    }
  };

  // Sum of all zone sizes (ignores zones with no size_sqft)
  const totalLawnSize = zones.reduce((sum, z) => sum + (z.size_sqft ?? 0), 0);

  useEffect(() => {
    if (userLoading) return;

    if (user) {
      fetchZones();
    } else {
      setError('Not authenticated');
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, userLoading]);

  return {
    zones,
    loading,
    error,
    addZone,
    deleteZone,
    totalLawnSize,
    refetch: fetchZones,
  };
}
