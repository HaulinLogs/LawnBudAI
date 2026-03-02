import { StyleSheet } from 'react-native';
import { AppThemeColors } from '@/hooks/useAppTheme';

export const createSettingsStyles = (colors: AppThemeColors) =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
      backgroundColor: colors.screenBackgroundGreen,
      paddingHorizontal: 16,
      paddingVertical: 20,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.screenBackgroundGreen,
    },
    card: {
      backgroundColor: colors.cardBackground,
      borderRadius: 8,
      padding: 16,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.settingsLabel,
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: colors.textPrimary,
      backgroundColor: colors.inputBackground,
    },
    grassTypeContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 8,
    },
    grassTypeButton: {
      flex: 1,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 8,
      alignItems: 'center',
      backgroundColor: colors.inputBackground,
    },
    grassTypeButtonActive: {
      backgroundColor: '#22c55e',
      borderColor: '#22c55e',
    },
    grassTypeText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.subHeaderText,
    },
    grassTypeTextActive: {
      color: '#fff',
    },
    button: {
      backgroundColor: '#22c55e',
      borderRadius: 8,
      padding: 14,
      alignItems: 'center',
      marginBottom: 12,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
    },
    signOutButton: {
      backgroundColor: colors.signOutBackground,
      borderRadius: 8,
      padding: 14,
      alignItems: 'center',
      marginBottom: 32,
      borderWidth: 1,
      borderColor: colors.signOutBorder,
    },
    signOutButtonText: {
      color: colors.signOutText,
      fontWeight: 'bold',
      fontSize: 16,
    },
  });
