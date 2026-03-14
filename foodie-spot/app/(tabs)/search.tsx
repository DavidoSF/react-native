import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { RestaurantCard } from "@/components/restaurant-card";
import { Colors } from "@/constants/theme";
import { restaurantAPI } from "@/services/api";
import { Restaurant, SearchFilters } from "@/types";
import { Filter, Search } from "lucide-react-native";
import { useAppTheme } from "@/hooks/use-app-theme";

import { SafeAreaView } from "react-native-safe-area-context";

export default function SearchScreen() {
    const { colors } = useAppTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [filters, setFilters] = useState<SearchFilters>({});
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        loadRestaurants();
    }, [query, filters]);

    const loadRestaurants = async () => {
        if (query) {
            const data = await restaurantAPI.searchRestaurants(query);
            setRestaurants(data);
        } else {
            const data = await restaurantAPI.getRestaurants(filters);
            setRestaurants(data);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <View style={styles.searchContainer}>
                    <Search size={24} color={colors.text} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Rechercher un restaurant"
                        placeholderTextColor={colors.placeholder}
                        value={query}
                        onChangeText={setQuery}
                    />
                </View>
                <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilters(!showFilters)}>
                    <Filter size={24} color={colors.text} />
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

            <ScrollView style={styles.content}>
                <Text style={styles.resultsText}>

                    {restaurants.length} {restaurants.length > 1 ? 'restaurants' : 'restaurant'} trouvés
                </Text>
                {restaurants.map((restaurant) => (
                    <RestaurantCard key={restaurant.id} restaurant={restaurant} onPress={() => router.push(`/restaurant/${restaurant.id}`)} />
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

const createStyles = (colors: typeof Colors.light) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: colors.cardMuted,
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderRadius: 24,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: colors.text,
    },
    filterButton: {
        padding: 8,
    },
    filters: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: colors.cardMuted,
        marginRight: 8,
    },
    filterChipActive: {
        backgroundColor: colors.accent,
    },
    filterChipText: {
        fontSize: 14,
        color: colors.mutedText,
    },
    filterChipTextActive: {
        color: colors.card,
        fontWeight: '600',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    resultsText: {
        fontSize: 14,
        color: colors.mutedText,
        marginBottom: 16,
    },
});
