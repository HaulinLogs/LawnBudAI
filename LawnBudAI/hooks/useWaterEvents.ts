import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { WaterEvent, WaterEventInput } from '@/models/events';

export function useWaterEvents() {
  const [events, setEvents] = useState<WaterEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all watering events for current user
  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error: fetchError } = await supabase
        .from('water_events')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(100);

      if (fetchError) throw fetchError;
      setEvents(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch events';
      setError(message);
      console.error('Error fetching water events:', err);
    } finally {
      setLoading(false);
    }
  };

  // Add new watering event
  const addEvent = async (input: WaterEventInput) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error: insertError } = await supabase
        .from('water_events')
        .insert([
          {
            user_id: user.id,
            date: input.date,
            amount_gallons: input.amount_gallons,
            source: input.source,
            notes: input.notes || null,
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      // Add to local state
      setEvents([data as WaterEvent, ...events]);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add event';
      setError(message);
      console.error('Error adding water event:', err);
      throw err;
    }
  };

  // Delete watering event
  const deleteEvent = async (eventId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('water_events')
        .delete()
        .eq('id', eventId);

      if (deleteError) throw deleteError;

      // Remove from local state
      setEvents(events.filter(e => e.id !== eventId));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete event';
      setError(message);
      console.error('Error deleting water event:', err);
      throw err;
    }
  };

  // Get statistics
  const getStats = () => {
    if (events.length === 0) {
      return {
        lastWateredDaysAgo: null,
        totalGallonsThisMonth: 0,
        averageGallonsPerWatering: null,
      };
    }

    const lastEvent = events[0];
    const lastWaterDate = new Date(lastEvent.date);
    const today = new Date();
    const daysAgo = Math.floor((today.getTime() - lastWaterDate.getTime()) / (1000 * 60 * 60 * 24));

    // Calculate total gallons this month
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const eventsThisMonth = events.filter(e => new Date(e.date) >= thisMonth);
    const totalGallons = eventsThisMonth.reduce((sum, e) => sum + e.amount_gallons, 0);

    // Calculate average
    const averageGallons = events.length > 0
      ? (events.reduce((sum, e) => sum + e.amount_gallons, 0) / events.length).toFixed(1)
      : null;

    return {
      lastWateredDaysAgo: daysAgo,
      totalGallonsThisMonth: totalGallons.toFixed(1),
      averageGallonsPerWatering: averageGallons,
    };
  };

  // Get source breakdown
  const getSourceBreakdown = () => {
    const breakdown = {
      sprinkler: 0,
      manual: 0,
      rain: 0,
    };

    events.forEach(event => {
      breakdown[event.source]++;
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
    getSourceBreakdown,
    refetch: fetchEvents,
  };
}
