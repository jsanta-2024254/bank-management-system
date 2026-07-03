import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../shared/constants/colors';
import { COMMON_STYLES, THEME } from '../../../shared/constants/theme';
import { getMyAccounts } from '../../../api/accounts';

const SINGLE_LIMIT = 2000;

const formatCurrency = (amount) =>
  `Q ${parseFloat(amount || 0).toLocaleString('es-GT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const TransferScreen = ({ navigation, route }) => {
  const prefill = route.params?.favorite || null;
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [numeroCuentaDestino, setNumeroCuentaDestino] = useState(prefill?.numeroCuenta || '');
  const [tipoCuentaDestino, setTipoCuentaDestino] = useState(prefill?.tipoCuenta || 'monetaria');
  const [monto, setMonto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAccounts(); }, []);

  const fetchAccounts = async () => {
    try {
      const data = await getMyAccounts();
      const list = data.data || data;
      setAccounts(list);
      if (list.length > 0) setSelectedAccount(list[0]);
    } catch {
      Alert.alert('Error', 'No se pudieron cargar tus cuentas.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    const numAmount = parseFloat(monto);
    if (!numeroCuentaDestino.trim()) {
      Alert.alert('Campo requerido', 'Ingresa el número de cuenta destino.'); return;
    }
    if (!monto || isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Monto inválido', 'Ingresa un monto válido mayor a Q0.00'); return;
    }
    if (numAmount > SINGLE_LIMIT) {
      Alert.alert('Límite excedido', `El máximo por transferencia es ${formatCurrency(SINGLE_LIMIT)}.`); return;
    }
    if (numAmount > parseFloat(selectedAccount?.saldo || 0)) {
      Alert.alert('Saldo insuficiente', 'No tienes saldo suficiente para esta transferencia.'); return;
    }
    if (numeroCuentaDestino.trim() === selectedAccount?.numeroCuenta &&
        tipoCuentaDestino === selectedAccount?.tipoCuenta) {
      Alert.alert('Cuenta inválida', 'No puedes transferir a tu misma cuenta.'); return;
    }

    navigation.navigate('TransferConfirm', {
      fromAccount: selectedAccount,
      numeroCuentaDestino: numeroCuentaDestino.trim(),
      tipoCuentaDestino,
      tipoCuentaOrigen: selectedAccount?.tipoCuenta,
      monto: numAmount,
      descripcion: descripcion.trim(),
    });
  };

  if (loading) {
    return (
      <View style={[COMMON_STYLES.container, COMMON_STYLES.center]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={COMMON_STYLES.scrollContent} keyboardShouldPersistTaps="handled">

        {/* Cuenta origen */}
        <Text style={COMMON_STYLES.sectionTitle}>Cuenta origen</Text>
        {accounts.map(acc => (
          <TouchableOpacity
            key={String(acc._id)}
            style={[styles.accountOption, selectedAccount?._id === acc._id && styles.accountOptionSelected]}
            onPress={() => setSelectedAccount(acc)}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.accountType}>
                {acc.tipoCuenta === 'monetaria' ? 'Cuenta Monetaria' : 'Cuenta de Ahorro'}
              </Text>
              <Text style={styles.accountNumber}>•••• {acc.numeroCuenta?.slice(-4)}</Text>
            </View>
            <Text style={styles.accountBalance}>{formatCurrency(acc.saldo)}</Text>
            {selectedAccount?._id === acc._id && (
              <Ionicons name="checkmark-circle" size={22} color={COLORS.accentDark} style={{ marginLeft: 8 }} />
            )}
          </TouchableOpacity>
        ))}

        {/* Info de límites */}
        <View style={styles.limitsBox}>
          <View style={styles.limitRow}>
            <Text style={styles.limitLabel}>Límite por transferencia</Text>
            <Text style={styles.limitValue}>{formatCurrency(SINGLE_LIMIT)}</Text>
          </View>
          <View style={styles.limitRow}>
            <Text style={styles.limitLabel}>Límite diario</Text>
            <Text style={styles.limitValue}>Q 10,000.00</Text>
          </View>
        </View>

        {/* Cuenta destino */}
        <Text style={COMMON_STYLES.sectionTitle}>Cuenta destino</Text>

        <Text style={COMMON_STYLES.label}>Número de cuenta</Text>
        <TextInput
          style={COMMON_STYLES.input}
          placeholder="Ej. 1000000003"
          placeholderTextColor={COLORS.textSecondary}
          value={numeroCuentaDestino}
          onChangeText={setNumeroCuentaDestino}
          keyboardType="numeric"
        />

        <Text style={COMMON_STYLES.label}>Tipo de cuenta destino</Text>
        <View style={styles.typeRow}>
          {['monetaria', 'ahorro'].map(type => (
            <TouchableOpacity
              key={type}
              style={[styles.typeBtn, tipoCuentaDestino === type && styles.typeBtnActive]}
              onPress={() => setTipoCuentaDestino(type)}
            >
              <Text style={[styles.typeBtnText, tipoCuentaDestino === type && styles.typeBtnTextActive]}>
                {type === 'monetaria' ? 'Monetaria' : 'Ahorro'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={COMMON_STYLES.label}>Monto (Q)</Text>
        <TextInput
          style={COMMON_STYLES.input}
          placeholder="0.00"
          placeholderTextColor={COLORS.textSecondary}
          value={monto}
          onChangeText={setMonto}
          keyboardType="decimal-pad"
        />

        <Text style={COMMON_STYLES.label}>Descripción (opcional)</Text>
        <TextInput
          style={COMMON_STYLES.input}
          placeholder="Ej. Pago de renta"
          placeholderTextColor={COLORS.textSecondary}
          value={descripcion}
          onChangeText={setDescripcion}
          maxLength={100}
        />

        <TouchableOpacity style={COMMON_STYLES.primaryButton} onPress={handleContinue}>
          <Text style={COMMON_STYLES.buttonText}>Continuar →</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  accountOption: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: 12,
    padding: 14, marginBottom: 10,
    borderWidth: 1.5, borderColor: COLORS.border,
  },
  accountOptionSelected: { borderColor: COLORS.accent, backgroundColor: COLORS.accentSurface },
  accountType: { fontSize: 12, color: COLORS.textSecondary },
  accountNumber: { fontSize: 15, fontWeight: '600', color: COLORS.text, marginTop: 2 },
  accountBalance: { fontSize: 15, fontWeight: '700', color: COLORS.primary },
  limitsBox: {
    backgroundColor: COLORS.primarySurface, borderRadius: 12,
    padding: 14, marginBottom: 24,
  },
  limitRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  limitLabel: { fontSize: 13, color: COLORS.textSecondary },
  limitValue: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  typeRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  typeBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 8,
    borderWidth: 1.5, borderColor: COLORS.border,
    alignItems: 'center', backgroundColor: COLORS.surface,
  },
  typeBtnActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accentSurface },
  typeBtnText: { fontSize: 14, fontWeight: '500', color: COLORS.textSecondary },
  typeBtnTextActive: { color: COLORS.accentDark, fontWeight: '700' },
});

export default TransferScreen;