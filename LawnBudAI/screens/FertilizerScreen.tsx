import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  StyleSheet,
  TextInput,
} from 'react-native';
import { Stack } from 'expo-router';
import Icon from '@expo/vector-icons/Ionicons';
import { useFertilizerEvents } from '@/hooks/useFertilizerEvents';
import { FertilizerEventInput, ApplicationForm, ApplicationMethod } from '@/models/events';
import EventForm from '@/components/EventForm';
import EventHistory from '@/components/EventHistory';
import Statistics from '@/components/Statistics';
import GenericPicker from '@/components/ui/GenericPicker';
import { validateRequiredField, validatePositiveNumber, validateNumberInRange, validateForm } from '@/lib/validation';

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
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState('');
  const [nitrogen, setNitrogen] = useState('');
  const [phosphorus, setPhosphorus] = useState('');
  const [potassium, setPotassium] = useState('');
  const [applicationForm, setApplicationForm] = useState<ApplicationForm>('granular');
  const [applicationMethod, setApplicationMethod] = useState<ApplicationMethod>('broadcast');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const stats = getStats();
  const formBreakdown = getFormBreakdown();
  const methodBreakdown = getMethodBreakdown();

  // Calculate NPK total and warn if > 100
  const npkTotal = (parseFloat(nitrogen) || 0) + (parseFloat(phosphorus) || 0) + (parseFloat(potassium) || 0);
  const npkWarning = npkTotal > 100 ? 'N-P-K total exceeds 100%' : null;

  const handleSubmit = async () => {
    // Validate form using centralized validation utilities
    const validation = validateForm([
      () => validateRequiredField(date, 'Date'),
      () => validatePositiveNumber(amount, 'Amount'),
      () => validateNumberInRange(nitrogen, 'Nitrogen', 0, 100),
      () => validateNumberInRange(phosphorus, 'Phosphorus', 0, 100),
      () => validateNumberInRange(potassium, 'Potassium', 0, 100),
    ]);

    if (!validation.valid) {
      Alert.alert('Error', validation.error || 'Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const input: FertilizerEventInput = {
        date,
        amount_lbs_per_1000sqft: parseFloat(amount),
        nitrogen_pct: parseFloat(nitrogen),
        phosphorus_pct: parseFloat(phosphorus),
        potassium_pct: parseFloat(potassium),
        application_form: applicationForm,
        application_method: applicationMethod,
        notes: notes.trim() || undefined,
      };
      await addEvent(input);
      Alert.alert('Success', 'Fertilizer application recorded!');
      setAmount('');
      setNitrogen('');
      setPhosphorus('');
      setPotassium('');
      setNotes('');
      setDate(new Date().toISOString().split('T')[0]);
      setApplicationForm('granular');
      setApplicationMethod('broadcast');
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

  const formPicker = (
    <GenericPicker
      label="Application Form"
      options={APPLICATION_FORMS}
      value={applicationForm}
      onChange={setApplicationForm}
    />
  );

  const methodPicker = (
    <GenericPicker
      label="Application Method"
      options={APPLICATION_METHODS}
      value={applicationMethod}
      onChange={setApplicationMethod}
    />
  );

  return (
    <View style={localStyles.container}>
      <Stack.Screen options={{ title: 'Fertilizer' }} />
      <ScrollView style={localStyles.content} showsVerticalScrollIndicator={false}>
        {/* Form Section */}
        <View style={localStyles.section}>
          <Text style={localStyles.sectionTitle}>Log Fertilizer Application</Text>

          {/* Date and Amount using EventForm */}
          <EventForm
            date={date}
            onDateChange={setDate}
            amount={amount}
            onAmountChange={setAmount}
            amountLabel="Amount (lbs/1000 sq ft)"
            amountPlaceholder="e.g., 3.5"
            amountKeyboardType="decimal-pad"
            notes={notes}
            onNotesChange={setNotes}
            submitLabel="Record Application"
            onSubmit={handleSubmit}
            submitting={submitting}
          />

          {/* N-P-K Inputs */}
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 12 }}>
            N-P-K Ratio (%)
          </Text>
          <View style={localStyles.npkInputContainer}>
            <View style={{ flex: 1 }}>
              <TextInput
                style={localStyles.npkInput}
                placeholder="N"
                placeholderTextColor="#9ca3af"
                keyboardType="decimal-pad"
                value={nitrogen}
                onChangeText={setNitrogen}
                maxLength={6}
              />
              <Text style={localStyles.npkLabel}>Nitrogen</Text>
            </View>
            <View style={{ flex: 1 }}>
              <TextInput
                style={localStyles.npkInput}
                placeholder="P"
                placeholderTextColor="#9ca3af"
                keyboardType="decimal-pad"
                value={phosphorus}
                onChangeText={setPhosphorus}
                maxLength={6}
              />
              <Text style={localStyles.npkLabel}>Phosphorus</Text>
            </View>
            <View style={{ flex: 1 }}>
              <TextInput
                style={localStyles.npkInput}
                placeholder="K"
                placeholderTextColor="#9ca3af"
                keyboardType="decimal-pad"
                value={potassium}
                onChangeText={setPotassium}
                maxLength={6}
              />
              <Text style={localStyles.npkLabel}>Potassium</Text>
            </View>
          </View>

          {npkWarning && <Text style={localStyles.warningText}>⚠️ {npkWarning}</Text>}

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
            renderEventDetail={(event) => (
              <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                {event.amount_lbs_per_1000sqft} lbs/1000 sq ft • {event.nitrogen_pct}-{event.phosphorus_pct}-{event.potassium_pct} • {event.application_form} • {event.application_method}
                {event.notes && <Text>{'\n'}{event.notes}</Text>}
              </Text>
            )}
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
