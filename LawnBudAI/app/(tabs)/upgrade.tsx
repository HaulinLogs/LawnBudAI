import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

/**
 * Premium Upgrade Screen (Phase 2.5 Placeholder)
 * In Phase 2.5, this will integrate with RevenueCat for in-app purchases
 * For now, it shows the premium benefits and a coming soon message
 */
export default function UpgradeScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Upgrade to Premium',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <MaterialIcons name="arrow-back" size={24} color="#22c55e" />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <MaterialIcons name="workspace-premium" size={56} color="#fbbf24" />
          <Text style={styles.title}>Go Premium</Text>
          <Text style={styles.subtitle}>Unlock all features for better lawn care</Text>
        </View>

        {/* Price Card */}
        <View style={styles.priceCard}>
          <Text style={styles.price}>$2.99</Text>
          <Text style={styles.period}>per month</Text>
          <Text style={styles.trialText}>7 days free, then auto-renews</Text>
        </View>

        {/* Benefits */}
        <View style={styles.benefitsSection}>
          <Text style={styles.benefitsTitle}>What You Get</Text>

          <View style={styles.benefit}>
            <MaterialIcons name="smart-toy" size={20} color="#22c55e" />
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Smart Recommendations</Text>
              <Text style={styles.benefitDescription}>
                AI-powered suggestions based on weather and lawn history
              </Text>
            </View>
          </View>

          <View style={styles.benefit}>
            <MaterialIcons name="bar-chart" size={20} color="#22c55e" />
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Advanced Analytics</Text>
              <Text style={styles.benefitDescription}>
                Detailed insights into your lawn care patterns
              </Text>
            </View>
          </View>

          <View style={styles.benefit}>
            <MaterialIcons name="speed" size={20} color="#22c55e" />
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Higher API Limits</Text>
              <Text style={styles.benefitDescription}>
                1,000 requests/hour vs 100 for free users
              </Text>
            </View>
          </View>

          <View style={styles.benefit}>
            <MaterialIcons name="notifications-active" size={20} color="#22c55e" />
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Priority Notifications</Text>
              <Text style={styles.benefitDescription}>
                Get reminders at your preferred time
              </Text>
            </View>
          </View>
        </View>

        {/* CTA Button - Phase 2.5 */}
        <TouchableOpacity style={styles.subscribeButton} disabled>
          <Text style={styles.subscribeButtonText}>Coming in Phase 2.5</Text>
        </TouchableOpacity>

        {/* Bottom Text */}
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>
            In Phase 2.5, we'll integrate RevenueCat for secure in-app purchases on iOS and Android.
          </Text>
          <Text style={styles.footerTextSmall}>
            Cancel your subscription anytime from App Store/Play Store settings
          </Text>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingVertical: 32,
    paddingHorizontal: 16,
    backgroundColor: '#f9fafb',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 12,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  priceCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 2,
    borderColor: '#22c55e',
  },
  price: {
    fontSize: 44,
    fontWeight: '700',
    color: '#22c55e',
  },
  period: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 4,
  },
  trialText: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 12,
    fontStyle: 'italic',
  },
  benefitsSection: {
    marginBottom: 32,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  benefit: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  benefitContent: {
    marginLeft: 12,
    flex: 1,
  },
  benefitTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  benefitDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    lineHeight: 16,
  },
  subscribeButton: {
    backgroundColor: '#d1d5db',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  subscribeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  footerContainer: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 16,
  },
  footerText: {
    fontSize: 13,
    color: '#4b5563',
    lineHeight: 20,
  },
  footerTextSmall: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 8,
    lineHeight: 16,
  },
});
