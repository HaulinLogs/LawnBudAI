import { router, Stack } from 'expo-router';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';

export default function WateringScreen() {
  return (
    <View style={styles.card}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: '#064e3b',
          },
          headerTitleStyle: {
            color: '#fff',
            fontSize: 24,
          },
          headerTitle: 'Watering',
          headerLeft: () => (
            <TouchableOpacity onPress={() => {
               router.back();
            }}>
              <Icon name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
          ),
        }}
      />
      <Text>{'Water the lawn'}</Text>
      <Text style={styles.tip}>
        Watering...
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, backgroundColor: '#fff', borderRadius: 8, elevation: 2 },
  title: { fontSize: 20, fontWeight: 'bold' },
  tip: { marginTop: 8, fontStyle: 'italic' },
});