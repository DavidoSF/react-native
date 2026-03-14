
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/auth-context';
import { Colors } from '@/constants/theme';

export default function RegisterScreen() {
  const { register, isLoading, error, clearError } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const MIN_PASSWORD_LENGTH = 8;
  const EMAIL_REGEX = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$/;

  const handleRegister = async () => {
    const errors: typeof fieldErrors = {};
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedFirstName) errors.firstName = 'Veuillez entrer votre prénom.';
    if (!trimmedLastName) errors.lastName = 'Veuillez entrer votre nom.';
    if (!trimmedEmail) {
      errors.email = 'Veuillez entrer votre email.';
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      errors.email = 'Veuillez saisir un email valide (ex: nom@domaine.com).';
    }
    if (!password) {
      errors.password = 'Veuillez entrer votre mot de passe.';
    } else if (password.length < MIN_PASSWORD_LENGTH) {
      errors.password = `Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caracteres.`;
    }
    if (!confirmPassword) {
      errors.confirmPassword = 'Veuillez confirmer votre mot de passe.';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Les mots de passe ne correspondent pas.';
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      await register({
        email: trimmedEmail,
        password,
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
        phone: trimmedPhone,
      });
    } catch (err) {
      console.log('Register error handled');
    }
  };

  const displayError = error;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>🍔</Text>
            <Text style={styles.title}>Créer un compte</Text>
          </View>

          {displayError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{displayError}</Text>
            </View>
          )}

          <View style={styles.form}>
            <View style={styles.nameRow}>
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <View style={styles.inputContainer}>
                  <User size={20} color="#999" />
                  <TextInput
                    style={styles.input}
                    placeholder="Prénom"
                    value={firstName}
                    onChangeText={t => {
                      setFirstName(t);
                      setFieldErrors(prev => ({ ...prev, firstName: undefined }));
                      clearError();
                    }}
                    editable={!isLoading}
                  />
                </View>
                {fieldErrors.firstName ? <Text style={styles.fieldError}>{fieldErrors.firstName}</Text> : null}
              </View>
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Nom"
                    value={lastName}
                    onChangeText={t => {
                      setLastName(t);
                      setFieldErrors(prev => ({ ...prev, lastName: undefined }));
                      clearError();
                    }}
                    editable={!isLoading}
                  />
                </View>
                {fieldErrors.lastName ? <Text style={styles.fieldError}>{fieldErrors.lastName}</Text> : null}
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <View style={styles.inputContainer}>
                <Mail size={20} color="#999" />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  value={email}
                  onChangeText={t => {
                    setEmail(t);
                    setFieldErrors(prev => ({ ...prev, email: undefined }));
                    clearError();
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
              </View>
              {fieldErrors.email ? <Text style={styles.fieldError}>{fieldErrors.email}</Text> : null}
            </View>

            <View style={styles.fieldGroup}>
              <View style={styles.inputContainer}>
                <Phone size={20} color="#999" />
                <TextInput
                  style={styles.input}
                  placeholder="Téléphone (optionnel)"
                  value={phone}
                  onChangeText={t => {
                    setPhone(t);
                    setFieldErrors(prev => ({ ...prev, phone: undefined }));
                  }}
                  keyboardType="phone-pad"
                  editable={!isLoading}
                />
              </View>
              {fieldErrors.phone ? <Text style={styles.fieldError}>{fieldErrors.phone}</Text> : null}
            </View>

            <View style={styles.fieldGroup}>
              <View style={styles.inputContainer}>
                <Lock size={20} color="#999" />
                <TextInput
                  style={styles.input}
                  placeholder="Mot de passe"
                  value={password}
                  onChangeText={t => {
                    setPassword(t);
                    setFieldErrors(prev => ({ ...prev, password: undefined, confirmPassword: undefined }));
                    clearError();
                  }}
                  secureTextEntry={!showPassword}
                  editable={!isLoading}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={20} color="#999" /> : <Eye size={20} color="#999" />}
                </TouchableOpacity>
              </View>
              {fieldErrors.password ? <Text style={styles.fieldError}>{fieldErrors.password}</Text> : null}
            </View>

            <View style={styles.fieldGroup}>
              <View style={styles.inputContainer}>
                <Lock size={20} color="#999" />
                <TextInput
                  style={styles.input}
                  placeholder="Confirmer mot de passe"
                  value={confirmPassword}
                  onChangeText={t => {
                    setConfirmPassword(t);
                    setFieldErrors(prev => ({ ...prev, confirmPassword: undefined }));
                    clearError();
                  }}
                  secureTextEntry={!showPassword}
                  editable={!isLoading}
                />
              </View>
              {fieldErrors.confirmPassword ? <Text style={styles.fieldError}>{fieldErrors.confirmPassword}</Text> : null}
            </View>

            <TouchableOpacity style={[styles.button, isLoading && styles.buttonDisabled]} onPress={handleRegister} disabled={isLoading}>
              {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Créer mon compte</Text>}
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.loginButton} onPress={() => router.back()} disabled={isLoading}>
            <Text style={styles.loginText}>Déjà un compte ? <Text style={styles.loginTextBold}>Se connecter</Text></Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  logoContainer: { alignItems: 'center', marginBottom: 24 },
  logo: { fontSize: 48, marginBottom: 8 },
  title: { fontSize: 28, fontWeight: 'bold', color: Colors.light.tint },
  errorContainer: { backgroundColor: '#FFEBEE', padding: 12, borderRadius: 12, marginBottom: 16 },
  errorText: { color: '#D32F2F', fontSize: 14, textAlign: 'center' },
  form: { width: '100%' },
  nameRow: { flexDirection: 'row', gap: 12 },
  fieldGroup: { width: '100%' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 12, marginBottom: 12, paddingHorizontal: 16, gap: 12 },
  input: { flex: 1, paddingVertical: 16, fontSize: 16, color: '#000' },
  fieldError: { color: '#D32F2F', fontSize: 12, marginTop: -4, marginBottom: 8 },
  button: { backgroundColor: Colors.light.tint, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  loginButton: { alignItems: 'center', padding: 16, marginTop: 16 },
  loginText: { color: '#666', fontSize: 14 },
  loginTextBold: { color: Colors.light.tint, fontWeight: '600' },
});
