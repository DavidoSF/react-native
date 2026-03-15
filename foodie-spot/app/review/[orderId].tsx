import { useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import api from '@/services/api';
import { Colors } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';

type ReviewImage = {
  uri: string;
  name: string;
  type: string;
};

const ratingValues = [1, 2, 3, 4, 5];

export default function ReviewScreen() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { orderId, restaurantId } = useLocalSearchParams<{
    orderId?: string;
    restaurantId?: string;
  }>();
  const [rating, setRating] = useState<number>(5);
  const [qualityRating, setQualityRating] = useState<number>(5);
  const [speedRating, setSpeedRating] = useState<number>(5);
  const [presentationRating, setPresentationRating] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState<ReviewImage[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const safeRestaurantId = restaurantId || 'r1';

  const ratingLabel = useMemo(() => {
    if (rating >= 5) return 'Excellent';
    if (rating === 4) return 'Tres bien';
    if (rating === 3) return 'Bien';
    if (rating === 2) return 'Moyen';
    return 'Decevant';
  }, [rating]);

  const pickImages = async () => {
    setError(null);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError("Autorisation d'acces aux photos requise.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 5,
      quality: 0.7,
    });

    if (result.canceled || !result.assets?.length) return;

    const mapped = result.assets.map((asset, index) => ({
      uri: asset.uri,
      name: asset.fileName || `review_${Date.now()}_${index}.jpg`,
      type: asset.mimeType || 'image/jpeg',
    }));

    setImages((prev) => [...prev, ...mapped].slice(0, 5));
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== index));
  };

  const submitReview = async () => {
    if (!safeRestaurantId) {
      setError('Restaurant introuvable.');
      return;
    }
    if (rating <= 0) {
      setError('Veuillez selectionner une note.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('restaurantId', safeRestaurantId);
      formData.append('rating', String(rating));
      formData.append('qualityRating', String(qualityRating));
      formData.append('speedRating', String(speedRating));
      formData.append('presentationRating', String(presentationRating));
      formData.append('comment', comment.trim());

      if (orderId && !String(orderId).startsWith('demo-')) {
        formData.append('orderId', String(orderId));
      }

      images.forEach((image) => {
        formData.append('images', {
          uri: image.uri,
          name: image.name,
          type: image.type,
        } as any);
      });

      await api.post('/reviews', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSuccess(true);
    } catch (err) {
      setError("Echec de l'envoi de l'avis.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.successCard}>
          <Ionicons name="checkmark-circle" size={56} color={colors.success} />
          <Text style={styles.successTitle}>Merci pour votre avis</Text>
          <Text style={styles.successSubtitle}>Votre retour a ete envoye avec succes.</Text>
          <TouchableOpacity style={styles.ctaButton} onPress={() => router.replace('/(tabs)')}>
            <Text style={styles.ctaText}>Retour accueil</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Avis commande</Text>
        <Text style={styles.subtitle}>Commande {orderId || 'N/A'}</Text>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Votre note</Text>
          <View style={styles.ratingRow}>
            {ratingValues.map((value) => (
              <TouchableOpacity key={value} onPress={() => setRating(value)}>
                <Ionicons
                  name={value <= rating ? 'star' : 'star-outline'}
                  size={28}
                  color={value <= rating ? colors.warning : colors.border}
                />
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.ratingLabel}>{ratingLabel}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Sous-notes</Text>
          <View style={styles.subRatingRow}>
            <Text style={styles.subRatingLabel}>Qualite</Text>
            <View style={styles.ratingRow}>
              {ratingValues.map((value) => (
                <TouchableOpacity key={`quality-${value}`} onPress={() => setQualityRating(value)}>
                  <Ionicons
                    name={value <= qualityRating ? 'star' : 'star-outline'}
                    size={22}
                    color={value <= qualityRating ? colors.warning : colors.border}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.subRatingRow}>
            <Text style={styles.subRatingLabel}>Vitesse</Text>
            <View style={styles.ratingRow}>
              {ratingValues.map((value) => (
                <TouchableOpacity key={`speed-${value}`} onPress={() => setSpeedRating(value)}>
                  <Ionicons
                    name={value <= speedRating ? 'star' : 'star-outline'}
                    size={22}
                    color={value <= speedRating ? colors.warning : colors.border}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.subRatingRow}>
            <Text style={styles.subRatingLabel}>Presentation</Text>
            <View style={styles.ratingRow}>
              {ratingValues.map((value) => (
                <TouchableOpacity
                  key={`presentation-${value}`}
                  onPress={() => setPresentationRating(value)}
                >
                  <Ionicons
                    name={value <= presentationRating ? 'star' : 'star-outline'}
                    size={22}
                    color={value <= presentationRating ? colors.warning : colors.border}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Commentaire</Text>
          <TextInput
            style={styles.commentInput}
            placeholder="Partagez votre experience..."
            placeholderTextColor={colors.placeholder}
            multiline
            value={comment}
            onChangeText={setComment}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Photos</Text>
          <Text style={styles.photoHint}>Ajoutez jusqu'a 5 photos.</Text>
          <View style={styles.photoRow}>
            {images.map((image, index) => (
              <TouchableOpacity key={image.uri} onPress={() => removeImage(index)}>
                <Image source={{ uri: image.uri }} style={styles.photoThumb} />
              </TouchableOpacity>
            ))}
            {images.length < 5 && (
              <TouchableOpacity style={styles.addPhoto} onPress={pickImages}>
                <Ionicons name="add" size={24} color={colors.mutedText} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.ctaButton, isSubmitting && styles.ctaButtonDisabled]}
          onPress={submitReview}
          disabled={isSubmitting}
        >
          <Text style={styles.ctaText}>{isSubmitting ? 'Envoi...' : 'Envoyer mon avis'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 20,
      gap: 16,
    },
    title: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.text,
    },
    subtitle: {
      color: colors.mutedText,
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
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
    ratingRow: {
      flexDirection: 'row',
      gap: 6,
    },
    subRatingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    subRatingLabel: {
      color: colors.mutedText,
      fontWeight: '600',
      width: 90,
    },
    ratingLabel: {
      color: colors.mutedText,
    },
    commentInput: {
      minHeight: 120,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 12,
      textAlignVertical: 'top',
      color: colors.text,
    },
    photoHint: {
      color: colors.mutedText,
    },
    photoRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    photoThumb: {
      width: 72,
      height: 72,
      borderRadius: 12,
    },
    addPhoto: {
      width: 72,
      height: 72,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    ctaButton: {
      backgroundColor: colors.tint,
      paddingVertical: 16,
      borderRadius: 14,
      alignItems: 'center',
    },
    ctaButtonDisabled: {
      opacity: 0.6,
    },
    ctaText: {
      color: colors.card,
      fontSize: 16,
      fontWeight: '700',
    },
    errorBox: {
      backgroundColor: colors.danger,
      borderRadius: 12,
      padding: 12,
    },
    errorText: {
      color: colors.card,
      fontSize: 13,
    },
    successCard: {
      margin: 20,
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 24,
      gap: 12,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 4,
    },
    successTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
    },
    successSubtitle: {
      color: colors.mutedText,
      textAlign: 'center',
    },
  });
