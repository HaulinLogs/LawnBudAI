import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';
import { Stack } from 'expo-router';
import { useMowEvents } from '@/hooks/useMowEvents';
import { MowEventInput } from '@/models/events';
import EventForm from '@/components/EventForm';
import EventHistory from '@/components/EventHistory';
import Statistics from '@/components/Statistics';
import { validateRequiredField, validatePositiveNumber, validateForm } from '@/lib/validation';

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
});

export default function MowingScreen() {
  const { events, loading, error, addEvent, deleteEvent, getStats } = useMowEvents();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [height, setHeight] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const stats = getStats();

  const handleSubmit = async () => {
    // Validate form using centralized validation utilities
    const validation = validateForm([
      () => validateRequiredField(date, 'Date'),
      () => validatePositiveNumber(height, 'Height'),
    ]);

    if (!validation.valid) {
      Alert.alert('Error', validation.error || 'Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const input: MowEventInput = {
        date,
        height_inches: parseFloat(height),
        notes: notes.trim() || undefined,
      };
      await addEvent(input);
      Alert.alert('Success', 'Mowing event recorded!');
      setHeight('');
      setNotes('');
      setDate(new Date().toISOString().split('T')[0]);
    } catch {
      Alert.alert('Error', 'Failed to record mowing event');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (eventId: string) => {
    Alert.alert('Delete Event', 'Are you sure?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Delete',
        onPress: async () => {
          try {
            await deleteEvent(eventId);
            Alert.alert('Success', 'Event deleted');
          } catch {
            Alert.alert('Error', 'Failed to delete event');
          }
        },
        style: 'destructive',
      },
    ]);
  };

  return (
    <View style={localStyles.container}>
      <Stack.Screen options={{ title: 'Mowing' }} />
      <ScrollView style={localStyles.content} showsVerticalScrollIndicator={false}>
        {/* Form Section */}
        <View style={localStyles.section}>
          <Text style={localStyles.sectionTitle}>Log Mowing Event</Text>
          <EventForm
            date={date}
            onDateChange={setDate}
            amount={height}
            onAmountChange={setHeight}
            amountLabel="Height (inches)"
            amountPlaceholder="e.g., 2.5"
            amountKeyboardType="decimal-pad"
            notes={notes}
            onNotesChange={setNotes}
            submitLabel="Record Mowing"
            onSubmit={handleSubmit}
            submitting={submitting}
          />
        </View>

        {/* Statistics Section */}
        {events.length > 0 && (
          <View style={localStyles.section}>
            <Text style={localStyles.sectionTitle}>Statistics</Text>
            <Statistics
              stats={[
                {
                  value: stats.lastMowedDaysAgo !== null ? stats.lastMowedDaysAgo : '–',
                  label: 'Days since last mow',
                },
                {
                  value: stats.averageHeight,
                  label: 'Avg height (in)',
                },
              ]}
            />
          </View>
        )}

        {/* History Section */}
        <View style={localStyles.section}>
          <Text style={localStyles.sectionTitle}>Recent Events</Text>
          <EventHistory
            events={events}
            loading={loading}
            error={error}
            renderEventDetail={(event) => (
              <>
                <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                  Height: {event.height_inches}&quot;
                </Text>
                {event.notes && (
                  <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                    {event.notes}
                  </Text>
                )}
              </>
            )}
            onDelete={handleDelete}
            emptyStateIcon="cut"
            emptyStateText="No mowing events yet"
            maxDisplay={10}
          />
        </View>
      </ScrollView>
    </View>
  );
}