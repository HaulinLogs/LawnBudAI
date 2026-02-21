import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';
import { Stack } from 'expo-router';
import Icon from '@expo/vector-icons/Ionicons';
import { useWaterEvents } from '@/hooks/useWaterEvents';
import { WaterEventInput } from '@/models/events';
import EventForm from '@/components/EventForm';
import EventHistory from '@/components/EventHistory';
import Statistics from '@/components/Statistics';
import GenericPicker from '@/components/ui/GenericPicker';
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
  sourceBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  breakdownItem: {
    alignItems: 'center',
  },
  breakdownLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
});

export default function WateringScreen() {
  const { events, loading, error, addEvent, deleteEvent, getStats, getSourceBreakdown } = useWaterEvents();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState<'sprinkler' | 'manual' | 'rain'>('manual');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const sourceOptions = [
    { label: 'Sprinkler', value: 'sprinkler' as const, icon: 'water' },
    { label: 'Manual', value: 'manual' as const, icon: 'hand-right' },
    { label: 'Rain', value: 'rain' as const, icon: 'rainy' },
  ];

  const stats = getStats();
  const breakdown = getSourceBreakdown();

  const handleSubmit = async () => {
    // Validate form using centralized validation utilities
    const validation = validateForm([
      () => validateRequiredField(date, 'Date'),
      () => validatePositiveNumber(amount, 'Amount'),
    ]);

    if (!validation.valid) {
      Alert.alert('Error', validation.error || 'Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const input: WaterEventInput = {
        date,
        amount_gallons: parseFloat(amount),
        source,
        notes: notes.trim() || undefined,
      };
      await addEvent(input);
      Alert.alert('Success', 'Watering event recorded!');
      setAmount('');
      setNotes('');
      setDate(new Date().toISOString().split('T')[0]);
    } catch {
      Alert.alert('Error', 'Failed to record watering event');
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

  const sourcePicker = (
    <GenericPicker
      label="Source"
      options={sourceOptions}
      value={source}
      onChange={setSource}
    />
  );

  return (
    <View style={localStyles.container}>
      <Stack.Screen options={{ title: 'Watering' }} />
      <ScrollView style={localStyles.content} showsVerticalScrollIndicator={false}>
        {/* Form Section */}
        <View style={localStyles.section}>
          <Text style={localStyles.sectionTitle}>Log Watering Event</Text>
          <EventForm
            date={date}
            onDateChange={setDate}
            amount={amount}
            onAmountChange={setAmount}
            amountLabel="Amount (gallons)"
            amountPlaceholder="e.g., 25.5"
            amountKeyboardType="decimal-pad"
            notes={notes}
            onNotesChange={setNotes}
            optionalField={sourcePicker}
            submitLabel="Record Watering"
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
                  value: stats.lastWateredDaysAgo !== null ? stats.lastWateredDaysAgo : '–',
                  label: 'Days since watering',
                },
                {
                  value: stats.totalGallonsThisMonth,
                  label: 'Gallons this month',
                },
                {
                  value: stats.averageGallonsPerWatering,
                  label: 'Avg gallons',
                },
              ]}
            />

            <Text style={[localStyles.sectionTitle, { marginTop: 16 }]}>Source Breakdown</Text>
            <View style={localStyles.sourceBreakdown}>
              <View style={localStyles.breakdownItem}>
                <Icon name="droplet" size={24} color="#22c55e" />
                <Text style={{ fontSize: 20, fontWeight: '700', color: '#22c55e', marginBottom: 4 }}>
                  {breakdown.sprinkler}
                </Text>
                <Text style={localStyles.breakdownLabel}>Sprinkler</Text>
              </View>
              <View style={localStyles.breakdownItem}>
                <Icon name="hand-right" size={24} color="#22c55e" />
                <Text style={{ fontSize: 20, fontWeight: '700', color: '#22c55e', marginBottom: 4 }}>
                  {breakdown.manual}
                </Text>
                <Text style={localStyles.breakdownLabel}>Manual</Text>
              </View>
              <View style={localStyles.breakdownItem}>
                <Icon name="rainy" size={24} color="#22c55e" />
                <Text style={{ fontSize: 20, fontWeight: '700', color: '#22c55e', marginBottom: 4 }}>
                  {breakdown.rain}
                </Text>
                <Text style={localStyles.breakdownLabel}>Rain</Text>
              </View>
            </View>
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
              <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                {event.amount_gallons} gal • {event.source}
                {event.notes && <Text>{'\n'}{event.notes}</Text>}
              </Text>
            )}
            onDelete={handleDelete}
            emptyStateIcon="water"
            emptyStateText="No watering events yet"
            maxDisplay={10}
          />
        </View>
      </ScrollView>
    </View>
  );
}