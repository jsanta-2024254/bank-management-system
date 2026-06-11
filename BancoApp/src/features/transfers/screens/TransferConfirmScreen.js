import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, ScrollView, Alert,
} from 'react-native';
import { COLORS } from '../../../shared/constants/colors';
import { COMMON_STYLES, THEME } from '../../../shared/constants/theme';
import { transfer } from '../../../api/transactions';

const formatCurrency = (amount) =>
  `Q ${parseFloat(amount || 0).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const Row = ({ label, value, highlight }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={[styles.rowValue, highlight && { color: COLORS.primary, fontWeight: '700' }]}>{value}</Text>
  </View>
);

const TransferConfirmScreen = ({ navigation, route }) => {
  const { fromAccount, toAccountNumber, toAccountType, amount, description } = route.params;
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await transfer({
        fromAccountId: fromAccount._id || fromAccount.id,
        toAccountNumber,
        toAccountType,
        amount,
        description,
      });
      navigation.replace('TransferSuccess', { amount, toAccountNumber });
    } catch (error) {
      const msg = error.response?.data?.message || 'No se pudo completar la transferencia.';
      Alert.alert('Transferencia fallida', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={COMMON_STYLES.scrollContent}>
      <View style={styles.iconBox}>
        <Text style={styles.icon}>📋</Text>
      </View>
      <Text style={styles.title}>Confirma tu transferencia</Text>
      <Text style={styles.subtitle}>Revisa los datos antes de continuar. Esta acción no se puede deshacer.</Text>

      <View style={styles.card}>
        <Row label="Cuenta origen" value={`•••• ${fromAccount.accountNumber?.slice(-4)}`} />
        <Row label="Tipo origen" value={fromAccount.accountType === 'monetaria' ? 'Monetaria' : 'Ahorro'} />
        <View style={styles.divider} />
        <Row label="Cuenta destino" value={toAccountNumber} />
        <Row label="Tipo destino" value={toAccountType === 'monetaria' ? 'Monetaria' : 'Ahorro'} />
        {description ? <Row label="Descripción" value={description} /> : null}
        <View style={styles.divider} />
        <Row label="Monto a transferir" value={formatCurrency(amount)} highlight />
      </View>

      <TouchableOpacity
        style={[COMMON_STYLES.primaryButton, loading && COMMON_STYLES.primaryButtonDisabled]}
        onPress={handleConfirm}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color={COLORS.white} />
          : <Text style={COMMON_STYLES.buttonText}>Confirmar transferencia</Text>
        }
      </TouchableOpacity>

      <TouchableOpacity
        style={[COMMON_STYLES.secondaryButton, { marginTop: 12 }]}
        onPress={() => navigation.goBack()}
        disabled={loading}
      >
        <Text style={COMMON_STYLES.secondaryButtonText}>Cancelar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  iconBox: { alignItems: 'center', marginBottom: 16 },
  icon: { fontSize: 48 },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.text, textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 19, marginBottom: 24 },
  card: {
    backgroundColor: COLORS.surface, borderRadius: 16,
    padding: THEME.spacing.lg, marginBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  rowLabel: { fontSize: 14, color: COLORS.textSecondary },
  rowValue: { fontSize: 14, color: COLORS.text, fontWeight: '500', maxWidth: '55%', textAlign: 'right' },
  divider: { height: 1, backgroundColor: COLORS.borderLight, marginVertical: 4 },
});

export default TransferConfirmScreen;