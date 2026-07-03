import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { COLORS } from '../../../shared/constants/colors';
import { COMMON_STYLES } from '../../../shared/constants/theme';
import { updateProfile } from '../../../api/auth';
import useAuthStore from '../../../store/useAuthStore';

const EditProfileScreen = ({ navigation }) => {
  const { user, updateUser } = useAuthStore();
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    address: user?.address || '',
    workName: user?.workName || '',
    monthlyIncome: user?.monthlyIncome?.toString() || '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      Alert.alert('Campos requeridos', 'Nombre y apellido son obligatorios.'); return;
    }
    setLoading(true);
    try {
      const updated = await updateProfile({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        address: form.address.trim(),
        workName: form.workName.trim(),
        monthlyIncome: parseFloat(form.monthlyIncome) || 0,
      });
      await updateUser(updated.data || updated);
      Alert.alert('Perfil actualizado', 'Tus datos fueron guardados.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'No se pudo actualizar el perfil.');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: 'firstName', label: 'Nombre', placeholder: 'Tu nombre' },
    { key: 'lastName', label: 'Apellido', placeholder: 'Tu apellido' },
    { key: 'address', label: 'Dirección', placeholder: 'Tu dirección' },
    { key: 'workName', label: 'Lugar de trabajo', placeholder: 'Empresa o negocio' },
    { key: 'monthlyIncome', label: 'Ingresos mensuales (Q)', placeholder: '0.00', keyboardType: 'decimal-pad' },
  ];

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={COMMON_STYLES.scrollContent} keyboardShouldPersistTaps="handled">
        {fields.map(f => (
          <View key={f.key}>
            <Text style={COMMON_STYLES.label}>{f.label}</Text>
            <TextInput
              style={COMMON_STYLES.input}
              placeholder={f.placeholder}
              placeholderTextColor={COLORS.textSecondary}
              value={form[f.key]}
              onChangeText={val => handleChange(f.key, val)}
              keyboardType={f.keyboardType || 'default'}
            />
          </View>
        ))}

        <TouchableOpacity
          style={[COMMON_STYLES.primaryButton, loading && COMMON_STYLES.primaryButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color={COLORS.white} />
            : <Text style={COMMON_STYLES.buttonText}>Guardar cambios</Text>
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

export default EditProfileScreen;