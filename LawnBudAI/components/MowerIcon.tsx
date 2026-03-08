import React from 'react';
import { View } from 'react-native';

interface Props {
  rotation?: number; // degrees: 0=facing south(↓), 90=east(→), 180=north(↑), 270=west(←)
}

// Top-down push mower icon composed from Views.
// Base orientation: front (cutting deck) faces DOWN (south).
// Rotate to point the front in the direction of travel.
export function MowerIcon({ rotation = 0 }: Props) {
  return (
    <View
      style={{
        width: 20,
        height: 26,
        transform: [{ rotate: `${rotation}deg` }],
        alignItems: 'center',
      }}
    >
      {/* Handle bar – at the BACK of the mower (top when facing down) */}
      <View
        style={{
          width: 14,
          height: 3,
          backgroundColor: '#4b5563',
          borderRadius: 1,
        }}
      />
      {/* Main body */}
      <View
        style={{
          width: 20,
          height: 22,
          backgroundColor: '#b91c1c',
          borderRadius: 3,
        }}
      >
        {/* Rear-left wheel */}
        <View
          style={{
            position: 'absolute',
            top: 2,
            left: 1,
            width: 6,
            height: 6,
            backgroundColor: '#111827',
            borderRadius: 3,
          }}
        />
        {/* Rear-right wheel */}
        <View
          style={{
            position: 'absolute',
            top: 2,
            right: 1,
            width: 6,
            height: 6,
            backgroundColor: '#111827',
            borderRadius: 3,
          }}
        />
        {/* Cutting deck (slightly darker center panel) */}
        <View
          style={{
            position: 'absolute',
            top: 7,
            left: 3,
            right: 3,
            height: 8,
            backgroundColor: '#7f1d1d',
            borderRadius: 2,
          }}
        />
        {/* Front-left wheel */}
        <View
          style={{
            position: 'absolute',
            bottom: 2,
            left: 1,
            width: 6,
            height: 6,
            backgroundColor: '#111827',
            borderRadius: 3,
          }}
        />
        {/* Front-right wheel */}
        <View
          style={{
            position: 'absolute',
            bottom: 2,
            right: 1,
            width: 6,
            height: 6,
            backgroundColor: '#111827',
            borderRadius: 3,
          }}
        />
      </View>
    </View>
  );
}
