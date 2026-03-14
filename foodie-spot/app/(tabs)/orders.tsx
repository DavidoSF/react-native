import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ShoppingBag } from 'lucide-react-native';
import { OrderCard } from '@/components/order-card';
import { Brand } from '@/constants/theme';
import { useI18n } from '@/contexts/i18n-context';
import { orderAPI } from '@/services/api';
import { Order } from '@/types';

type Tab = 'all' | 'inProgress' | 'delivered' | 'cancelled';

const IN_PROGRESS: Order['status'][] = ['pending', 'confirmed', 'preparing', 'on-the-way'];

export default function OrdersScreen() {
    const { t } = useI18n();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<Tab>('all');

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
    };

    const filteredOrders = orders.filter((o) => {
        if (activeTab === 'all') return true;
        if (activeTab === 'inProgress') return IN_PROGRESS.includes(o.status);
        if (activeTab === 'delivered') return o.status === 'delivered';
        if (activeTab === 'cancelled') return o.status === 'cancelled';
        return true;
    });

    const tabs: { key: Tab; label: string }[] = [
        { key: 'all', label: t.orders.all },
        { key: 'inProgress', label: t.orders.inProgress },
        { key: 'delivered', label: t.orders.delivered },
        { key: 'cancelled', label: t.orders.cancelled },
    ];

    const handlePress = (order: Order) => {
        router.push(`/tracking/${order.id}`);
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.title}>{t.orders.title}</Text>
            </View>

            {/* Status filter tabs */}
            <View style={styles.tabsRow}>
                {tabs.map((tab) => (
                    <TouchableOpacity
                        key={tab.key}
                        style={[styles.tab, activeTab === tab.key && styles.tabActive]}
                        onPress={() => setActiveTab(tab.key)}
                        accessibilityRole="tab"
                        accessibilityState={{ selected: activeTab === tab.key }}
                    >
                        <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {loading ? (
                <View style={styles.centeredState}>
                    <ActivityIndicator size="large" color={Brand.primary} />
                    <Text style={styles.stateText}>{t.common.loading}</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredOrders}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <OrderCard order={item} onPress={() => handlePress(item)} />
                    )}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    onRefresh={onRefresh}
                    refreshing={refreshing}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <ShoppingBag size={72} color="#ddd" strokeWidth={1.2} />
                            <Text style={styles.emptyText}>{t.orders.noOrders}</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    tabsRow: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    tab: {
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 20,
        backgroundColor: '#f5f5f5',
        borderWidth: 1.5,
        borderColor: 'transparent',
    },
    tabActive: {
        backgroundColor: Brand.primaryLight,
        borderColor: Brand.primary,
    },
    tabText: {
        fontSize: 13,
        color: '#666',
        fontWeight: '500',
    },
    tabTextActive: {
        color: Brand.primary,
        fontWeight: '700',
    },
    listContent: {
        padding: 16,
        gap: 12,
        flexGrow: 1,
    },
    centeredState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        paddingTop: 80,
    },
    stateText: {
        color: '#888',
    },
    emptyState: {
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
    },
});

