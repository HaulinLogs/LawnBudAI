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
import { useMowEvents } from '@/hooks/useMowEvents';
import { MowEventInput } from '@/models/events';

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
    justifyContent: 'space-around',
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

export default function MowingScreen() {
  const { events, loading, error, addEvent, deleteEvent, getStats } = useMowEvents();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [height, setHeight] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const stats = getStats();

  const handleSubmit = async () => {
    if (!date || !height) {
      Alert.alert('Error', 'Please fill in date and height');
      return;
    }

    const heightNum = parseFloat(height);
    if (isNaN(heightNum) || heightNum <= 0) {
      Alert.alert('Error', 'Height must be a valid positive number');
      return;
    }

    setSubmitting(true);
    try {
      const input: MowEventInput = {
        date,
        height_inches: heightNum,
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
          <View style={localStyles.card}>
            <Text style={localStyles.label}>Date</Text>
            <TextInput
              style={localStyles.input}
              placeholder="YYYY-MM-DD"
              value={date}
              onChangeText={setDate}
              editable={!submitting}
            />

            <Text style={localStyles.label}>Height (inches)</Text>
            <TextInput
              style={localStyles.input}
              placeholder="e.g., 2.5"
              value={height}
              onChangeText={setHeight}
              keyboardType="decimal-pad"
              editable={!submitting}
            />

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
                <Text style={localStyles.buttonText}>Record Mowing</Text>
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
                  {stats.lastMowedDaysAgo !== null ? stats.lastMowedDaysAgo : '–'}
                </Text>
                <Text style={localStyles.statLabel}>Days since last mow</Text>
              </View>
              <View style={localStyles.statBox}>
                <Text style={localStyles.statValue}>{stats.averageHeight}</Text>
                <Text style={localStyles.statLabel}>Avg height (in)</Text>
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
              <Icon name="cut" size={48} color="#d1d5db" />
              <Text style={localStyles.emptyStateText}>No mowing events yet</Text>
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
                  <Text style={localStyles.eventDetail}>Height: {event.height_inches}&quot;</Text>
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