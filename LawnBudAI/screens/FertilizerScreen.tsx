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
import { useFertilizerEvents } from '@/hooks/useFertilizerEvents';
import { FertilizerEventInput } from '@/models/events';
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
  typeButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeButtonText: {
    fontSize: 16,
    color: '#1f2937',
  },
  typeOption: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  typeOptionText: {
    fontSize: 16,
    color: '#1f2937',
  },
  typeOptionSelected: {
    backgroundColor: '#f0fdf4',
  },
  typeOptionSelectedText: {
    color: '#22c55e',
    fontWeight: '600',
  },
  typeBreakdown: {
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

const FERTILIZER_TYPES = [
  { label: 'Nitrogen', value: 'nitrogen' as const, icon: 'leaf' },
  { label: 'Phosphorus', value: 'phosphorus' as const, icon: 'flower' },
  { label: 'Potassium', value: 'potassium' as const, icon: 'sparkles' },
  { label: 'Balanced', value: 'balanced' as const, icon: 'settings' },
];

export default function FertilizerScreen() {
  const { events, loading, error, addEvent, deleteEvent, getStats, getTypeBreakdown } = useFertilizerEvents();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'nitrogen' | 'phosphorus' | 'potassium' | 'balanced'>('nitrogen');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);

  const stats = getStats();
  const breakdown = getTypeBreakdown();

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
      const input: FertilizerEventInput = {
        date,
        type,
        amount_lbs: amountNum,
        notes: notes.trim() || undefined,
      };
      await addEvent(input);
      Alert.alert('Success', 'Fertilizer application recorded!');
      setAmount('');
      setNotes('');
      setDate(new Date().toISOString().split('T')[0]);
      setType('nitrogen');
    } catch {
      Alert.alert('Error', 'Failed to record fertilizer application');
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

  const getTypeIcon = (typeValue: string) => {
    const type = FERTILIZER_TYPES.find(t => t.value === typeValue);
    return type?.icon || 'leaf';
  };

  const typePicker = (
    <View>
      <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6 }}>
        Type
      </Text>
      <View style={localStyles.pickerContainer}>
        <TouchableOpacity
          style={localStyles.typeButton}
          onPress={() => setShowTypePicker(!showTypePicker)}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon name={getTypeIcon(type)} size={16} color="#22c55e" />
            <Text style={localStyles.typeButtonText}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          </View>
          <Icon name={showTypePicker ? 'chevron-up' : 'chevron-down'} size={20} color="#6b7280" />
        </TouchableOpacity>

        {showTypePicker && (
          <>
            {FERTILIZER_TYPES.map(opt => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  localStyles.typeOption,
                  type === opt.value && localStyles.typeOptionSelected,
                ]}
                onPress={() => {
                  setType(opt.value);
                  setShowTypePicker(false);
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icon name={opt.icon} size={16} color={type === opt.value ? '#22c55e' : '#6b7280'} />
                  <Text
                    style={[
                      localStyles.typeOptionText,
                      type === opt.value && localStyles.typeOptionSelectedText,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}
      </View>
    </View>
  );

  return (
    <View style={localStyles.container}>
      <Stack.Screen options={{ title: 'Fertilizer' }} />
      <ScrollView style={localStyles.content} showsVerticalScrollIndicator={false}>
        {/* Form Section */}
        <View style={localStyles.section}>
          <Text style={localStyles.sectionTitle}>Log Fertilizer Application</Text>
          <EventForm
            date={date}
            onDateChange={setDate}
            amount={amount}
            onAmountChange={setAmount}
            amountLabel="Amount (lbs)"
            amountPlaceholder="e.g., 15.5"
            amountKeyboardType="decimal-pad"
            notes={notes}
            onNotesChange={setNotes}
            optionalField={typePicker}
            submitLabel="Record Application"
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
                  value: stats.lastApplicationDaysAgo !== null ? stats.lastApplicationDaysAgo : '–',
                  label: 'Days since application',
                },
                {
                  value: stats.totalPoundsApplied,
                  label: 'Total lbs applied',
                },
                {
                  value: stats.averagePoundsPerApplication || '–',
                  label: 'Avg lbs per app',
                },
              ]}
            />

            <Text style={[localStyles.sectionTitle, { marginTop: 16 }]}>Type Breakdown</Text>
            <View style={localStyles.typeBreakdown}>
              {FERTILIZER_TYPES.map(fertilizerType => (
                <View key={fertilizerType.value} style={localStyles.breakdownItem}>
                  <Icon name={fertilizerType.icon} size={24} color="#22c55e" />
                  <Text style={{ fontSize: 20, fontWeight: '700', color: '#22c55e', marginBottom: 4 }}>
                    {breakdown[fertilizerType.value]}
                  </Text>
                  <Text style={localStyles.breakdownLabel}>{fertilizerType.label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* History Section */}
        <View style={localStyles.section}>
          <Text style={localStyles.sectionTitle}>Recent Applications</Text>
          <EventHistory
            events={events}
            loading={loading}
            error={error}
            renderEventDetail={(event) => (
              <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                {event.amount_lbs} lbs • {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                {event.notes && <Text>{'\n'}{event.notes}</Text>}
              </Text>
            )}
            onDelete={handleDelete}
            emptyStateIcon="leaf"
            emptyStateText="No fertilizer applications yet"
            maxDisplay={10}
          />
        </View>
      </ScrollView>
    </View>
  );
}
