import { Todo } from '@/models/todo';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Props = { todo: Todo | null, title: string | null };

export function TodoStatusCard({ todo, title }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text>{todo?.name ?? 'Loading...'}</Text>
      <Text style={styles.tip}>
        {todo?.text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, backgroundColor: '#fff', borderRadius: 8, elevation: 2 },
  title: { fontSize: 20, fontWeight: 'bold' },
  tip: { marginTop: 8, fontStyle: 'italic' },
});