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
  `Q ${parseFloat(amount || 0).toLocaleString('es-GT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

// ─── Tarjeta visual de cuenta ───────────────────────────────────────────────
const AccountCard = ({ account, onPress }) => {
  // El backend devuelve: numeroCuenta, tipoCuenta, saldo, estado (boolean)
  const isActive = account.estado === true;
  const lastFour = account.numeroCuenta?.slice(-4) ?? '????';
  const label = account.tipoCuenta === 'monetaria' ? 'Cuenta Monetaria' : 'Cuenta de Ahorro';
  const icon = account.tipoCuenta === 'monetaria' ? 'card' : 'wallet';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {/* Cabecera: tipo + badge de estado */}
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <View style={styles.iconWrapper}>
            <Ionicons name={icon} size={20} color={COLORS.white} />
          </View>
          <View>
            <Text style={styles.cardType}>{label}</Text>
            <Text style={styles.cardNumber}>•••• •••• {lastFour}</Text>
          </View>
        </View>

        <View style={[
          styles.statusBadge,
          { backgroundColor: isActive ? 'rgba(15,157,107,0.25)' : 'rgba(192,57,43,0.25)' },
        ]}>
          <View style={[
            styles.statusDot,
            { backgroundColor: isActive ? COLORS.success : COLORS.error },
          ]} />
          <Text style={[
            styles.statusText,
            { color: isActive ? COLORS.success : COLORS.error },
          ]}>
            {isActive ? 'Activa' : 'Inactiva'}
          </Text>
        </View>
      </View>

      {/* Saldo */}
      <Text style={styles.balanceLabel}>Saldo disponible</Text>
      <Text style={styles.balance}>{formatCurrency(account.saldo)}</Text>

      {/* Pie */}
      <View style={styles.cardFooter}>
        <Text style={styles.cardFooterText}>Ver movimientos</Text>
        <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.7)" />
      </View>
    </TouchableOpacity>
  );
};

// ─── Pantalla principal ──────────────────────────────────────────────────────
const AccountsScreen = ({ navigation }) => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuthStore();

  const fetchAccounts = async () => {
    try {
      const data = await getMyAccounts();
      setAccounts(data.data || data);
    } catch {
      Alert.alert('Error', 'No se pudieron cargar las cuentas.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchAccounts(); }, []));

  const onRefresh = () => { setRefreshing(true); fetchAccounts(); };

  const firstName = user?.firstName || user?.username || 'Usuario';

  if (loading) {
    return (
      <View style={[COMMON_STYLES.container, COMMON_STYLES.center]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={COMMON_STYLES.container}>

      {/* Banner / Greeting */}
      <View style={styles.headerBanner}>
        <Text style={styles.greeting}>Hola, {firstName} 👋</Text>
        <Text style={styles.headerSub}>Aquí están tus cuentas</Text>

        {/* Resumen rápido */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{accounts.length}</Text>
            <Text style={styles.summaryLabel}>Cuenta{accounts.length !== 1 ? 's' : ''}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>
              {formatCurrency(accounts.reduce((sum, a) => sum + (a.saldo || 0), 0))}
            </Text>
            <Text style={styles.summaryLabel}>Saldo total</Text>
          </View>
        </View>
      </View>

      {/* Lista de cuentas */}
      <FlatList
        data={accounts}
        keyExtractor={(item) => String(item._id || item.id)}
        renderItem={({ item }) => (
          <AccountCard
            account={item}
            onPress={() => navigation.navigate('AccountDetail', { account: item })}
          />
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          <View style={[COMMON_STYLES.center, { marginTop: 60 }]}>
            <Ionicons name="wallet-outline" size={56} color={COLORS.border} />
            <Text style={styles.emptyText}>No tienes cuentas registradas</Text>
            <Text style={styles.emptySubText}>Contacta a tu banco para abrir una cuenta</Text>
          </View>
        }
      />
    </View>
  );
};

// ─── Estilos ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Header
  headerBanner: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: 48,
    paddingBottom: 28,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.white,
  },
  headerSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
    marginBottom: 20,
  },

  // Resumen rápido
  summaryRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: THEME.borderRadius.lg,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 2,
  },
  summaryValue: { fontSize: 18, fontWeight: '700', color: COLORS.white },
  summaryLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },

  // Lista
  list: { padding: THEME.spacing.lg, paddingBottom: 40 },

  // Tarjeta de cuenta
  card: {
    backgroundColor: COLORS.primary,
    borderRadius: THEME.borderRadius.xl,
    padding: THEME.spacing.lg,
    marginBottom: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center' },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  cardType: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '500',
  },
  cardNumber: {
    fontSize: 15,
    color: COLORS.white,
    fontWeight: '600',
    letterSpacing: 1,
    marginTop: 2,
  },

  // Badge de estado
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: THEME.borderRadius.round,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  statusText: { fontSize: 12, fontWeight: '700' },

  // Saldo
  balanceLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.65)',
    marginBottom: 4,
  },
  balance: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -0.5,
  },

  // Pie de tarjeta
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
    paddingTop: 12,
  },
  cardFooterText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    marginRight: 4,
  },

  // Empty state
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 14,
  },
  emptySubText: {
    fontSize: 13,
    color: COLORS.border,
    marginTop: 6,
    textAlign: 'center',
  },
});

export default AccountsScreen;