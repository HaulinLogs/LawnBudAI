import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { createSettingsStyles } from '@/styles/settings.styles';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useThemeMode, ThemeMode } from '@/contexts/ThemeContext';
import { useUsdaZone } from '@/hooks/useUsdaZone';
import {
  getVarietiesForZone,
  getGrassTypeForVariety,
  type SunExposure,
  type SoilType,
  type GrassVariety,
} from '@/lib/grassVarieties';

const SUN_OPTIONS: { value: SunExposure; icon: string; label: string; description: string }[] = [
  { value: 'full_sun', icon: '☀️', label: 'Full Sun', description: '6+ hours of direct sunlight' },
  { value: 'sun_and_shade', icon: '⛅', label: 'Sun & Shade', description: '4–6 hours, or dappled light' },
  { value: 'dense_shade', icon: '🌑', label: 'Mostly Shade', description: 'Under 4 hours — dense tree cover' },
];

const SOIL_OPTIONS: { value: SoilType; icon: string; label: string; description: string }[] = [
  { value: 'sandy', icon: '🏖️', label: 'Sandy', description: 'Drains quickly, dries out fast' },
  { value: 'loamy', icon: '🌱', label: 'Loamy', description: 'Dark, crumbly — ideal lawn soil' },
  { value: 'clay', icon: '🏗️', label: 'Clay', description: 'Heavy, sticky when wet, hard when dry' },
];

export default function SettingsScreen() {
  const { signOut } = useAuth();
  const { prefs, loading, loadError, save } = useUserPreferences();
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [lawnSize, setLawnSize] = useState('');
  const [sunExposure, setSunExposure] = useState<SunExposure>('sun_and_shade');
  const [grassVariety, setGrassVariety] = useState<string>('');
  const [soilType, setSoilType] = useState<SoilType>('loamy');
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const themeColors = useAppTheme();
  const styles = useMemo(() => createSettingsStyles(themeColors), [themeColors]);
  const { themeMode, setThemeMode } = useThemeMode();

  const { zoneInfo } = useUsdaZone(state || 'WI', city || 'Madison');
  const climateCategory = zoneInfo?.climateCategory ?? 'cool';

  const varieties: GrassVariety[] = useMemo(
    () => getVarietiesForZone(climateCategory, sunExposure),
    [climateCategory, sunExposure],
  );

  useEffect(() => {
    if (!loading && prefs) {
      setCity(prefs.city);
      setState(prefs.state || 'WI');
      setLawnSize(prefs.lawn_size_sqft ? String(prefs.lawn_size_sqft) : '');
      setSunExposure(prefs.sun_exposure ?? 'sun_and_shade');
      setGrassVariety(prefs.grass_variety ?? '');
      setSoilType(prefs.soil_type ?? 'loamy');
    }
  }, [prefs, loading]);

  // When sun exposure changes, reset variety if the current one is no longer valid
  useEffect(() => {
    if (grassVariety && !varieties.find((v) => v.id === grassVariety)) {
      setGrassVariety('');
    }
  }, [varieties, grassVariety]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const selectedVariety = varieties.find((v) => v.id === grassVariety);
      const derivedGrassType = selectedVariety
        ? getGrassTypeForVariety(grassVariety)
        : prefs.grass_type;

      await save({
        city: city || 'Madison',
        state: state || 'WI',
        grass_type: derivedGrassType,
        grass_variety: grassVariety || undefined,
        sun_exposure: sunExposure,
        soil_type: soilType,
        lawn_size_sqft: lawnSize ? parseInt(lawnSize) : null,
      });
      Alert.alert('Success', 'Preferences saved');
    } catch {
      Alert.alert('Error', 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Sign Out',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/sign-in');
        },
        style: 'destructive',
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Settings' }} />
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {loadError && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>Could not load preferences: {loadError}</Text>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.label}>City</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter city name (e.g., Madison)"
            placeholderTextColor={themeColors.placeholderText}
            value={city}
            onChangeText={setCity}
            editable={!saving}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>State (US) / Region</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter state code (e.g., WI, CA)"
            placeholderTextColor={themeColors.placeholderText}
            value={state}
            onChangeText={(text) => setState(text.toUpperCase())}
            editable={!saving}
            maxLength={2}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Lawn Size (sq ft)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter lawn size"
            placeholderTextColor={themeColors.placeholderText}
            value={lawnSize}
            onChangeText={setLawnSize}
            keyboardType="numeric"
            editable={!saving}
          />
        </View>

        {/* Sun Exposure */}
        <View style={styles.card}>
          <Text style={styles.label}>Sunlight</Text>
          <Text style={optionHintText}>How much sun does your lawn get?</Text>
          {SUN_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[
                optionRowStyle,
                sunExposure === opt.value && optionRowActiveStyle,
              ]}
              onPress={() => setSunExposure(opt.value)}
              disabled={saving}
            >
              <Text style={{ fontSize: 20, marginRight: 10 }}>{opt.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[optionLabelStyle, sunExposure === opt.value && { color: '#fff' }]}>
                  {opt.label}
                </Text>
                <Text style={[optionDescStyle, sunExposure === opt.value && { color: '#d1fae5' }]}>
                  {opt.description}
                </Text>
              </View>
              {sunExposure === opt.value && (
                <Text style={{ color: '#fff', fontSize: 16 }}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Grass Variety */}
        <View style={styles.card}>
          <Text style={styles.label}>Grass Variety</Text>
          <Text style={optionHintText}>
            {varieties.length === 0
              ? 'No varieties found for your zone and sunlight selection.'
              : 'Select the grass closest to what you have (or want):'}
          </Text>
          {varieties.map((v) => (
            <TouchableOpacity
              key={v.id}
              style={[
                varietyCardStyle,
                grassVariety === v.id && varietyCardActiveStyle,
              ]}
              onPress={() => setGrassVariety(v.id)}
              disabled={saving}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Text style={[optionLabelStyle, grassVariety === v.id && { color: '#fff' }, { flex: 1 }]}>
                  {v.displayName}
                </Text>
                <Text style={[mowBadgeStyle, grassVariety === v.id && { backgroundColor: '#16a34a', color: '#fff' }]}>
                  Mow {v.mowHeightRange[0]}–{v.mowHeightRange[1]}&quot;
                </Text>
              </View>
              <Text style={[optionDescStyle, grassVariety === v.id && { color: '#d1fae5' }, { marginTop: 4 }]}>
                {v.description}
              </Text>
              <Text style={[storeTipStyle, grassVariety === v.id && { color: '#a7f3d0' }]}>
                🛒 {v.storeTip}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Soil Type */}
        <View style={styles.card}>
          <Text style={styles.label}>Soil Type</Text>
          <Text style={optionHintText}>What does your soil feel like?</Text>
          {SOIL_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[
                optionRowStyle,
                soilType === opt.value && optionRowActiveStyle,
              ]}
              onPress={() => setSoilType(opt.value)}
              disabled={saving}
            >
              <Text style={{ fontSize: 20, marginRight: 10 }}>{opt.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[optionLabelStyle, soilType === opt.value && { color: '#fff' }]}>
                  {opt.label}
                </Text>
                <Text style={[optionDescStyle, soilType === opt.value && { color: '#d1fae5' }]}>
                  {opt.description}
                </Text>
              </View>
              {soilType === opt.value && (
                <Text style={{ color: '#fff', fontSize: 16 }}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Appearance</Text>
          <View style={styles.grassTypeContainer}>
            {(['system', 'light', 'dark'] as ThemeMode[]).map((mode) => (
              <TouchableOpacity
                key={mode}
                style={[
                  styles.grassTypeButton,
                  themeMode === mode && styles.grassTypeButtonActive,
                ]}
                onPress={() => setThemeMode(mode)}
              >
                <Text
                  style={[
                    styles.grassTypeText,
                    themeMode === mode && styles.grassTypeTextActive,
                  ]}
                >
                  {mode === 'system' ? 'System' : mode === 'light' ? 'Light' : 'Dark'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, saving && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Save Preferences</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
          disabled={saving}
        >
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
}

const optionHintText = {
  fontSize: 13,
  color: '#6b7280',
  marginBottom: 10,
};

const optionRowStyle = {
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  borderWidth: 1,
  borderColor: '#d1d5db',
  borderRadius: 8,
  padding: 12,
  marginBottom: 8,
  backgroundColor: '#f9fafb',
};

const optionRowActiveStyle = {
  backgroundColor: '#22c55e',
  borderColor: '#22c55e',
};

const optionLabelStyle = {
  fontSize: 14,
  fontWeight: '600' as const,
  color: '#111827',
};

const optionDescStyle = {
  fontSize: 12,
  color: '#6b7280',
  marginTop: 2,
};

const varietyCardStyle = {
  borderWidth: 1,
  borderColor: '#d1d5db',
  borderRadius: 8,
  padding: 12,
  marginBottom: 10,
  backgroundColor: '#f9fafb',
};

const varietyCardActiveStyle = {
  backgroundColor: '#22c55e',
  borderColor: '#22c55e',
};

const mowBadgeStyle = {
  fontSize: 11,
  fontWeight: '600' as const,
  color: '#374151',
  backgroundColor: '#e5e7eb',
  paddingHorizontal: 6,
  paddingVertical: 2,
  borderRadius: 4,
  overflow: 'hidden' as const,
};

const storeTipStyle = {
  fontSize: 11,
  color: '#374151',
  marginTop: 6,
  fontStyle: 'italic' as const,
};
