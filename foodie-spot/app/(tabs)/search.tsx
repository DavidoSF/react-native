import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useRouter } from "expo-router";
import { RestaurantCard } from "@/components/restaurant-card";
import { Brand, Colors } from "@/constants/theme";
import { useI18n } from "@/contexts/i18n-context";
import { restaurantAPI } from "@/services/api";
import { Restaurant, SearchFilters } from "@/types";
import { Filter, Search } from "lucide-react-native";

import { SafeAreaView } from "react-native-safe-area-context";

const CUISINE_FILTERS = ['Burger', 'Pizza', 'Sushi', 'Healthy', 'Desserts'] as const;

export default function SearchScreen() {
    const router = useRouter();
    const { t } = useI18n();
    const [query, setQuery] = useState('');
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [filters, setFilters] = useState<SearchFilters>({});
    const [showFilters, setShowFilters] = useState(false);
    const [loading, setLoading] = useState(false);

    const loadRestaurants = useCallback(async () => {
        setLoading(true);
        try {
            if (query) {
                const data = await restaurantAPI.searchRestaurants(query);
                setRestaurants(data);
            } else {
                const data = await restaurantAPI.getRestaurants(filters);
                setRestaurants(data);
            }
        } finally {
            setLoading(false);
        }
    }, [query, filters]);

    useEffect(() => {
        loadRestaurants();
    }, [loadRestaurants]);

    const toggleCuisine = (cuisine: string) => {
        setFilters((prev) => ({
            ...prev,
            cuisine: prev.cuisine === cuisine ? undefined : cuisine,
        }));
    };

    const resultsLabel =
        restaurants.length === 1
            ? `1 ${t.search.resultsOne}`
            : `${restaurants.length} ${t.search.resultsMany}`;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Search bar */}
            <View style={styles.header}>
                <View style={styles.searchContainer}>
                    <Search size={24} color={Colors.light.text} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder={t.search.placeholder}
                        value={query}
                        onChangeText={setQuery}
                        returnKeyType="search"
                        accessibilityLabel={t.search.placeholder}
                    />
                </View>
                <TouchableOpacity
                    style={styles.filterButton}
                    onPress={() => setShowFilters((v) => !v)}
                    accessibilityLabel={t.search.filterToggle}
                >
                    <Filter size={24} color={Colors.light.text} />
                </TouchableOpacity>
            </View>

            {/* Cuisine filter chips */}
            {showFilters && (
                <View style={styles.filters}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {CUISINE_FILTERS.map((cuisine) => (
                            <TouchableOpacity
                                key={cuisine}
                                style={[
                                    styles.filterChip,
                                    filters.cuisine === cuisine && styles.filterChipActive,
                                ]}
                                onPress={() => toggleCuisine(cuisine)}
                            >
                                <Text
                                    style={[
                                        styles.filterChipText,
                                        filters.cuisine === cuisine && styles.filterChipTextActive,
                                    ]}
                                >
                                    {cuisine}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* Results */}
            <FlatList
                data={restaurants}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <RestaurantCard
                        restaurant={item}
                        onPress={() => router.push(`/restaurant/${item.id}`)}
                    />
                )}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={
                    loading ? null : (
                        <Text style={styles.resultsText}>{resultsLabel}</Text>
                    )
                }
                ListEmptyComponent={
                    loading ? (
                        <View style={styles.centeredState}>
                            <ActivityIndicator size="large" color={Brand.primary} />
                            <Text style={styles.stateText}>{t.common.loading}</Text>
                        </View>
                    ) : (
                        <Text style={styles.emptyText}>{t.search.noResults}</Text>
                    )
                }
                showsVerticalScrollIndicator={false}
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
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 24,
        minHeight: 44,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
    },
    filterButton: {
        padding: 8,
        minWidth: 44,
        minHeight: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    filters: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f5f5f5',
        marginRight: 8,
        minHeight: 36,
        justifyContent: 'center',
    },
    filterChipActive: {
        backgroundColor: Brand.primary,
    },
    filterChipText: {
        fontSize: 14,
        color: '#666',
    },
    filterChipTextActive: {
        color: '#fff',
        fontWeight: '600',
    },
    listContent: {
        padding: 16,
        paddingBottom: 24,
    },
    resultsText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 16,
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
    emptyText: {
        color: '#666',
        textAlign: 'center',
        paddingVertical: 32,
    },
});