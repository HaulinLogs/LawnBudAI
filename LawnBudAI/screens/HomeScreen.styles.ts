import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 24,
    backgroundColor: '#ecfdf5',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 8,
  },
  weatherText: {
    fontSize: 14,
    color: '#4b5563',
  },
  loadingIndicator: {
    marginTop: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#dc2626',
  },
  section: {
    gap: 12,
  },
  reminderItem: {
    backgroundColor: '#d1fae5',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  reminderTitle: {
    fontSize: 16,
    color: '#065f46',
    fontWeight: '500',
  },
  reminderSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
});
