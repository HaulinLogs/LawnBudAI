import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface PremiumGateProps {
  feature: string;
}

/**
 * PremiumGate component
 * Shown when a free user tries to access a premium feature
 * Displays feature name, explanation, and upgrade CTA button
 *
 * @param feature - Name of the premium feature (e.g., "Smart Recommendations")
 */
export function PremiumGate({ feature }: PremiumGateProps) {
  const router = useRouter();

  const handleUpgrade = () => {
    // Phase 2.5: This will navigate to the premium paywall screen
    // For now, we navigate to the upgrade tab (when created in Phase 2.5)
    router.push('/(tabs)/upgrade');
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        {/* Crown Icon */}
        <MaterialIcons name="workspace-premium" size={64} color="#fbbf24" style={styles.icon} />

        {/* Title */}
        <Text style={styles.title}>Premium Feature</Text>

        {/* Description */}
        <Text style={styles.description}>
          <Text style={styles.featureName}>{feature}</Text> is available only for premium members.
        </Text>

        {/* Benefits Preview */}
        <View style={styles.benefitsContainer}>
          <Text style={styles.benefitsTitle}>With Premium, you get:</Text>
          <View style={styles.benefitItem}>
            <MaterialIcons name="check-circle" size={16} color="#10b981" />
            <Text style={styles.benefitText}>Smart AI recommendations</Text>
          </View>
          <View style={styles.benefitItem}>
            <MaterialIcons name="check-circle" size={16} color="#10b981" />
            <Text style={styles.benefitText}>Advanced analytics</Text>
          </View>
          <View style={styles.benefitItem}>
            <MaterialIcons name="check-circle" size={16} color="#10b981" />
            <Text style={styles.benefitText}>Higher API limits</Text>
          </View>
        </View>

        {/* Upgrade Button */}
        <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgrade}>
          <MaterialIcons name="card-membership" size={20} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
        </TouchableOpacity>

        {/* Dismiss Text */}
        <Text style={styles.dismissText}>
          Start with 7 days free, then $2.99/month. Cancel anytime.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#f9fafb',
  },
  contentContainer: {
    alignItems: 'center',
    maxWidth: 320,
  },
  icon: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  featureName: {
    fontWeight: '600',
    color: '#1f2937',
  },
  benefitsContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    borderLeftWidth: 4,
    borderLeftColor: '#fbbf24',
  },
  benefitsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  benefitText: {
    fontSize: 14,
    color: '#4b5563',
    marginLeft: 10,
    fontWeight: '500',
  },
  upgradeButton: {
    width: '100%',
    backgroundColor: '#22c55e',
    paddingVertical: 14,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonIcon: {
    marginRight: 8,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  dismissText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
});
