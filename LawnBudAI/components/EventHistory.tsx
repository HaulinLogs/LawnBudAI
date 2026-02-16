import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';

interface Event {
  id: string;
  date: string;
  [key: string]: any;
}

interface EventHistoryProps {
  events: Event[];
  loading: boolean;
  error: string | null;
  renderEventDetail: (event: Event) => React.ReactNode;
  onDelete: (eventId: string) => void;
  emptyStateIcon?: string;
  emptyStateText?: string;
  maxDisplay?: number;
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
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
  eventContent: {
    flex: 1,
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
    marginTop: 8,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
  },
});

export default function EventHistory({
  events,
  loading,
  error,
  renderEventDetail,
  onDelete,
  emptyStateIcon = 'calendar',
  emptyStateText = 'No events yet',
  maxDisplay = 10,
}: EventHistoryProps) {
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (events.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Icon name={emptyStateIcon} size={48} color="#d1d5db" />
          <Text style={styles.emptyStateText}>{emptyStateText}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {events.slice(0, maxDisplay).map(event => (
        <View key={event.id} style={styles.eventItem}>
          <View style={styles.eventContent}>
            <Text style={styles.eventDate}>
              {new Date(event.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
            {renderEventDetail(event)}
          </View>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => onDelete(event.id)}
          >
            <Icon name="trash" size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}
