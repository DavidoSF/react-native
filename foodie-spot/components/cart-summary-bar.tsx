import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSegments, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useCart } from '@/contexts/cart-context';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/theme';

export function CartSummaryBar() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { totalItems, subtotal } = useCart();
  const insets = useSafeAreaInsets();
  const segments = useSegments();
  const isAuthRoute = segments.includes('(auth)');
  const isCartFlow = segments.includes('cart') || segments.includes('checkout') || segments.includes('review');
  const shouldShow = totalItems > 0 && !isAuthRoute && !isCartFlow;

  const slideAnim = useRef(new Animated.Value(0)).current;
  const badgeScale = useRef(new Animated.Value(1)).current;
  const prevCount = useRef(totalItems);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: shouldShow ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [shouldShow, slideAnim]);

  useEffect(() => {
    if (prevCount.current !== totalItems) {
      Animated.sequence([
        Animated.timing(badgeScale, { toValue: 1.2, duration: 120, useNativeDriver: true }),
        Animated.timing(badgeScale, { toValue: 1, duration: 120, useNativeDriver: true }),
      ]).start();
      prevCount.current = totalItems;
    }
  }, [totalItems, badgeScale]);

  if (!shouldShow) return null;

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [80, 0],
  });

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[styles.wrapper, { transform: [{ translateY }], bottom: 12 + insets.bottom }]}
    >
      <TouchableOpacity style={styles.container} onPress={() => router.push('/cart')}>
        <View style={styles.left}>
          <Animated.View style={[styles.badge, { transform: [{ scale: badgeScale }] }]}>
            <Text style={styles.badgeText}>{totalItems}</Text>
          </Animated.View>
          <Text style={styles.label}>Voir le panier</Text>
        </View>
        <View style={styles.right}>
          <Text style={styles.totalText}>${subtotal.toFixed(2)}</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.card} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    wrapper: {
      position: 'absolute',
      left: 16,
      right: 16,
      zIndex: 50,
    },
    container: {
      backgroundColor: colors.accent,
      borderRadius: 18,
      paddingHorizontal: 16,
      paddingVertical: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.12,
      shadowRadius: 10,
      elevation: 5,
    },
    left: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    badge: {
      backgroundColor: colors.card,
      minWidth: 26,
      height: 26,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 6,
    },
    badgeText: {
      color: colors.accent,
      fontWeight: '700',
      fontSize: 12,
    },
    label: {
      color: colors.card,
      fontWeight: '600',
    },
    right: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    totalText: {
      color: colors.card,
      fontWeight: '700',
      fontSize: 16,
    },
  });
