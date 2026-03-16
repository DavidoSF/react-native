import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    ActivityIndicator,
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { AlertCircle, Bike, Clock, MapPin, Phone, RefreshCw, Star } from "lucide-react-native";
import { Address, OrderStatus, OrderTracking } from "@/types";
import { orderAPI } from "@/services/api";
import { notifications } from "@/services/notification";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useI18n } from "@/contexts/i18n-context";

const POLL_INTERVAL_MS = 15000;

// Progress along the route (0 = restaurant, 1 = destination)
const STATUS_PROGRESS: Record<OrderStatus, number> = {
    pending: 0,
    confirmed: 0,
    preparing: 0.05,
    ready: 0.1,
    picked_up: 0.25,
    delivering: 0.6,
    "on-the-way": 0.6,
    delivered: 1.0,
    cancelled: 0,
};

const statusColors: Record<OrderStatus, string> = {
    pending: "#9CA3AF",
    confirmed: "#2563EB",
    preparing: "#F59E0B",
    ready: "#10B981",
    picked_up: "#6366F1",
    delivering: "#8B5CF6",
    "on-the-way": "#8B5CF6",
    delivered: "#16A34A",
    cancelled: "#DC2626",
};

const formatTime = (value?: string, locale = "fr-FR") => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
};

const formatDate = (value?: string, locale = "fr-FR") => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString(locale, { day: "2-digit", month: "short" });
};

const formatAddress = (address?: Address | string) => {
    if (!address) return "\u2014";
    if (typeof address === "string") return address;
    const line1 = [address.street, address.city, address.postalCode]
        .filter(Boolean)
        .join(", ");
    const line2 = [address.country].filter(Boolean).join(", ");
    const label = address.label ? `${address.label} • ` : "";
    return `${label}${line1}${line2 ? ` • ${line2}` : ""}`;
};

type TimelineEntry = {
    status: OrderStatus;
    timestamp?: string;
    message?: string;
    completed?: boolean;
};

export default function TrackingScreen() {
    const params = useLocalSearchParams<{ orderId?: string | string[] }>();
    const orderId = typeof params.orderId === "string" ? params.orderId : params.orderId?.[0];
    const [tracking, setTracking] = useState<OrderTracking | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const isFetchingRef = useRef(false);
    const hasTrackingRef = useRef(false);
    const previousStatusRef = useRef<OrderStatus | null>(null);
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const styles = useMemo(() => createStyles(theme), [theme]);
    const { t, language } = useI18n();
    const locale = language === 'en' ? 'en-GB' : 'fr-FR';

    // Language-aware status labels built from i18n
    const statusLabels = useMemo<Record<OrderStatus, string>>(() => ({
        pending:     t.tracking.statusPending,
        confirmed:   t.tracking.statusConfirmed,
        preparing:   t.tracking.statusPreparing,
        ready:       t.tracking.statusReady,
        picked_up:   t.tracking.statusPickedUp,
        delivering:  t.tracking.statusDelivering,
        "on-the-way":t.tracking.statusDelivering,
        delivered:   t.tracking.statusDelivered,
        cancelled:   t.tracking.statusCancelled,
    }), [t]);

    // Prefer steps (full journey including future steps); fall back to timeline events only
    const timelineEntries = useMemo<TimelineEntry[]>(() => {
        if (!tracking) return [];
        if (tracking.steps && tracking.steps.length > 0) {
            return tracking.steps.map(step => ({
                status: step.key,
                timestamp: step.time,
                message: step.label,
                completed: step.completed,
            }));
        }
        if (tracking.timeline && tracking.timeline.length > 0) {
            const sortedTimeline = [...tracking.timeline].sort(
                (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            );
            const currentIndex = sortedTimeline.findIndex(item => item.status === tracking.status);
            return sortedTimeline.map((item, index) => ({
                status: item.status,
                timestamp: item.timestamp,
                message: item.message,
                completed: currentIndex >= 0 ? index <= currentIndex : item.status === tracking.status,
            }));
        }
        return [];
    }, [tracking]);

    const loadTracking = useCallback(
        async (options?: { silent?: boolean }) => {
            if (!orderId) {
                setError(t.tracking.noData);
                setLoading(false);
                return;
            }
            if (isFetchingRef.current) {
                return;
            }
            isFetchingRef.current = true;
            if (!options?.silent && !hasTrackingRef.current) {
                setLoading(true);
            }
            try {
                const data = await orderAPI.getOrderTracking(orderId);
                if (data) {
                    hasTrackingRef.current = true;
                    // Fire a local notification when the status advances
                    if (
                        previousStatusRef.current !== null &&
                        data.status !== previousStatusRef.current
                    ) {
                        const label = {
                            pending:     t.tracking.statusPending,
                            confirmed:   t.tracking.statusConfirmed,
                            preparing:   t.tracking.statusPreparing,
                            ready:       t.tracking.statusReady,
                            picked_up:   t.tracking.statusPickedUp,
                            delivering:  t.tracking.statusDelivering,
                            'on-the-way':t.tracking.statusDelivering,
                            delivered:   t.tracking.statusDelivered,
                            cancelled:   t.tracking.statusCancelled,
                        }[data.status] ?? data.status;
                        const body =
                            data.timeline?.slice(-1)[0]?.message ||
                            data.steps?.find(s => s.key === data.status)?.label ||
                            label;
                        await notifications.sendOrderStatus(orderId, label, body);
                    }
                    previousStatusRef.current = data.status;
                    setTracking(data);
                    setError(null);
                } else {
                    setError(t.tracking.noData);
                }
            } catch (err) {
                setError(t.tracking.errorTitle);
            } finally {
                setLoading(false);
                setRefreshing(false);
                setLastUpdated(new Date());
                isFetchingRef.current = false;
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [orderId]
    );

    useEffect(() => {
        hasTrackingRef.current = false;
        previousStatusRef.current = null;
        setTracking(null);
        setError(null);
        setLoading(true);
        loadTracking();
    }, [loadTracking]);

    useEffect(() => {
        if (!orderId) return;
        const interval = setInterval(() => {
            loadTracking({ silent: true });
        }, POLL_INTERVAL_MS);
        return () => clearInterval(interval);
    }, [orderId, loadTracking]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadTracking();
    }, [loadTracking]);

    if (loading && !tracking) {
        return (
            <SafeAreaView style={styles.container} edges={["top"]}>
                <View style={styles.loadingState}>
                    <ActivityIndicator size="large" color={theme.brand} />
                    <Text style={styles.loadingText}>{t.tracking.loadingText}</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!tracking && error) {
        return (
            <SafeAreaView style={styles.container} edges={["top"]}>
                <View style={styles.errorState}>
                    <AlertCircle size={28} color={theme.danger} />
                    <Text style={styles.errorTitle}>{t.tracking.errorTitle}</Text>
                    <Text style={styles.errorMessage}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={() => loadTracking()}>
                        <RefreshCw size={16} color={theme.onBrand} />
                        <Text style={styles.retryText}>{t.common.retry}</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const statusLabel = tracking ? statusLabels[tracking.status] : "";
    const statusColor = tracking ? statusColors[tracking.status] : "#9CA3AF";
    const etaText = tracking?.estimatedMinutes
        ? `${tracking.estimatedMinutes} min`
        : tracking?.estimatedArrival
            ? formatTime(tracking.estimatedArrival, locale)
            : tracking?.estimatedDelivery
                ? formatTime(tracking.estimatedDelivery, locale)
                : "";

    const addressText = formatAddress(tracking?.deliveryAddress);
    const lastUpdatedText = lastUpdated
        ? lastUpdated.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })
        : "";

    const driver = tracking?.driver;
    const driverPhoto = driver?.photo;

    // Map: compute driver progress (0=restaurant, 1=destination)
    const driverProgress = tracking ? (STATUS_PROGRESS[tracking.status] ?? 0) : 0;
    // Use actual GPS-derived progress when available (delivering/picked_up)
    const actualProgress = tracking?.driverLocation
        ? driverProgress  // could compute from lat/lng but simulated value is fine
        : driverProgress;
    // leftPct: 6% at restaurant end, 82% at destination end
    const driverLeftPct = `${6 + actualProgress * 76}%`;
    const showDriverOnMap = driverProgress > 0 && tracking?.status !== 'cancelled';

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.brand} />}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>{t.tracking.title}</Text>
                        <Text style={styles.subtitle}>{tracking?.orderNumber ? `${t.tracking.order} ${tracking.orderNumber}` : `${t.tracking.order} #${tracking?.orderId}`}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                        <Text style={styles.statusText}>{statusLabel}</Text>
                    </View>
                </View>

                {error ? (
                    <View style={styles.inlineError}>
                        <AlertCircle size={18} color={theme.danger} />
                        <Text style={styles.inlineErrorText}>{error}</Text>
                    </View>
                ) : null}

                <View style={styles.summaryCard}>
                    <View style={styles.summaryRow}>
                        <Clock size={18} color={theme.brand} />
                        <View>
                            <Text style={styles.summaryLabel}>{t.tracking.estimatedDelivery}</Text>
                            <Text style={styles.summaryValue}>{etaText || t.tracking.updating}</Text>
                        </View>
                    </View>
                    <View style={styles.summaryRow}>
                        <MapPin size={18} color={theme.brand} />
                        <View style={styles.summaryTextBlock}>
                            <Text style={styles.summaryLabel}>{t.tracking.deliveryAddress}</Text>
                            <Text style={styles.summaryValue}>{addressText}</Text>
                        </View>
                    </View>
                    <View style={styles.summaryMeta}>
                        <View style={styles.liveBadge}>
                            <View style={styles.liveDot} />
                            <Text style={styles.liveText}>{t.tracking.liveTracking}</Text>
                        </View>
                        {lastUpdatedText ? <Text style={styles.updatedText}>{t.tracking.updatedAt} {lastUpdatedText}</Text> : null}
                    </View>
                </View>

                <View style={styles.mapCard}>
                    <View style={styles.mapHeader}>
                        <Text style={styles.sectionTitle}>{t.tracking.map}</Text>
                        <Text style={styles.mapSubtitle}>{t.tracking.mapSubtitle}</Text>
                    </View>
                    <View style={styles.mapCanvas}>
                        <View style={styles.mapRoute} />
                        {/* Restaurant marker (origin) */}
                        <View style={[styles.mapMarker, styles.mapMarkerRestaurant]} />
                        {/* Driver marker — moves along the route based on status */}
                        {showDriverOnMap && (
                            <View style={[styles.mapMarker, styles.mapMarkerDriver, { left: driverLeftPct as any }]} />
                        )}
                        {/* Destination marker */}
                        <View style={[styles.mapMarker, styles.mapMarkerDestination]} />
                        <Text style={[styles.mapLabel, styles.mapLabelRestaurant]}>{t.tracking.restaurant}</Text>
                        <Text style={[styles.mapLabel, styles.mapLabelDestination]}>{t.tracking.you}</Text>
                    </View>
                    <View style={styles.mapFooter}>
                        <Text style={styles.mapFooterText}>{tracking?.restaurant?.name || t.tracking.restaurant}</Text>
                        {showDriverOnMap ? (
                            <Text style={styles.mapFooterText}>
                                {driverProgress >= 1 ? t.tracking.statusDelivered : t.tracking.driverApproaching}
                            </Text>
                        ) : (
                            <Text style={styles.mapFooterText}>{t.tracking.driverUnavailable}</Text>
                        )}
                    </View>
                </View>

                <View style={styles.driverCard}>
                    <Text style={styles.sectionTitle}>{t.tracking.driver}</Text>
                    {driver ? (
                        <View style={styles.driverContent}>
                            {driverPhoto ? (
                                <Image source={{ uri: driverPhoto }} style={styles.driverAvatar} />
                            ) : (
                                <View style={styles.driverAvatarFallback}>
                                    <Bike size={20} color={theme.onBrand} />
                                </View>
                            )}
                            <View style={styles.driverInfo}>
                                <Text style={styles.driverName}>{driver.name}</Text>
                                {driver.vehicle ? <Text style={styles.driverDetail}>{driver.vehicle}</Text> : null}
                                <View style={styles.driverMetaRow}>
                                    {driver.rating ? (
                                        <View style={styles.ratingBadge}>
                                            <Star size={12} color={theme.warning} />
                                            <Text style={styles.ratingText}>{driver.rating.toFixed(1)}</Text>
                                        </View>
                                    ) : null}
                                    {driver.totalDeliveries ? (
                                        <Text style={styles.driverDetail}>{driver.totalDeliveries} {t.tracking.deliveries}</Text>
                                    ) : null}
                                </View>
                            </View>
                            {driver.phone ? (
                                <View style={styles.driverPhone}>
                                    <Phone size={16} color={theme.brand} />
                                    <Text style={styles.driverPhoneText}>{driver.phone}</Text>
                                </View>
                            ) : null}
                        </View>
                    ) : (
                        <Text style={styles.emptyText}>{t.tracking.driverSoon}</Text>
                    )}
                </View>

                <View style={styles.timelineCard}>
                    <Text style={styles.sectionTitle}>{t.tracking.timeline}</Text>
                    {timelineEntries.length === 0 ? (
                        <Text style={styles.emptyText}>{t.tracking.timelineUpdating}</Text>
                    ) : (
                        timelineEntries.map((entry, index) => {
                            const isActive = entry.status === tracking?.status;
                            const isCompleted = entry.completed || isActive;
                            return (
                                <View key={`${entry.status}-${entry.timestamp || index}`} style={styles.timelineRow}>
                                    <View style={styles.timelineMarker}>
                                        <View style={[styles.timelineDot, isCompleted ? styles.timelineDotActive : styles.timelineDot]} />
                                        {index < timelineEntries.length - 1 ? (
                                            <View style={[styles.timelineLine, isCompleted ? styles.timelineLineActive : null]} />
                                        ) : null}
                                    </View>
                                    <View style={styles.timelineContent}>
                                        <Text style={[styles.timelineTitle, isActive && styles.timelineTitleActive, !isCompleted && styles.timelineTitlePending]}>
                                            {entry.message || statusLabels[entry.status]}
                                        </Text>
                                        {entry.timestamp ? (
                                            <Text style={styles.timelineTime}>
                                                {formatTime(entry.timestamp, locale)} • {formatDate(entry.timestamp, locale)}
                                            </Text>
                                        ) : !isCompleted ? (
                                            <Text style={styles.timelineTimePending}>{language === 'en' ? 'Upcoming' : 'À venir'}</Text>
                                        ) : null}
                                    </View>
                                </View>
                            );
                        })
                    )}
                </View>

                <View style={styles.pullHint}>
                    <RefreshCw size={14} color={theme.textSecondary} />
                    <Text style={styles.pullHintText}>{t.tracking.pullToRefresh}</Text>
                </View>

                {tracking?.status === 'delivered' && (
                    <TouchableOpacity
                        style={styles.reviewCta}
                        onPress={() => router.push(`/review/${tracking.orderId}?restaurantId=${tracking.restaurant?.id ?? ''}`)}
                    >
                        <Star size={16} color={theme.onBrand} />
                        <Text style={styles.reviewCtaText}>Laisser un avis</Text>
                    </TouchableOpacity>
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
        content: {
            padding: 16,
            paddingBottom: 32,
            gap: 16,
        },
        loadingState: {
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
        },
        loadingText: {
            color: theme.textMuted,
            fontSize: 14,
        },
        errorState: {
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            gap: 12,
        },
        errorTitle: {
            fontSize: 18,
            fontWeight: "700",
            color: theme.text,
        },
        errorMessage: {
            textAlign: "center",
            color: theme.textMuted,
        },
        retryButton: {
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 999,
            backgroundColor: theme.brand,
            marginTop: 8,
        },
        retryText: {
            color: theme.onBrand,
            fontWeight: "600",
        },
        header: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
        },
        title: {
            fontSize: 22,
            fontWeight: "800",
            color: theme.text,
        },
        subtitle: {
            color: theme.textMuted,
            marginTop: 4,
        },
        statusBadge: {
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 999,
        },
        statusText: {
            color: theme.onBrand,
            fontWeight: "700",
            fontSize: 12,
            textTransform: "uppercase",
        },
        inlineError: {
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            backgroundColor: theme.dangerSoft,
            borderRadius: 12,
            padding: 12,
        },
        inlineErrorText: {
            color: theme.danger,
            flex: 1,
            fontSize: 13,
        },
        summaryCard: {
            backgroundColor: theme.surface,
            borderRadius: 16,
            padding: 16,
            gap: 14,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.06,
            shadowRadius: 10,
            elevation: 2,
        },
        summaryRow: {
            flexDirection: "row",
            alignItems: "flex-start",
            gap: 12,
        },
        summaryLabel: {
            fontSize: 12,
            color: theme.textSecondary,
        },
        summaryValue: {
            fontSize: 15,
            fontWeight: "600",
            color: theme.text,
            marginTop: 2,
        },
        summaryTextBlock: {
            flex: 1,
        },
        summaryMeta: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
        },
        liveBadge: {
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            paddingHorizontal: 10,
            paddingVertical: 6,
            backgroundColor: theme.successSoft,
            borderRadius: 999,
        },
        liveDot: {
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: theme.success,
        },
        liveText: {
            color: theme.success,
            fontSize: 12,
            fontWeight: "600",
        },
        updatedText: {
            fontSize: 12,
            color: theme.textSecondary,
        },
        sectionTitle: {
            fontSize: 16,
            fontWeight: "700",
            color: theme.text,
        },
        mapCard: {
            backgroundColor: theme.surface,
            borderRadius: 16,
            padding: 16,
            gap: 12,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.06,
            shadowRadius: 10,
            elevation: 2,
        },
        mapHeader: {
            gap: 2,
        },
        mapSubtitle: {
            color: theme.textSecondary,
            fontSize: 12,
        },
        mapCanvas: {
            height: 160,
            borderRadius: 14,
            backgroundColor: theme.surfaceMuted,
            overflow: "hidden",
            position: "relative",
            justifyContent: "center",
        },
        mapRoute: {
            height: 3,
            backgroundColor: theme.border,
            marginHorizontal: 20,
            borderRadius: 999,
        },
        mapMarker: {
            position: "absolute",
            width: 14,
            height: 14,
            borderRadius: 7,
        },
        mapMarkerRestaurant: {
            backgroundColor: theme.brand,
            left: 20,
            top: 70,
        },
        mapMarkerDriver: {
            backgroundColor: theme.info,
            left: 120,
            top: 45,
        },
        mapMarkerDestination: {
            backgroundColor: theme.success,
            right: 20,
            top: 90,
        },
        mapLabel: {
            position: "absolute",
            fontSize: 10,
            color: theme.textSecondary,
            fontWeight: "600",
        },
        mapLabelRestaurant: {
            left: 16,
            top: 90,
        },
        mapLabelDestination: {
            right: 16,
            top: 110,
        },
        mapFooter: {
            flexDirection: "row",
            justifyContent: "space-between",
        },
        mapFooterText: {
            fontSize: 12,
            color: theme.textMuted,
            fontWeight: "600",
        },
        driverCard: {
            backgroundColor: theme.surface,
            borderRadius: 16,
            padding: 16,
            gap: 12,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.06,
            shadowRadius: 10,
            elevation: 2,
        },
        driverContent: {
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
        },
        driverAvatar: {
            width: 56,
            height: 56,
            borderRadius: 28,
        },
        driverAvatarFallback: {
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: theme.brand,
            alignItems: "center",
            justifyContent: "center",
        },
        driverInfo: {
            flex: 1,
            gap: 2,
        },
        driverName: {
            fontSize: 16,
            fontWeight: "700",
            color: theme.text,
        },
        driverDetail: {
            fontSize: 12,
            color: theme.textMuted,
        },
        driverMetaRow: {
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            marginTop: 4,
        },
        ratingBadge: {
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
            backgroundColor: theme.warningSoft,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 999,
        },
        ratingText: {
            fontSize: 12,
            fontWeight: "600",
            color: theme.warning,
        },
        driverPhone: {
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            paddingHorizontal: 10,
            paddingVertical: 8,
            borderRadius: 12,
            backgroundColor: theme.brandSoftAlt,
        },
        driverPhoneText: {
            fontSize: 12,
            fontWeight: "600",
            color: theme.brand,
        },
        timelineCard: {
            backgroundColor: theme.surface,
            borderRadius: 16,
            padding: 16,
            gap: 12,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.06,
            shadowRadius: 10,
            elevation: 2,
        },
        timelineRow: {
            flexDirection: "row",
            gap: 12,
        },
        timelineMarker: {
            alignItems: "center",
        },
        timelineDot: {
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: theme.border,
        },
        timelineDotActive: {
            backgroundColor: theme.brand,
        },
        timelineLine: {
            width: 2,
            flex: 1,
            backgroundColor: theme.borderSubtle,
            marginTop: 2,
        },
        timelineContent: {
            flex: 1,
            paddingBottom: 12,
        },
        timelineTitle: {
            fontSize: 14,
            fontWeight: "600",
            color: theme.text,
        },
        timelineTitleActive: {
            color: theme.brand,
        },
        timelineTitlePending: {
            color: theme.textSecondary,
            fontWeight: "400",
        },
        timelineLineActive: {
            backgroundColor: theme.brand,
        },
        timelineTime: {
            marginTop: 4,
            fontSize: 12,
            color: theme.textSecondary,
        },
        timelineTimePending: {
            marginTop: 4,
            fontSize: 12,
            color: theme.textSecondary,
            fontStyle: "italic",
        },
        emptyText: {
            fontSize: 13,
            color: theme.textSecondary,
        },
        pullHint: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            paddingVertical: 8,
        },
        pullHintText: {
            fontSize: 12,
            color: theme.textSecondary,
        },
        reviewCta: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            marginHorizontal: 16,
            marginTop: 8,
            marginBottom: 24,
            paddingVertical: 14,
            borderRadius: 14,
            backgroundColor: theme.brand,
        },
        reviewCtaText: {
            fontSize: 15,
            fontWeight: '700',
            color: theme.onBrand,
        },
    });
