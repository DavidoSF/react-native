import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { RestaurantCard } from "@/components/restaurant-card";
import { Colors } from "@/constants/theme";
import { restaurantAPI } from "@/services/api";
import { storage, STORAGE_KEYS } from "@/services/storage";
import { Restaurant, SearchFilters } from "@/types";
import { Filter, Search } from "lucide-react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";

import { SafeAreaView } from "react-native-safe-area-context";

const MAX_RECENT_SEARCHES = 8;

export default function SearchScreen() {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [allRestaurants, setAllRestaurants] = useState<Restaurant[]>([]);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [filters, setFilters] = useState<SearchFilters>({});
    const [showFilters, setShowFilters] = useState(false);
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const styles = useMemo(() => createStyles(theme), [theme]);

    useEffect(() => {
        loadRestaurants();
    }, [query, filters]);

    useEffect(() => {
        loadRecentSearches();
    }, []);

    const normalizedQuery = query.trim().toLowerCase();
    const isQueryEmpty = normalizedQuery.length === 0;

    const suggestions = useMemo(() => {
        if (!normalizedQuery) {
            return [];
        }
        const suggestionPool = [
            ...allRestaurants.map(restaurant => restaurant.name),
            ...allRestaurants.map(restaurant => restaurant.cuisine),
        ];
        const uniqueSuggestions = Array.from(
            new Set(suggestionPool.map(item => item.trim()).filter(Boolean))
        );
        return uniqueSuggestions
            .filter(item => item.toLowerCase().includes(normalizedQuery))
            .slice(0, 8);
    }, [allRestaurants, normalizedQuery]);

    const loadRestaurants = async () => {
        const trimmedQuery = query.trim();
        if (trimmedQuery) {
            const data = await restaurantAPI.searchRestaurants(trimmedQuery);
            setRestaurants(data);
        } else {
            const data = await restaurantAPI.getRestaurants(filters);
            setRestaurants(data);
            setAllRestaurants(data);
        }
    };

    const loadRecentSearches = async () => {
        const stored = await storage.getItem<string[]>(STORAGE_KEYS.RECENT_SEARCHES);
        if (stored && Array.isArray(stored)) {
            setRecentSearches(stored);
        }
    };

    const saveRecentSearch = async (term: string) => {
        const trimmed = term.trim();
        if (!trimmed) {
            return;
        }
        try {
            const updated = [
                trimmed,
                ...recentSearches.filter(item => item.toLowerCase() !== trimmed.toLowerCase()),
            ].slice(0, MAX_RECENT_SEARCHES);
            setRecentSearches(updated);
            await storage.setItem(STORAGE_KEYS.RECENT_SEARCHES, updated);
        } catch {
            // ignore storage errors
        }
    };

    const handleSubmitSearch = async () => {
        if (!query.trim()) {
            return;
        }
        await saveRecentSearch(query);
        setQuery(query.trim());
    };

    const handleSuggestionPress = async (term: string) => {
        await saveRecentSearch(term);
        setQuery(term);
    };

    const handleRestaurantPress = async (restaurantId: string) => {
        if (query.trim()) {
            await saveRecentSearch(query);
        }
        router.push(`/restaurant/${restaurantId}`);
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <View style={styles.searchContainer}>
                    <Search size={24} color={theme.text} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Rechercher un restaurant"
                        placeholderTextColor={theme.placeholder}
                        value={query}
                        onChangeText={setQuery}
                        onSubmitEditing={handleSubmitSearch}
                        returnKeyType="search"
                    />
                </View>
                <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilters(!showFilters)}>
                    <Filter size={24} color={theme.text} />
                </TouchableOpacity>
            </View>

            {
                showFilters && (
                    <View style={styles.filters}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {['Burger', 'Pizza', 'Sushi', 'Healthy', 'Desserts'].map((cuisine) => (
                                <TouchableOpacity key={cuisine} style={[styles.filterChip, filters.cuisine === cuisine && styles.filterChipActive]}
                                    onPress={() => setFilters({ ...filters, cuisine: filters.cuisine ? undefined : cuisine })}>
                                    <Text style={[styles.filterChipText, filters.cuisine === cuisine && styles.filterChipTextActive]}>{cuisine}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )
            }

            <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
                {isQueryEmpty && recentSearches.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Recherches récentes</Text>
                        <View style={styles.chipRow}>
                            {recentSearches.map((term) => (
                                <TouchableOpacity key={term} style={styles.chip} onPress={() => handleSuggestionPress(term)}>
                                    <Text style={styles.chipText}>{term}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

                {!isQueryEmpty && suggestions.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Suggestions</Text>
                        {suggestions.map((term) => (
                            <TouchableOpacity key={term} style={styles.suggestionRow} onPress={() => handleSuggestionPress(term)}>
                                <Search size={18} color={theme.icon} />
                                <Text style={styles.suggestionText}>{term}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                <Text style={styles.resultsText}>

                    {restaurants.length} {restaurants.length > 1 ? 'restaurants' : 'restaurant'} trouvés
                </Text>
                {restaurants.map((restaurant) => (
                    <RestaurantCard
                        key={restaurant.id}
                        restaurant={restaurant}
                        onPress={() => handleRestaurantPress(restaurant.id)}
                    />
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

const createStyles = (theme: typeof Colors.light) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.background,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: theme.borderSubtle,
            backgroundColor: theme.surface,
        },
        searchContainer: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            backgroundColor: theme.inputBackground,
            paddingHorizontal: 16,
            paddingVertical: 16,
            borderRadius: 24,
        },
        searchInput: {
            flex: 1,
            fontSize: 16,
            color: theme.text,
        },
        filterButton: {
            padding: 8,
        },
        filters: {
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: theme.borderSubtle,
            backgroundColor: theme.surface,
        },
        filterChip: {
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
            backgroundColor: theme.surfaceMuted,
            marginRight: 8,
        },
        filterChipText: {
            fontSize: 14,
            color: theme.textMuted,
        },
        filterChipTextActive: {
            color: theme.onBrand,
            fontWeight: '600',
        },
        filterChipActive: {
            backgroundColor: theme.brand,
        },
        content: {
            flex: 1,
            padding: 16,
        },
        section: {
            marginBottom: 20,
        },
        sectionTitle: {
            fontSize: 14,
            fontWeight: '600',
            color: theme.text,
            marginBottom: 10,
        },
        chipRow: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
        },
        chip: {
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 18,
            backgroundColor: theme.surfaceMuted,
        },
        chipText: {
            fontSize: 14,
            color: theme.text,
        },
        suggestionRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            paddingVertical: 10,
            borderBottomWidth: 1,
            borderBottomColor: theme.borderSubtle,
        },
        suggestionText: {
            fontSize: 16,
            color: theme.text,
        },
        resultsText: {
            fontSize: 14,
            color: theme.textMuted,
            marginBottom: 16,
        },
    });
