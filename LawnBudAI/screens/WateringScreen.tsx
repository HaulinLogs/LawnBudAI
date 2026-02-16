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
import { useWaterEvents } from '@/hooks/useWaterEvents';
import { WaterEventInput } from '@/models/events';

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

  return (
    <View style={localStyles.container}>
      <Stack.Screen options={{ title: 'Watering' }} />
      <ScrollView style={localStyles.content} showsVerticalScrollIndicator={false}>
        {/* Form Section */}
        <View style={localStyles.section}>
          <Text style={localStyles.sectionTitle}>Log Watering Event</Text>
          <View style={localStyles.card}>
            <Text style={localStyles.label}>Date</Text>
            <TextInput
              style={localStyles.input}
              placeholder="YYYY-MM-DD"
              value={date}
              onChangeText={setDate}
              editable={!submitting}
            />

            <Text style={localStyles.label}>Amount (gallons)</Text>
            <TextInput
              style={localStyles.input}
              placeholder="e.g., 25.5"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              editable={!submitting}
            />

            <Text style={localStyles.label}>Source</Text>
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
                <Text style={localStyles.buttonText}>Record Watering</Text>
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
                  {stats.lastWateredDaysAgo !== null ? stats.lastWateredDaysAgo : '–'}
                </Text>
                <Text style={localStyles.statLabel}>Days since watering</Text>
              </View>
              <View style={localStyles.statBox}>
                <Text style={localStyles.statValue}>{stats.totalGallonsThisMonth}</Text>
                <Text style={localStyles.statLabel}>Gallons this month</Text>
              </View>
              <View style={localStyles.statBox}>
                <Text style={localStyles.statValue}>{stats.averageGallonsPerWatering}</Text>
                <Text style={localStyles.statLabel}>Avg gallons</Text>
              </View>
            </View>

            <Text style={[localStyles.sectionTitle, { marginTop: 16 }]}>Source Breakdown</Text>
            <View style={localStyles.sourceBreakdown}>
              <View style={localStyles.breakdownItem}>
                <Icon name="droplet" size={24} color="#22c55e" />
                <Text style={localStyles.statValue}>{breakdown.sprinkler}</Text>
                <Text style={localStyles.breakdownLabel}>Sprinkler</Text>
              </View>
              <View style={localStyles.breakdownItem}>
                <Icon name="hand-right" size={24} color="#22c55e" />
                <Text style={localStyles.statValue}>{breakdown.manual}</Text>
                <Text style={localStyles.breakdownLabel}>Manual</Text>
              </View>
              <View style={localStyles.breakdownItem}>
                <Icon name="rainy" size={24} color="#22c55e" />
                <Text style={localStyles.statValue}>{breakdown.rain}</Text>
                <Text style={localStyles.breakdownLabel}>Rain</Text>
              </View>
            </View>
          </View>
        )}

        {/* History Section */}
        <View style={localStyles.section}>
          <Text style={localStyles.sectionTitle}>Recent Events</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#22c55e" />
          ) : error ? (
            <Text style={{ color: '#ef4444' }}>{error}</Text>
          ) : events.length === 0 ? (
            <View style={localStyles.emptyState}>
              <Icon name="water" size={48} color="#d1d5db" />
              <Text style={localStyles.emptyStateText}>No watering events yet</Text>
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
                    {event.amount_gallons} gal • {event.source}
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