import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { COLORS } from '../../../shared/constants/colors';
import { THEME, COMMON_STYLES } from '../../../shared/constants/theme';
import { forgotPassword } from '../../../api/auth';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) { Alert.alert('Campo requerido', 'Ingresa tu correo electrónico.'); return; }
    setLoading(true);
    try {
      await forgotPassword(email.trim());
      setSent(true);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'No se pudo procesar la solicitud.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <View style={styles.container}>
        <Text style={styles.successIcon}>📧</Text>
        <Text style={styles.title}>Revisa tu correo</Text>
        <Text style={styles.subtitle}>
          Si el correo <Text style={{ fontWeight: '600' }}>{email}</Text> está registrado, recibirás instrucciones para restablecer tu contraseña.
        </Text>
        <TouchableOpacity style={[COMMON_STYLES.primaryButton, { width: '100%' }]} onPress={() => navigation.navigate('ResetPassword')}>
          <Text style={COMMON_STYLES.buttonText}>Tengo mi código</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.backText}>Volver al inicio de sesión</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.container}>
        <Text style={styles.title}>Recuperar contraseña</Text>
        <Text style={styles.subtitle}>Ingresa el correo asociado a tu cuenta.</Text>

        <Text style={COMMON_STYLES.label}>Correo electrónico</Text>
        <TextInput
          style={[COMMON_STYLES.input, { width: '100%' }]}
          placeholder="usuario@correo.com"
          placeholderTextColor={COLORS.textSecondary}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TouchableOpacity
          style={[COMMON_STYLES.primaryButton, { width: '100%' }, loading && COMMON_STYLES.primaryButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={COMMON_STYLES.buttonText}>Enviar instrucciones</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: THEME.spacing.lg, justifyContent: 'center', alignItems: 'center' },
  successIcon: { fontSize: 56, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.text, marginBottom: 10, textAlign: 'center' },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: 28 },
  backBtn: { marginTop: 20, padding: 10 },
  backText: { color: COLORS.primaryLight, fontSize: 14, fontWeight: '500' },
});

export default ForgotPasswordScreen;