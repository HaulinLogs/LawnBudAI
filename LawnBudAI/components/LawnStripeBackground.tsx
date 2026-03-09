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
const MOWER_W = 25; // 125% of 20
const MOWER_H = 33; // 125% of 26

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
  const rowDur = 1300; // ms per horizontal pass (2× slower = 50% speed)

  // Natural diagonal angle of the header rectangle
  const diagDeg = (Math.atan2(HEADER_HEIGHT, width) * 180) / Math.PI;

  // Mower rotation constants: 0°=facing south, positive=clockwise
  const R_E = 90;
  const R_W = 270;
  const R_S = 0;
  const R_N = 180;
  const R_SE = 90 - diagDeg;
  const R_NW = 270 - diagDeg;
  const R_SW = 270 + diagDeg;
  const R_NE = 90 + diagDeg;

  if (pattern === 'horizontal') {
    // Stripe height = MOWER_W so each pass aligns with one stripe (mower cutting width when facing east)
    const stripeH = MOWER_W;
    const numStripes = Math.ceil(HEADER_HEIGHT / stripeH);
    const fwd: Pass[] = Array.from({ length: numStripes }, (_, i) => {
      const y = stripeH * i + stripeH / 2;
      const goEast = i % 2 === 0;
      return {
        fromX: goEast ? -mW : width + mW,
        fromY: y,
        toX: goEast ? width + mW : -mW,
        toY: y,
        rotation: goEast ? R_E : R_W,
        duration: rowDur,
      };
    });
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
    // Stripe width = MOWER_H so each pass aligns with one stripe (mower cutting width when facing south)
    const stripeW = MOWER_H;
    const numStripes = Math.ceil(width / stripeW);
    const fwd: Pass[] = Array.from({ length: numStripes }, (_, i) => {
      const x = stripeW * i + stripeW / 2 - MOWER_W / 2;
      const goSouth = i % 2 === 0;
      return {
        fromX: x,
        fromY: goSouth ? -mH : HEADER_HEIGHT + mH,
        toX: x,
        toY: goSouth ? HEADER_HEIGHT + mH : -mH,
        rotation: goSouth ? R_S : R_N,
        duration: colDur,
      };
    });
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
    // Mower travels the true header diagonal (top-left ↘ bottom-right), matching stripe angle
    const passes: Pass[] = [
      { fromX: -mW, fromY: 0, toX: width + mW, toY: HEADER_HEIGHT, rotation: R_SE, duration: diagDur },
      { fromX: width + mW, fromY: HEADER_HEIGHT, toX: -mW, toY: 0, rotation: R_NW, duration: diagDur },
      { fromX: -mW, fromY: -mH, toX: width + mW, toY: HEADER_HEIGHT + mH, rotation: R_SE, duration: diagDur * 1.05 },
      { fromX: width + mW, fromY: HEADER_HEIGHT + mH, toX: -mW, toY: -mH, rotation: R_NW, duration: diagDur * 1.05 },
    ];
    return reversed ? [...passes].reverse() : passes;
  }

  // diag-left: mower travels top-right ↙ bottom-left
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
      // Stripe height matches mower cutting width so it looks like the mower creates each stripe
      const stripeH = MOWER_W;
      const numStripes = Math.ceil(HEADER_HEIGHT / stripeH);
      return Array.from({ length: numStripes }, (_, i) => (
        <View
          key={i}
          style={{
            width: '100%',
            height: stripeH,
            backgroundColor: i % 2 === 0 ? colorA : colorB,
          }}
        />
      ));
    }

    if (pattern === 'vertical') {
      // Stripe width matches mower cutting width when facing south
      const stripeW = MOWER_H;
      const numStripes = Math.ceil(width / stripeW);
      return (
        <View style={{ flexDirection: 'row', width: '100%', height: HEADER_HEIGHT }}>
          {Array.from({ length: numStripes }, (_, i) => (
            <View
              key={i}
              style={{ width: stripeW, height: HEADER_HEIGHT, backgroundColor: i % 2 === 0 ? colorA : colorB }}
            />
          ))}
        </View>
      );
    }

    // Diagonal: rotate stripes at the true header diagonal angle so they align with the mower path
    const diagDeg = (Math.atan2(HEADER_HEIGHT, width) * 180) / Math.PI;
    // Container must cover the full header after rotation — use the header diagonal length with padding
    const containerSize = Math.ceil(Math.sqrt(width * width + HEADER_HEIGHT * HEADER_HEIGHT) * 1.5);
    // Stripe width matches mower cutting width so it looks like the mower creates each stripe
    const stripeWidth = MOWER_W;
    const stripeCount = Math.ceil(containerSize / stripeWidth) + 1;
    const rotateDeg = pattern === 'diag-right' ? `${diagDeg}deg` : `-${diagDeg}deg`;

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
        <MowerIcon rotation={mowerRotation} width={MOWER_W} height={MOWER_H} />
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
