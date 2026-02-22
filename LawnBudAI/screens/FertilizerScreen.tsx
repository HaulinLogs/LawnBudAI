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
// eslint-disable-next-line import/no-unresolved
import { useFormik } from 'formik';
import { useFertilizerEvents } from '@/hooks/useFertilizerEvents';
import { FertilizerEventInput, ApplicationForm, ApplicationMethod } from '@/models/events';
import FormikEventForm from '@/components/forms/FormikEventForm';
import FormikNPKInput from '@/components/forms/FormikNPKInput';
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
  npkInputContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  npkInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  npkLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
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
  npkRatioDisplay: {
    fontSize: 20,
    fontWeight: '700',
    color: '#22c55e',
    textAlign: 'center',
    marginBottom: 12,
  },
});

const APPLICATION_FORMS = [
  { label: 'Liquid', value: 'liquid' as const, icon: 'water' },
  { label: 'Granular', value: 'granular' as const, icon: 'cube' },
];

const APPLICATION_METHODS = [
  { label: 'Broadcast', value: 'broadcast' as const, icon: 'radio-button-on' },
  { label: 'Spot', value: 'spot' as const, icon: 'locate' },
  { label: 'Edge', value: 'edge' as const, icon: 'cut' },
  { label: 'Custom', value: 'custom' as const, icon: 'settings' },
];

export default function FertilizerScreen() {
  const { events, loading, error, addEvent, deleteEvent, getStats, getFormBreakdown, getMethodBreakdown } = useFertilizerEvents();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stats = useMemo(() => getStats(), [events]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const formBreakdown = useMemo(() => getFormBreakdown(), [events]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const methodBreakdown = useMemo(() => getMethodBreakdown(), [events]);

  const formik = useFormik<FertilizerFormValues>({
    initialValues: {
      date: new Date().toISOString().split('T')[0],
      amount_lbs_per_1000sqft: '',
      nitrogen_pct: '',
      phosphorus_pct: '',
      potassium_pct: '',
      application_form: 'granular',
      application_method: 'broadcast',
      notes: '',
    },
    validationSchema: fertilizerEventSchema,
    validateOnChange: true,  // Real-time validation
    validateOnBlur: true,    // Validate on field blur
    onSubmit: async (values, { resetForm }) => {
      try {
        const input: FertilizerEventInput = {
          date: values.date,
          amount_lbs_per_1000sqft: parseFloat(String(values.amount_lbs_per_1000sqft)),
          nitrogen_pct: parseFloat(String(values.nitrogen_pct)),
          phosphorus_pct: parseFloat(String(values.phosphorus_pct)),
          potassium_pct: parseFloat(String(values.potassium_pct)),
          application_form: values.application_form as ApplicationForm,
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

  const handleSubmit = useCallback(() => {
    formik.handleSubmit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik]);

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
      {event.amount_lbs_per_1000sqft} lbs/1000 sq ft • {event.nitrogen_pct}-{event.phosphorus_pct}-{event.potassium_pct} • {event.application_form} • {event.application_method}
      {event.notes && <Text>{'\n'}{event.notes}</Text>}
    </Text>
  ), []);

  const formPicker = useMemo(() => {
    const hasFormError = formik.touched.application_form && formik.errors.application_form;
    return (
      <View>
        <GenericPicker
          label="Application Form"
          options={APPLICATION_FORMS}
          value={String(formik.values.application_form)}
          onChange={(value) => {
            formik.setFieldValue('application_form', value);
            formik.setFieldTouched('application_form', true);
          }}
        />
        {hasFormError && (
          <Text style={[typography.errorText, { marginLeft: spacing.lg }]}>
            {formik.errors.application_form}
          </Text>
        )}
      </View>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.application_form, formik.errors.application_form, formik.touched.application_form]);

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

          {/* Date and Amount using FormikEventForm */}
          <FormikEventForm
            formik={formik}
            fieldNames={{
              date: 'date',
              amount: 'amount_lbs_per_1000sqft',
              notes: 'notes',
            }}
            amountLabel="Amount (lbs/1000 sq ft)"
            amountPlaceholder="e.g., 3.5"
            amountKeyboardType="decimal-pad"
            submitLabel="Record Application"
          />

          {/* N-P-K Inputs */}
          <FormikNPKInput
            formik={formik}
            nitrogenField="nitrogen_pct"
            phosphorusField="phosphorus_pct"
            potassiumField="potassium_pct"
            showNPKWarning
          />

          {/* Application Form and Method Pickers */}
          {formPicker}
          {methodPicker}
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
                  value: stats.totalPoundsPerThousandSqftApplied,
                  label: 'Total lbs/1000 sq ft',
                },
                {
                  value: stats.averagePoundsPerThousandSqftPerApplication || '–',
                  label: 'Avg lbs/1000 sq ft per app',
                },
              ]}
            />

            <Text style={[localStyles.sectionTitle, { marginTop: 16 }]}>Average N-P-K Ratio</Text>
            <Text style={localStyles.npkRatioDisplay}>
              {stats.averageNPK.nitrogen}-{stats.averageNPK.phosphorus}-{stats.averageNPK.potassium}
            </Text>

            <Text style={[localStyles.sectionTitle, { marginTop: 16 }]}>Application Form</Text>
            <View style={localStyles.breakdownRow}>
              <View style={localStyles.breakdownItem}>
                <Icon name="water" size={24} color="#22c55e" />
                <Text style={localStyles.breakdownValue}>{formBreakdown.liquid}</Text>
                <Text style={localStyles.breakdownLabel}>Liquid</Text>
              </View>
              <View style={localStyles.breakdownItem}>
                <Icon name="cube" size={24} color="#22c55e" />
                <Text style={localStyles.breakdownValue}>{formBreakdown.granular}</Text>
                <Text style={localStyles.breakdownLabel}>Granular</Text>
              </View>
            </View>

            <Text style={[localStyles.sectionTitle, { marginTop: 16 }]}>Application Method</Text>
            <View style={localStyles.breakdownRow}>
              <View style={localStyles.breakdownItem}>
                <Icon name="radio-button-on" size={24} color="#22c55e" />
                <Text style={localStyles.breakdownValue}>{methodBreakdown.broadcast}</Text>
                <Text style={localStyles.breakdownLabel}>Broadcast</Text>
              </View>
              <View style={localStyles.breakdownItem}>
                <Icon name="locate" size={24} color="#22c55e" />
                <Text style={localStyles.breakdownValue}>{methodBreakdown.spot}</Text>
                <Text style={localStyles.breakdownLabel}>Spot</Text>
              </View>
              <View style={localStyles.breakdownItem}>
                <Icon name="cut" size={24} color="#22c55e" />
                <Text style={localStyles.breakdownValue}>{methodBreakdown.edge}</Text>
                <Text style={localStyles.breakdownLabel}>Edge</Text>
              </View>
              <View style={localStyles.breakdownItem}>
                <Icon name="settings" size={24} color="#22c55e" />
                <Text style={localStyles.breakdownValue}>{methodBreakdown.custom}</Text>
                <Text style={localStyles.breakdownLabel}>Custom</Text>
              </View>
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
