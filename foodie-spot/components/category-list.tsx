import { Coffee, IceCream2, Pizza, Sandwich, UtensilsCrossed } from 'lucide-react-native';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/theme';
import React, { useMemo } from 'react';

export const CategoryList: React.FC = () => {
    const { colors } = useAppTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    const categories = [
        { label: 'Burger', icon: <Sandwich size={18} color={colors.accent} /> },
        { label: 'Pizza', icon: <Pizza size={18} color={colors.accent} /> },
        { label: 'Sushi', icon: <UtensilsCrossed size={18} color={colors.accent} /> },
        { label: 'Healthy', icon: <Coffee size={18} color={colors.accent} /> },
        { label: 'Desserts', icon: <IceCream2 size={18} color={colors.accent} /> },
    ];

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Catégories</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {categories.map((category) => (
                    <TouchableOpacity key={category.label} style={styles.chip}>
                        {category.icon}
                        <Text style={styles.chipText}>{category.label}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const createStyles = (colors: typeof Colors.light) => StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 12,
        color: colors.text,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: colors.cardMuted,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 18,
        marginRight: 12,
    },
    chipText: {
        color: colors.accent,
        fontWeight: '600',
    }
});
