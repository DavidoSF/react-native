import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';

import { useCart } from '@/contexts/cart-context';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/theme';

export function CartAnimationOverlay() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { lastAddedAt } = useCart();
  const lottieRef = useRef<LottieView>(null);
  const [visible, setVisible] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (!lastAddedAt) return;
    setVisible(true);
    lottieRef.current?.play(0, 30);
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 120, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
    ]).start();

    const timeout = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 160, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0.8, duration: 160, useNativeDriver: true }),
      ]).start(() => setVisible(false));
    }, 650);

    return () => clearTimeout(timeout);
  }, [lastAddedAt, opacity, scale]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.overlay, { opacity, transform: [{ scale }] }]} pointerEvents="none">
      <LottieView
        ref={lottieRef}
        source={require('@/assets/animations/cart-burst.json')}
        autoPlay
        loop={false}
        style={styles.lottie}
      />
    </Animated.View>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    overlay: {
      position: 'absolute',
      top: '40%',
      left: 0,
      right: 0,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 60,
    },
    lottie: {
      width: 160,
      height: 160,
    },
  });
