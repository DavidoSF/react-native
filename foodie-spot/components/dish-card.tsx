import { Dish } from "@/types";
import { Image } from "expo-image";
import { Plus } from "lucide-react-native";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAppTheme } from "@/hooks/use-app-theme";
import { Colors } from "@/constants/theme";
import React, { useMemo } from "react";

interface Props {
    dish: Dish;
    onPress?: () => void;
}

export const DishCard: React.FC<Props> = ({ dish, onPress }) => {
    const { colors } = useAppTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    return (
        <TouchableOpacity style={styles.card} onPress={onPress}>
            <View style={styles.imageContainer}>
                <Image source={{ uri: dish.image }} style={styles.image} />
            </View>
            <View style={styles.info}>
                <Text style={styles.name}>{dish.name}</Text>
                <Text style={styles.description} numberOfLines={2}>{dish.description}</Text>
                <Text style={styles.price}>{dish.price} €</Text>
            </View>
            <View style={styles.addButton}>
                <Plus size={16} color={colors.card} />
            </View>
        </TouchableOpacity>
    );
}

const createStyles = (colors: typeof Colors.light) => StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
    },
    info: {
        flex: 1,
        gap: 6
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
    },
    description: {
        fontSize: 12,
        color: colors.mutedText,
    },
    price: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.accent,
    },
    imageContainer: {
        position: 'relative',
    },
    image: {
        width: 90,
        height: 90,
        borderRadius: 12,
        marginRight: 12,
    },
    addButton: {
        position: 'absolute',
        bottom: 6,
        right: 6,
        backgroundColor: colors.accent,
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    }
});
