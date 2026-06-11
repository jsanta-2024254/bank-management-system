import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../../../shared/constants/colors';
import { COMMON_STYLES, THEME } from '../../../shared/constants/theme';

const formatCurrency = (amount) =>
  `Q ${parseFloat(amount || 0).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const TransferSuccessScreen = ({ navigation, route }) => {
  const { amount, toAccountNumber } = route.params;

  return (
    <View style={styles.container}>
      <View style={styles.iconBox}>
        <Text style={styles.icon}>✅</Text>
      </View>
      <Text style={styles.title}>¡Transferencia exitosa!</Text>
      <Text style={styles.amount}>{formatCurrency(amount)}</Text>
      <Text style={styles.subtitle}>
        Transferencia enviada a la cuenta{'\n'}
        <Text style={styles.highlight}>{toAccountNumber}</Text>
      </Text>

      <TouchableOpacity
        style={COMMON_STYLES.primaryButton}
        onPress={() => navigation.navigate('Transfer')}
      >
        <Text style={COMMON_STYLES.buttonText}>Nueva transferencia</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[COMMON_STYLES.secondaryButton, { marginTop: 12 }]}
        onPress={() => navigation.navigate('Inicio', { screen: 'AccountsHome' })}
      >
        <Text style={COMMON_STYLES.secondaryButtonText}>Ir a mis cuentas</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: COLORS.background,
    padding: THEME.spacing.lg, justifyContent: 'center', alignItems: 'center',
  },
  iconBox: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: '#E6F9F2', justifyContent: 'center',
    alignItems: 'center', marginBottom: 24,
  },
  icon: { fontSize: 48 },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.text, marginBottom: 12 },
  amount: { fontSize: 36, fontWeight: '800', color: COLORS.primary, marginBottom: 12 },
  subtitle: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 40 },
  highlight: { color: COLORS.text, fontWeight: '600' },
});

export default TransferSuccessScreen;