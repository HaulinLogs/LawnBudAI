import React, { useEffect, useRef, useMemo } from 'react';
import {
  View,
  Animated,
  Image,
  Text,
  StyleSheet,
  useWindowDimensions,
  Easing,
} from 'react-native';
import { MowerIcon } from './MowerIcon';
import { useColorScheme } from '@/hooks/useColorScheme';

const HEADER_HEIGHT = 140;
const MOWER_W = 25; // 125% of 20
const MOWER_H = 33; // 125% of 26

// Three-tone lawn stripe effect: cut1 (lightest) / cut2 (medium) / uncut (darkest)
const COLOR_CUT1  = { light: '#86efac', dark: '#166534' };
const COLOR_CUT2  = { light: '#4ade80', dark: '#15803d' };
const COLOR_UNCUT = { light: '#16a34a', dark: '#052e16' };

type Pattern = 'horizontal' | 'vertical';

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

  // Mower rotation constants: 0°=facing south, positive=clockwise
  const R_E = 90;
  const R_W = 270;
  const R_S = 0;
  const R_N = 180;

  if (pattern === 'horizontal') {
    // Stripe height matches mower cutting width so it looks like the mower creates each stripe
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
    // Stripe width = MOWER_W (cutting swath perpendicular to south/north travel)
    const stripeW = MOWER_W;
    const numStripes = Math.ceil(width / stripeW);
    const fwd: Pass[] = Array.from({ length: numStripes }, (_, i) => {
      const x = stripeW * i + stripeW / 2;
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

  // fallback (should never reach here with only horizontal/vertical patterns)
  return [];
}

export function LawnStripeBackground() {
  const { width } = useWindowDimensions();
  const scheme = useColorScheme() ?? 'light';
  const colorCut1 = COLOR_CUT1[scheme];
  const colorCut2 = COLOR_CUT2[scheme];
  const colorUncut = COLOR_UNCUT[scheme];

  // Pick pattern and direction once on mount (stable refs — never change after init)
  const patternRef = useRef<Pattern | null>(null);
  const reversedRef = useRef<boolean | null>(null);
  if (patternRef.current === null) {
    const opts: Pattern[] = ['horizontal', 'vertical'];
    patternRef.current = opts[Math.floor(Math.random() * opts.length)];
    reversedRef.current = Math.random() < 0.5;
  }
  const pattern = patternRef.current;
  const reversed = reversedRef.current ?? false;

  // Animated values: position uses native driver, rotation uses native driver
  const mowerPos = useRef(new Animated.ValueXY({ x: -50, y: HEADER_HEIGHT / 2 })).current;
  const mowerRot = useRef(new Animated.Value(90)).current;
  const mountedRef = useRef(true);

  // Passes computed outside effect so renderStripes can use them for layout
  const passes = useMemo(
    () => buildPasses(pattern, width, reversed),
    // pattern and reversed are stable; only width can change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [width]
  );

  // One Animated.Value per pass — drives the progressive stripe reveal.
  // Recreated whenever pass count changes (i.e. when width changes enough to add/remove stripes).
  // Note: useNativeDriver:false is required for width/height animations.
  const stripeAnims = useMemo(
    () => passes.map(() => new Animated.Value(0)),
    [passes]
  );

  useEffect(() => {
    mountedRef.current = true;
    // Reset stripe progress (important when width changes and effect re-runs)
    stripeAnims.forEach(a => a.setValue(0));
    // Set initial mower rotation without animation
    if (passes.length > 0) mowerRot.setValue(passes[0].rotation);

    const startMoving = (index: number) => {
      if (!mountedRef.current || index >= passes.length) return;
      const p = passes[index];
      // Snap mower to pass start (off-screen for pass 0; same point as previous pass end for index > 0)
      mowerPos.setValue({ x: p.fromX, y: p.fromY });

      const animations: Animated.CompositeAnimation[] = [
        Animated.timing(mowerPos, {
          toValue: { x: p.toX, y: p.toY },
          duration: p.duration,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ];

      // Animate stripe reveal in sync with mower movement (JS thread — unavoidable for layout props)
      if (stripeAnims[index]) {
        animations.push(
          Animated.timing(stripeAnims[index], {
            toValue: 1,
            duration: p.duration,
            easing: Easing.linear,
            useNativeDriver: false,
          })
        );
      }

      Animated.parallel(animations).start(({ finished }) => {
        if (!finished || !mountedRef.current) return;

        // Pivot the mower at the turnaround point before the next pass
        const next = passes[index + 1];
        if (!next) return;

        Animated.timing(mowerRot, {
          toValue: next.rotation,
          duration: 400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }).start(({ finished: pivotDone }) => {
          if (pivotDone) startMoving(index + 1);
        });
      });
    };

    startMoving(0);

    return () => {
      mountedRef.current = false;
      mowerPos.stopAnimation();
      mowerRot.stopAnimation();
      stripeAnims.forEach(a => a.stopAnimation());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passes, stripeAnims]);

  // Rotation string for the Animated.View wrapper (extrapolate handles values outside 0-360)
  const rotStr = mowerRot.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
    extrapolate: 'extend',
  });

  const renderStripes = () => {
    if (pattern === 'horizontal') {
      const stripeH = MOWER_W;
      const numStripes = Math.ceil(HEADER_HEIGHT / stripeH);
      return (
        <View style={{ flex: 1, backgroundColor: colorUncut }}>
          {Array.from({ length: numStripes }, (_, i) => {
            // Even stripes: mower travels East (or West when reversed) → colorCut1
            // Odd stripes: mower travels the opposite direction → colorCut2
            const isEven = i % 2 === 0;
            const goEast = isEven ? !reversed : reversed;
            const color = isEven ? colorCut1 : colorCut2;
            const revealWidth = stripeAnims[i]?.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }) ?? '0%';
            return (
              <View key={i} style={{ height: stripeH }}>
                <Animated.View
                  style={{
                    height: '100%',
                    backgroundColor: color,
                    alignSelf: goEast ? 'flex-start' : 'flex-end',
                    width: revealWidth,
                  }}
                />
              </View>
            );
          })}
        </View>
      );
    }

    if (pattern === 'vertical') {
      const stripeW = MOWER_W;
      const numStripes = Math.ceil(width / stripeW);
      return (
        <View style={{ flex: 1, flexDirection: 'row', backgroundColor: colorUncut }}>
          {Array.from({ length: numStripes }, (_, i) => {
            // Even stripes: mower travels South (or North when reversed) → colorCut1
            // Odd stripes: mower travels the opposite direction → colorCut2
            const isEven = i % 2 === 0;
            const goSouth = isEven ? !reversed : reversed;
            const color = isEven ? colorCut1 : colorCut2;
            const revealHeight = stripeAnims[i]?.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }) ?? '0%';
            return (
              <View key={i} style={{ width: stripeW, justifyContent: goSouth ? 'flex-start' : 'flex-end' }}>
                <Animated.View
                  style={{
                    width: '100%',
                    backgroundColor: color,
                    height: revealHeight,
                  }}
                />
              </View>
            );
          })}
        </View>
      );
    }

    return null;
  };

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Stripe background — clipped to header bounds */}
      <View style={{ width: '100%', height: HEADER_HEIGHT, overflow: 'hidden' }}>
        {renderStripes()}
      </View>

      {/* Mower: outer view provides the translated position, inner view applies the animated rotation */}
      <Animated.View style={[styles.mowerContainer, { transform: mowerPos.getTranslateTransform() }]}>
        <Animated.View style={{ transform: [{ rotate: rotStr }] }}>
          <MowerIcon width={MOWER_W} height={MOWER_H} />
        </Animated.View>
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
  // Center the mower icon on its position coordinates
  mowerContainer: {
    position: 'absolute',
    top: -MOWER_H / 2,
    left: -MOWER_W / 2,
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
