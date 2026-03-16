import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { SeedEvent, SeedEventInput } from '@/models/events';
import { useSupabaseUser } from '@/hooks/useSupabaseUser';

export function useSeedEvents() {
  const [events, setEvents] = useState<SeedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, loading: userLoading } = useSupabaseUser();

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user) throw new Error('Not authenticated');

      const { data, error: fetchError } = await supabase
        .from('seed_events')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(20);

      if (fetchError) throw fetchError;
      setEvents(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch seed events';
      setError(message);
      console.error('Error fetching seed events:', err);
    } finally {
      setLoading(false);
    }
  };

  const addEvent = async (input: SeedEventInput): Promise<SeedEvent> => {
    if (!user) throw new Error('Not authenticated');

    const { data, error: insertError } = await supabase
      .from('seed_events')
      .insert([
        {
          user_id: user.id,
          date: input.date,
          grass_seed_type: input.grass_seed_type,
          area_sqft: input.area_sqft ?? null,
          notes: input.notes ?? null,
        },
      ])
      .select()
      .single();

    if (insertError) throw insertError;

    const newEvent = data as SeedEvent;
    setEvents(prev => [newEvent, ...prev]);
    return newEvent;
  };

  const deleteEvent = async (eventId: string) => {
    const { error: deleteError } = await supabase
      .from('seed_events')
      .delete()
      .eq('id', eventId);

    if (deleteError) throw deleteError;
    setEvents(prev => prev.filter(e => e.id !== eventId));
  };

  /** Most recent seed event, or null if none recorded */
  const latestEvent: SeedEvent | null = events.length > 0 ? events[0] : null;

  /**
   * Days since the last seed event, or null if no events.
   * Used to drive watering reminders and germination countdown.
   */
  const daysSinceLastSeed: number | null = latestEvent
    ? Math.floor(
        (Date.now() - new Date(latestEvent.date).getTime()) / (1000 * 60 * 60 * 24),
      )
    : null;

  useEffect(() => {
    if (userLoading) return;
    if (user) {
      fetchEvents();
    } else {
      setError('Not authenticated');
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, userLoading]);

  return {
    events,
    loading,
    error,
    latestEvent,
    daysSinceLastSeed,
    addEvent,
    deleteEvent,
    refetch: fetchEvents,
  };
}
