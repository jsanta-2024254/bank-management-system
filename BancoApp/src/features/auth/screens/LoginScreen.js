import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView,
  Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { COLORS } from '../../../shared/constants/colors';
import { THEME, COMMON_STYLES } from '../../../shared/constants/theme';
import { login } from '../../../api/auth';
import useAuthStore from '../../../store/useAuthStore';
import { useAlert } from '../../../shared/components/CustomAlert';
import * as SecureStore from 'expo-secure-store';

const LoginScreen = ({ navigation }) => {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { showAlert } = useAlert();

  const handleLogin = async () => {
    if (!emailOrUsername.trim() || !password.trim()) {
      showAlert({
        type: 'warning',
        title: 'Campos requeridos',
        message: 'Ingresa tu usuario/correo y contraseña.',
      });
      return;
    }
    setLoading(true);
    try {
      const response = await login({ emailOrUsername: emailOrUsername.trim(), password });
      const token = response.token || response.data?.token;
      const user = response.userDetails || response.data?.userDetails;
      await SecureStore.setItemAsync('userToken', String(token));
      await SecureStore.setItemAsync('userData', JSON.stringify(user));
      useAuthStore.getState().setAuthenticated(token, user);
    } catch (error) {
      const status = error.response?.status;
      if (status === 423) {
        showAlert({
          type: 'error',
          title: 'Cuenta bloqueada',
          message: 'Tu cuenta ha sido bloqueada por seguridad. Contacta con tu banco.',
        });
      } else if (status === 401) {
        showAlert({
          type: 'error',
          title: 'Credenciales inválidas',
          message: 'El usuario o la contraseña son incorrectos.',
        });
      } else {
        showAlert({
          type: 'error',
          title: 'Error al iniciar sesión',
          message: error.response?.data?.message || 'Ocurrió un problema. Intenta de nuevo.',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        <View style={styles.header}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>B</Text>
          </View>
          <Text style={styles.bankName}>BancoApp</Text>
          <Text style={styles.subtitle}>Banca móvil segura</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.formTitle}>Iniciar sesión</Text>

          <Text style={COMMON_STYLES.label}>Usuario o correo electrónico</Text>
          <TextInput
            style={COMMON_STYLES.input}
            placeholder="usuario@correo.com"
            placeholderTextColor={COLORS.textSecondary}
            value={emailOrUsername}
            onChangeText={setEmailOrUsername}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
          />

          <Text style={COMMON_STYLES.label}>Contraseña</Text>
          <View style={styles.passwordRow}>
            <TextInput
              style={[COMMON_STYLES.input, styles.passwordInput]}
              placeholder="Contraseña"
              placeholderTextColor={COLORS.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword(!showPassword)}>
              <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[COMMON_STYLES.primaryButton, loading && COMMON_STYLES.primaryButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color={COLORS.white} />
              : <Text style={COMMON_STYLES.buttonText}>Continuar</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity style={styles.forgotBtn} onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>
          Solo los clientes registrados pueden acceder.{'\n'}
          Contacta a tu asesor si aún no tienes cuenta.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, backgroundColor: COLORS.background, padding: THEME.spacing.lg, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 36 },
  logoBox: {
    width: 76, height: 76, borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center', marginBottom: 14,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  logoText: { fontSize: 38, fontWeight: '800', color: COLORS.white },
  bankName: { fontSize: 27, fontWeight: '800', color: COLORS.primary, letterSpacing: 0.5 },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  form: {
    backgroundColor: COLORS.surface, borderRadius: THEME.borderRadius.xl,
    padding: THEME.spacing.lg, marginBottom: THEME.spacing.lg,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 16, elevation: 4,
  },
  formTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 20 },
  passwordRow: { position: 'relative' },
  passwordInput: { paddingRight: 50 },
  eyeBtn: { position: 'absolute', right: 14, top: 14 },
  eyeText: { fontSize: 18 },
  forgotBtn: { marginTop: 16, alignItems: 'center' },
  forgotText: { color: COLORS.primaryLight, fontSize: 14, fontWeight: '500' },
  footer: { textAlign: 'center', fontSize: 12, color: COLORS.textSecondary, lineHeight: 18 },
});

export default LoginScreen;