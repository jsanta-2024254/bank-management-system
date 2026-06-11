import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, KeyboardAvoidingView,
  Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { COLORS } from '../../../shared/constants/colors';
import { THEME, COMMON_STYLES } from '../../../shared/constants/theme';
import { login } from '../../../api/auth';

const LoginScreen = ({ navigation }) => {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!emailOrUsername.trim() || !password.trim()) {
      Alert.alert('Campos requeridos', 'Ingresa tu usuario/correo y contraseña.');
      return;
    }
    setLoading(true);
  console.log('URL:', process.env.EXPO_PUBLIC_API_URL);
  console.log('emailOrUsername:', emailOrUsername);
  console.log('password:', password);
    try {
      await login({ emailOrUsername: emailOrUsername.trim(), password });
      navigation.navigate('TwoFactor', { emailOrUsername: emailOrUsername.trim() });
    } catch (error) {
  console.log('STATUS:', error.response?.status);
  console.log('ERROR:', error.response?.data);
  console.log('ERROR COMPLETO:', error.message);
  console.log('ERROR TIPO:', error.code);
      const status = error.response?.status;
      if (status === 423) {
        Alert.alert('Cuenta bloqueada', 'Tu cuenta ha sido bloqueada. Contacta con soporte.');
      } else if (status === 401) {
        Alert.alert('Credenciales inválidas', 'Usuario o contraseña incorrectos.');
      } else {
        Alert.alert('Error', error.response?.data?.message || 'Error al iniciar sesión.');
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
  onPress={() => {
    console.log('BOTON PRESIONADO');
    handleLogin();
  }}
  disabled={loading}
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
    width: 72, height: 72, borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  logoText: { fontSize: 36, fontWeight: '800', color: COLORS.white },
  bankName: { fontSize: 26, fontWeight: '800', color: COLORS.primary, letterSpacing: 0.5 },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  form: {
    backgroundColor: COLORS.surface, borderRadius: THEME.borderRadius.xl,
    padding: THEME.spacing.lg, marginBottom: THEME.spacing.lg,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 3,
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