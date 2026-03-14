import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Heart } from 'lucide-react-native';
import { RestaurantCard } from '@/components/restaurant-card';
import { Brand } from '@/constants/theme';
import { useI18n } from '@/contexts/i18n-context';
import { userAPI } from '@/services/api';
import { Restaurant } from '@/types';

export default function FavoritesScreen() {
    const router = useRouter();
    const { language } = useI18n();
    const [favorites, setFavorites] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        userAPI.getFavorites()
            .then(setFavorites)
            .finally(() => setLoading(false));
    }, []);

    const title = language === 'fr' ? 'Mes favoris' : 'My favourites';

    return (
        <>
            <Stack.Screen options={{ title, headerBackTitle: '' }} />
            <SafeAreaView style={styles.container} edges={['bottom']}>
                {loading ? (
                    <View style={styles.centered}>
                        <ActivityIndicator size="large" color={Brand.primary} />
                    </View>
                ) : (
                    <FlatList
                        data={favorites}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <RestaurantCard
                                restaurant={item}
                                onPress={() => router.push(`/restaurant/${item.id}`)}
                            />
                        )}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={styles.empty}>
                                <Heart size={64} color="#ddd" strokeWidth={1.2} />
                                <Text style={styles.emptyText}>
                                    {language === 'fr'
                                        ? "Aucun restaurant favori pour l'instant."
                                        : 'No favourite restaurants yet.'}
                                </Text>
                            </View>
                        }
                    />
                )}
            </SafeAreaView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    centered: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    listContent: {
        padding: 16,
        gap: 12,
        flexGrow: 1,
    },
    empty: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 80,
        gap: 16,
    },
    emptyText: {
        fontSize: 15,
        color: '#aaa',
        textAlign: 'center',
        paddingHorizontal: 32,
    },
});
