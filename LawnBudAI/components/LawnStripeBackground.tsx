import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Animated,
  Image,
  Text,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { MowerIcon } from './MowerIcon';
import { useColorScheme } from '@/hooks/useColorScheme';

const HEADER_HEIGHT = 140;
const MOWER_W = 20;
const MOWER_H = 26;

// Two slightly contrasting green shades for lawn stripes
const STRIPE_LIGHT = { light: '#86efac', dark: '#166534' };
const STRIPE_DARK = { light: '#4ade80', dark: '#14532d' };

type Pattern = 'horizontal' | 'vertical' | 'diag-right' | 'diag-left';

interface Pass {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  rotation: number; // degrees: 0=south(↓), 90=east(→), 180=north(↑), 270=west(←)
  duration: number;
}

function buildPasses(pattern: Pattern, width: number, reversed: boolean): Pass[] {
  const mW = MOWER_W + 6; // buffer so mower is fully off-screen at start/end
  const mH = MOWER_H + 6;
  const stripeH = HEADER_HEIGHT / 4;
  const stripeW = width / 4;
  const rowDur = 650; // ms per horizontal/vertical pass

  // Natural diagonal angle of the header rectangle
  const diagDeg = (Math.atan2(HEADER_HEIGHT, width) * 180) / Math.PI; // ~19° for typical phones

  // Mower rotation constants: 0°=facing south, positive=clockwise
  const R_E = 90; // facing east (→)
  const R_W = 270; // facing west (←)
  const R_S = 0; // facing south (↓)
  const R_N = 180; // facing north (↑)
  const R_SE = 90 - diagDeg; // facing ↘
  const R_NW = 270 - diagDeg; // facing ↖
  const R_SW = 270 + diagDeg; // facing ↙
  const R_NE = 90 + diagDeg; // facing ↗

  if (pattern === 'horizontal') {
    const fwd: Pass[] = [
      { fromX: -mW, fromY: stripeH * 0.5, toX: width + mW, toY: stripeH * 0.5, rotation: R_E, duration: rowDur },
      { fromX: width + mW, fromY: stripeH * 1.5, toX: -mW, toY: stripeH * 1.5, rotation: R_W, duration: rowDur },
      { fromX: -mW, fromY: stripeH * 2.5, toX: width + mW, toY: stripeH * 2.5, rotation: R_E, duration: rowDur },
      { fromX: width + mW, fromY: stripeH * 3.5, toX: -mW, toY: stripeH * 3.5, rotation: R_W, duration: rowDur },
    ];
    if (!reversed) return fwd;
    return fwd.map(p => ({
      ...p,
      fromX: p.toX,
      toX: p.fromX,
      rotation: p.rotation === R_E ? R_W : R_E,
    }));
  }

  if (pattern === 'vertical') {
    const colDur = rowDur * 0.4;
    const fwd: Pass[] = [
      { fromX: stripeW * 0.5 - mW / 2, fromY: -mH, toX: stripeW * 0.5 - mW / 2, toY: HEADER_HEIGHT + mH, rotation: R_S, duration: colDur },
      { fromX: stripeW * 1.5 - mW / 2, fromY: HEADER_HEIGHT + mH, toX: stripeW * 1.5 - mW / 2, toY: -mH, rotation: R_N, duration: colDur },
      { fromX: stripeW * 2.5 - mW / 2, fromY: -mH, toX: stripeW * 2.5 - mW / 2, toY: HEADER_HEIGHT + mH, rotation: R_S, duration: colDur },
      { fromX: stripeW * 3.5 - mW / 2, fromY: HEADER_HEIGHT + mH, toX: stripeW * 3.5 - mW / 2, toY: -mH, rotation: R_N, duration: colDur },
    ];
    if (!reversed) return fwd;
    return fwd.map(p => ({
      ...p,
      fromY: p.toY,
      toY: p.fromY,
      rotation: p.rotation === R_S ? R_N : R_S,
    }));
  }

  const diagDur = rowDur * 1.3;

  if (pattern === 'diag-right') {
    // Stripes run ↘; mower serpentines ↘ ↖ ↘ ↖
    const passes: Pass[] = [
      { fromX: -mW, fromY: 0, toX: width + mW, toY: HEADER_HEIGHT, rotation: R_SE, duration: diagDur },
      { fromX: width + mW, fromY: HEADER_HEIGHT, toX: -mW, toY: 0, rotation: R_NW, duration: diagDur },
      { fromX: -mW, fromY: -mH, toX: width + mW, toY: HEADER_HEIGHT + mH, rotation: R_SE, duration: diagDur * 1.05 },
      { fromX: width + mW, fromY: HEADER_HEIGHT + mH, toX: -mW, toY: -mH, rotation: R_NW, duration: diagDur * 1.05 },
    ];
    return reversed ? [...passes].reverse() : passes;
  }

  // diag-left: stripes run ↙; mower serpentines ↙ ↗ ↙ ↗
  const passes: Pass[] = [
    { fromX: width + mW, fromY: 0, toX: -mW, toY: HEADER_HEIGHT, rotation: R_SW, duration: diagDur },
    { fromX: -mW, fromY: HEADER_HEIGHT, toX: width + mW, toY: 0, rotation: R_NE, duration: diagDur },
    { fromX: width + mW, fromY: -mH, toX: -mW, toY: HEADER_HEIGHT + mH, rotation: R_SW, duration: diagDur * 1.05 },
    { fromX: -mW, fromY: HEADER_HEIGHT + mH, toX: width + mW, toY: -mH, rotation: R_NE, duration: diagDur * 1.05 },
  ];
  return reversed ? [...passes].reverse() : passes;
}

export function LawnStripeBackground() {
  const { width } = useWindowDimensions();
  const scheme = useColorScheme() ?? 'light';
  const colorA = STRIPE_LIGHT[scheme];
  const colorB = STRIPE_DARK[scheme];

  // Pick pattern and starting direction once on mount
  const patternRef = useRef<Pattern | null>(null);
  const reversedRef = useRef<boolean | null>(null);
  if (patternRef.current === null) {
    const opts: Pattern[] = ['horizontal', 'vertical', 'diag-right', 'diag-left'];
    patternRef.current = opts[Math.floor(Math.random() * opts.length)];
    reversedRef.current = Math.random() < 0.5;
  }
  const pattern = patternRef.current;
  const reversed = reversedRef.current ?? false;

  const mowerPos = useRef(new Animated.ValueXY({ x: -50, y: HEADER_HEIGHT / 2 })).current;
  const [mowerRotation, setMowerRotation] = useState(90);
  const mountedRef = useRef(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    const passes = buildPasses(pattern, width, reversed);

    const runPass = (index: number) => {
      if (!mountedRef.current || index >= passes.length) return;
      const p = passes[index];
      mowerPos.setValue({ x: p.fromX, y: p.fromY });
      setMowerRotation(p.rotation);
      timeoutRef.current = setTimeout(() => {
        if (!mountedRef.current) return;
        Animated.timing(mowerPos, {
          toValue: { x: p.toX, y: p.toY },
          duration: p.duration,
          useNativeDriver: true,
        }).start(({ finished }) => {
          if (finished) runPass(index + 1);
        });
      }, 16);
    };

    runPass(0);

    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      mowerPos.stopAnimation();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width]);

  const renderStripes = () => {
    if (pattern === 'horizontal') {
      return Array.from({ length: 4 }, (_, i) => (
        <View
          key={i}
          style={{
            width: '100%',
            height: HEADER_HEIGHT / 4,
            backgroundColor: i % 2 === 0 ? colorA : colorB,
          }}
        />
      ));
    }

    if (pattern === 'vertical') {
      return (
        <View style={{ flexDirection: 'row', width: '100%', height: HEADER_HEIGHT }}>
          {Array.from({ length: 4 }, (_, i) => (
            <View
              key={i}
              style={{ flex: 1, height: HEADER_HEIGHT, backgroundColor: i % 2 === 0 ? colorA : colorB }}
            />
          ))}
        </View>
      );
    }

    // Diagonal: overflow-clipped rotated stripe container
    // Size must be large enough so that after 45° rotation the corners still cover the header
    const containerSize = Math.ceil(Math.max(width, HEADER_HEIGHT) * 1.85);
    const stripeCount = 8; // 4 pairs → ~4 visible stripes after clipping
    const stripeWidth = containerSize / stripeCount;
    const rotateDeg = pattern === 'diag-right' ? '45deg' : '-45deg';

    return (
      <View
        style={{
          position: 'absolute',
          width: containerSize,
          height: containerSize,
          top: (HEADER_HEIGHT - containerSize) / 2,
          left: (width - containerSize) / 2,
          transform: [{ rotate: rotateDeg }],
          flexDirection: 'row',
        }}
      >
        {Array.from({ length: stripeCount }, (_, i) => (
          <View
            key={i}
            style={{
              width: stripeWidth,
              height: containerSize,
              backgroundColor: i % 2 === 0 ? colorA : colorB,
            }}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Stripe background — clipped to header bounds */}
      <View style={{ width: '100%', height: HEADER_HEIGHT, overflow: 'hidden' }}>
        {renderStripes()}
      </View>

      {/* Animated mower icon */}
      <Animated.View
        style={[styles.mower, { transform: mowerPos.getTranslateTransform() }]}
      >
        <MowerIcon rotation={mowerRotation} />
      </Animated.View>

      {/* Logo + "LawnBud" — bottom-left with readability scrim */}
      <View style={styles.logoOverlay}>
        <View style={styles.scrim} />
        <View style={styles.logoRow}>
          <Image
            source={require('@/assets/images/icon.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.logoText}>LawnBud</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mower: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  logoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 54,
    justifyContent: 'flex-end',
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.20)',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 10,
  },
  logoImage: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  logoText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
