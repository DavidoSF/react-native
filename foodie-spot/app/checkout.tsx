import { useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function CheckoutScreen() {
  const [promoCode, setPromoCode] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const orderIdRef = useRef(`demo-${Math.floor(1000 + Math.random() * 9000)}`);
  const restaurantIdRef = useRef('r1');
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const styles = useMemo(() => createStyles(theme), [theme]);

  const summary = useMemo(() => {
    const subtotal = 23.0;
    const deliveryFee = 2.5;
    const discount = promoCode.trim() ? 2.0 : 0;
    const total = subtotal + deliveryFee - discount;
    return { subtotal, deliveryFee, discount, total };
  }, [promoCode]);

  if (isConfirmed) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
          <View style={styles.confirmationCard}>
          <View style={styles.confirmationIcon}>
            <Ionicons name="checkmark" size={32} color={theme.onBrand} />
          </View>
          <Text style={styles.confirmationTitle}>Commande confirmee</Text>
          <Text style={styles.confirmationSubtitle}>
            Numero {orderIdRef.current}
          </Text>
          <Text style={styles.confirmationMessage}>
            Votre commande est en preparation. Nous vous notifierons quand elle partira.
          </Text>

          <View style={styles.confirmationActions}>
            <TouchableOpacity
              style={[styles.ctaButton, styles.ctaSecondary]}
              onPress={() => router.replace('/(tabs)')}
            >
              <Text style={styles.ctaSecondaryText}>Retour accueil</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() =>
                router.push(
                  `/review/${orderIdRef.current}?restaurantId=${restaurantIdRef.current}`
                )
              }
            >
              <Text style={styles.ctaText}>Laisser un avis</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

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
          <TouchableOpacity style={styles.linkButton}>
            <Text style={styles.linkButtonText}>Modifier</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Methode de paiement</Text>
          <Text style={styles.cardText}>Carte Visa se terminant par 4242</Text>
          <Text style={styles.cardSubtext}>Expiration 12/28</Text>
          <TouchableOpacity style={styles.linkButton}>
            <Text style={styles.linkButtonText}>Changer</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Code promo</Text>
          <View style={styles.promoRow}>
              <TextInput
                style={styles.promoInput}
                placeholder="FOODIE10"
                placeholderTextColor={theme.placeholder}
                value={promoCode}
                onChangeText={setPromoCode}
                autoCapitalize="characters"
              />
            <TouchableOpacity style={styles.promoButton}>
              <Text style={styles.promoButtonText}>Appliquer</Text>
            </TouchableOpacity>
          </View>
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
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Promo</Text>
            <Text style={styles.summaryValue}>-${summary.discount.toFixed(2)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.summaryTotal]}>
            <Text style={styles.summaryTotalLabel}>Total</Text>
            <Text style={styles.summaryTotalValue}>${summary.total.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.ctaButton} onPress={() => setIsConfirmed(true)}>
          <Text style={styles.ctaText}>Confirmer la commande</Text>
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
      gap: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 2,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.text,
    },
    cardText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
    },
    cardSubtext: {
      fontSize: 13,
      color: theme.textMuted,
    },
    linkButton: {
      alignSelf: 'flex-start',
      marginTop: 4,
    },
    linkButtonText: {
      color: theme.brand,
      fontWeight: '600',
    },
    promoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    promoInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: theme.inputBorder,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      color: theme.text,
      backgroundColor: theme.inputBackground,
    },
    promoButton: {
      backgroundColor: theme.brand,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 12,
    },
    promoButtonText: {
      color: theme.onBrand,
      fontWeight: '600',
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
    ctaText: {
      color: theme.onBrand,
      fontSize: 16,
      fontWeight: '700',
    },
    confirmationCard: {
      margin: 20,
      backgroundColor: theme.surface,
      borderRadius: 20,
      padding: 24,
      gap: 12,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 4,
    },
    confirmationIcon: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: theme.success,
      alignItems: 'center',
      justifyContent: 'center',
    },
    confirmationTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.text,
    },
    confirmationSubtitle: {
      color: theme.textMuted,
    },
    confirmationMessage: {
      textAlign: 'center',
      color: theme.textSubtle,
    },
    confirmationActions: {
      width: '100%',
      gap: 12,
    },
    ctaSecondary: {
      backgroundColor: theme.surfaceMuted,
    },
    ctaSecondaryText: {
      color: theme.text,
      fontSize: 16,
      fontWeight: '700',
    },
  });
