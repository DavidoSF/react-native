import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MapPin, Heart, ShoppingBag, Phone, Share2, Camera, ChevronRight, LogOut, Globe } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

import { userAPI, uploadAPI } from '@/services/api';
import type { User } from '@/types';
import log from '@/services/logger';
import { useToast } from '@/components/toast-provider';
import { useAuth } from '@/contexts/auth-context';
import { useI18n } from '@/contexts/i18n-context';
import { Brand } from '@/constants/theme';

export default function ProfileScreen() {
  const toast = useToast();
  const { logout } = useAuth();
  const { t, language, setLanguage } = useI18n();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const userData = await userAPI.getCurrentUser();
    setUser(userData ? { ...userData, favoriteRestaurants: userData.favoriteRestaurants || [] } : null);
    setLoading(false);
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t.profile.permissionRequired, t.profile.photoPermission);
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos', 'livePhotos'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      try {
        const imageUrl = await uploadAPI.uploadImage(result.assets[0].uri, 'profile');
        await userAPI.updateProfile({ photo: imageUrl });
        await loadUser();
        toast.success(t.profile.photoUpdated);
      } catch (error) {
        log.error('Failed to upload profile photo:', error);
        Alert.alert(t.common.error, t.profile.photoError);
      }
    }
  };

  const handleLogout = () => {
    Alert.alert(t.profile.logoutTitle, t.profile.logoutMessage, [
      { text: t.common.cancel, style: 'cancel' },
      { text: t.profile.logout, style: 'destructive', onPress: async () => { await logout(); } },
    ]);
  };

  const handleToggleLanguage = () => {
    setLanguage(language === 'fr' ? 'en' : 'fr');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Brand.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.profileContainer}>
            <View style={styles.avatarContainer}>
              {user?.photo ? (
                <Image source={{ uri: user.photo }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
                  </Text>
                </View>
              )}
              <TouchableOpacity style={styles.cameraButton} onPress={handlePickImage}>
                <Camera size={14} color="#fff" />
              </TouchableOpacity>
            </View>
            <Text style={styles.name}>{user?.name ?? '—'}</Text>
            <Text style={styles.email}>{user?.email ?? ''}</Text>
            <Text style={styles.phone}>{user?.phone ?? ''}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>{t.orders.title}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user?.favoriteRestaurants?.length ?? 0}</Text>
            <Text style={styles.statLabel}>{language === 'fr' ? 'Favoris' : 'Favourites'}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>4.8</Text>
            <Text style={styles.statLabel}>{language === 'fr' ? 'Avis' : 'Reviews'}</Text>
          </View>
        </View>

        {/* Menu */}
        <View style={styles.menu}>
          <TouchableOpacity style={styles.menuItem}>
            <MapPin size={20} color="#666" />
            <Text style={styles.menuText}>{language === 'fr' ? 'Mes adresses' : 'My addresses'}</Text>
            <View style={styles.menuRight}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{user?.addresses?.length ?? 0}</Text>
              </View>
              <ChevronRight size={18} color="#ccc" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert(language === 'fr' ? 'Bientôt disponible' : 'Coming soon', language === 'fr' ? 'La liste de favoris arrive prochainement.' : 'Favorites list coming soon.')}>
            <Heart size={20} color="#666" />
            <Text style={styles.menuText}>{language === 'fr' ? 'Mes favoris' : 'My favourites'}</Text>
            <View style={styles.menuRight}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{user?.favoriteRestaurants?.length ?? 0}</Text>
              </View>
              <ChevronRight size={18} color="#ccc" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(tabs)/orders')}>
            <ShoppingBag size={20} color="#666" />
            <Text style={styles.menuText}>{language === 'fr' ? 'Historique' : 'Order history'}</Text>
            <ChevronRight size={18} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Phone size={20} color="#666" />
            <Text style={styles.menuText}>{language === 'fr' ? 'Support' : 'Support'}</Text>
            <ChevronRight size={18} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Share2 size={20} color="#666" />
            <Text style={styles.menuText}>{language === 'fr' ? "Partager l'app" : 'Share the app'}</Text>
            <ChevronRight size={18} color="#ccc" />
          </TouchableOpacity>

          {/* Language toggle */}
          <TouchableOpacity style={styles.menuItem} onPress={handleToggleLanguage} accessibilityLabel="Toggle language">
            <Globe size={20} color="#666" />
            <Text style={styles.menuText}>{language === 'fr' ? 'Langue' : 'Language'}</Text>
            <View style={styles.langToggle}>
              <View style={[styles.langOption, language === 'fr' && styles.langOptionActive]}>
                <Text style={[styles.langOptionText, language === 'fr' && styles.langOptionTextActive]}>FR</Text>
              </View>
              <View style={[styles.langOption, language === 'en' && styles.langOptionActive]}>
                <Text style={[styles.langOptionText, language === 'en' && styles.langOptionTextActive]}>EN</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={handleLogout}>
            <LogOut size={20} color={Brand.primary} />
            <Text style={[styles.menuText, styles.logoutText]}>{t.profile.logout}</Text>
          </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  profileContainer: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  phone: {
    fontSize: 12,
    color: '#999',
  },
  stats: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Brand.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  menu: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 24,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    minHeight: 52,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    backgroundColor: '#FFE5DB',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 12,
    color: Brand.primary,
    fontWeight: '600',
  },
  langToggle: {
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  langOption: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#f5f5f5',
  },
  langOptionActive: {
    backgroundColor: Brand.primary,
  },
  langOptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  langOptionTextActive: {
    color: '#fff',
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  logoutText: {
    color: Brand.primary,
    fontWeight: '600',
  },
});

