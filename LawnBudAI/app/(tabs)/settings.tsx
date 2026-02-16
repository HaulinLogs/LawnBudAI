import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useRole } from '@/hooks/useRole';
import { MaterialIcons } from '@expo/vector-icons';
import { styles } from '@/styles/settings.styles';

export default function SettingsScreen() {
  const { signOut } = useAuth();
  const { prefs, loading, save } = useUserPreferences();
  const { role, isPremium } = useRole();
  const [city, setCity] = useState('');
  const [lawnSize, setLawnSize] = useState('');
  const [grassType, setGrassType] = useState('cool_season');
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!loading && prefs) {
      setCity(prefs.city);
      setGrassType(prefs.grass_type);
      setLawnSize(prefs.lawn_size_sqft ? String(prefs.lawn_size_sqft) : '');
    }
  }, [prefs, loading]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await save({
        city: city || 'Madison',
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

  // Plan section styles
  const planStyles = StyleSheet.create({
    planCard: {
      backgroundColor: isPremium ? '#f0fdf4' : '#fff',
      borderRadius: 12,
      padding: 16,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: isPremium ? '#10b981' : '#e5e7eb',
    },
    planHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: isPremium ? 0 : 16,
    },
    planInfo: {
      marginLeft: 12,
      flex: 1,
    },
    planTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: '#1f2937',
    },
    planDescription: {
      fontSize: 12,
      color: '#6b7280',
      marginTop: 4,
    },
    upgradeButton: {
      backgroundColor: '#22c55e',
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 12,
    },
    upgradeButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#fff',
    },
  });

  return (
    <>
      <Stack.Screen options={{ title: 'Settings' }} />
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.label}>City</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter city name"
            value={city}
            onChangeText={setCity}
            editable={!saving}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Lawn Size (sq ft)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter lawn size"
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

        {/* Plan Section */}
        <View style={planStyles.planCard}>
          <View style={planStyles.planHeader}>
            <MaterialIcons
              name={isPremium ? 'workspace-premium' : 'card-membership'}
              size={24}
              color={isPremium ? '#10b981' : '#9ca3af'}
            />
            <View style={planStyles.planInfo}>
              <Text style={planStyles.planTitle}>
                {role === 'admin' ? 'Admin' : isPremium ? 'Premium' : 'Free Plan'}
              </Text>
              <Text style={planStyles.planDescription}>
                {role === 'admin'
                  ? 'Full access to admin features'
                  : isPremium
                  ? 'Unlimited API calls & premium features'
                  : '100 API calls per hour'}
              </Text>
            </View>
          </View>
          {!isPremium && (
            <TouchableOpacity
              style={planStyles.upgradeButton}
              onPress={() => router.push('/(tabs)/upgrade')}
            >
              <Text style={planStyles.upgradeButtonText}>Upgrade to Premium</Text>
            </TouchableOpacity>
          )}
        </View>

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
