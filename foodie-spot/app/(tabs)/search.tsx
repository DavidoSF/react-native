import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
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
import { categoryAPI, restaurantAPI } from "@/services/api";
import { Category, Restaurant, SearchFilters } from "@/types";
import { Filter, Search } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const DEBOUNCE_MS = 400;

export default function SearchScreen() {
    const router = useRouter();
    const { t } = useI18n();
    const [query, setQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [filters, setFilters] = useState<SearchFilters>({});
    const [showFilters, setShowFilters] = useState(false);
    const [loading, setLoading] = useState(false);
    const [categoriesLoading, setCategoriesLoading] = useState(true);

    // Debounce: propagate query to debouncedQuery after 400 ms of inactivity
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(query), DEBOUNCE_MS);
        return () => clearTimeout(timer);
    }, [query]);

    // Load categories once on mount
    useEffect(() => {
        setCategoriesLoading(true);
        categoryAPI.getCategories()
            .then(setCategories)
            .finally(() => setCategoriesLoading(false));
    }, []);

    const loadRestaurants = useCallback(async () => {
        setLoading(true);
        try {
            if (debouncedQuery) {
                const data = await restaurantAPI.searchRestaurants(debouncedQuery);
                setRestaurants(data);
            } else {
                const data = await restaurantAPI.getRestaurants(filters);
                setRestaurants(data);
            }
        } finally {
            setLoading(false);
        }
    }, [debouncedQuery, filters]);

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

    const renderFilterChip = ({ item }: { item: Category }) => {
        const active = filters.cuisine === item.name;
        return (
            <TouchableOpacity
                style={[styles.filterChip, active && styles.filterChipActive]}
                onPress={() => toggleCuisine(item.name)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: active }}
            >
                <Text style={styles.filterChipIcon}>{item.icon}</Text>
                <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                    {item.name}
                </Text>
            </TouchableOpacity>
        );
    };

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
                    style={[styles.filterButton, showFilters && styles.filterButtonActive]}
                    onPress={() => setShowFilters((v) => !v)}
                    accessibilityLabel={t.search.filterToggle}
                >
                    <Filter size={24} color={showFilters ? Brand.primary : Colors.light.text} />
                </TouchableOpacity>
            </View>

            {/* Cuisine filter chips */}
            {showFilters && (
                <View style={styles.filters}>
                    {categoriesLoading ? (
                        <ActivityIndicator size="small" color={Brand.primary} style={styles.chipsLoader} />
                    ) : (
                        <FlatList
                            data={categories}
                            keyExtractor={(item) => item.id}
                            renderItem={renderFilterChip}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.chipsContent}
                        />
                    )}
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
                        <View style={styles.centeredState}>
                            <Text style={styles.emptyText}>{t.search.noResults}</Text>
                        </View>
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
        borderRadius: 22,
    },
    filterButtonActive: {
        backgroundColor: Brand.primaryLight,
    },
    filters: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    chipsLoader: {
        marginHorizontal: 16,
    },
    chipsContent: {
        paddingHorizontal: 16,
        gap: 8,
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f5f5f5',
        borderWidth: 1.5,
        borderColor: 'transparent',
        minHeight: 36,
    },
    filterChipActive: {
        backgroundColor: Brand.primaryLight,
        borderColor: Brand.primary,
    },
    filterChipIcon: {
        fontSize: 14,
    },
    filterChipText: {
        fontSize: 13,
        color: '#444',
        fontWeight: '500',
    },
    filterChipTextActive: {
        color: Brand.primary,
        fontWeight: '700',
    },
    listContent: {
        padding: 16,
        gap: 12,
        flexGrow: 1,
    },
    resultsText: {
        fontSize: 13,
        color: '#888',
        marginBottom: 8,
    },
    centeredState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 64,
    },
    stateText: {
        marginTop: 12,
        color: '#888',
    },
    emptyText: {
        textAlign: 'center',
        color: '#888',
        fontSize: 15,
    },
});

