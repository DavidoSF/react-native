import { MapPin, Search } from 'lucide-react-native';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { CategoryList } from '@/components/category-list';
import { RestaurantCard } from '@/components/restaurant-card';
import { restaurantAPI, promoAPI } from '@/services/api';
import { locationService } from '@/services/location';
import { Restaurant } from '@/types';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useI18n } from '@/contexts/i18n-context';

export default function HomeScreen() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [location, setLocation] = useState<string>('Locating...');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [promoBanner, setPromoBanner] = useState<{ code: string; description: string } | null>(null);
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t } = useI18n();

  useEffect(() => {
    loadData();
    getCurrentLocation();
    promoAPI.getBanners().then(banners => {
      if (banners.length > 0) setPromoBanner(banners[0]);
    });
  }, []);

  useEffect(() => {
    loadData();
  }, [selectedCategory]);

  const loadData = async () => {
    try {
      const filters = selectedCategory ? { cuisine: selectedCategory } : undefined;
      const data = await restaurantAPI.getRestaurants(filters);
      setRestaurants(data);
    } catch (error) {
      Alert.alert("Error", "Failed to load restaurants");
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = async () => {
    const coords = await locationService.getCurrentLocation();
    if (coords) {
      const address = await locationService.reverseGeoCode(coords);
      if (address) {
        setLocation(address);
      }
    }

  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  return (
      <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.locationContainer}>
          <MapPin size={20} color={theme.onHeader} />
          <View style= {{ flex: 1}}>
            <Text style={styles.locationLabel}>Livraison à </Text>
            <Text style={styles.locationText} numberOfLines={1}>{location}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.searchBar} onPress={() => router.push('/(tabs)/search')}>
        <Search size={20} color={theme.textMuted} />
        <Text style={styles.searchPlaceholder}>{t.home.searchPlaceholder}</Text>
        </TouchableOpacity>
      </View>


      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.brand} />}
      >
         {promoBanner && (
           <View style={styles.promoBanner}>
             <Text style={styles.promoLabel}>{t.home.specialOffer}</Text>
             <Text style={styles.promoTitle}>{promoBanner.description}</Text>
             <Text style={styles.promoCode}>Code: {promoBanner.code}</Text>
           </View>
         )}

          <CategoryList
            selected={selectedCategory}
            onSelect={(cat) => setSelectedCategory(prev => prev === cat ? null : cat)}
          />

          <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t.home.nearby}</Text>
              {restaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} onPress={() => router.push(`/restaurant/${restaurant.id}`)} />
              ))}
              {!loading && restaurants.length === 0 && <Text style={styles.emptyText}>{t.home.noRestaurantsFound}</Text>}
              {/* {loading && <Text>Chargement des restaurants...</Text>} */}
          </View>
         
      </ScrollView>
    
    </SafeAreaView>
  );

};

const createStyles = (theme: typeof Colors.light) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      backgroundColor: theme.header,
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
      color: theme.onHeader,
      opacity: 0.8,
    },
    locationText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.onHeader,
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: theme.surface,
      borderRadius: 24,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    searchPlaceholder: {
      flex: 1,
      fontSize: 14,
      color: theme.placeholder,
    },
    content: {
      flex: 1,
    },
    promoBanner: {
      margin: 16,
      padding: 16,
      backgroundColor: theme.promo,
      borderRadius: 16,
    },
    promoLabel: {
      fontSize: 10,
      fontWeight: '700',
      color: theme.promoOn,
      letterSpacing: 1,
      marginBottom: 4,
      textTransform: 'uppercase',
    },

    promoTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.promoOn,
      marginBottom: 4,
    },
    promoCode: {
      fontSize: 14,
      color: theme.promoOn,
      opacity: 0.9,
    },
    section: {
      padding: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 16,
      color: theme.text,
    },
    emptyText: {
      color: theme.textMuted,
      textAlign: 'center',
    },
  });
