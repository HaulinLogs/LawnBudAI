import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { MowEvent, MowEventInput } from '@/models/events';

export function useMowEvents() {
  const [events, setEvents] = useState<MowEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all mowing events for current user
  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error: fetchError } = await supabase
        .from('mow_events')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(100);

      if (fetchError) throw fetchError;
      setEvents(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch events';
      setError(message);
      console.error('Error fetching mow events:', err);
    } finally {
      setLoading(false);
    }
  };

  // Add new mowing event
  const addEvent = async (input: MowEventInput) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error: insertError } = await supabase
        .from('mow_events')
        .insert([
          {
            user_id: user.id,
            date: input.date,
            height_inches: input.height_inches,
            notes: input.notes || null,
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      // Add to local state
      setEvents([data as MowEvent, ...events]);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add event';
      setError(message);
      console.error('Error adding mow event:', err);
      throw err;
    }
  };

  // Delete mowing event
  const deleteEvent = async (eventId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('mow_events')
        .delete()
        .eq('id', eventId);

      if (deleteError) throw deleteError;

      // Remove from local state
      setEvents(events.filter(e => e.id !== eventId));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete event';
      setError(message);
      console.error('Error deleting mow event:', err);
      throw err;
    }
  };

  // Get statistics
  const getStats = () => {
    if (events.length === 0) {
      return {
        lastMowedDaysAgo: null,
        averageHeight: null,
      };
    }

    const lastEvent = events[0];
    const lastMowDate = new Date(lastEvent.date);
    const today = new Date();
    const daysAgo = Math.floor((today.getTime() - lastMowDate.getTime()) / (1000 * 60 * 60 * 24));

    const heights = events.slice(0, 3).map(e => e.height_inches);
    const averageHeight = heights.length > 0 ? (heights.reduce((a, b) => a + b, 0) / heights.length).toFixed(2) : null;

    return {
      lastMowedDaysAgo: daysAgo,
      averageHeight,
    };
  };

  // Initial fetch on component mount
  useEffect(() => {
    fetchEvents();
  }, []);

  return {
    events,
    loading,
    error,
    addEvent,
    deleteEvent,
    getStats,
    refetch: fetchEvents,
  };
}
