import { useEffect, useMemo, useState } from "react";

import { restaurantAPI } from "@/services/api";
import { Dish } from "@/types";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { ArrowLeft, Minus, Plus } from "lucide-react-native";
import { useAppTheme } from "@/hooks/use-app-theme";
import { Colors } from "@/constants/theme";

export default function DishScreen() {
    const { colors } = useAppTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const { id } = useLocalSearchParams<{ id: string }>();
    const [dish, setDish] = useState<Dish | null>(null);
    const [quantity, setQuantity] = useState<number>(1);

    useEffect(() => {
        loadDish();
    }, [id]);

    const loadDish = async () => {
        // const dishData = await restaurantAPI.getDishById(id);
        const dishData = await Promise.all(['r1', 'r2'].map((rid) => restaurantAPI.getMenu(rid)));
        const allDishes = dishData.flat();
        const foundDish = allDishes.find((d) => d.id === id) || null;
        setDish(foundDish);
    };

    if (!dish) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <Text>Loading...</Text>
            </SafeAreaView>
        );
    }
    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.imageWrapper}>
                    <Image source={{ uri: dish.image }} style={styles.image} />
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <ArrowLeft size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>



                <View style={styles.content}>
                    <Text style={styles.name}>{dish.name}</Text>
                    <Text style={styles.description}>{dish.description}</Text>

                    <View style={styles.quantity}>
                        <Text style={styles.price}>{dish.price} €</Text>
                        <View style={styles.qtyControls}>
                            <TouchableOpacity
                                style={[styles.qtyButton, quantity === 1 && styles.qtyButtonDisabled]}
                                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                                disabled={quantity === 1}>
                                <Minus size={18} color={quantity === 1 ? colors.text : colors.card} />
                            </ TouchableOpacity>
                            <Text style={styles.qtyValue}>{quantity}</Text>
                            <TouchableOpacity style={styles.qtyButton} onPress={() => setQuantity(quantity + 1)}>
                                <Plus size={18} color={colors.card} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.addButton}>
                        <Text style={styles.addButtonText}>Ajouter au panier</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </SafeAreaView>
    );

}

const createStyles = (colors: typeof Colors.light) => StyleSheet.create({
    container: {
        flex: 1,
        marginTop: -100,
        backgroundColor: colors.background,
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageWrapper: {
        position: 'relative',
    },
    image: {
        width: '100%',
        height: 280,
    },
    backButton: {
        position: 'absolute',
        top: 16,
        left: 16,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.card,
        padding: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        padding: 16,
        gap: 12
    },
    name: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.text,
    },
    description: {
        color: colors.mutedText,
        lineHeight: 20,
    },
    price: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.accent,
    },
    quantity: {
        flexDirection: 'row',
        alignItems: 'center',
        // gap: 12,
        justifyContent: 'space-between',
    },
    qtyControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    qtyButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.accent,
    },
    qtyButtonDisabled: {
        borderColor: colors.border,
        backgroundColor: colors.cardMuted,
    },
    qtyValue: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
    },
    addButton: {
        backgroundColor: colors.accent,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    }
});
