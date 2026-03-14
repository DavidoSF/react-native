import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { Colors } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';

type CartLine = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

const initialItems: CartLine[] = [
  { id: '1', name: 'Classic Burger', price: 12.5, quantity: 1 },
  { id: '2', name: 'Crispy Fries', price: 4.0, quantity: 2 },
  { id: '3', name: 'Cola Zero', price: 2.5, quantity: 1 },
];

export default function CartScreen() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [items, setItems] = useState<CartLine[]>(initialItems);

  const summary = useMemo(() => {
    const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
    const deliveryFee = subtotal > 0 ? 2.5 : 0;
    const total = subtotal + deliveryFee;
    return { subtotal, deliveryFee, total };
  }, [items]);

  const increment = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: item.quantity + 1 } : item))
    );
  };

  const decrement = (id: string) => {
    setItems((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: Math.max(0, item.quantity - 1) } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Panier</Text>
        <Text style={styles.subtitle}>{items.length} articles</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {items.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Votre panier est vide</Text>
            <Text style={styles.emptySubtitle}>Ajoutez des plats pour continuer.</Text>
          </View>
        ) : (
          <View style={styles.card}>
            {items.map((item) => (
              <View key={item.id} style={styles.lineItem}>
                <View style={styles.lineInfo}>
                  <Text style={styles.lineName}>{item.name}</Text>
                  <Text style={styles.lineMeta}>${item.price.toFixed(2)} chacun</Text>
                </View>
                <View style={styles.quantityControls}>
                  <TouchableOpacity style={styles.qtyButton} onPress={() => decrement(item.id)}>
                    <Text style={styles.qtyButtonText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.qtyValue}>{item.quantity}</Text>
                  <TouchableOpacity style={styles.qtyButton} onPress={() => increment(item.id)}>
                    <Text style={styles.qtyButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.linePrice}>${(item.price * item.quantity).toFixed(2)}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Resume</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Sous-total</Text>
            <Text style={styles.summaryValue}>${summary.subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Livraison</Text>
            <Text style={styles.summaryValue}>${summary.deliveryFee.toFixed(2)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.summaryTotal]}>
            <Text style={styles.summaryTotalLabel}>Total</Text>
            <Text style={styles.summaryTotalValue}>${summary.total.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.ctaButton, items.length === 0 && styles.ctaButtonDisabled]}
          onPress={() => router.push('/checkout')}
          disabled={items.length === 0}
        >
          <Text style={styles.ctaText}>Passer la commande</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 16,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
    },
    subtitle: {
      marginTop: 4,
      color: colors.mutedText,
    },
    content: {
      padding: 20,
      gap: 16,
    },
    card: {
      backgroundColor: colors.card,
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
      color: colors.text,
    },
    lineMeta: {
      marginTop: 4,
      color: colors.mutedText,
    },
    linePrice: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    quantityControls: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.cardMuted,
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
      color: colors.text,
    },
    qtyValue: {
      minWidth: 24,
      textAlign: 'center',
      fontWeight: '600',
      color: colors.text,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
    summaryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    summaryLabel: {
      color: colors.mutedText,
    },
    summaryValue: {
      fontWeight: '600',
      color: colors.text,
    },
    summaryTotal: {
      marginTop: 8,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    summaryTotalLabel: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
    summaryTotalValue: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
    footer: {
      padding: 20,
      backgroundColor: colors.card,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    ctaButton: {
      backgroundColor: colors.tint,
      paddingVertical: 16,
      borderRadius: 14,
      alignItems: 'center',
    },
    ctaButtonDisabled: {
      opacity: 0.5,
    },
    ctaText: {
      color: colors.card,
      fontSize: 16,
      fontWeight: '700',
    },
    emptyState: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 24,
      alignItems: 'center',
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
    emptySubtitle: {
      marginTop: 6,
      color: colors.mutedText,
    },
  });
