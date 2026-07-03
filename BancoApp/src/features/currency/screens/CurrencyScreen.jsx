import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../shared/constants/colors';
import { COMMON_STYLES, THEME } from '../../../shared/constants/theme';
import { convertCurrency } from '../../../api/currency';
import { getMyAccounts } from '../../../api/accounts';

const CURRENCIES = [
  { code: 'USD', label: 'Dólar', flag: '🇺🇸' },
  { code: 'EUR', label: 'Euro', flag: '🇪🇺' },
  { code: 'MXN', label: 'Peso mexicano', flag: '🇲🇽' },
  { code: 'GTQ', label: 'Quetzal', flag: '🇬🇹' },
];

const formatNumber = (amount) =>
  parseFloat(amount || 0).toLocaleString('es-GT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const CurrencyScreen = () => {
  const [accounts, setAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  const [fromCurrency, setFromCurrency] = useState('GTQ');
  const [toCurrency, setToCurrency] = useState('USD');
  const [amount, setAmount] = useState('100');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const data = await getMyAccounts();
        setAccounts(data.data || data);
      } catch {}
      finally { setLoadingAccounts(false); }
    };
    fetchAccounts();
  }, []);

  const handleConvert = async () => {
    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Monto inválido', 'Ingresa un monto válido mayor a 0.'); return;
    }
    if (fromCurrency === toCurrency) {
      Alert.alert('Monedas iguales', 'Selecciona dos monedas diferentes.'); return;
    }
    setLoading(true);
    try {
      const data = await convertCurrency({ from: fromCurrency, to: toCurrency, amount: numAmount });
      setResult(data.data || data);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'No se pudo realizar la conversión.');
    } finally {
      setLoading(false);
    }
  };

  const handleConvertAccount = async (account) => {
    setLoading(true);
    try {
      const data = await convertCurrency({
        from: 'GTQ',
        to: toCurrency,
        accountId: account._id,
      });
      setResult(data.data || data);
      setAmount(String(account.saldo));
      setFromCurrency('GTQ');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'No se pudo convertir el saldo.');
    } finally {
      setLoading(false);
    }
  };

  const CurrencySelector = ({ value, onChange, exclude }) => (
    <View style={styles.currencyRow}>
      {CURRENCIES.filter(c => c.code !== exclude).map(c => (
        <TouchableOpacity
          key={c.code}
          style={[styles.currencyChip, value === c.code && styles.currencyChipActive]}
          onPress={() => onChange(c.code)}
        >
          <Text style={styles.currencyFlag}>{c.flag}</Text>
          <Text style={[styles.currencyCode, value === c.code && styles.currencyCodeActive]}>{c.code}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={COMMON_STYLES.scrollContent} keyboardShouldPersistTaps="handled">

        <View style={styles.header}>
          <Ionicons name="swap-horizontal-outline" size={28} color={COLORS.primary} />
          <Text style={styles.headerTitle}>Conversor de divisas</Text>
          <Text style={styles.headerSubtitle}>Tasas de cambio en tiempo real</Text>
        </View>

        {/* De */}
        <Text style={COMMON_STYLES.label}>Moneda origen</Text>
        <CurrencySelector value={fromCurrency} onChange={setFromCurrency} exclude={toCurrency} />

        <Text style={COMMON_STYLES.label}>Monto</Text>
        <TextInput
          style={COMMON_STYLES.input}
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          placeholder="0.00"
          placeholderTextColor={COLORS.textSecondary}
        />

        <View style={styles.swapIconRow}>
          <View style={styles.swapLine} />
          <TouchableOpacity
            style={styles.swapBtn}
            onPress={() => { setFromCurrency(toCurrency); setToCurrency(fromCurrency); }}
          >
            <Ionicons name="swap-vertical" size={20} color={COLORS.accentDark} />
          </TouchableOpacity>
          <View style={styles.swapLine} />
        </View>

        {/* A */}
        <Text style={COMMON_STYLES.label}>Moneda destino</Text>
        <CurrencySelector value={toCurrency} onChange={setToCurrency} exclude={fromCurrency} />

        <TouchableOpacity
          style={[COMMON_STYLES.primaryButton, loading && COMMON_STYLES.primaryButtonDisabled]}
          onPress={handleConvert}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color={COLORS.white} />
            : <Text style={COMMON_STYLES.buttonText}>Convertir</Text>
          }
        </TouchableOpacity>

        {/* Resultado */}
        {result && (
          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>Resultado de la conversión</Text>
            <Text style={styles.resultAmount}>
              {formatNumber(result.montoConvertido)} {result.monedaDestino}
            </Text>
            <View style={styles.resultDivider} />
            <View style={styles.resultRow}>
              <Text style={styles.resultRowLabel}>Monto original</Text>
              <Text style={styles.resultRowValue}>{formatNumber(result.montoOriginal)} {result.monedaOrigen}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultRowLabel}>Tasa de cambio</Text>
              <Text style={styles.resultRowValue}>1 {result.monedaOrigen} = {result.tasaDeCambio} {result.monedaDestino}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultRowLabel}>Actualizado</Text>
              <Text style={styles.resultRowValue}>{result.fechaActualizacion}</Text>
            </View>
          </View>
        )}

        {/* Convertir saldo de cuentas */}
        {!loadingAccounts && accounts.length > 0 && (
          <View style={{ marginTop: 24 }}>
            <Text style={COMMON_STYLES.sectionTitle}>Convertir saldo de mis cuentas</Text>
            {accounts.map(acc => (
              <TouchableOpacity
                key={String(acc._id)}
                style={styles.accountCard}
                onPress={() => handleConvertAccount(acc)}
                disabled={loading}
              >
                <View>
                  <Text style={styles.accountType}>
                    {acc.tipoCuenta === 'monetaria' ? 'Cuenta Monetaria' : 'Cuenta de Ahorro'}
                  </Text>
                  <Text style={styles.accountBalance}>Q {formatNumber(acc.saldo)}</Text>
                </View>
                <View style={styles.accountConvertBtn}>
                  <Text style={styles.accountConvertText}>Convertir a {toCurrency}</Text>
                  <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  header: { alignItems: 'center', marginBottom: 24 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginTop: 8 },
  headerSubtitle: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  currencyRow: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  currencyChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10,
    borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.surface,
  },
  currencyChipActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accentSurface },
  currencyFlag: { fontSize: 16 },
  currencyCode: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary },
  currencyCodeActive: { color: COLORS.accentDark },
  swapIconRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
  swapLine: { flex: 1, height: 1, backgroundColor: COLORS.borderLight },
  swapBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.primarySurface, justifyContent: 'center', alignItems: 'center',
    marginHorizontal: 10,
  },
  resultCard: {
    backgroundColor: COLORS.primary, borderRadius: 16,
    padding: THEME.spacing.lg, marginTop: 20,
  },
  resultLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
  resultAmount: { fontSize: 30, fontWeight: '800', color: COLORS.white, marginBottom: 14 },
  resultDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginBottom: 10 },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  resultRowLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  resultRowValue: { fontSize: 12, color: COLORS.white, fontWeight: '600' },
  accountCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: COLORS.border,
  },
  accountType: { fontSize: 12, color: COLORS.textSecondary },
  accountBalance: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginTop: 2 },
  accountConvertBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  accountConvertText: { fontSize: 12, fontWeight: '600', color: COLORS.primary },
});

export default CurrencyScreen;