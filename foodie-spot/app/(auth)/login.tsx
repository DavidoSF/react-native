// app/(auth)/login.tsx

import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/auth-context';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function LoginScreen() {
  const { login, isLoading, error, clearError } = useAuth();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const MIN_PASSWORD_LENGTH = 8;
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const handleLogin = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setLocalError('Veuillez entrer votre email.');
      return;
    }
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setLocalError('Veuillez saisir un email valide (ex: nom@domaine.com).');
      return;
    }
    if (!password) {
      setLocalError('Veuillez entrer votre mot de passe.');
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setLocalError(`Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caracteres.`);
      return;
    }

    setLocalError('');
    try {
      await login({ email: trimmedEmail, password });
    } catch (err) {
      console.log('Login error handled');
    }
  };

  const displayError = localError || error;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>🍔</Text>
            <Text style={styles.title}>FoodieSpot</Text>
            <Text style={styles.subtitle}>Connectez-vous pour commander</Text>
          </View>

          {displayError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{displayError}</Text>
            </View>
          )}

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Mail size={20} color={theme.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={theme.placeholder}
                value={email}
                onChangeText={t => {
                  setEmail(t);
                  setLocalError('');
                  clearError();
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Lock size={20} color={theme.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder="Mot de passe"
                placeholderTextColor={theme.placeholder}
                value={password}
                onChangeText={t => {
                  setPassword(t);
                  setLocalError('');
                  clearError();
                }}
                secureTextEntry={!showPassword}
                editable={!isLoading}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={20} color={theme.textSecondary} /> : <Eye size={20} color={theme.textSecondary} />}
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.forgotButton}>
              <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, isLoading && styles.buttonDisabled]} onPress={handleLogin} disabled={isLoading}>
              {isLoading ? <ActivityIndicator color={theme.onBrand} /> : <Text style={styles.buttonText}>Se connecter</Text>}
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.registerButton} onPress={() => router.push('/(auth)/register')} disabled={isLoading}>
            <Text style={styles.registerText}>Pas encore de compte ? <Text style={styles.registerTextBold}>S'inscrire</Text></Text>
          </TouchableOpacity>

          <View style={styles.demoHint}>
            <Text style={styles.demoHintText}>💡 Pour tester, utilisez un email valide et un mot de passe de 8 caracteres</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (theme: typeof Colors.light) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24 },
    logoContainer: { alignItems: 'center', marginBottom: 32 },
    logo: { fontSize: 64, marginBottom: 8 },
    title: { fontSize: 32, fontWeight: 'bold', color: theme.brand, marginBottom: 8 },
    subtitle: { fontSize: 16, color: theme.textMuted },
    errorContainer: { backgroundColor: theme.dangerSoft, padding: 12, borderRadius: 12, marginBottom: 16 },
    errorText: { color: theme.danger, fontSize: 14, textAlign: 'center' },
    form: { width: '100%' },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.inputBackground,
      borderRadius: 12,
      marginBottom: 12,
      paddingHorizontal: 16,
      gap: 12,
    },
    input: { flex: 1, paddingVertical: 16, fontSize: 16, color: theme.text },
    forgotButton: { alignSelf: 'flex-end', marginBottom: 16 },
    forgotText: { color: theme.brand, fontSize: 14 },
    button: { backgroundColor: theme.brand, borderRadius: 12, padding: 16, alignItems: 'center' },
    buttonDisabled: { opacity: 0.7 },
    buttonText: { color: theme.onBrand, fontSize: 16, fontWeight: '600' },
    registerButton: { alignItems: 'center', padding: 16, marginTop: 24 },
    registerText: { color: theme.textMuted, fontSize: 14 },
    registerTextBold: { color: theme.brand, fontWeight: '600' },
    demoHint: { marginTop: 16, padding: 12, backgroundColor: theme.warningSoft, borderRadius: 8 },
    demoHintText: { fontSize: 12, color: theme.warning, textAlign: 'center' },
  });
