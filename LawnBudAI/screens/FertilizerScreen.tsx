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
import { useFertilizerEvents } from '@/hooks/useFertilizerEvents';
import { FertilizerEventInput, FertilizerType, ApplicationMethod } from '@/models/events';
import FormikEventForm from '@/components/forms/FormikEventForm';
import EventHistory from '@/components/EventHistory';
import Statistics from '@/components/Statistics';
import GenericPicker from '@/components/ui/GenericPicker';
import { fertilizerEventSchema, FertilizerFormValues } from '@/lib/schemas/fertilizer.schema';
import { spacing, typography } from '@/styles/theme';

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
  warningText: {
    color: '#f97316',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 8,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  breakdownItem: {
    alignItems: 'center',
  },
  breakdownValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#22c55e',
    marginBottom: 4,
  },
  breakdownLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
});

const FERTILIZER_TYPES = [
  { label: 'Nitrogen', value: 'nitrogen' as const, icon: 'leaf' },
  { label: 'Phosphorus', value: 'phosphorus' as const, icon: 'flower' },
  { label: 'Potassium', value: 'potassium' as const, icon: 'nutrition' },
  { label: 'NPK', value: 'npk' as const, icon: 'layers' },
  { label: 'Organic', value: 'organic' as const, icon: 'leaf-outline' },
  { label: 'Liquid', value: 'liquid' as const, icon: 'water' },
  { label: 'Granular', value: 'granular' as const, icon: 'cube' },
];

const APPLICATION_METHODS = [
  { label: 'Spreader', value: 'spreader' as const, icon: 'radio-button-on' },
  { label: 'Spray', value: 'spray' as const, icon: 'water' },
  { label: 'Liquid', value: 'liquid' as const, icon: 'droplet' },
  { label: 'Granular', value: 'granular' as const, icon: 'cube' },
];

export default function FertilizerScreen() {
  const { events, loading, error, addEvent, deleteEvent, getStats, getTypeBreakdown, getMethodBreakdown } = useFertilizerEvents();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stats = useMemo(() => getStats(), [events]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const typeBreakdown = useMemo(() => getTypeBreakdown(), [events]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const methodBreakdown = useMemo(() => getMethodBreakdown(), [events]);

  const formik = useFormik<FertilizerFormValues>({
    initialValues: {
      date: new Date().toISOString().split('T')[0],
      amount_lbs: '',
      type: 'npk',
      application_method: 'spreader',
      notes: '',
    },
    validationSchema: fertilizerEventSchema,
    validateOnChange: true,  // Real-time validation
    validateOnBlur: true,    // Validate on field blur
    onSubmit: async (values, { resetForm }) => {
      try {
        const input: FertilizerEventInput = {
          date: values.date,
          amount_lbs: parseFloat(String(values.amount_lbs)),
          type: values.type as FertilizerType,
          application_method: values.application_method as ApplicationMethod,
          notes: String(values.notes).trim() || undefined,
        };
        await addEvent(input);
        // Form resets naturally after successful submission
        resetForm();
        // Optional: Show success alert
        Alert.alert('Success', 'Fertilizer application recorded!');
      } catch {
        Alert.alert('Error', 'Failed to record fertilizer application');
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
    <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
      {event.amount_lbs} lbs • {event.type} • {event.application_method}
      {event.notes && <Text>{'\n'}{event.notes}</Text>}
    </Text>
  ), []);

  const typePicker = useMemo(() => {
    const hasTypeError = formik.touched.type && formik.errors.type;
    return (
      <View>
        <GenericPicker
          label="Fertilizer Type"
          options={FERTILIZER_TYPES}
          value={String(formik.values.type)}
          onChange={(value) => {
            formik.setFieldValue('type', value);
            formik.setFieldTouched('type', true);
          }}
        />
        {hasTypeError && (
          <Text style={[typography.errorText, { marginLeft: spacing.lg }]}>
            {formik.errors.type}
          </Text>
        )}
      </View>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.type, formik.errors.type, formik.touched.type]);

  const methodPicker = useMemo(() => {
    const hasMethodError = formik.touched.application_method && formik.errors.application_method;
    return (
      <View>
        <GenericPicker
          label="Application Method"
          options={APPLICATION_METHODS}
          value={String(formik.values.application_method)}
          onChange={(value) => {
            formik.setFieldValue('application_method', value);
            formik.setFieldTouched('application_method', true);
          }}
        />
        {hasMethodError && (
          <Text style={[typography.errorText, { marginLeft: spacing.lg }]}>
            {formik.errors.application_method}
          </Text>
        )}
      </View>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.application_method, formik.errors.application_method, formik.touched.application_method]);

  return (
    <View style={localStyles.container}>
      <Stack.Screen options={{ title: 'Fertilizer' }} />
      <ScrollView style={localStyles.content} showsVerticalScrollIndicator={false}>
        {/* Form Section */}
        <View style={localStyles.section}>
          <Text style={localStyles.sectionTitle}>Log Fertilizer Application</Text>

          {/* Fertilizer Type and Method Pickers - BEFORE submit button for correct form flow */}
          {typePicker}
          {methodPicker}

          {/* Date, Amount, Notes, and Submit Button */}
          <FormikEventForm
            formik={formik}
            fieldNames={{
              date: 'date',
              amount: 'amount_lbs',
              notes: 'notes',
            }}
            amountLabel="Amount (lbs)"
            amountPlaceholder="e.g., 3.5"
            amountKeyboardType="decimal-pad"
            submitLabel="Record Application"
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
                  value: stats.totalAmountLbs,
                  label: 'Total lbs applied',
                },
                {
                  value: stats.averageAmountLbs || '–',
                  label: 'Avg lbs per application',
                },
              ]}
            />

            <Text style={[localStyles.sectionTitle, { marginTop: 16 }]}>Fertilizer Types Used</Text>
            <View style={localStyles.breakdownRow}>
              {Object.entries(typeBreakdown).map(([type, count]) => (
                <View key={type} style={localStyles.breakdownItem}>
                  <Icon name="leaf" size={24} color="#22c55e" />
                  <Text style={localStyles.breakdownValue}>{count}</Text>
                  <Text style={localStyles.breakdownLabel}>{type}</Text>
                </View>
              ))}
            </View>

            <Text style={[localStyles.sectionTitle, { marginTop: 16 }]}>Application Methods</Text>
            <View style={localStyles.breakdownRow}>
              {Object.entries(methodBreakdown).map(([method, count]) => (
                <View key={method} style={localStyles.breakdownItem}>
                  <Icon name="settings" size={24} color="#22c55e" />
                  <Text style={localStyles.breakdownValue}>{count}</Text>
                  <Text style={localStyles.breakdownLabel}>{method}</Text>
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
            renderEventDetail={renderEventDetail}
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
