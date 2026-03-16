import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCart } from '@/contexts/cart-context';
import { useI18n } from '@/contexts/i18n-context';


export default function CartScreen() {
  const { items, updateQuantity, removeItem, totalItems, subtotal, deliveryFee, total } = useCart();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t } = useI18n();

  const increment = (id: string) => {
    const item = items.find(i => i.dish.id === id);
    if (item) updateQuantity(id, item.quantity + 1);
  };

  const decrement = (id: string) => {
    const item = items.find(i => i.dish.id === id);
    if (item) updateQuantity(id, item.quantity - 1);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>{t.cart.title}</Text>
        <Text style={styles.subtitle}>{totalItems} article{totalItems !== 1 ? 's' : ''}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {items.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>{t.cart.empty}</Text>
            <Text style={styles.emptySubtitle}>{t.cart.emptySubtitle}</Text>
          </View>
        ) : (
          <View style={styles.card}>
            {items.map((item) => (
              <View key={item.dish.id} style={styles.lineItem}>
                <View style={styles.lineInfo}>
                  <Text style={styles.lineName}>{item.dish.name}</Text>
                  <Text style={styles.lineMeta}>{item.dish.price.toFixed(2)} € {t.cart.each}</Text>
                </View>
                <View style={styles.quantityControls}>
                  <TouchableOpacity style={styles.qtyButton} onPress={() => decrement(item.dish.id)}>
                    <Text style={styles.qtyButtonText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.qtyValue}>{item.quantity}</Text>
                  <TouchableOpacity style={styles.qtyButton} onPress={() => increment(item.dish.id)}>
                    <Text style={styles.qtyButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.linePrice}>{(item.dish.price * item.quantity).toFixed(2)} €</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t.cart.summary}</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t.cart.subtotal}</Text>
            <Text style={styles.summaryValue}>{subtotal.toFixed(2)} €</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t.cart.delivery}</Text>
            <Text style={styles.summaryValue}>{deliveryFee.toFixed(2)} €</Text>
          </View>
          <View style={[styles.summaryRow, styles.summaryTotal]}>
            <Text style={styles.summaryTotalLabel}>{t.cart.total}</Text>
            <Text style={styles.summaryTotalValue}>{total.toFixed(2)} €</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.ctaButton, items.length === 0 && styles.ctaButtonDisabled]}
          onPress={() => router.push('/checkout')}
          disabled={items.length === 0}
        >
          <Text style={styles.ctaText}>{t.cart.placeOrder}</Text>
        </TouchableOpacity>
      </View>
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
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 16,
      backgroundColor: theme.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.text,
    },
    subtitle: {
      marginTop: 4,
      color: theme.textMuted,
    },
    content: {
      padding: 20,
      gap: 16,
    },
    card: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 16,
      gap: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 2,
    },
    lineItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    lineInfo: {
      flex: 1,
    },
    lineName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
    },
    lineMeta: {
      marginTop: 4,
      color: theme.textSubtle,
    },
    linePrice: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
    },
    quantityControls: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.surfaceMuted,
      borderRadius: 20,
      paddingHorizontal: 6,
    },
    qtyButton: {
      width: 28,
      height: 28,
      alignItems: 'center',
      justifyContent: 'center',
    },
    qtyButtonText: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.text,
    },
    qtyValue: {
      minWidth: 24,
      textAlign: 'center',
      fontWeight: '600',
      color: theme.text,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.text,
    },
    summaryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    summaryLabel: {
      color: theme.textMuted,
    },
    summaryValue: {
      fontWeight: '600',
      color: theme.text,
    },
    summaryTotal: {
      marginTop: 8,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    summaryTotalLabel: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.text,
    },
    summaryTotalValue: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.text,
    },
    footer: {
      padding: 20,
      backgroundColor: theme.surface,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    ctaButton: {
      backgroundColor: theme.brand,
      paddingVertical: 16,
      borderRadius: 14,
      alignItems: 'center',
    },
    ctaButtonDisabled: {
      opacity: 0.5,
    },
    ctaText: {
      color: theme.onBrand,
      fontSize: 16,
      fontWeight: '700',
    },
    emptyState: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 24,
      alignItems: 'center',
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.text,
    },
    emptySubtitle: {
      marginTop: 6,
      color: theme.textSubtle,
    },
  });
