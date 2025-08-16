import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function FertilizerScreen() {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Fertilizer</Text>
      <Text>{'Fertilize the lawn'}</Text>
      <Text style={styles.tip}>
        Fertilze...
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, backgroundColor: '#fff', borderRadius: 8, elevation: 2 },
  title: { fontSize: 20, fontWeight: 'bold' },
  tip: { marginTop: 8, fontStyle: 'italic' },
});