import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Dish, Restaurant, Review } from "@/types";
import { router, useLocalSearchParams } from "expo-router";
import { restaurantAPI, reviewAPI, userAPI } from "@/services/api";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { ArrowLeft, Clock, Heart, MapPin, Navigation, Phone, Share2, Star } from "lucide-react-native";
import { DishCard } from "@/components/dish-card";

export default function RestaurantScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [menu, setMenu] = useState<Dish[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        loadRestaurant();
    }, [id]);

    const loadRestaurant = async () => {
        const restaurantData = await restaurantAPI.getRestaurantById(id);
        const menuData = await restaurantAPI.getMenu(id);
        const reviewData = await reviewAPI.getRestaurantReviews(id);
        setRestaurant(restaurantData);
        setMenu(menuData);
        setReviews(reviewData);
        setIsFavorite(restaurantData?.isFavorite || false);
    };
    const handleToggleFavorite = async () => {
        try {
            await userAPI.toggleFavorite(id);
            setIsFavorite(!isFavorite);
        } catch (error) {
            Alert.alert("Error", "Failed to update favorite status");
        }
    };

    if (!restaurant) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <Text>Loading...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.imageContainer}>
                    <Image source={{ uri: restaurant?.image }} style={styles.image} />
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <ArrowLeft size={24} color="rgba(0,0,0)" />
                    </TouchableOpacity>
                    <View style={styles.headerActions}>
                        <TouchableOpacity style={styles.actionButton} onPress={handleToggleFavorite}>
                            <Heart size={24} color={isFavorite ? '#FF6B35' : '#000'} fill={isFavorite ? '#FF6B35' : 'transparent'} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton} onPress={handleToggleFavorite}>
                            <Share2 size={18} color="#000" />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.info}>
                    <Text style={styles.name}>{restaurant?.name}</Text>
                    <Text style={styles.cuisine}>{restaurant?.cuisine}</Text>
                    <View style={styles.meta}>
                        <View style={styles.metaItem}>
                            <Star size={16} color="#FFC107" fill="#FFC107" />
                            <Text style={styles.metaText}>
                                {restaurant?.rating.toFixed(1)} ({restaurant?.reviewsCount})
                            </Text>
                        </View>
                        <View style={styles.metaItem}>
                            <Clock size={16} color="#666"/>
                            <Text style={styles.metaText}>
                                {typeof restaurant?.deliveryTime === 'object' && restaurant?.deliveryTime !== null
                                    ? `${(restaurant.deliveryTime as { min: number; max: number }).min}-${(restaurant.deliveryTime as { min: number; max: number }).max}` 
                                    : restaurant?.deliveryTime} min
                            </Text>
                        </View>
                         <View style={styles.metaItem}>
                            <MapPin size={16} color="#666"/>
                            <Text style={styles.metaText}>
                                {restaurant?.distance} km
                            </Text>
                        </View>
                    </View>
                    <View style={styles.actions}>
                         <TouchableOpacity style={styles.primaryButton}>
                            <Navigation size={18} color="#fff" />
                            <Text style={styles.primaryButtonText}>Itinéraire</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.secondaryButton}>
                            <Phone size={18} color="#666" />
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

                <View style={styles.reviewsSection}>
                    <Text style={styles.menuTitle}>Avis clients</Text>
                    {reviews.length === 0 ? (
                        <Text style={styles.emptyReviews}>Aucun avis pour le moment.</Text>
                    ) : (
                        reviews.map((review) => (
                            <View key={review.id} style={styles.reviewCard}>
                                <View style={styles.reviewHeader}>
                                    <Text style={styles.reviewAuthor}>{review.userName}</Text>
                                    <View style={styles.reviewRating}>
                                        <Star size={14} color="#FFC107" fill="#FFC107" />
                                        <Text style={styles.reviewRatingText}>{review.rating}</Text>
                                    </View>
                                </View>
                                {!!review.comment && (
                                    <Text style={styles.reviewComment}>{review.comment}</Text>
                                )}
                                {!!review.images?.length && (
                                    <View style={styles.reviewImages}>
                                        {review.images.slice(0, 3).map((uri, index) => (
                                            <Image key={`${review.id}-${index}`} source={{ uri }} style={styles.reviewImage} />
                                        ))}
                                    </View>
                                )}
                                <View style={styles.subRatings}>
                                    {review.qualityRating ? (
                                        <Text style={styles.subRatingText}>Qualite: {review.qualityRating}/5</Text>
                                    ) : null}
                                    {review.speedRating ? (
                                        <Text style={styles.subRatingText}>Vitesse: {review.speedRating}/5</Text>
                                    ) : null}
                                    {review.presentationRating ? (
                                        <Text style={styles.subRatingText}>Presentation: {review.presentationRating}/5</Text>
                                    ) : null}
                                </View>
                            </View>
                        ))
                    )}
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
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
        backgroundColor: '#fff',
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
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    info: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    cuisine: {
        fontSize: 16,
        color: '#666',
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
        color: '#666',
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
        backgroundColor: '#FF6B35',
        borderRadius: 12,
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    secondaryButton: {
         flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        padding: 12,
    },
    secondaryButtonText: {
        color: '#666',
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
    },
    reviewsSection: {
        padding: 16,
        gap: 12,
    },
    emptyReviews: {
        color: '#666',
    },
    reviewCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: '#f0f0f0',
        gap: 8,
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    reviewAuthor: {
        fontWeight: '700',
    },
    reviewRating: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    reviewRatingText: {
        fontWeight: '600',
    },
    reviewComment: {
        color: '#666',
    },
    reviewImages: {
        flexDirection: 'row',
        gap: 8,
    },
    reviewImage: {
        width: 64,
        height: 64,
        borderRadius: 8,
    },
    subRatings: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    subRatingText: {
        fontSize: 12,
        color: '#999',
    },
});
