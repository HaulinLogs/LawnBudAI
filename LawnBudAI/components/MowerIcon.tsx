import React from 'react';
import { View } from 'react-native';

interface Props {
  rotation?: number; // degrees: 0=facing south(↓), 90=east(→), 180=north(↑), 270=west(←)
  width?: number;
  height?: number;
}

// Top-down push mower icon composed from Views.
// Base orientation: front (cutting deck) faces DOWN (south).
// Rotate to point the front in the direction of travel.
export function MowerIcon({ rotation = 0, width = 25, height = 33 }: Props) {
  const s = width / 20; // scale factor relative to original 20px width
  return (
    <View
      style={{
        width,
        height,
        transform: [{ rotate: `${rotation}deg` }],
        alignItems: 'center',
      }}
    >
      {/* Handle bar – at the BACK of the mower (top when facing down) */}
      <View
        style={{
          width: Math.round(14 * s),
          height: Math.round(3 * s),
          backgroundColor: '#4b5563',
          borderRadius: 1,
        }}
      />
      {/* Main body */}
      <View
        style={{
          width,
          height: Math.round(22 * s),
          backgroundColor: '#b91c1c',
          borderRadius: Math.round(3 * s),
        }}
      >
        {/* Rear-left wheel */}
        <View
          style={{
            position: 'absolute',
            top: Math.round(2 * s),
            left: Math.round(1 * s),
            width: Math.round(6 * s),
            height: Math.round(6 * s),
            backgroundColor: '#111827',
            borderRadius: Math.round(3 * s),
          }}
        />
        {/* Rear-right wheel */}
        <View
          style={{
            position: 'absolute',
            top: Math.round(2 * s),
            right: Math.round(1 * s),
            width: Math.round(6 * s),
            height: Math.round(6 * s),
            backgroundColor: '#111827',
            borderRadius: Math.round(3 * s),
          }}
        />
        {/* Cutting deck (slightly darker center panel) */}
        <View
          style={{
            position: 'absolute',
            top: Math.round(7 * s),
            left: Math.round(3 * s),
            right: Math.round(3 * s),
            height: Math.round(8 * s),
            backgroundColor: '#7f1d1d',
            borderRadius: Math.round(2 * s),
          }}
        />
        {/* Front-left wheel */}
        <View
          style={{
            position: 'absolute',
            bottom: Math.round(2 * s),
            left: Math.round(1 * s),
            width: Math.round(6 * s),
            height: Math.round(6 * s),
            backgroundColor: '#111827',
            borderRadius: Math.round(3 * s),
          }}
        />
        {/* Front-right wheel */}
        <View
          style={{
            position: 'absolute',
            bottom: Math.round(2 * s),
            right: Math.round(1 * s),
            width: Math.round(6 * s),
            height: Math.round(6 * s),
            backgroundColor: '#111827',
            borderRadius: Math.round(3 * s),
          }}
        />
      </View>
    </View>
  );
}
