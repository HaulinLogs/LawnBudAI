import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { Stack } from 'expo-router';
import Icon from '@expo/vector-icons/Ionicons';
import { useFertilizerEvents } from '@/hooks/useFertilizerEvents';
import { FertilizerEventInput } from '@/models/events';

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
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 12,
    color: '#1f2937',
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
  button: {
    backgroundColor: '#22c55e',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#d1d5db',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 6,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#22c55e',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
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
  eventItem: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  eventDetail: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  deleteButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#9ca3af',
  },
  typeIndicator: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
    marginLeft: 4,
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

  return (
    <View style={localStyles.container}>
      <Stack.Screen options={{ title: 'Fertilizer' }} />
      <ScrollView style={localStyles.content} showsVerticalScrollIndicator={false}>
        {/* Form Section */}
        <View style={localStyles.section}>
          <Text style={localStyles.sectionTitle}>Log Fertilizer Application</Text>
          <View style={localStyles.card}>
            <Text style={localStyles.label}>Date</Text>
            <TextInput
              style={localStyles.input}
              placeholder="YYYY-MM-DD"
              value={date}
              onChangeText={setDate}
              editable={!submitting}
            />

            <Text style={localStyles.label}>Amount (lbs)</Text>
            <TextInput
              style={localStyles.input}
              placeholder="e.g., 15.5"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              editable={!submitting}
            />

            <Text style={localStyles.label}>Type</Text>
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

            <Text style={localStyles.label}>Notes (optional)</Text>
            <TextInput
              style={[localStyles.input, { minHeight: 80 }]}
              placeholder="Any notes..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              editable={!submitting}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[localStyles.button, submitting && localStyles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={localStyles.buttonText}>Record Application</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Statistics Section */}
        {events.length > 0 && (
          <View style={localStyles.section}>
            <Text style={localStyles.sectionTitle}>Statistics</Text>
            <View style={localStyles.statsContainer}>
              <View style={localStyles.statBox}>
                <Text style={localStyles.statValue}>
                  {stats.lastApplicationDaysAgo !== null ? stats.lastApplicationDaysAgo : '–'}
                </Text>
                <Text style={localStyles.statLabel}>Days since application</Text>
              </View>
              <View style={localStyles.statBox}>
                <Text style={localStyles.statValue}>{stats.totalPoundsApplied}</Text>
                <Text style={localStyles.statLabel}>Total lbs applied</Text>
              </View>
              <View style={localStyles.statBox}>
                <Text style={localStyles.statValue}>{stats.averagePoundsPerApplication || '–'}</Text>
                <Text style={localStyles.statLabel}>Avg lbs per app</Text>
              </View>
            </View>

            <Text style={[localStyles.sectionTitle, { marginTop: 16 }]}>Type Breakdown</Text>
            <View style={localStyles.typeBreakdown}>
              {FERTILIZER_TYPES.map(type => (
                <View key={type.value} style={localStyles.breakdownItem}>
                  <Icon name={type.icon} size={24} color="#22c55e" />
                  <Text style={localStyles.statValue}>{breakdown[type.value]}</Text>
                  <Text style={localStyles.breakdownLabel}>{type.label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* History Section */}
        <View style={localStyles.section}>
          <Text style={localStyles.sectionTitle}>Recent Applications</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#22c55e" />
          ) : error ? (
            <Text style={{ color: '#ef4444' }}>{error}</Text>
          ) : events.length === 0 ? (
            <View style={localStyles.emptyState}>
              <Icon name="leaf" size={48} color="#d1d5db" />
              <Text style={localStyles.emptyStateText}>No fertilizer applications yet</Text>
            </View>
          ) : (
            events.slice(0, 10).map(event => (
              <View key={event.id} style={localStyles.eventItem}>
                <View style={{ flex: 1 }}>
                  <Text style={localStyles.eventDate}>
                    {new Date(event.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Text>
                  <Text style={localStyles.eventDetail}>
                    {event.amount_lbs} lbs • {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                  </Text>
                  {event.notes && <Text style={localStyles.eventDetail}>{event.notes}</Text>}
                </View>
                <TouchableOpacity
                  style={localStyles.deleteButton}
                  onPress={() => handleDelete(event.id)}
                >
                  <Icon name="trash" size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
