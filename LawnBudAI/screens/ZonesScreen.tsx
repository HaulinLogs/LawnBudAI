import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Stack } from 'expo-router';
import { useLawnZones } from '@/hooks/useLawnZones';
import { useAppTheme } from '@/hooks/useAppTheme';
import { LawnZone } from '@/models/zones';

export default function ZonesScreen() {
  const { zones, loading, error, addZone, deleteZone } = useLawnZones();
  const themeColors = useAppTheme();

  const [name, setName] = useState('');
  const [sizeSqft, setSizeSqft] = useState('');
  const [adding, setAdding] = useState(false);

  const styles = useMemo(() => createStyles(themeColors), [themeColors]);

  const handleAdd = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert('Validation Error', 'Zone name is required.');
      return;
    }
    const parsedSize = sizeSqft ? parseInt(sizeSqft, 10) : null;
    if (sizeSqft && (isNaN(parsedSize!) || parsedSize! <= 0)) {
      Alert.alert('Validation Error', 'Size must be a positive number.');
      return;
    }

    setAdding(true);
    try {
      await addZone({ name: trimmed, size_sqft: parsedSize });
      setName('');
      setSizeSqft('');
      Alert.alert('Zone Added', `"${trimmed}" has been added to your lawn zones.`);
    } catch {
      Alert.alert('Error', 'Failed to add zone. Make sure the name is unique.');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = (zone: LawnZone) => {
    Alert.alert(
      'Delete Zone',
      `Delete "${zone.name}"? Events logged for this zone will not be deleted, but they will no longer be associated with a zone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteZone(zone.id);
            } catch {
              Alert.alert('Error', 'Failed to delete zone.');
            }
          },
        },
      ],
    );
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Lawn Zones' }} />
      <ScrollView contentContainerStyle={styles.container}>
        {/* Add Zone Form */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Add Zone</Text>
          <Text style={styles.hint}>
            Divide your lawn into named zones (e.g. Front Yard, Back Yard, Side Yard) to track
            care activities independently.
          </Text>

          <Text style={styles.label}>Zone Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Front Yard"
            placeholderTextColor={themeColors.placeholderText}
            value={name}
            onChangeText={setName}
            editable={!adding}
            maxLength={100}
          />

          <Text style={styles.label}>Size (sq ft)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 1000"
            placeholderTextColor={themeColors.placeholderText}
            value={sizeSqft}
            onChangeText={setSizeSqft}
            keyboardType="numeric"
            editable={!adding}
          />

          <TouchableOpacity
            style={[styles.addButton, adding && styles.addButtonDisabled]}
            onPress={handleAdd}
            disabled={adding}
          >
            {adding ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.addButtonText}>+ Add Zone</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Zones List */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Your Zones</Text>

          {loading ? (
            <ActivityIndicator color="#22c55e" />
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : zones.length === 0 ? (
            <Text style={styles.emptyText}>
              No zones yet. Add your first zone above to start tracking care per area.
            </Text>
          ) : (
            zones.map(zone => (
              <View key={zone.id} style={styles.zoneItem}>
                <View style={styles.zoneInfo}>
                  <Text style={styles.zoneName}>{zone.name}</Text>
                  {zone.size_sqft != null && (
                    <Text style={styles.zoneSize}>{zone.size_sqft.toLocaleString()} sq ft</Text>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(zone)}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            ))
          )}

          {zones.length > 0 && (
            <Text style={styles.totalText}>
              Total tracked area:{' '}
              {zones.reduce((s, z) => s + (z.size_sqft ?? 0), 0).toLocaleString()} sq ft across{' '}
              {zones.length} zone{zones.length !== 1 ? 's' : ''}
            </Text>
          )}
        </View>
      </ScrollView>
    </>
  );
}

function createStyles(colors: ReturnType<typeof useAppTheme>) {
  return StyleSheet.create({
    container: {
      padding: 16,
      backgroundColor: colors.screenBackground,
      flexGrow: 1,
    },
    card: {
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sectionTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: 6,
    },
    hint: {
      fontSize: 13,
      color: colors.textTertiary,
      marginBottom: 14,
      lineHeight: 18,
    },
    label: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: 6,
      marginTop: 10,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: 8,
      padding: 10,
      fontSize: 14,
      color: colors.textPrimary,
      backgroundColor: colors.inputBackground,
    },
    addButton: {
      backgroundColor: '#22c55e',
      borderRadius: 8,
      padding: 12,
      alignItems: 'center',
      marginTop: 16,
    },
    addButtonDisabled: {
      opacity: 0.6,
    },
    addButtonText: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 15,
    },
    emptyText: {
      fontSize: 13,
      color: colors.textTertiary,
      textAlign: 'center',
      paddingVertical: 12,
      lineHeight: 18,
    },
    errorText: {
      fontSize: 13,
      color: colors.error,
    },
    zoneItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    zoneInfo: {
      flex: 1,
    },
    zoneName: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    zoneSize: {
      fontSize: 12,
      color: colors.textTertiary,
      marginTop: 2,
    },
    deleteButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
      backgroundColor: colors.errorBackground,
      borderWidth: 1,
      borderColor: colors.errorBorder,
    },
    deleteButtonText: {
      fontSize: 13,
      color: colors.errorText,
      fontWeight: '600',
    },
    totalText: {
      fontSize: 12,
      color: colors.textTertiary,
      marginTop: 10,
      textAlign: 'center',
    },
  });
}
