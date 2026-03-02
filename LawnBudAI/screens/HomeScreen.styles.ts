import { StyleSheet } from 'react-native';
import { AppThemeColors } from '@/hooks/useAppTheme';

export const createHomeStyles = (colors: AppThemeColors) =>
  StyleSheet.create({
    container: {
      padding: 20,
      gap: 24,
      backgroundColor: colors.screenBackgroundGreen,
    },
    card: {
      backgroundColor: colors.cardBackground,
      borderRadius: 8,
      padding: 12,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    sectionTitle: {
      fontWeight: 'bold',
      fontSize: 20,
      color: colors.textPrimary,
    },
    weatherRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'stretch',
      minHeight: 64,
    },
    weatherText: {
      fontSize: 14,
      color: colors.forecastTemp,
      flexShrink: 1,
      alignSelf: 'center',
    },
    iconContainer: {
      alignSelf: 'stretch',
      justifyContent: 'center',
      alignItems: 'center',
    },
    weatherIcon: {
      color: '#22c55e',
      flex: 1,
      height: '100%',
      aspectRatio: 1,
    },
    loadingIndicator: {
      marginTop: 8,
    },
    errorText: {
      fontSize: 14,
      color: colors.error,
    },
    section: {
      gap: 12,
    },
    reminderItem: {
      backgroundColor: colors.reminderBackground,
      borderRadius: 12,
      padding: 12,
      marginTop: 8,
    },
    reminderTitle: {
      fontSize: 16,
      color: colors.reminderTitle,
      fontWeight: '500',
    },
    reminderSubtitle: {
      fontSize: 12,
      color: colors.textTertiary,
      marginTop: 4,
    },
  });
