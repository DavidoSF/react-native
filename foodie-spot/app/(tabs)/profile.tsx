import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, Switch, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MapPin, Heart, ShoppingBag, Phone, Share2, Camera, ChevronRight, LogOut, Globe } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

import { userAPI, uploadAPI, orderAPI } from '@/services/api';
import type { User } from '@/types';
import log from '@/services/logger';
import  { useToast } from '@/components/toast-provider';
import { useAuth } from '@/contexts/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/contexts/theme-context';
import { useI18n } from '@/contexts/i18n-context';

export default function ProfileScreen() {

  const toast = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [orderCount, setOrderCount] = useState<number>(0);
  const { logout } = useAuth();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const styles = useMemo(() => createStyles(theme), [theme]);
  const themeContext = useTheme();
  const isDarkMode = themeContext?.isDark ?? colorScheme === 'dark';
  const toggleDarkMode = themeContext?.toggleDarkMode;
  const { language, setLanguage, t } = useI18n();


  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    setIsLoading(true);
    try {
      const [userData, favorites, orders] = await Promise.all([
        userAPI.getCurrentUser(),
        userAPI.getFavorites(),
        orderAPI.getOrders(),
      ]);
      log.info('Loaded user data:', toast, userData);
      setUser(userData ? { ...userData, favoriteRestaurants: favorites } : null);
      setOrderCount(orders.length);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', "Nous avons besoin d'accéder à vos photos");
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
        toast.success('Photo de profil mise à jour !'); 
      } catch (error) {
        log.error('Failed to upload profile photo:', error);
        Alert.alert('Erreur', 'Impossible de télécharger la photo');
      }
    }
  };

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Êtes-vous sûr de vouloir vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Déconnexion',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={theme.brand} />
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loading}>
          <Text style={{ color: theme.textMuted }}>Impossible de charger le profil.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView>
        <View style={styles.header}>
          <View style={styles.profileContainer}>
            <View style={styles.avatarContainer}>
              {user.photo ? (
                <Image source={{ uri: user.photo }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>{user.name?.charAt(0).toUpperCase()}</Text>
                </View>
              )}
              <TouchableOpacity style={styles.cameraButton} onPress={handlePickImage}>
                <Camera size={14} color={theme.onBrand} />
              </TouchableOpacity>
            </View>
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.email}>{user.email}</Text>
            <Text style={styles.phone}>{user.phone}</Text>
          </View>
        </View>

        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{orderCount}</Text>
            <Text style={styles.statLabel}>Commandes</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.favoriteRestaurants?.length ?? 0}</Text>
            <Text style={styles.statLabel}>Favoris</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>—</Text>
            <Text style={styles.statLabel}>Avis</Text>
          </View>
        </View>

        <View style={styles.menu}>
          <TouchableOpacity style={styles.menuItem}>
            <MapPin size={20} color={theme.textMuted} />
            <Text style={styles.menuText}>{t.profile.addresses}</Text>
            <View style={styles.menuRight}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{user.addresses.length}</Text>
              </View>
              <ChevronRight size={18} color={theme.textSecondary} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(tabs)/favorites')}>
            <Heart size={20} color={theme.textMuted} />
            <Text style={styles.menuText}>{t.profile.favourites}</Text>
            <View style={styles.menuRight}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{user.favoriteRestaurants.length}</Text>
              </View>
              <ChevronRight size={18} color={theme.textSecondary} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(tabs)/orders')}>
            <ShoppingBag size={20} color={theme.textMuted} />
            <Text style={styles.menuText}>{t.profile.orderHistory}</Text>
            <ChevronRight size={18} color={theme.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Phone size={20} color={theme.textMuted} />
            <Text style={styles.menuText}>{t.profile.support}</Text>
            <ChevronRight size={18} color={theme.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Share2 size={20} color={theme.textMuted} />
            <Text style={styles.menuText}>{t.profile.shareApp}</Text>
            <ChevronRight size={18} color={theme.textSecondary} />
          </TouchableOpacity>

          <View style={[styles.menuItem, styles.menuItemToggle]}>
            <Text style={[styles.menuText, styles.menuTextToggle]}>{t.profile.darkMode}</Text>
            <Switch
              value={isDarkMode}
              onValueChange={() => toggleDarkMode?.()}
              trackColor={{ false: theme.border, true: theme.brand }}
              thumbColor={theme.onBrand}
            />
          </View>

          <View style={[styles.menuItem, styles.menuItemToggle]}>
            <Globe size={20} color={theme.textMuted} />
            <Text style={styles.menuText}>{t.profile.language}</Text>
            <View style={styles.langToggle}>
              <TouchableOpacity
                style={[styles.langPill, language === 'fr' && styles.langPillActive]}
                onPress={() => setLanguage('fr')}>
                <Text style={[styles.langPillText, language === 'fr' && styles.langPillTextActive]}>FR</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.langPill, language === 'en' && styles.langPillActive]}
                onPress={() => setLanguage('en')}>
                <Text style={[styles.langPillText, language === 'en' && styles.langPillTextActive]}>EN</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={handleLogout}>
            <LogOut size={20} color={theme.brand} />
            <Text style={[styles.menuText, styles.logoutText]}>{t.profile.logout}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: typeof Colors.light) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    loading: {
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
      backgroundColor: theme.brand,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      fontSize: 32,
      fontWeight: 'bold',
      color: theme.onBrand,
    },
    cameraButton: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: theme.info,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: theme.surface,
    },
    name: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 4,
      color: theme.text,
    },
    email: {
      fontSize: 14,
      color: theme.textMuted,
      marginBottom: 2,
    },
    phone: {
      fontSize: 12,
      color: theme.textSecondary,
    },
    stats: {
      flexDirection: 'row',
      backgroundColor: theme.surfaceMuted,
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
      backgroundColor: theme.border,
    },
    statValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.brand,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      color: theme.textMuted,
    },
    menu: {
      backgroundColor: theme.surface,
      borderRadius: 12,
      marginHorizontal: 16,
      overflow: 'hidden',
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderSubtle,
    },
    menuItemToggle: {
      justifyContent: 'space-between',
    },
    menuText: {
      flex: 1,
      fontSize: 16,
      marginLeft: 12,
      color: theme.text,
    },
    menuRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    menuTextToggle: {
      marginLeft: 0,
    },
    badge: {
      backgroundColor: theme.brandSoft,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 10,
    },
    badgeText: {
      fontSize: 12,
      color: theme.brand,
      fontWeight: '600',
    },
    logoutItem: {
      borderBottomWidth: 0,
    },
    logoutText: {
      color: theme.brand,
      fontWeight: '600',
    },
    langToggle: {
      flexDirection: 'row',
      gap: 6,
    },
    langPill: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.border,
    },
    langPillActive: {
      borderColor: theme.brand,
      backgroundColor: theme.brandSoft,
    },
    langPillText: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.textMuted,
    },
    langPillTextActive: {
      color: theme.brand,
    },
  });
