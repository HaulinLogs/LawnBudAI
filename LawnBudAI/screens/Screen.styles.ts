import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  card: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold' },
  tip: { marginTop: 8, fontStyle: 'italic' },
  weatherContainer: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherText: { fontSize: 16 },
  temperature: { fontSize: 14, color: 'gray' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 10 },
  nextMowing: { fontSize: 16, marginTop: 10 },
  error: { color: 'red' },
});