import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { COLORS } from '../../../shared/constants/colors';
import { COMMON_STYLES } from '../../../shared/constants/theme';
import { changePassword } from '../../../api/auth';

const ChangePasswordScreen = ({ navigation }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Campos requeridos', 'Completa todos los campos.'); return;
    }
    if (newPassword.length < 8) {
      Alert.alert('Contraseña débil', 'La nueva contraseña debe tener al menos 8 caracteres.'); return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('No coinciden', 'Las contraseñas nuevas no coinciden.'); return;
    }
    if (currentPassword === newPassword) {
      Alert.alert('Sin cambios', 'La nueva contraseña debe ser diferente a la actual.'); return;
    }
    setLoading(true);
    try {
      await changePassword({ currentPassword, newPassword });
      Alert.alert('Contraseña actualizada', 'Tu contraseña fue cambiada exitosamente.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      const status = error.response?.status;
      if (status === 401) {
        Alert.alert('Contraseña incorrecta', 'La contraseña actual no es correcta.');
      } else {
        Alert.alert('Error', error.response?.data?.message || 'No se pudo cambiar la contraseña.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={COMMON_STYLES.scrollContent} keyboardShouldPersistTaps="handled">

        <Text style={COMMON_STYLES.label}>Contraseña actual</Text>
        <TextInput
          style={COMMON_STYLES.input}
          placeholder="Tu contraseña actual"
          placeholderTextColor={COLORS.textSecondary}
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry
        />

        <Text style={COMMON_STYLES.label}>Nueva contraseña</Text>
        <TextInput
          style={COMMON_STYLES.input}
          placeholder="Mínimo 8 caracteres"
          placeholderTextColor={COLORS.textSecondary}
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
        />

        <Text style={COMMON_STYLES.label}>Confirmar nueva contraseña</Text>
        <TextInput
          style={COMMON_STYLES.input}
          placeholder="Repite la nueva contraseña"
          placeholderTextColor={COLORS.textSecondary}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={[COMMON_STYLES.primaryButton, loading && COMMON_STYLES.primaryButtonDisabled]}
          onPress={handleChange}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color={COLORS.white} />
            : <Text style={COMMON_STYLES.buttonText}>Cambiar contraseña</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity
          style={[COMMON_STYLES.secondaryButton, { marginTop: 12 }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={COMMON_STYLES.secondaryButtonText}>Cancelar</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ChangePasswordScreen;