import { OrderCard } from "@/components/order-card";
import { orderAPI } from "@/services/api";
import { Order, OrderStatus } from "@/types";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function OrdersScreen() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const styles = useMemo(() => createStyles(theme), [theme]);

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            const data = await orderAPI.getOrders();
            setOrders(data);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadOrders();
        setRefreshing(false);
    }


    const trackableStatuses: OrderStatus[] = [
        'pending',
        'confirmed',
        'preparing',
        'ready',
        'picked_up',
        'delivering',
        'on-the-way',
    ];

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.title}>Mes Commandes</Text>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false} refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.brand} />
            }>
                {orders.length === 0 && !loading ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>ICON</Text>
                        <Text style={styles.emptyText}>Aucune commande trouvée.</Text>
                    </View>
                ) : (
                    orders.map((order) => (
                        <OrderCard
                            key={order.id}
                            order={order}
                            onPress={() => {
                                if (trackableStatuses.includes(order.status) && order.id) {
                                    router.push(`/tracking/${order.id}`);
                                }
                            }}
                        />
                    ))
                )}
            </ScrollView>

        </SafeAreaView>
    );
}

const createStyles = (theme: typeof Colors.light) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.surfaceAlt,
        },
        header: {
            padding: 16,
            backgroundColor: theme.surfaceAlt,
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
        },
        title: {
            fontSize: 24,
            fontWeight: 'bold',
            color: theme.text,
        },
        content: {
            flex: 1,
            padding: 16,
        },
        emptyState: {
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 80,
        },
        emptyIcon: {
            fontSize: 64,
            marginBottom: 16,
        },
        emptyText: {
            fontSize: 16,
            color: theme.textSecondary,
        }
    });
