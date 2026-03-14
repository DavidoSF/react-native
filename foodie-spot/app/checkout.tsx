import { useMemo, useRef } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { Colors } from '@/constants/theme';

export default function CheckoutScreen() {
  const orderIdRef = useRef(`demo-${Math.floor(1000 + Math.random() * 9000)}`);
  const summary = useMemo(() => {
    const subtotal = 23.0;
    const deliveryFee = 2.5;
    const total = subtotal + deliveryFee;
    return { subtotal, deliveryFee, total };
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Checkout</Text>
        <Text style={styles.subtitle}>Finalisez votre commande</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Adresse de livraison</Text>
          <Text style={styles.cardText}>12 Rue des Fleurs, Paris</Text>
          <Text style={styles.cardSubtext}>Appartement 3B, code 1468</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Paiement</Text>
          <Text style={styles.cardText}>Carte Visa se terminant par 4242</Text>
          <Text style={styles.cardSubtext}>Expiration 12/28</Text>
        </View>

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
          style={styles.ctaButton}
          onPress={() => router.push(`/review/${orderIdRef.current}`)}
        >
          <Text style={styles.ctaText}>Confirmer la commande</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f6f6',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 4,
    color: '#666',
  },
  content: {
    padding: 20,
    gap: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardText: {
    fontSize: 14,
    fontWeight: '600',
  },
  cardSubtext: {
    fontSize: 13,
    color: '#666',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    color: '#666',
  },
  summaryValue: {
    fontWeight: '600',
  },
  summaryTotal: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  summaryTotalValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  ctaButton: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  ctaText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
