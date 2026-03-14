import { MapPin, Search } from 'lucide-react-native';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { CategoryList } from '@/components/category-list';
import { RestaurantCard } from '@/components/restaurant-card';
import { Brand } from '@/constants/theme';
import { useI18n } from '@/contexts/i18n-context';
import { promoBannerAPI, restaurantAPI } from '@/services/api';
import { locationService } from '@/services/location';
import { PromoBanner, Restaurant } from '@/types';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

// Static fallback when API banner is unavailable
const FALLBACK_BANNER: PromoBanner = {
  id: 'fallback',
  label: 'Offre spéciale',
  title: '-30% sur votre première commande',
  code: 'FOODIE30',
  backgroundColor: Brand.secondary,
};

export default function HomeScreen() {
  const { t, language } = useI18n();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<string>('');
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [banner, setBanner] = useState<PromoBanner | null>(null);

  useEffect(() => {
    initLocation();
    fetchBanner();
  }, []);

  // Re-fetch restaurants whenever coords become available
  useEffect(() => {
    loadRestaurants();
  }, [coords]);

  const initLocation = async () => {
    const position = await locationService.getCurrentLocation();
    if (position) {
      setCoords(position);
      const address = await locationService.reverseGeoCode(position);
      if (address) setLocation(address);
    }
  };

  const fetchBanner = async () => {
    const data = await promoBannerAPI.getBanner();
    setBanner(data);
  };

  const loadRestaurants = useCallback(async () => {
    setError(null);
    try {
      const params = coords
        ? { lat: coords.latitude, lng: coords.longitude, sortBy: 'distance' }
        : {};
      const data = await restaurantAPI.getRestaurants(params as any);
      setRestaurants(data);
    } catch {
      setError(t.home.errorLoad);
    } finally {
      setLoading(false);
    }
  }, [coords, t]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadRestaurants(), fetchBanner()]);
    setRefreshing(false);
  }, [loadRestaurants]);

  // Derive banner display values depending on current language
  const activeBanner = banner ?? FALLBACK_BANNER;
  const bannerLabel =
    language === 'en' && 'label_en' in activeBanner
      ? (activeBanner as any).label_en
      : (activeBanner as any).label_fr ?? activeBanner.label;
  const bannerTitle =
    language === 'en' && 'title_en' in activeBanner
      ? (activeBanner as any).title_en
      : (activeBanner as any).title_fr ?? activeBanner.title;

  const ListHeader = (
    <>
      {/* Promo Banner */}
      <View style={[styles.promoBanner, { backgroundColor: activeBanner.backgroundColor }]}>
        <Text style={styles.promoLabel}>{bannerLabel}</Text>
        <Text style={styles.promoTitle}>{bannerTitle}</Text>
        <Text style={styles.promoCode}>
          {t.home.promoCodePrefix}: {activeBanner.code}
        </Text>
      </View>

      {/* Categories */}
      <CategoryList />

      {/* Section header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t.home.nearby}</Text>
      </View>
    </>
  );

  const ListEmpty = loading ? (
    <View style={styles.centeredState}>
      <ActivityIndicator size="large" color={Brand.primary} />
      <Text style={styles.stateText}>{t.common.loading}</Text>
    </View>
  ) : error ? (
    <View style={styles.centeredState}>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={loadRestaurants}>
        <Text style={styles.retryText}>{t.common.retry}</Text>
      </TouchableOpacity>
    </View>
  ) : (
    <Text style={styles.emptyText}>{t.home.noRestaurantsFound}</Text>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.locationContainer}>
          <MapPin size={20} color="#fff" />
          <View style={{ flex: 1 }}>
            <Text style={styles.locationLabel}>{t.home.deliverTo}</Text>
            <Text style={styles.locationText} numberOfLines={1}>
              {location || t.home.locating}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => router.push('/(tabs)/search')}
          accessibilityRole="button"
          accessibilityLabel={t.home.searchPlaceholder}
        >
          <Search size={20} color="#666" />
          <Text style={styles.searchPlaceholder}>{t.home.searchPlaceholder}</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <FlatList
        data={restaurants}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RestaurantCard
            restaurant={item}
            onPress={() => router.push(`/restaurant/${item.id}`)}
          />
        )}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Brand.primary]}
            tintColor={Brand.primary}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: Brand.primary,
    padding: 16,
    paddingBottom: 20,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  locationLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  locationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.5)',
  },
  listContent: {
    paddingBottom: 24,
  },
  promoBanner: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
  },
  promoLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 1,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  promoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  promoCode: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  centeredState: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  stateText: {
    color: '#666',
    fontSize: 14,
  },
  errorText: {
    color: Brand.danger,
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  retryButton: {
    backgroundColor: Brand.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    paddingVertical: 32,
  },
});