import { OrderCard } from "@/components/order-card";
import { Colors } from "@/constants/theme";
import { orderAPI } from "@/services/api";
import { Order, OrderStatus } from "@/types";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useI18n } from "@/contexts/i18n-context";
import { router } from "expo-router";
import { ShoppingBag } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type TabKey = "all" | "inProgress" | "delivered" | "cancelled";

const IN_PROGRESS: OrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "picked_up",
  "delivering",
  "on-the-way",
];

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t } = useI18n();

  const TABS: { key: TabKey; label: string }[] = useMemo(() => [
    { key: "all", label: t.orders.all },
    { key: "inProgress", label: t.orders.inProgress },
    { key: "delivered", label: t.orders.delivered },
    { key: "cancelled", label: t.orders.cancelled },
  ], [t]);

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

  const filteredOrders = useMemo(() => {
    switch (activeTab) {
      case "inProgress":
        return orders.filter((o) => IN_PROGRESS.includes(o.status));
      case "delivered":
        return orders.filter((o) => o.status === "delivered");
      case "cancelled":
        return orders.filter((o) => o.status === "cancelled");
      default:
        return orders;
    }
  }, [orders, activeTab]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>{t.orders.title}</Text>
      </View>

      {/* Status filter tabs */}
      <View style={styles.tabsRow}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === tab.key }}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && styles.tabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.centeredState}>
          <ActivityIndicator size="large" color={theme.brand} />
          <Text style={styles.stateText}>{t.common.loading}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <OrderCard
              order={item}
              onPress={() => router.push(`/tracking/${item.id}`)}
              onReview={() => router.push(`/review/${item.id}?restaurantId=${item.restaurantId}`)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onRefresh={onRefresh}
          refreshing={refreshing}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <ShoppingBag size={72} color={theme.border} strokeWidth={1.2} />
              <Text style={styles.emptyText}>{t.orders.noOrders}</Text>
            </View>
          }
        />
      )}
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
      paddingBottom: 12,
      backgroundColor: theme.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: theme.text,
    },
    tabsRow: {
      flexDirection: "row",
      backgroundColor: theme.surface,
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    tab: {
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 20,
      backgroundColor: theme.surfaceAlt,
      borderWidth: 1.5,
      borderColor: "transparent",
    },
    tabActive: {
      backgroundColor: theme.brandSoftAlt,
      borderColor: theme.brand,
    },
    tabText: {
      fontSize: 13,
      color: theme.textMuted,
      fontWeight: "500",
    },
    tabTextActive: {
      color: theme.brand,
      fontWeight: "700",
    },
    listContent: {
      padding: 16,
      gap: 12,
      flexGrow: 1,
    },
    centeredState: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      paddingTop: 80,
    },
    stateText: {
      color: theme.textSecondary,
      fontSize: 14,
    },
    emptyState: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 80,
      gap: 16,
    },
    emptyText: {
      fontSize: 15,
      color: theme.textSecondary,
      textAlign: "center",
    },
  });
