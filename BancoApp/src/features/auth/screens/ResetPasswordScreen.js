import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { COLORS } from '../../../shared/constants/colors';
import { THEME, COMMON_STYLES } from '../../../shared/constants/theme';
import { resetPassword } from '../../../api/auth';

const ResetPasswordScreen = ({ navigation }) => {
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!token.trim() || !newPassword || !confirmPassword) {
      Alert.alert('Campos requeridos', 'Completa todos los campos.'); return;
    }
    if (newPassword.length < 8) {
      Alert.alert('Contraseña débil', 'Mínimo 8 caracteres.'); return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('No coinciden', 'Las contraseñas no coinciden.'); return;
    }
    setLoading(true);
    try {
      await resetPassword({ token: token.trim(), newPassword });
      Alert.alert('Contraseña actualizada', 'Ya puedes iniciar sesión.', [
        { text: 'Ir al login', onPress: () => navigation.navigate('Login') },
      ]);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Token inválido o expirado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Nueva contraseña</Text>
        <Text style={styles.subtitle}>Ingresa el token recibido por correo y tu nueva contraseña.</Text>

        <Text style={COMMON_STYLES.label}>Token de recuperación</Text>
        <TextInput style={COMMON_STYLES.input} placeholder="Token del correo" placeholderTextColor={COLORS.textSecondary} value={token} onChangeText={setToken} autoCapitalize="none" />

        <Text style={COMMON_STYLES.label}>Nueva contraseña</Text>
        <TextInput style={COMMON_STYLES.input} placeholder="Mínimo 8 caracteres" placeholderTextColor={COLORS.textSecondary} value={newPassword} onChangeText={setNewPassword} secureTextEntry />

        <Text style={COMMON_STYLES.label}>Confirmar contraseña</Text>
        <TextInput style={COMMON_STYLES.input} placeholder="Repite la contraseña" placeholderTextColor={COLORS.textSecondary} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />

        <TouchableOpacity
          style={[COMMON_STYLES.primaryButton, loading && COMMON_STYLES.primaryButtonDisabled]}
          onPress={handleReset}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={COMMON_STYLES.buttonText}>Restablecer contraseña</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.backText}>← Volver al login</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, backgroundColor: COLORS.background, padding: THEME.spacing.lg, justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.text, marginBottom: 10 },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20, marginBottom: 24 },
  backBtn: { marginTop: 20, alignItems: 'center' },
  backText: { color: COLORS.primaryLight, fontSize: 14, fontWeight: '500' },
});

export default ResetPasswordScreen;