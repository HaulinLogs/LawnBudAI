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
import { FertilizerEventInput, ApplicationForm, ApplicationMethod } from '@/models/events';
import FormikEventForm from '@/components/forms/FormikEventForm';
import FormikNPKInput from '@/components/forms/FormikNPKInput';
import EventHistory from '@/components/EventHistory';
import Statistics from '@/components/Statistics';
import GenericPicker from '@/components/ui/GenericPicker';
import { fertilizerEventSchema, FertilizerFormValues } from '@/lib/schemas/fertilizer.schema';
import { spacing, typography } from '@/styles/theme';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import {
  getFertilizerAdvisory,
  getSeason,
  type GrassType,
  type FertilizerStatus,
} from '@/lib/lawnAdvice';
import { useAppTheme } from '@/hooks/useAppTheme';

const APPLICATION_FORMS = [
  { label: 'Granular', value: 'granular' as const, icon: 'cube' },
  { label: 'Liquid', value: 'liquid' as const, icon: 'water' },
];

const APPLICATION_METHODS_GRANULAR = [
  { label: 'Broadcast', value: 'broadcast' as const, icon: 'radio-button-on' },
  { label: 'Spot', value: 'spot' as const, icon: 'locate' },
  { label: 'Edge', value: 'edge' as const, icon: 'git-commit' },
  { label: 'Custom', value: 'custom' as const, icon: 'options' },
];

const APPLICATION_METHODS_LIQUID = [
  { label: 'Spray', value: 'spray' as const, icon: 'water' },
  { label: 'Spot', value: 'spot' as const, icon: 'locate' },
  { label: 'Edge', value: 'edge' as const, icon: 'git-commit' },
  { label: 'Custom', value: 'custom' as const, icon: 'options' },
];

// Maps advisory status to visual theme
const ADVISOR_THEME: Record<FertilizerStatus, { bg: string; border: string; heading: string; detail: string }> = {
  dormant:           { bg: '#f3f4f6', border: '#9ca3af', heading: '#374151', detail: '#6b7280' },
  too_soon:          { bg: '#dbeafe', border: '#3b82f6', heading: '#1e3a5f', detail: '#1e40af' },
  first_application: { bg: '#dcfce7', border: '#22c55e', heading: '#065f46', detail: '#166534' },
  due:               { bg: '#dcfce7', border: '#22c55e', heading: '#065f46', detail: '#166534' },
  overdue:           { bg: '#fef3c7', border: '#f59e0b', heading: '#92400e', detail: '#78350f' },
};

export default function FertilizerScreen() {
  const { events, loading, error, addEvent, deleteEvent, getStats, getFormBreakdown, getMethodBreakdown } = useFertilizerEvents();
  const { prefs } = useUserPreferences();
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
      color: themeColors.primary,
      marginBottom: 4,
    },
    breakdownLabel: {
      fontSize: 12,
      color: themeColors.textTertiary,
    },
    advisorCard: {
      borderRadius: 10,
      padding: 14,
      marginBottom: 16,
      borderLeftWidth: 4,
    },
    advisorHeading: {
      fontSize: 15,
      fontWeight: '700',
      marginBottom: 6,
    },
    advisorDetail: {
      fontSize: 13,
      lineHeight: 19,
    },
    advisorAmount: {
      marginTop: 8,
      fontSize: 13,
      fontWeight: '600',
    },
  }), [themeColors]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stats = useMemo(() => getStats(), [events]);

  const advisory = useMemo(
    () =>
      getFertilizerAdvisory(
        prefs.grass_type as GrassType,
        getSeason(new Date()),
        events[0]?.date,
        prefs.lawn_size_sqft,
      ),
    [events, prefs.grass_type, prefs.lawn_size_sqft],
  );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const formBreakdown = useMemo(() => getFormBreakdown(), [events]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const methodBreakdown = useMemo(() => getMethodBreakdown(), [events]);

  const formik = useFormik<FertilizerFormValues>({
    initialValues: {
      date: new Date().toISOString().split('T')[0],
      amount_lbs: '',
      nitrogen_pct: '',
      phosphorus_pct: '',
      potassium_pct: '',
      application_form: 'granular',
      application_method: 'broadcast',
      notes: '',
    },
    validationSchema: fertilizerEventSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values, { resetForm }) => {
      try {
        const input: FertilizerEventInput = {
          date: values.date,
          amount_lbs: parseFloat(String(values.amount_lbs)),
          nitrogen_pct: parseFloat(String(values.nitrogen_pct)) || 0,
          phosphorus_pct: parseFloat(String(values.phosphorus_pct)) || 0,
          potassium_pct: parseFloat(String(values.potassium_pct)) || 0,
          application_form: values.application_form as ApplicationForm,
          application_method: values.application_method as ApplicationMethod,
          notes: String(values.notes).trim() || undefined,
        };
        await addEvent(input);
        resetForm();
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
    <Text style={{ fontSize: 12, color: themeColors.textTertiary, marginTop: 4 }}>
      {event.amount_lbs} lbs • {event.application_form} • {event.application_method}
      {(event.nitrogen_pct || event.phosphorus_pct || event.potassium_pct) ? (
        <Text>{'\n'}N:{event.nitrogen_pct ?? 0}% P:{event.phosphorus_pct ?? 0}% K:{event.potassium_pct ?? 0}%</Text>
      ) : null}
      {event.notes && <Text>{'\n'}{event.notes}</Text>}
    </Text>
  ), [themeColors]);

  // Method options depend on application form — broadcast is granular-only
  const methodOptions = useMemo(
    () => formik.values.application_form === 'liquid'
      ? APPLICATION_METHODS_LIQUID
      : APPLICATION_METHODS_GRANULAR,
    [formik.values.application_form],
  );

  const formPicker = useMemo(() => {
    const hasError = formik.touched.application_form && formik.errors.application_form;
    return (
      <View>
        <GenericPicker
          label="Application Form"
          options={APPLICATION_FORMS}
          value={String(formik.values.application_form)}
          onChange={(value) => {
            formik.setFieldValue('application_form', value);
            formik.setFieldTouched('application_form', true);
            // Reset method to a sensible default when form changes
            if (value === 'liquid' && formik.values.application_method === 'broadcast') {
              formik.setFieldValue('application_method', 'spray');
            } else if (value === 'granular' && formik.values.application_method === 'spray') {
              formik.setFieldValue('application_method', 'broadcast');
            }
          }}
        />
        {hasError && (
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
          options={methodOptions}
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
  }, [formik.values.application_method, formik.errors.application_method, formik.touched.application_method, methodOptions]);

  return (
    <View style={localStyles.container}>
      <Stack.Screen options={{ title: 'Fertilizer' }} />
      <ScrollView style={localStyles.content} showsVerticalScrollIndicator={false}>
        {/* Form Section */}
        <View style={localStyles.section}>
          <Text style={localStyles.sectionTitle}>Log Fertilizer Application</Text>

          {/* Fertilizer Advisor */}
          {(() => {
            const theme = ADVISOR_THEME[advisory.status];
            return (
              <View style={[localStyles.advisorCard, { backgroundColor: theme.bg, borderLeftColor: theme.border }]}>
                <Text style={[localStyles.advisorHeading, { color: theme.heading }]}>
                  {advisory.heading}
                </Text>
                <Text style={[localStyles.advisorDetail, { color: theme.detail }]}>
                  {advisory.detail}
                </Text>
                {advisory.suggestedAmountLbs !== null && (
                  <Text style={[localStyles.advisorAmount, { color: theme.heading }]}>
                    Suggested amount: {advisory.suggestedAmountLbs} lbs
                  </Text>
                )}
              </View>
            );
          })()}

          {/* N-P-K Ratio inputs */}
          <FormikNPKInput
            formik={formik}
            nitrogenField="nitrogen_pct"
            phosphorusField="phosphorus_pct"
            potassiumField="potassium_pct"
          />

          {/* Application Form and Method pickers */}
          {formPicker}
          {methodPicker}

          {/* Date, Amount, Notes, and Submit Button — all together */}
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

            <Text style={[localStyles.sectionTitle, { marginTop: 16 }]}>Application Form</Text>
            <View style={localStyles.breakdownRow}>
              {Object.entries(formBreakdown).map(([form, count]) => (
                <View key={form} style={localStyles.breakdownItem}>
                  <Icon name={form === 'liquid' ? 'water' : 'cube'} size={24} color="#22c55e" />
                  <Text style={localStyles.breakdownValue}>{count}</Text>
                  <Text style={localStyles.breakdownLabel}>{form}</Text>
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
