import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  sourceButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sourceButtonText: {
    fontSize: 16,
    color: '#1f2937',
  },
  sourceOption: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  sourceOptionText: {
    fontSize: 16,
    color: '#1f2937',
  },
  sourceOptionSelected: {
    backgroundColor: '#f0fdf4',
  },
  sourceOptionSelectedText: {
    color: '#22c55e',
    fontWeight: '600',
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
  const [showSourcePicker, setShowSourcePicker] = useState(false);

  const stats = getStats();
  const breakdown = getSourceBreakdown();

  const handleSubmit = async () => {
    if (!date || !amount) {
      Alert.alert('Error', 'Please fill in date and amount');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Error', 'Amount must be a valid positive number');
      return;
    }

    setSubmitting(true);
    try {
      const input: WaterEventInput = {
        date,
        amount_gallons: amountNum,
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
    <View>
      <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6 }}>
        Source
      </Text>
      <View style={localStyles.pickerContainer}>
        <TouchableOpacity
          style={localStyles.sourceButton}
          onPress={() => setShowSourcePicker(!showSourcePicker)}
        >
          <Text style={localStyles.sourceButtonText}>
            {source.charAt(0).toUpperCase() + source.slice(1)}
          </Text>
          <Icon name={showSourcePicker ? 'chevron-up' : 'chevron-down'} size={20} color="#6b7280" />
        </TouchableOpacity>

        {showSourcePicker && (
          <>
            {(['sprinkler', 'manual', 'rain'] as const).map(opt => (
              <TouchableOpacity
                key={opt}
                style={[
                  localStyles.sourceOption,
                  source === opt && localStyles.sourceOptionSelected,
                ]}
                onPress={() => {
                  setSource(opt);
                  setShowSourcePicker(false);
                }}
              >
                <Text
                  style={[
                    localStyles.sourceOptionText,
                    source === opt && localStyles.sourceOptionSelectedText,
                  ]}
                >
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </>
        )}
      </View>
    </View>
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