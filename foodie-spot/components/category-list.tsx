import { Coffee, IceCream2, Pizza, Sandwich, UtensilsCrossed } from 'lucide-react-native';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useMemo } from 'react';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useI18n } from '@/contexts/i18n-context';

const categories = [
    { label: 'Burger', icon: Sandwich },
    { label: 'Pizza', icon: Pizza },
    { label: 'Sushi', icon: UtensilsCrossed },
    { label: 'Healthy', icon: Coffee },
    { label: 'Desserts', icon: IceCream2 },
];

interface CategoryListProps {
    selected?: string | null;
    onSelect?: (label: string) => void;
}

export const CategoryList: React.FC<CategoryListProps> = ({ selected, onSelect }) => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const styles = useMemo(() => createStyles(theme), [theme]);
    const { t } = useI18n();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{t.home.categories}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {categories.map((category) => {
                    const Icon = category.icon;
                    const isActive = selected === category.label;
                    return (
                    <TouchableOpacity
                        key={category.label}
                        style={[styles.chip, isActive && styles.chipActive]}
                        onPress={() => onSelect?.(category.label)}
                    >
                        <Icon size={18} color={isActive ? theme.onBrand : theme.brand} />
                        <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{category.label}</Text>
                    </TouchableOpacity>
                );
                })}
            </ScrollView>
        </View>
    );
};

const createStyles = (theme: typeof Colors.light) =>
    StyleSheet.create({
        container: {
            paddingHorizontal: 16,
            paddingVertical: 12,
        },
        title: {
            fontSize: 16,
            fontWeight: '700',
            marginBottom: 12,
            color: theme.text,
        },
        chip: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            backgroundColor: theme.brandSoftAlt,
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderRadius: 18,
            marginRight: 12,
        },
        chipActive: {
            backgroundColor: theme.brand,
        },
        chipText: {
            color: theme.brand,
            fontWeight: '600',
        },
        chipTextActive: {
            color: theme.onBrand,
        },
    });
