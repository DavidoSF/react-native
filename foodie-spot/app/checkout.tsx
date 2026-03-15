import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Tag } from "lucide-react-native";
import { router } from "expo-router";

import { promoAPI } from "@/services/api";
import { storage, STORAGE_KEYS } from "@/services/storage";
import { CartItem, PromoValidationResult } from "@/types";

export default function CheckoutScreen() {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [promoCode, setPromoCode] = useState('');
    const [promoResult, setPromoResult] = useState<PromoValidationResult | null>(null);
    const [promoError, setPromoError] = useState('');
    const [isValidating, setIsValidating] = useState(false);

    useEffect(() => {
        loadCart();
    }, []);

    useEffect(() => {
        if (promoResult) {
            setPromoResult(null);
            setPromoError('');
        }
    }, [cartItems]);

    const subtotal = useMemo(() => {
        return cartItems.reduce((sum, item) => {
            const price = item?.dish?.price ?? 0;
            const qty = item?.quantity ?? 0;
            return sum + price * qty;
        }, 0);
    }, [cartItems]);

    const restaurantId = useMemo(() => cartItems[0]?.dish?.resurantId, [cartItems]);

    const discountAmount = promoResult && typeof promoResult.discount === 'number'
        ? promoResult.discount
        : 0;
    const total = Math.max(subtotal - discountAmount, 0);

    const discountLabel = promoResult
        ? (promoResult.type === 'delivery'
            ? promoResult.message || 'Livraison gratuite'
            : `-${discountAmount.toFixed(2)} €`)
        : '—';

    const loadCart = async () => {
        const stored = await storage.getItem<CartItem[]>(STORAGE_KEYS.CART);
        if (stored && Array.isArray(stored)) {
            setCartItems(stored);
        } else {
            setCartItems([]);
        }
    };

    const handleValidatePromo = async () => {
        const trimmed = promoCode.trim();
        if (!trimmed) {
            setPromoError('Code promo requis');
            setPromoResult(null);
            return;
        }
        setIsValidating(true);
        setPromoError('');
        try {
            const result = await promoAPI.validatePromo(trimmed, subtotal, restaurantId);
            setPromoResult(result);
        } catch (error: any) {
            const message = error?.response?.data?.message || 'Code promo invalide';
            setPromoError(message);
            setPromoResult(null);
        } finally {
            setIsValidating(false);
        }
    };

    const handleClearPromo = () => {
        setPromoCode('');
        setPromoResult(null);
        setPromoError('');
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <ArrowLeft size={22} color="#111" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Checkout</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Code promo</Text>
                    <View style={styles.promoRow}>
                        <View style={styles.inputWrap}>
                            <Tag size={18} color="#666" />
                            <TextInput
                                style={styles.input}
                                placeholder="Entrer un code"
                                value={promoCode}
                                autoCapitalize="characters"
                                onChangeText={(value) => {
                                    setPromoCode(value);
                                    setPromoError('');
                                }}
                                onSubmitEditing={handleValidatePromo}
                                returnKeyType="send"
                            />
                        </View>
                        <TouchableOpacity
                            style={[styles.applyButton, isValidating && styles.applyButtonDisabled]}
                            onPress={handleValidatePromo}
                            disabled={isValidating}
                        >
                            <Text style={styles.applyButtonText}>{isValidating ? '...' : 'Appliquer'}</Text>
                        </TouchableOpacity>
                    </View>

                    {promoResult && (
                        <View style={styles.promoSuccessRow}>
                            <Text style={styles.promoSuccessText}>
                                {promoResult.message || 'Promo appliquée'}
                            </Text>
                            <TouchableOpacity onPress={handleClearPromo}>
                                <Text style={styles.clearPromoText}>Retirer</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {!!promoError && (
                        <Text style={styles.promoErrorText}>{promoError}</Text>
                    )}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Récapitulatif</Text>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Sous-total</Text>
                        <Text style={styles.summaryValue}>{subtotal.toFixed(2)} €</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Réduction</Text>
                        <Text style={styles.summaryValue}>{discountLabel}</Text>
                    </View>
                    <View style={[styles.summaryRow, styles.summaryTotalRow]}>
                        <Text style={styles.summaryTotalLabel}>Total</Text>
                        <Text style={styles.summaryTotalValue}>{total.toFixed(2)} €</Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    backButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#f5f5f5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: '700',
        color: '#111',
    },
    headerSpacer: {
        width: 36,
        height: 36,
    },
    content: {
        padding: 16,
        gap: 20,
    },
    section: {
        padding: 16,
        borderRadius: 16,
        backgroundColor: '#fafafa',
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111',
        marginBottom: 12,
    },
    promoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    inputWrap: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e6e6e6',
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: '#111',
    },
    applyButton: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: '#FF6B35',
    },
    applyButtonDisabled: {
        opacity: 0.6,
    },
    applyButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    promoSuccessRow: {
        marginTop: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    promoSuccessText: {
        color: '#0a7ea4',
        fontWeight: '600',
    },
    clearPromoText: {
        color: '#666',
        fontWeight: '600',
    },
    promoErrorText: {
        marginTop: 10,
        color: '#d14343',
        fontWeight: '600',
    },
    summaryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    summaryLabel: {
        color: '#666',
        fontSize: 14,
    },
    summaryValue: {
        color: '#111',
        fontWeight: '600',
        fontSize: 14,
    },
    summaryTotalRow: {
        paddingTop: 6,
        borderTopWidth: 1,
        borderTopColor: '#eaeaea',
        marginTop: 8,
    },
    summaryTotalLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111',
    },
    summaryTotalValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111',
    },
});
