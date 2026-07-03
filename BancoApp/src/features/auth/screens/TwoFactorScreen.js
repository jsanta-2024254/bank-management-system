import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { COLORS } from '../../../shared/constants/colors';
import { THEME, COMMON_STYLES } from '../../../shared/constants/theme';
import useAuthStore from '../../../store/useAuthStore';

const TwoFactorScreen = ({ route }) => {
  const { emailOrUsername } = route.params;
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const { requestTwoFactor, verifyAndLogin } = useAuthStore();

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendCode = async () => {
    setSending(true);
    try {
      await requestTwoFactor(emailOrUsername);
      setCountdown(60);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'No se pudo enviar el código.');
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async () => {
    if (code.trim().length !== 6) {
      Alert.alert('Código inválido', 'El código debe tener exactamente 6 dígitos.');
      return;
    }
    setLoading(true);
    try {
      console.log('Verificando con email:', emailOrUsername);
      console.log('Código:', code.trim());
      await verifyAndLogin(code.trim(), emailOrUsername);
    } catch (error) {
      console.log('Error completo:', error.message);
      console.log('Error response:', JSON.stringify(error.response));
      Alert.alert('Error', error.message || 'Código inválido');
      setCode('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.container}>
        <View style={styles.iconBox}>
          <Text style={styles.icon}>🔐</Text>
        </View>
        <Text style={styles.title}>Verificación en dos pasos</Text>
        <Text style={styles.subtitle}>
          Ingresa el código de 6 dígitos enviado al correo de{' '}
          <Text style={styles.highlight}>{emailOrUsername}</Text>
        </Text>
        <Text style={styles.expiry}>El código expira en 5 minutos.</Text>

        <TextInput
          style={styles.codeInput}
          value={code}
          onChangeText={val => setCode(val.replace(/\D/g, '').slice(0, 6))}
          keyboardType="number-pad"
          maxLength={6}
          placeholder="000000"
          placeholderTextColor={COLORS.border}
          autoFocus
        />

        <TouchableOpacity
          style={[COMMON_STYLES.primaryButton, { width: '100%' }, (loading || code.length !== 6) && COMMON_STYLES.primaryButtonDisabled]}
          onPress={handleVerify}
          disabled={loading || code.length !== 6}
        >
          {loading
            ? <ActivityIndicator color={COLORS.white} />
            : <Text style={COMMON_STYLES.buttonText}>Verificar código</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity style={styles.resendBtn} onPress={handleSendCode} disabled={sending || countdown > 0}>
          {sending
            ? <ActivityIndicator size="small" color={COLORS.primaryLight} />
            : <Text style={[styles.resendText, countdown > 0 && styles.resendDisabled]}>
                {countdown > 0 ? `Reenviar código en ${countdown}s` : 'Reenviar código'}
              </Text>
          }
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: THEME.spacing.lg, justifyContent: 'center', alignItems: 'center' },
  iconBox: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primarySurface, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  icon: { fontSize: 36 },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.text, marginBottom: 10, textAlign: 'center' },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: 6 },
  highlight: { color: COLORS.accentDark, fontWeight: '600' },
  expiry: { fontSize: 12, color: COLORS.warning, marginBottom: 28, fontWeight: '500' },
  codeInput: {
    width: '60%', fontSize: 32, fontWeight: '700', letterSpacing: 10,
    textAlign: 'center', borderBottomWidth: 2, borderBottomColor: COLORS.accent,
    color: COLORS.text, marginBottom: 32, paddingBottom: 8,
  },
  resendBtn: { marginTop: 20, padding: 10 },
  resendText: { color: COLORS.accentDark, fontSize: 14, fontWeight: '500' },
  resendDisabled: { color: COLORS.textSecondary },
});

export default TwoFactorScreen;