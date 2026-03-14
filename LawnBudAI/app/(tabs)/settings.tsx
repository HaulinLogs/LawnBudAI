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

export default function SettingsScreen() {
  const { signOut } = useAuth();
  const { prefs, loading, loadError, save } = useUserPreferences();
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [lawnSize, setLawnSize] = useState('');
  const [grassType, setGrassType] = useState('cool_season');
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const themeColors = useAppTheme();
  const styles = useMemo(() => createSettingsStyles(themeColors), [themeColors]);
  const { themeMode, setThemeMode } = useThemeMode();

  useEffect(() => {
    if (!loading && prefs) {
      setCity(prefs.city);
      setState(prefs.state || 'WI');
      setGrassType(prefs.grass_type);
      setLawnSize(prefs.lawn_size_sqft ? String(prefs.lawn_size_sqft) : '');
    }
  }, [prefs, loading]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await save({
        city: city || 'Madison',
        state: state || 'WI',
        grass_type: grassType,
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

        <View style={styles.card}>
          <Text style={styles.label}>Grass Type</Text>
          <View style={styles.grassTypeContainer}>
            {['cool_season', 'warm_season', 'mixed'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.grassTypeButton,
                  grassType === type && styles.grassTypeButtonActive,
                ]}
                onPress={() => setGrassType(type)}
                disabled={saving}
              >
                <Text
                  style={[
                    styles.grassTypeText,
                    grassType === type && styles.grassTypeTextActive,
                  ]}
                >
                  {type === 'cool_season'
                    ? 'Cool Season'
                    : type === 'warm_season'
                    ? 'Warm Season'
                    : 'Mixed'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
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
