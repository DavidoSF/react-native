// app/_layout.tsx

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, usePathname, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import 'react-native-reanimated';

import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { ToastProvider } from '@/components/toast-provider';
import { useOffline } from '@/hooks/use-offline';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

function RootLayoutContent() {
  const colorScheme = useColorScheme();
  const { isOnline, pendingCount, isSyncing, syncNow } = useOffline();
  const { isAuthenticated, isLoading, refreshAuth } = useAuth();
  const segments = useSegments();
  const pathname = usePathname();
  const router = useRouter();
  const lastRedirectRef = useRef<string | null>(null);
  const refreshAttemptedRef = useRef(false);
  const refreshInFlightRef = useRef(false);

  const { inTabsGroup, isAuthRoute, isProtectedRoute } = useMemo(() => {
    const authRoutes = new Set(['login', 'register']);
    const protectedRoutes = new Set(['cart', 'checkout', 'restaurant', 'dish', 'tracking', 'review']);
    const inAuth = segments.includes('(auth)');
    const inTabs = segments.includes('(tabs)');
    const hasAuthSegment = segments.some(segment => authRoutes.has(segment));
    const hasProtectedSegment = segments.some(segment => protectedRoutes.has(segment));

    return {
      inTabsGroup: inTabs,
      isAuthRoute: inAuth || hasAuthSegment,
      isProtectedRoute: inTabs || hasProtectedSegment,
    };
  }, [segments]);

  useEffect(() => {
    lastRedirectRef.current = null;
  }, [pathname]);

  const safeReplace = useCallback(
    (target: string) => {
      if (!target || pathname === target || lastRedirectRef.current === target) return;
      lastRedirectRef.current = target;
      router.replace(target);
    },
    [pathname, router]
  );

  // Navigation Guard
  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated && isProtectedRoute) {
      safeReplace('/login');
    } else if (isAuthenticated && isAuthRoute) {
      safeReplace('/(tabs)');
    }
  }, [isLoading, isAuthenticated, isProtectedRoute, isAuthRoute, safeReplace]);

  useEffect(() => {
    if (isLoading) return;
    if (!inTabsGroup) {
      refreshAttemptedRef.current = false;
      return;
    }
    if (isAuthenticated) {
      refreshAttemptedRef.current = false;
      return;
    }
    if (refreshAttemptedRef.current || refreshInFlightRef.current) return;

    refreshAttemptedRef.current = true;
    refreshInFlightRef.current = true;
    refreshAuth().finally(() => {
      refreshInFlightRef.current = false;
    });
  }, [inTabsGroup, isLoading, isAuthenticated, refreshAuth]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingLogo}>🍔</Text>
        <ActivityIndicator size="large" color={Colors.light.tint} />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {!isOnline && (
        <View style={styles.offlineBanner}>
          <Ionicons name="cloud-offline-outline" size={16} color="#fff" />
          <Text style={styles.bannerText}>
            Hors ligne {pendingCount > 0 && `• ${pendingCount} en attente`}
          </Text>
        </View>
      )}

      {isOnline && pendingCount > 0 && (
        <TouchableOpacity style={styles.syncBanner} onPress={syncNow} disabled={isSyncing}>
          <Ionicons name={isSyncing ? 'sync' : 'sync-outline'} size={16} color="#fff" />
          <Text style={styles.bannerText}>
            {isSyncing ? 'Synchronisation...' : `Synchroniser ${pendingCount} action(s)`}
          </Text>
        </TouchableOpacity>
      )}

      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="restaurant/[id]" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="dish/[id]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="cart" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="checkout" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="tracking/[orderId]" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="review/[orderId]" options={{ presentation: 'modal' }} />
      </Stack>

      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  loadingLogo: { fontSize: 64, marginBottom: 16 },
  loadingText: { marginTop: 12, fontSize: 16, color: '#666' },
  offlineBanner: { backgroundColor: '#EF4444', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, paddingTop: 50, gap: 8 },
  syncBanner: { backgroundColor: '#F59E0B', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, paddingTop: 50, gap: 8 },
  bannerText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ToastProvider>
        <AuthProvider>
          <RootLayoutContent />
        </AuthProvider>
        </ToastProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
