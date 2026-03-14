
import { useState, useEffect, useCallback, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { notifications, NotificationPreferences, PushToken } from "@/services/notification";

const normalizeError = (error: unknown, fallback = 'Une erreur est survenue') => {
    if (error instanceof Error && error.message) return error.message;
    if (typeof error === 'string' && error.trim().length > 0) return error;
    try {
        const serialized = JSON.stringify(error);
        return serialized === '{}' ? fallback : serialized;
    } catch {
        return fallback;
    }
};

export const useNotifications = (
    onReceived?: (notification: Notifications.Notification) => void,
    onTapped?: (datam: any) => void
) => {
    const [pushToken, setPushToken] = useState<PushToken | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasPermission, setHasPermission] = useState(false);
    const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
    const [scheduled, setScheduled] = useState<Notifications.NotificationRequest[]>([]);
    const [badgeCount, setBadgeCount] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const cleanupRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        loadData();
        setupListeners();
        return () => cleanupRef.current?.();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [token, prefs, badge, scheduledList] = await Promise.all([
                notifications.getToken(),
                notifications.getPreferences(),
                notifications.getBadge(),
                notifications.getScheduled(),
            ]);

            setPushToken(token);
            setPreferences(prefs);
            setBadgeCount(badge);
            setScheduled(scheduledList);
            setHasPermission(!!token);
        } catch (err) {
            setError(normalizeError(err));
        } finally {
            setIsLoading(false);
        }
    };

    const setupListeners = () => {
        cleanupRef.current = notifications.setupListeners(
            (n) => onReceived?.(n),
            (r) => onTapped?.(r.notification.request.content.data)
        );
    };

    const initialize = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const token = await notifications.initialize();
            if (token) {
                setPushToken(token);
                setHasPermission(true);
                return token;
            }
            setHasPermission(false);
            setError('Permissions non accordées');
            return token;
        } catch (err) {
            setError(normalizeError(err));
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const send = useCallback((title: string, body: string, data?: any) => {
        return notifications.send(title, body, data);
    }, []);

    const refreshScheduled = useCallback(async () => {
        try {
            const list = await notifications.getScheduled();
            setScheduled(list);
        } catch (err) {
            setError(normalizeError(err));
        }
    }, []);

    const schedule = useCallback(async (title: string, body: string, date: Date, data?: any) => {
        const id = await notifications.schedule(title, body, date, data);
        await refreshScheduled();
        return id;
    }, [refreshScheduled]);



    const scheduleTripReminder = useCallback(async (id: string, title: string, date: Date) => {
        const id_ = await notifications.scheduleTripReminder(id, title, date);
        await refreshScheduled();
        return id_;
    }, [refreshScheduled]);


    const cancel = useCallback(async (id: string) => {
        await notifications.cancel(id);
        await refreshScheduled();
    }, [refreshScheduled]);

    const cancelAll = useCallback(async () => {
        await notifications.cancelAll();
        setScheduled([]);
    }, []);

    const updatePreferences = useCallback(async (updates: Partial<NotificationPreferences>) => {
        const current = preferences || await notifications.getPreferences();
        const updated = { ...current, ...updates };
        await notifications.savePreferences(updated);
        setPreferences(updated);
    }, [preferences]);

    const updateBadge = useCallback(async (count: number) => {
        try {
            await notifications.setBadge(count);
            setBadgeCount(count);
        } catch (err) {
            setError(normalizeError(err));
        }
    }, []);

    const clearBadge = useCallback(async () => {
        try {
            await notifications.clearBadge();
            setBadgeCount(0);
        } catch (err) {
            setError(normalizeError(err));
        }
    }, []);

    const resetInitialization = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            await notifications.clearToken();
            setPushToken(null);
            const { status } = await Notifications.getPermissionsAsync();
            setHasPermission(status === 'granted');
        } catch (err) {
            setError(normalizeError(err));
        } finally {
            setIsLoading(false);
        }
    }, []);

    const clearError = useCallback(() => setError(null), []);
    const reportError = useCallback((err: unknown) => setError(normalizeError(err)), []);

    return {
        pushToken,
        isLoading,
        hasPermission,
        preferences,
        scheduled,
        badgeCount,
        error,
        initialize,
        send,
        schedule,
        scheduleTripReminder,
        cancel,
        cancelAll,
        updatePreferences,
        setBadgeCount: updateBadge,
        clearBadge,
        refreshScheduled,
        resetInitialization,
        clearError,
        reportError,
    };
}

export const useLastNotificationResponse = () => {
    const [response, setResponse] = useState<Notifications.NotificationResponse | null>(null);
    useEffect(() => {
        Notifications.getLastNotificationResponseAsync().then((r) => {
            if (r) setResponse(r);
        });
    }, []);

    return response;
}
