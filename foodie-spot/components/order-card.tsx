import { Order } from "@/types";
import { Bike, Check, CheckCircle, ChefHat, Clock, Navigation, Package, X } from "lucide-react-native";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useMemo } from "react";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

interface Props {
    order: Order;
    onPress?: () => void;
}

const statusColor: Record<Order['status'],string> = {
    'pending': '#9CA3AF',
    'preparing': '#F59E0B',
    'delivered': '#4CAF50',
    'cancelled': '#F44336', 
    'confirmed': '#2196F3',
    'on-the-way': '#8B5CF6',
    'ready': '#10B981',
    'picked_up': '#6366F1',
    'delivering': '#8B5CF6',
};
const statusIcon: Record<Order['status'], React.ReactNode> = {
    'pending': <Clock size={16} color="#9CA3AF" />,
    'preparing': <ChefHat size={16} color="#F59E0B" />,
    'delivered': <Check size={16} color="#4CAF50" />,
    'cancelled': <X size={16} color="#F44336" />, 
    'confirmed': <CheckCircle size={16} color="#2196F3" />,
    'on-the-way': <Navigation size={16} color="#8B5CF6" />,
    'ready': <Package size={16} color="#10B981" />,
    'picked_up': <Bike size={16} color="#6366F1" />,
    'delivering': <Navigation size={16} color="#8B5CF6" />,
};


export const OrderCard: React.FC<Props> = ({ order, onPress }) => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const styles = useMemo(() => createStyles(theme), [theme]);

    return (
        <TouchableOpacity style={styles.card} onPress={onPress} disabled={!onPress}>
                <View style={styles.header}>
                        <Text style={styles.restaurant}>{order.restaurantName}</Text>
                        <View style={[styles.status, { backgroundColor: statusColor[order.status] }]}>
                            {statusIcon[order.status]}
                            <Text style={styles.statusText}>{order.status.toUpperCase()}</Text>
                        </View>
                </View>

                <Text style={styles.items} numberOfLines={1}>{order.items.map(item => item.dish.name).join(', ')}</Text>
                <View style={styles.footer}>
                    <Text style={styles.total}>Total: {order.total} €</Text>
                    <Text style= {styles.date}>{new Date(order.createdAt).toLocaleDateString()}</Text>
                </View>
        </TouchableOpacity>
    );
}


const createStyles = (theme: typeof Colors.light) =>
    StyleSheet.create({
        card: {
            backgroundColor: theme.surface,
            borderRadius: 16,
            padding: 16,
            marginBottom: 12,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.4,
            shadowRadius: 6,
            elevation: 1,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8,
        },
        restaurant: {
            fontSize: 16,
            fontWeight: '700', 
            flex : 1,
            color: theme.text,
        },
        status: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 12,
        },
        statusText: {
            color: theme.onBrand,
            fontSize: 12,
            fontWeight: '600',
        },
        items: {
            color: theme.textMuted,
            marginBottom: 10,
        },
        footer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        total: {
            fontSize: 16,
            fontWeight: '700',
            color: theme.brand,
        },
        date: {
            fontSize: 12,
            color: theme.textSecondary,
        }
    });
