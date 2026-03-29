import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';
import { Stack } from 'expo-router';
import Icon from '@expo/vector-icons/Ionicons';
import { useFormik } from 'formik';
import { useWaterEvents } from '@/hooks/useWaterEvents';
import { useLawnZones } from '@/hooks/useLawnZones';
import { WaterEventInput } from '@/models/events';
import FormikEventForm from '@/components/forms/FormikEventForm';
import EventHistory from '@/components/EventHistory';
import Statistics from '@/components/Statistics';
import GenericPicker from '@/components/ui/GenericPicker';
import { wateringEventSchema, WateringFormValues } from '@/lib/schemas/watering.schema';
import { spacing, typography } from '@/styles/theme';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function WateringScreen() {
  const { events, loading, error, addEvent, deleteEvent, getStats, getSourceBreakdown } = useWaterEvents();
  const { zones } = useLawnZones();
  const themeColors = useAppTheme();
  const localStyles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.screenBackground,
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
      color: themeColors.textPrimary,
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
      color: themeColors.textTertiary,
      marginTop: 4,
    },
  }), [themeColors]);

  const sourceOptions = useMemo(() => [
    { label: 'Sprinkler', value: 'sprinkler' as const, icon: 'water' },
    { label: 'Manual', value: 'manual' as const, icon: 'hand-right' },
    { label: 'Rain', value: 'rain' as const, icon: 'rainy' },
  ], []);

  const zoneOptions = useMemo(() => [
    { label: 'Whole Lawn', value: '' },
    ...zones.map(z => ({ label: z.name, value: z.id })),
  ], [zones]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stats = useMemo(() => getStats(), [events]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const breakdown = useMemo(() => getSourceBreakdown(), [events]);

  const formik = useFormik<WateringFormValues & { zone_id: string }>({
    initialValues: {
      date: new Date().toISOString().split('T')[0],
      amount_inches: '',
      source: 'manual',
      notes: '',
      zone_id: '',
    },
    validationSchema: wateringEventSchema,
    validateOnChange: true,  // Real-time validation
    validateOnBlur: true,    // Validate on field blur
    onSubmit: async (values, { resetForm }) => {
      try {
        const input: WaterEventInput = {
          date: values.date,
          amount_inches: parseFloat(String(values.amount_inches)),
          source: values.source as 'sprinkler' | 'manual' | 'rain',
          notes: String(values.notes).trim() || undefined,
          zone_id: values.zone_id || null,
        };
        await addEvent(input);
        // Form resets naturally after successful submission
        resetForm();
        // Optional: Show success alert
        Alert.alert('Success', 'Watering event recorded!');
      } catch {
        Alert.alert('Error', 'Failed to record watering event');
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
    <Text style={{ fontSize: 12, color: themeColors.textTertiary, marginTop: 4 }}>
      {event.amount_inches}&quot; • {event.source}
      {event.notes && <Text>{'\n'}{event.notes}</Text>}
    </Text>
  ), [themeColors]);

  const sourcePicker = useMemo(() => {
    const hasSourceError = formik.touched.source && formik.errors.source;
    return (
      <View>
        <GenericPicker
          label="Source"
          options={sourceOptions}
          value={String(formik.values.source)}
          onChange={(value) => {
            formik.setFieldValue('source', value);
            formik.setFieldTouched('source', true);
          }}
        />
        {hasSourceError && (
          <Text style={[typography.errorText, { marginLeft: spacing.lg }]}>
            {formik.errors.source}
          </Text>
        )}
        {zones.length > 0 && (
          <GenericPicker
            label="Zone (optional)"
            options={zoneOptions}
            value={String(formik.values.zone_id)}
            onChange={(value) => formik.setFieldValue('zone_id', value)}
          />
        )}
      </View>
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.source, formik.errors.source, formik.touched.source, formik.values.zone_id, sourceOptions, zoneOptions, zones.length]);

  return (
    <View style={localStyles.container}>
      <Stack.Screen options={{ title: 'Watering' }} />
      <ScrollView style={localStyles.content} showsVerticalScrollIndicator={false}>
        {/* Form Section */}
        <View style={localStyles.section}>
          <Text style={localStyles.sectionTitle}>Log Watering Event</Text>
          <FormikEventForm
            formik={formik}
            fieldNames={{
              date: 'date',
              amount: 'amount_inches',
              notes: 'notes',
            }}
            amountLabel="Amount (inches)"
            amountPlaceholder="e.g., 0.5"
            amountKeyboardType="decimal-pad"
            submitLabel="Record Watering"
            optionalField={sourcePicker}
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
                  value: stats.totalInchesThisMonth || "–",
                  label: 'Inches this month',
                },
                {
                  value: stats.averageInchesPerWatering || '–',
                  label: 'Avg inches',
                },
              ]}
            />

            <Text style={[localStyles.sectionTitle, { marginTop: 16 }]}>Source Breakdown</Text>
            <View style={localStyles.sourceBreakdown}>
              <View style={localStyles.breakdownItem}>
                <Icon name="water" size={24} color="#22c55e" />
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
            renderEventDetail={renderEventDetail}
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