import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { FertilizerEvent, FertilizerEventInput } from '@/models/events';
import { useSupabaseUser } from '@/hooks/useSupabaseUser';

export function useFertilizerEvents() {
  const [events, setEvents] = useState<FertilizerEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, loading: userLoading } = useSupabaseUser();

  // Fetch all fertilizer events for current user
  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user) throw new Error('Not authenticated');

      const { data, error: fetchError } = await supabase
        .from('fertilizer_events')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(20);

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
      if (!user) throw new Error('Not authenticated');

      const { data, error: insertError } = await supabase
        .from('fertilizer_events')
        .insert([
          {
            user_id: user.id,
            date: input.date,
            amount_lbs_per_1000sqft: input.amount_lbs_per_1000sqft,
            nitrogen_pct: input.nitrogen_pct,
            phosphorus_pct: input.phosphorus_pct,
            potassium_pct: input.potassium_pct,
            application_form: input.application_form,
            application_method: input.application_method,
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
        totalPoundsPerThousandSqftApplied: '0',
        averagePoundsPerThousandSqftPerApplication: null,
        averageNPK: { n: 0, p: 0, k: 0 },
      };
    }

    const lastEvent = events[0];
    const lastAppDate = new Date(lastEvent.date);
    const today = new Date();
    const daysAgo = Math.floor((today.getTime() - lastAppDate.getTime()) / (1000 * 60 * 60 * 24));

    // Calculate total pounds per 1000 sqft applied
    const totalPounds = events.reduce((sum, e) => sum + e.amount_lbs_per_1000sqft, 0);

    // Calculate average per application
    const averagePounds = events.length > 0
      ? (events.reduce((sum, e) => sum + e.amount_lbs_per_1000sqft, 0) / events.length).toFixed(1)
      : null;

    // Calculate average NPK
    const averageN = events.length > 0
      ? events.reduce((sum, e) => sum + e.nitrogen_pct, 0) / events.length
      : 0;
    const averageP = events.length > 0
      ? events.reduce((sum, e) => sum + e.phosphorus_pct, 0) / events.length
      : 0;
    const averageK = events.length > 0
      ? events.reduce((sum, e) => sum + e.potassium_pct, 0) / events.length
      : 0;

    return {
      lastApplicationDaysAgo: daysAgo,
      totalPoundsPerThousandSqftApplied: totalPounds.toFixed(1),
      averagePoundsPerThousandSqftPerApplication: averagePounds,
      averageNPK: { nitrogen: averageN.toFixed(1), phosphorus: averageP.toFixed(1), potassium: averageK.toFixed(1) },
    };
  };

  // Get application form breakdown (liquid vs granular)
  const getFormBreakdown = () => {
    const breakdown: { [key: string]: number } = {};

    events.forEach(event => {
      breakdown[event.application_form] = (breakdown[event.application_form] || 0) + 1;
    });

    return breakdown;
  };

  // Get application method breakdown
  const getMethodBreakdown = () => {
    const breakdown: { [key: string]: number } = {};

    events.forEach(event => {
      if (event.application_method) {
        breakdown[event.application_method] =
          (breakdown[event.application_method] || 0) + 1;
      }
    });

    return breakdown;
  };

  // Initial fetch when user is available
  useEffect(() => {
    // Still waiting for user authentication status to be determined
    if (userLoading) {
      return;
    }

    // User is authenticated, fetch events
    if (user) {
      fetchEvents();
    } else {
      // User is not authenticated and loading is complete
      setError('Not authenticated');
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, userLoading]);

  return {
    events,
    loading,
    error,
    addEvent,
    deleteEvent,
    getStats,
    getFormBreakdown,
    getMethodBreakdown,
    refetch: fetchEvents,
  };
}
