import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';
import { Stack } from 'expo-router';
// eslint-disable-next-line import/no-unresolved
import { useFormik } from 'formik';
import { useMowEvents } from '@/hooks/useMowEvents';
import { MowEventInput } from '@/models/events';
import FormikEventForm from '@/components/forms/FormikEventForm';
import EventHistory from '@/components/EventHistory';
import Statistics from '@/components/Statistics';
import { mowingEventSchema, MowingFormValues } from '@/lib/schemas/mowing.schema';

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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stats = useMemo(() => getStats(), [events]);

  const formik = useFormik<MowingFormValues>({
    initialValues: {
      date: new Date().toISOString().split('T')[0],
      height_inches: '',
      notes: '',
    },
    validationSchema: mowingEventSchema,
    validateOnChange: true,  // Real-time validation
    validateOnBlur: true,    // Validate on field blur
    onSubmit: async (values, { resetForm }) => {
      try {
        const input: MowEventInput = {
          date: values.date,
          height_inches: parseFloat(String(values.height_inches)),
          notes: String(values.notes).trim() || undefined,
        };
        await addEvent(input);
        // Form resets naturally after successful submission
        resetForm();
        // Optional: Show success alert
        Alert.alert('Success', 'Mowing event recorded!');
      } catch {
        Alert.alert('Error', 'Failed to record mowing event');
      }
    },
  });


  const handleDelete = useCallback((eventId: string) => {
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
  }, [deleteEvent]);

  const renderEventDetail = useCallback((event: any) => (
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
  ), []);

  return (
    <View style={localStyles.container}>
      <Stack.Screen options={{ title: 'Mowing' }} />
      <ScrollView style={localStyles.content} showsVerticalScrollIndicator={false}>
        {/* Form Section */}
        <View style={localStyles.section}>
          <Text style={localStyles.sectionTitle}>Log Mowing Event</Text>
          <FormikEventForm
            formik={formik}
            fieldNames={{
              date: 'date',
              amount: 'height_inches',
              notes: 'notes',
            }}
            amountLabel="Height (inches)"
            amountPlaceholder="e.g., 2.5"
            amountKeyboardType="decimal-pad"
            submitLabel="Record Mowing"
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
            renderEventDetail={renderEventDetail}
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