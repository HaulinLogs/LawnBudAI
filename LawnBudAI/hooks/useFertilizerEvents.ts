import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { FertilizerEvent, FertilizerEventInput } from '@/models/events';

export function useFertilizerEvents() {
  const [events, setEvents] = useState<FertilizerEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all fertilizer events for current user
  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error: fetchError } = await supabase
        .from('fertilizer_events')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(100);

      if (fetchError) throw fetchError;
      setEvents(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch events';
      setError(message);
      console.error('Error fetching fertilizer events:', err);
    } finally {
      setLoading(false);
    }
  };

  // Add new fertilizer event
  const addEvent = async (input: FertilizerEventInput) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error: insertError } = await supabase
        .from('fertilizer_events')
        .insert([
          {
            user_id: user.id,
            date: input.date,
            type: input.type,
            amount_lbs: input.amount_lbs,
            notes: input.notes || null,
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      // Add to local state
      setEvents([data as FertilizerEvent, ...events]);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add event';
      setError(message);
      console.error('Error adding fertilizer event:', err);
      throw err;
    }
  };

  // Delete fertilizer event
  const deleteEvent = async (eventId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('fertilizer_events')
        .delete()
        .eq('id', eventId);

      if (deleteError) throw deleteError;

      // Remove from local state
      setEvents(events.filter(e => e.id !== eventId));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete event';
      setError(message);
      console.error('Error deleting fertilizer event:', err);
      throw err;
    }
  };

  // Get statistics
  const getStats = () => {
    if (events.length === 0) {
      return {
        lastApplicationDaysAgo: null,
        totalPoundsApplied: '0',
        averagePoundsPerApplication: null,
      };
    }

    const lastEvent = events[0];
    const lastAppDate = new Date(lastEvent.date);
    const today = new Date();
    const daysAgo = Math.floor((today.getTime() - lastAppDate.getTime()) / (1000 * 60 * 60 * 24));

    // Calculate total pounds applied
    const totalPounds = events.reduce((sum, e) => sum + e.amount_lbs, 0);

    // Calculate average per application
    const averagePounds = events.length > 0
      ? (events.reduce((sum, e) => sum + e.amount_lbs, 0) / events.length).toFixed(1)
      : null;

    return {
      lastApplicationDaysAgo: daysAgo,
      totalPoundsApplied: totalPounds.toFixed(1),
      averagePoundsPerApplication: averagePounds,
    };
  };

  // Get type breakdown
  const getTypeBreakdown = () => {
    const breakdown = {
      nitrogen: 0,
      phosphorus: 0,
      potassium: 0,
      balanced: 0,
    };

    events.forEach(event => {
      breakdown[event.type]++;
    });

    return breakdown;
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
    getTypeBreakdown,
    refetch: fetchEvents,
  };
}
