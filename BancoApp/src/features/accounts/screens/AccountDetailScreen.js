import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  ActivityIndicator, RefreshControl, TouchableOpacity, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../shared/constants/colors';
import { COMMON_STYLES, THEME } from '../../../shared/constants/theme';
import { getTransactionsByAccount } from '../../../api/transactions';

const formatCurrency = (amount) =>
  `Q ${parseFloat(amount || 0).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-GT', { day: '2-digit', month: 'short', year: 'numeric' });
};

const TX_LABELS = {
  transfer: 'Transferencia',
  purchase: 'Compra',
  credit: 'Crédito',
  deposit: 'Depósito',
  reversal: 'Reversión',
};

const TransactionItem = ({ tx, accountId }) => {
  const isCredit = tx.toAccount === accountId || tx.type === 'credit' || tx.type === 'deposit';
  return (
    <View style={styles.txItem}>
      <View style={[styles.txIcon, { backgroundColor: isCredit ? '#E6F9F2' : '#FEE2E2' }]}>
        <Ionicons
          name={isCredit ? 'arrow-down' : 'arrow-up'}
          size={18}
          color={isCredit ? COLORS.credit : COLORS.debit}
        />
      </View>
      <View style={styles.txInfo}>
        <Text style={styles.txLabel}>{TX_LABELS[tx.type] || tx.type}</Text>
        <Text style={styles.txDate}>{formatDate(tx.createdAt)}</Text>
        {tx.description ? <Text style={styles.txDesc} numberOfLines={1}>{tx.description}</Text> : null}
      </View>
      <Text style={[styles.txAmount, { color: isCredit ? COLORS.credit : COLORS.debit }]}>
        {isCredit ? '+' : '-'}{formatCurrency(tx.amount)}
      </Text>
    </View>
  );
};

const AccountDetailScreen = ({ route }) => {
  const { account } = route.params;
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTransactions = async () => {
    try {
      const data = await getTransactionsByAccount(account._id || account.id);
      setTransactions(data.data || data);
    } catch {
      Alert.alert('Error', 'No se pudieron cargar los movimientos.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchTransactions(); }, []));

  const onRefresh = () => { setRefreshing(true); fetchTransactions(); };

  return (
    <View style={COMMON_STYLES.container}>
      {/* Tarjeta resumen de cuenta */}
      <View style={styles.summaryCard}>
        <Text style={styles.accountType}>
          {account.accountType === 'monetaria' ? 'Cuenta Monetaria' : 'Cuenta de Ahorro'}
        </Text>
        <Text style={styles.accountNumber}>N° {account.accountNumber}</Text>
        <Text style={styles.balanceLabel}>Saldo actual</Text>
        <Text style={styles.balance}>{formatCurrency(account.balance)}</Text>
      </View>

      <Text style={[COMMON_STYLES.sectionTitle, { paddingHorizontal: THEME.spacing.lg, marginTop: 16 }]}>
        Movimientos
      </Text>

      {loading
        ? <ActivityIndicator color={COLORS.primary} style={{ marginTop: 32 }} />
        : (
          <FlatList
            data={transactions}
            keyExtractor={(item) => item._id || item.id}
            renderItem={({ item }) => (
              <TransactionItem tx={item} accountId={account._id || account.id} />
            )}
            contentContainerStyle={{ paddingHorizontal: THEME.spacing.lg, paddingBottom: 40 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
            ListEmptyComponent={
              <View style={[COMMON_STYLES.center, { marginTop: 40 }]}>
                <Ionicons name="receipt-outline" size={48} color={COLORS.border} />
                <Text style={styles.emptyText}>Sin movimientos registrados</Text>
              </View>
            }
          />
        )
      }
    </View>
  );
};

const styles = StyleSheet.create({
  summaryCard: {
    backgroundColor: COLORS.primary,
    padding: THEME.spacing.lg,
    paddingTop: 28,
    paddingBottom: 28,
  },
  accountType: { fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: '500' },
  accountNumber: { fontSize: 15, color: COLORS.white, fontWeight: '600', marginBottom: 16, marginTop: 2 },
  balanceLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
  balance: { fontSize: 32, fontWeight: '800', color: COLORS.white },
  txItem: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: 12,
    padding: 14, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  txIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  txInfo: { flex: 1 },
  txLabel: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  txDate: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  txDesc: { fontSize: 12, color: COLORS.textSecondary, marginTop: 1 },
  txAmount: { fontSize: 15, fontWeight: '700' },
  emptyText: { fontSize: 15, color: COLORS.textSecondary, marginTop: 12 },
});

export default AccountDetailScreen;