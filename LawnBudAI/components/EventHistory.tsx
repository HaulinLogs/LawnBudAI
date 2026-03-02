import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';
import { spacing, borderRadius } from '@/styles/theme';
import { useAppTheme } from '@/hooks/useAppTheme';

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

function EventHistoryComponent({
  events,
  loading,
  error,
  renderEventDetail,
  onDelete,
  emptyStateIcon = 'calendar',
  emptyStateText = 'No events yet',
  maxDisplay = 10,
}: EventHistoryProps) {
  const themeColors = useAppTheme();
  const styles = useMemo(() => StyleSheet.create({
    container: {
      marginBottom: spacing.md,
    },
    eventItem: {
      backgroundColor: themeColors.eventItemBackground,
      borderRadius: borderRadius.sm,
      padding: spacing.md,
      marginBottom: spacing.sm,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    eventContent: {
      flex: 1,
    },
    eventDate: {
      fontSize: 14,
      fontWeight: '600' as const,
      color: themeColors.textPrimary,
    },
    deleteButton: {
      padding: spacing.sm,
    },
    emptyState: {
      alignItems: 'center' as const,
      paddingVertical: spacing.xl,
    },
    emptyStateText: {
      fontSize: 16,
      color: themeColors.textTertiary,
      marginTop: spacing.md,
    },
    errorText: {
      color: themeColors.error,
      fontSize: 14,
    },
  }), [themeColors]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={themeColors.primary} />
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
          <Icon name={emptyStateIcon as any} size={48} color={themeColors.border} />
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
            <Icon name="trash" size={20} color={themeColors.error} />
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

export default React.memo(EventHistoryComponent);
