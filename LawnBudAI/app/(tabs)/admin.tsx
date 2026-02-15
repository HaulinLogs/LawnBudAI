import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';

/**
 * Admin Dashboard (Phase 2.0 Placeholder)
 * In Phase 2.5, this will display telemetry and user management UI
 * For now, it shows a "Coming Soon" message
 */
export default function AdminScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Admin Dashboard' }} />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.contentContainer}>
          <View style={styles.card}>
            <Text style={styles.icon}>⚙️</Text>
            <Text style={styles.title}>Admin Dashboard</Text>
            <Text style={styles.subtitle}>Coming in Phase 2.5</Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>What's Next</Text>
            <Text style={styles.infoText}>
              In Phase 2.5, this dashboard will include:
            </Text>
            <View style={styles.featureList}>
              <Text style={styles.featureItem}>• User management (search, promote, demote roles)</Text>
              <Text style={styles.featureItem}>• Security event logs</Text>
              <Text style={styles.featureItem}>• Telemetry dashboards</Text>
              <Text style={styles.featureItem}>• Rate limit monitoring</Text>
              <Text style={styles.featureItem}>• System health status</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>For Now</Text>
            <Text style={styles.infoText}>
              User roles are managed via SQL in the Supabase console. See the RBAC runbook for instructions.
            </Text>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: '#f9fafb',
  },
  contentContainer: {
    flex: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#22c55e',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 12,
  },
  featureList: {
    marginTop: 8,
  },
  featureItem: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 8,
    lineHeight: 18,
  },
});
