import { useEffect, useMemo, useState } from "react";
import { Alert, Linking, Platform, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Dish, Restaurant } from "@/types";
import { router, useLocalSearchParams } from "expo-router";
import { restaurantAPI, userAPI } from "@/services/api";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { ArrowLeft, Clock, Heart, MapPin, Navigation, Phone, Share2, Star } from "lucide-react-native";
import { DishCard } from "@/components/dish-card";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function RestaurantScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [menu, setMenu] = useState<Dish[]>([]);
    const [isFavorite, setIsFavorite] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const styles = useMemo(() => createStyles(theme), [theme]);

    useEffect(() => {
        loadRestaurant();
    }, [id]);

    const loadRestaurant = async () => {
        if (!id) {
            setIsLoading(false);
            setError("Identifiant du restaurant manquant.");
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const [restaurantData, menuData] = await Promise.all([
                restaurantAPI.getRestaurantById(id),
                restaurantAPI.getMenu(id),
            ]);
            setRestaurant(restaurantData);
            setMenu(menuData);
            setIsFavorite(restaurantData?.isFavorite || false);
        } catch (err) {
            setError("Impossible de charger le restaurant pour le moment.");
        } finally {
            setIsLoading(false);
        }
    };
    const handleToggleFavorite = async () => {
        try {
            await userAPI.toggleFavorite(id);
            setIsFavorite(!isFavorite);
        } catch (error) {
            Alert.alert("Error", "Failed to update favorite status");
        }
    };

    const deliveryTimeLabel = useMemo(() => {
        if (!restaurant?.deliveryTime) return "N/A";
        if (typeof restaurant.deliveryTime === "number") {
            return `${restaurant.deliveryTime} min`;
        }
        return `${restaurant.deliveryTime.min}-${restaurant.deliveryTime.max} min`;
    }, [restaurant?.deliveryTime]);

    const handleOpenMaps = async () => {
        if (!restaurant) return;
        try {
            const { coordinates, address, name } = restaurant;
            const hasCoords =
                coordinates &&
                Number.isFinite(coordinates.latitude) &&
                Number.isFinite(coordinates.longitude);

            if (!hasCoords && !address) {
                Alert.alert("Adresse indisponible", "Aucune adresse n'est associée à ce restaurant.");
                return;
            }

            const label = encodeURIComponent(name);
            const coords = hasCoords ? `${coordinates.latitude},${coordinates.longitude}` : "";
            const encodedAddress = address ? encodeURIComponent(address) : "";

            const iosUrl = hasCoords
                ? `http://maps.apple.com/?ll=${coords}&q=${label}`
                : `http://maps.apple.com/?q=${encodedAddress}`;
            const androidUrl = hasCoords
                ? `geo:${coords}?q=${coords}(${label})`
                : `geo:0,0?q=${encodedAddress}(${label})`;
            const webUrl = `https://www.google.com/maps/search/?api=1&query=${hasCoords ? coords : encodedAddress || label}`;

            const primaryUrl = Platform.OS === "ios" ? iosUrl : androidUrl;
            const canOpen = await Linking.canOpenURL(primaryUrl);
            await Linking.openURL(canOpen ? primaryUrl : webUrl);
        } catch (err) {
            Alert.alert("Erreur", "Impossible d'ouvrir l'application Plans.");
        }
    };

    const handleCall = async () => {
        if (!restaurant?.phone) {
            Alert.alert("Numéro indisponible", "Ce restaurant n'a pas de numéro de téléphone.");
            return;
        }

        try {
            const sanitized = restaurant.phone.replace(/[^\d+]/g, "");
            const url = `tel:${sanitized}`;
            const canOpen = await Linking.canOpenURL(url);
            if (!canOpen) {
                Alert.alert("Appel non supporté", "Impossible d'initier l'appel sur cet appareil.");
                return;
            }
            await Linking.openURL(url);
        } catch (err) {
            Alert.alert("Erreur", "Impossible d'initier l'appel.");
        }
    };

    const handleShare = async () => {
        if (!restaurant) return;
        try {
            const message = `${restaurant.name}\n${restaurant.cuisine}\n${restaurant.address}`;
            await Share.share({ message, title: restaurant.name });
        } catch (err) {
            Alert.alert("Erreur", "Impossible de partager ce restaurant.");
        }
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.skeletonHero} />
                    <View style={styles.skeletonContent}>
                        <View style={styles.skeletonTitle} />
                        <View style={styles.skeletonSubtitle} />
                        <View style={styles.skeletonMetaRow}>
                            <View style={styles.skeletonPill} />
                            <View style={styles.skeletonPill} />
                            <View style={styles.skeletonPill} />
                        </View>
                        <View style={styles.skeletonActions}>
                            <View style={styles.skeletonButton} />
                            <View style={styles.skeletonButton} />
                        </View>
                    </View>
                    <View style={styles.skeletonMenu}>
                        <View style={styles.skeletonMenuTitle} />
                        <View style={styles.skeletonDish} />
                        <View style={styles.skeletonDish} />
                        <View style={styles.skeletonDish} />
                    </View>
                </ScrollView>
            </SafeAreaView>
        );
    }

    if (error || !restaurant) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.errorState}>
                    <Text style={styles.errorTitle}>Oups...</Text>
                    <Text style={styles.errorText}>{error || "Restaurant introuvable."}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={loadRestaurant}>
                        <Text style={styles.retryButtonText}>Réessayer</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.imageContainer}>
                    <Image source={{ uri: restaurant?.image }} style={styles.image} />
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <ArrowLeft size={24} color={theme.text} />
                    </TouchableOpacity>
                    <View style={styles.headerActions}>
                        <TouchableOpacity style={styles.actionButton} onPress={handleToggleFavorite}>
                            <Heart size={24} color={isFavorite ? theme.brand : theme.text} fill={isFavorite ? theme.brand : 'transparent'} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                            <Share2 size={18} color={theme.text} />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.info}>
                    <Text style={styles.name}>{restaurant?.name}</Text>
                    <Text style={styles.cuisine}>{restaurant?.cuisine}</Text>
                    <View style={styles.meta}>
                        <View style={styles.metaItem}>
                            <Star size={16} color={theme.warning} fill={theme.warning} />
                            <Text style={styles.metaText}>
                                {restaurant?.rating.toFixed(1)} ({restaurant?.reviewsCount})
                            </Text>
                        </View>
                        <View style={styles.metaItem}>
                            <Clock size={16} color={theme.textMuted}/>
                            <Text style={styles.metaText}>
                                {deliveryTimeLabel}
                            </Text>
                        </View>
                         <View style={styles.metaItem}>
                            <MapPin size={16} color={theme.textMuted}/>
                            <Text style={styles.metaText}>
                                {restaurant?.distance} km
                            </Text>
                        </View>
                    </View>
                    <View style={styles.actions}>
                         <TouchableOpacity style={styles.primaryButton} onPress={handleOpenMaps}>
                            <Navigation size={18} color={theme.onBrand} />
                            <Text style={styles.primaryButtonText}>Itinéraire</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.secondaryButton} onPress={handleCall}>
                            <Phone size={18} color={theme.textMuted} />
                            <Text style={styles.secondaryButtonText}>Appeler</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.menu}>
                    <Text style={styles.menuTitle}>Menu</Text>
                    {menu.map((dish) => (
                        <DishCard key={dish.id} dish={dish} onPress={() => router.push(`/dish/${dish.id}`)} />  
                        ))}  
                </View>


            </ScrollView>
        </SafeAreaView>
    );
}

const createStyles = (theme: typeof Colors.light) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.background,
            marginTop: -50,
        },
        imageContainer: {
            position: 'relative',
            height: 200,
        },
        image: {
            width: '100%',
            height: '100%'
        },
        backButton: {
            position: 'absolute',
            top: 50,
            left: 16,
            borderRadius: 20,
            backgroundColor: theme.surface,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 8,
        },
        headerActions: {
            position: 'absolute',
            top: 16,
            right: 16,
            flexDirection: 'row',
            gap: 8,
        },
        actionButton: {
            marginTop: 34,
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: theme.surface,
            alignItems: 'center',
            justifyContent: 'center',
        },
        info: {
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: theme.borderSubtle,
        },
        name: {
            fontSize: 24,
            fontWeight: 'bold',
            marginBottom: 4,
            color: theme.text,
        },
        cuisine: {
            fontSize: 16,
            color: theme.textMuted,
            marginBottom: 12,
        },
        meta: {
            flexDirection: 'row',
            gap: 16,
            marginBottom: 16,
        },
        metaItem: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
        },
        metaText: {
            fontSize: 14,
            color: theme.textMuted,
        },
        actions: {
            flexDirection: 'row',
            gap: 12,
        },
        primaryButton: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            backgroundColor: theme.brand,
            borderRadius: 12,
            padding: 12,
        },
        primaryButtonText: {
            color: theme.onBrand,
            fontSize: 16,
            fontWeight: '600',
        },
        secondaryButton: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            backgroundColor: theme.surfaceMuted,
            borderRadius: 12,
            padding: 12,
        },
        secondaryButtonText: {
            color: theme.textMuted,
            fontSize: 16,
            fontWeight: '600',
        },
        menu: {
            padding: 16,
        },
        menuTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            marginBottom: 16,
            color: theme.text,
        },
        skeletonHero: {
            height: 220,
            backgroundColor: theme.skeletonAlt,
        },
        skeletonContent: {
            padding: 16,
        },
        skeletonTitle: {
            height: 24,
            width: '65%',
            backgroundColor: theme.skeleton,
            borderRadius: 12,
            marginBottom: 10,
        },
        skeletonSubtitle: {
            height: 16,
            width: '40%',
            backgroundColor: theme.skeleton,
            borderRadius: 12,
            marginBottom: 16,
        },
        skeletonMetaRow: {
            flexDirection: 'row',
            gap: 12,
            marginBottom: 16,
        },
        skeletonPill: {
            height: 18,
            width: 80,
            backgroundColor: theme.skeleton,
            borderRadius: 999,
        },
        skeletonActions: {
            flexDirection: 'row',
            gap: 12,
        },
        skeletonButton: {
            flex: 1,
            height: 44,
            backgroundColor: theme.skeleton,
            borderRadius: 12,
        },
        skeletonMenu: {
            padding: 16,
        },
        skeletonMenuTitle: {
            height: 20,
            width: 120,
            backgroundColor: theme.skeleton,
            borderRadius: 10,
            marginBottom: 16,
        },
        skeletonDish: {
            height: 92,
            backgroundColor: theme.skeletonAlt,
            borderRadius: 16,
            marginBottom: 12,
        },
        errorState: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
        },
        errorTitle: {
            fontSize: 20,
            fontWeight: '700',
            color: theme.text,
            marginBottom: 8,
        },
        errorText: {
            fontSize: 14,
            color: theme.textMuted,
            textAlign: 'center',
            marginBottom: 16,
        },
        retryButton: {
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 12,
            backgroundColor: theme.brand,
        },
        retryButtonText: {
            color: theme.onBrand,
            fontSize: 14,
            fontWeight: '600',
        },
    }); 
