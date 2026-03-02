import { StyleSheet } from 'react-native';
import { AppThemeColors } from '@/hooks/useAppTheme';

export const createAuthStyles = (colors: AppThemeColors) =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
      backgroundColor: colors.screenBackgroundGreen,
      paddingHorizontal: 20,
      paddingVertical: 40,
      justifyContent: 'center',
    },
    headerContainer: {
      marginBottom: 32,
    },
    headerText: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.headerText,
      marginBottom: 8,
    },
    subHeaderText: {
      fontSize: 16,
      color: colors.subHeaderText,
    },
    card: {
      backgroundColor: colors.cardBackground,
      borderRadius: 8,
      padding: 20,
      marginBottom: 24,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
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
    button: {
      backgroundColor: '#22c55e',
      borderRadius: 8,
      padding: 14,
      alignItems: 'center',
      marginTop: 16,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
    },
    error: {
      color: colors.error,
      fontSize: 13,
      marginTop: 12,
    },
    success: {
      color: colors.success,
      fontSize: 13,
      marginTop: 12,
    },
    linkContainer: {
      alignItems: 'center',
      marginBottom: 16,
    },
    linkText: {
      fontSize: 14,
      color: colors.subHeaderText,
    },
    linkHighlight: {
      color: '#22c55e',
      fontWeight: 'bold',
    },
  });
