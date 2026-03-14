import { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';

import { Colors } from '@/constants/theme';

const ratings = [1, 2, 3, 4, 5];

export default function ReviewScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const [rating, setRating] = useState<number>(5);

  const ratingLabel = useMemo(() => {
    if (rating >= 5) return 'Excellent';
    if (rating === 4) return 'Tres bien';
    if (rating === 3) return 'Bien';
    if (rating === 2) return 'Moyen';
    return 'Decevant';
  }, [rating]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.card}>
        <Text style={styles.title}>Avis commande</Text>
        <Text style={styles.subtitle}>Commande {orderId}</Text>

        <Text style={styles.sectionTitle}>Votre note</Text>
        <View style={styles.ratingRow}>
          {ratings.map((value) => (
            <TouchableOpacity
              key={value}
              style={[styles.ratingChip, rating === value && styles.ratingChipActive]}
              onPress={() => setRating(value)}
            >
              <Text style={[styles.ratingText, rating === value && styles.ratingTextActive]}>
                {value}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.ratingLabel}>{ratingLabel}</Text>

        <TouchableOpacity style={styles.ctaButton} onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.ctaText}>Terminer</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f6f6',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    color: '#666',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  ratingRow: {
    flexDirection: 'row',
    gap: 10,
  },
  ratingChip: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingChipActive: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tint,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
  },
  ratingTextActive: {
    color: '#fff',
  },
  ratingLabel: {
    color: '#666',
  },
  ctaButton: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  ctaText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
