import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { COLORS } from '../../../shared/constants/colors';
import { COMMON_STYLES, THEME } from '../../../shared/constants/theme';
import { addFavorite } from '../../../api/favorites';

const AddFavoriteScreen = ({ navigation }) => {
  const [accountNumber, setAccountNumber] = useState('');
  const [accountType, setAccountType] = useState('monetaria');
  const [alias, setAlias] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!accountNumber.trim()) {
      Alert.alert('Campo requerido', 'Ingresa el número de cuenta.'); return;
    }
    if (!alias.trim()) {
      Alert.alert('Campo requerido', 'Asigna un alias a este favorito.'); return;
    }
    setLoading(true);
    try {
      await addFavorite({ accountNumber: accountNumber.trim(), accountType, alias: alias.trim() });
      Alert.alert('Favorito agregado', `"${alias}" fue guardado correctamente.`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      const msg = error.response?.data?.message || 'No se pudo agregar el favorito.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={COMMON_STYLES.scrollContent} keyboardShouldPersistTaps="handled">

        <Text style={COMMON_STYLES.label}>Número de cuenta</Text>
        <TextInput
          style={COMMON_STYLES.input}
          placeholder="Ej. 1234567890"
          placeholderTextColor={COLORS.textSecondary}
          value={accountNumber}
          onChangeText={setAccountNumber}
          keyboardType="numeric"
        />

        <Text style={COMMON_STYLES.label}>Tipo de cuenta</Text>
        <View style={styles.typeRow}>
          {['monetaria', 'ahorro'].map(type => (
            <TouchableOpacity
              key={type}
              style={[styles.typeBtn, accountType === type && styles.typeBtnActive]}
              onPress={() => setAccountType(type)}
            >
              <Text style={[styles.typeBtnText, accountType === type && styles.typeBtnTextActive]}>
                {type === 'monetaria' ? 'Monetaria' : 'Ahorro'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={COMMON_STYLES.label}>Alias</Text>
        <TextInput
          style={COMMON_STYLES.input}
          placeholder="Ej. Mamá, Arrendador, etc."
          placeholderTextColor={COLORS.textSecondary}
          value={alias}
          onChangeText={setAlias}
          maxLength={30}
        />

        <TouchableOpacity
          style={[COMMON_STYLES.primaryButton, loading && COMMON_STYLES.primaryButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color={COLORS.white} />
            : <Text style={COMMON_STYLES.buttonText}>Guardar favorito</Text>
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

const styles = StyleSheet.create({
  typeRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  typeBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 8,
    borderWidth: 1.5, borderColor: COLORS.border,
    alignItems: 'center', backgroundColor: COLORS.surface,
  },
  typeBtnActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primarySurface },
  typeBtnText: { fontSize: 14, fontWeight: '500', color: COLORS.textSecondary },
  typeBtnTextActive: { color: COLORS.primary, fontWeight: '700' },
});

export default AddFavoriteScreen;