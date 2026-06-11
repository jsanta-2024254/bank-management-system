import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../shared/constants/colors';
import { COMMON_STYLES, THEME } from '../../../shared/constants/theme';
import { getMyAccounts } from '../../../api/accounts';
import { getTransactionsByAccount } from '../../../api/transactions';

const DAILY_LIMIT = 10000;
const SINGLE_LIMIT = 2000;

const formatCurrency = (amount) =>
  `Q ${parseFloat(amount || 0).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const TransferScreen = ({ navigation, route }) => {
  const prefill = route.params?.favorite || null;
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [toAccountNumber, setToAccountNumber] = useState(prefill?.accountNumber || '');
  const [toAccountType, setToAccountType] = useState(prefill?.accountType || 'monetaria');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [dailyUsed, setDailyUsed] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAccounts(); }, []);

  const fetchAccounts = async () => {
    try {
      const data = await getMyAccounts();
      const list = data.data || data;
      setAccounts(list);
      if (list.length > 0) {
        setSelectedAccount(list[0]);
        fetchDailyUsed(list[0]._id || list[0].id);
      }
    } catch {
      Alert.alert('Error', 'No se pudieron cargar tus cuentas.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDailyUsed = async (accountId) => {
    try {
      const data = await getTransactionsByAccount(accountId);
      const txs = data.data || data;
      const today = new Date().toDateString();
      const used = txs
        .filter(tx => tx.type === 'transfer' && new Date(tx.createdAt).toDateString() === today)
        .reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);
      setDailyUsed(used);
    } catch {}
  };

  const handleAccountSelect = (acc) => {
    setSelectedAccount(acc);
    fetchDailyUsed(acc._id || acc.id);
  };

  const handleContinue = () => {
    const numAmount = parseFloat(amount);

    if (!toAccountNumber.trim()) {
      Alert.alert('Campo requerido', 'Ingresa el número de cuenta destino.'); return;
    }
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Monto inválido', 'Ingresa un monto válido mayor a Q0.00'); return;
    }
    if (numAmount > SINGLE_LIMIT) {
      Alert.alert('Límite excedido', `El máximo por transferencia es ${formatCurrency(SINGLE_LIMIT)}.`); return;
    }
    if (dailyUsed + numAmount > DAILY_LIMIT) {
      const remaining = DAILY_LIMIT - dailyUsed;
      Alert.alert('Límite diario excedido', `Solo puedes transferir ${formatCurrency(remaining)} más hoy.`); return;
    }
    if (numAmount > parseFloat(selectedAccount?.balance || 0)) {
      Alert.alert('Saldo insuficiente', 'No tienes saldo suficiente para esta transferencia.'); return;
    }

    navigation.navigate('TransferConfirm', {
      fromAccount: selectedAccount,
      toAccountNumber: toAccountNumber.trim(),
      toAccountType,
      amount: numAmount,
      description: description.trim(),
    });
  };

  if (loading) {
    return <View style={[COMMON_STYLES.container, COMMON_STYLES.center]}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  }

  const remaining = DAILY_LIMIT - dailyUsed;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={COMMON_STYLES.scrollContent} keyboardShouldPersistTaps="handled">

        {/* Selector de cuenta origen */}
        <Text style={COMMON_STYLES.sectionTitle}>Cuenta origen</Text>
        {accounts.map(acc => (
          <TouchableOpacity
            key={acc._id || acc.id}
            style={[styles.accountOption, selectedAccount?._id === acc._id && styles.accountOptionSelected]}
            onPress={() => handleAccountSelect(acc)}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.accountOptionType}>
                {acc.accountType === 'monetaria' ? 'Cuenta Monetaria' : 'Cuenta de Ahorro'}
              </Text>
              <Text style={styles.accountOptionNumber}>•••• {acc.accountNumber?.slice(-4)}</Text>
            </View>
            <Text style={styles.accountOptionBalance}>{formatCurrency(acc.balance)}</Text>
            {selectedAccount?._id === acc._id && (
              <Ionicons name="checkmark-circle" size={22} color={COLORS.primary} style={{ marginLeft: 8 }} />
            )}
          </TouchableOpacity>
        ))}

        {/* Límites */}
        <View style={styles.limitsBox}>
          <View style={styles.limitRow}>
            <Text style={styles.limitLabel}>Límite por transferencia</Text>
            <Text style={styles.limitValue}>{formatCurrency(SINGLE_LIMIT)}</Text>
          </View>
          <View style={styles.limitRow}>
            <Text style={styles.limitLabel}>Disponible hoy</Text>
            <Text style={[styles.limitValue, { color: remaining < 500 ? COLORS.error : COLORS.success }]}>
              {formatCurrency(remaining)}
            </Text>
          </View>
        </View>

        {/* Cuenta destino */}
        <Text style={COMMON_STYLES.sectionTitle}>Cuenta destino</Text>

        <Text style={COMMON_STYLES.label}>Número de cuenta</Text>
        <TextInput
          style={COMMON_STYLES.input}
          placeholder="Ej. 1234567890"
          placeholderTextColor={COLORS.textSecondary}
          value={toAccountNumber}
          onChangeText={setToAccountNumber}
          keyboardType="numeric"
        />

        <Text style={COMMON_STYLES.label}>Tipo de cuenta</Text>
        <View style={styles.typeRow}>
          {['monetaria', 'ahorro'].map(type => (
            <TouchableOpacity
              key={type}
              style={[styles.typeBtn, toAccountType === type && styles.typeBtnActive]}
              onPress={() => setToAccountType(type)}
            >
              <Text style={[styles.typeBtnText, toAccountType === type && styles.typeBtnTextActive]}>
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
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
        />

        <Text style={COMMON_STYLES.label}>Descripción (opcional)</Text>
        <TextInput
          style={COMMON_STYLES.input}
          placeholder="Ej. Pago de renta"
          placeholderTextColor={COLORS.textSecondary}
          value={description}
          onChangeText={setDescription}
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
  accountOptionSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primarySurface },
  accountOptionType: { fontSize: 12, color: COLORS.textSecondary },
  accountOptionNumber: { fontSize: 15, fontWeight: '600', color: COLORS.text, marginTop: 2 },
  accountOptionBalance: { fontSize: 15, fontWeight: '700', color: COLORS.primary },
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
  typeBtnActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primarySurface },
  typeBtnText: { fontSize: 14, fontWeight: '500', color: COLORS.textSecondary },
  typeBtnTextActive: { color: COLORS.primary, fontWeight: '700' },
});

export default TransferScreen;