import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../shared/constants/colors';
import { COMMON_STYLES, THEME } from '../../../shared/constants/theme';
import { getMyAccounts } from '../../../api/accounts';
import useAuthStore from '../../../store/useAuthStore';

const formatCurrency = (amount) =>
  `Q ${parseFloat(amount || 0).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const AccountCard = ({ account, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
    <View style={styles.cardHeader}>
      <View>
        <Text style={styles.cardType}>{account.accountType === 'monetaria' ? 'Cuenta Monetaria' : 'Cuenta de Ahorro'}</Text>
        <Text style={styles.cardNumber}>•••• {account.accountNumber?.slice(-4)}</Text>
      </View>
      <View style={[styles.statusBadge, { backgroundColor: account.status === 'active' ? COLORS.primarySurface : '#FEE2E2' }]}>
        <Text style={[styles.statusText, { color: account.status === 'active' ? COLORS.primary : COLORS.error }]}>
          {account.status === 'active' ? 'Activa' : 'Inactiva'}
        </Text>
      </View>
    </View>
    <Text style={styles.balanceLabel}>Saldo disponible</Text>
    <Text style={styles.balance}>{formatCurrency(account.balance)}</Text>
    <View style={styles.cardFooter}>
      <Text style={styles.cardFooterText}>Ver movimientos →</Text>
    </View>
  </TouchableOpacity>
);

const AccountsScreen = ({ navigation }) => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuthStore();

  const fetchAccounts = async () => {
    try {
      const data = await getMyAccounts();
      setAccounts(data.data || data);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las cuentas.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchAccounts(); }, []));

  const onRefresh = () => { setRefreshing(true); fetchAccounts(); };

  if (loading) {
    return (
      <View style={[COMMON_STYLES.container, COMMON_STYLES.center]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={COMMON_STYLES.container}>
      <View style={styles.headerBanner}>
        <Text style={styles.greeting}>Hola, {user?.firstName || user?.username} 👋</Text>
        <Text style={styles.headerSub}>Aquí están tus cuentas</Text>
      </View>

      <FlatList
        data={accounts}
        keyExtractor={(item) => item._id || item.id}
        renderItem={({ item }) => (
          <AccountCard
            account={item}
            onPress={() => navigation.navigate('AccountDetail', { account: item })}
          />
        )}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
        ListEmptyComponent={
          <View style={COMMON_STYLES.center}>
            <Ionicons name="wallet-outline" size={48} color={COLORS.border} />
            <Text style={styles.emptyText}>No tienes cuentas registradas</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  headerBanner: {
    backgroundColor: COLORS.primary,
    padding: THEME.spacing.lg,
    paddingTop: 48,
    paddingBottom: 24,
  },
  greeting: { fontSize: 22, fontWeight: '700', color: COLORS.white },
  headerSub: { fontSize: 14, color: 'rgba(255,255,255,0.75)', marginTop: 4 },
  list: { padding: THEME.spacing.lg, paddingBottom: 40 },
  card: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: THEME.spacing.lg,
    marginBottom: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  cardType: { fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
  cardNumber: { fontSize: 16, color: COLORS.white, fontWeight: '600', marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: '600' },
  balanceLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
  balance: { fontSize: 30, fontWeight: '800', color: COLORS.white },
  cardFooter: { marginTop: 20, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)', paddingTop: 12 },
  cardFooterText: { fontSize: 13, color: 'rgba(255,255,255,0.8)', textAlign: 'right' },
  emptyText: { fontSize: 15, color: COLORS.textSecondary, marginTop: 12 },
});

export default AccountsScreen;