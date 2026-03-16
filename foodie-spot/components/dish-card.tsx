import { Dish } from "@/types";
import { Image } from "expo-image";
import { Plus } from "lucide-react-native";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useMemo } from "react";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

interface Props {
    dish: Dish;
    onPress?: () => void;
}

export const DishCard: React.FC<Props> = ({ dish, onPress }) => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const styles = useMemo(() => createStyles(theme), [theme]);

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
                <Plus size={16} color={theme.onBrand} />
            </View>
        </TouchableOpacity>
    );
}

const createStyles = (theme: typeof Colors.light) =>
    StyleSheet.create({
        card: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.surface,
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
            color: theme.text,
        },
        description: {
            fontSize: 12,
            color: theme.textMuted,
        },
        price: {
            fontSize: 14,
            fontWeight: '700',
            color: theme.brand,
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
            backgroundColor: theme.brand,
            width: 28,
            height: 28,
            borderRadius: 14,
            alignItems: 'center',
            justifyContent: 'center',
        }
    });
