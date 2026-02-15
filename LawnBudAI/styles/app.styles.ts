import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 24,
    backgroundColor: '#ecfdf5',
  },
   card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 20,
  },
  weatherRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "stretch", // make children stretch vertically
    minHeight: 64, // set a minimum height for better scaling
  },
  weatherText: {
    fontSize: 14,
    color: "#333",
    flexShrink: 1,
    alignSelf: "center",
  },
  iconContainer: {
    alignSelf: "stretch",
    justifyContent: "center",
    alignItems: "center",
  },
  weatherIcon: {
    color: "#22c55e",
    flex: 1,
    height: "100%",
    aspectRatio: 1, // keeps it square
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
