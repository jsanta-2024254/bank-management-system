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
import ProfileMenu from '../../../shared/components/ProfileMenu';

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
            <Ionicons name={icon} size={20} color={COLORS.accentDark} />
          </View>
          <View>
            <Text style={styles.cardType}>{label}</Text>
            <Text style={styles.cardNumber}>•••• •••• {lastFour}</Text>
          </View>
        </View>

        <View style={styles.statusBadge}>
          <View style={[styles.statusDot, { backgroundColor: isActive ? COLORS.accent : COLORS.border }]} />
          <Text style={[styles.statusText, { color: COLORS.textSecondary }] }>
            {isActive ? 'Activa' : 'Inactiva'}
          </Text>
        </View>
      </View>

      {/* Saldo */}
      <Text style={styles.balanceLabel}>Saldo disponible</Text>
      <Text style={styles.balance}>{formatCurrency(account.saldo)}</Text>

      {/* Pie */}
      <View style={styles.cardFooter}>
        <Text style={styles.cardFooterText}>Ver movimientos →</Text>
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

      {/* Header: pantalla blanca con título y saludo */}
      <View style={styles.headerBanner}>
        <View style={styles.headerTopRow}>
          <View>
            <Text style={styles.screenTitle}>Mis cuentas</Text>
            <Text style={styles.greeting}>Hola, {firstName} 👋</Text>
          </View>
          <ProfileMenu />
        </View>

        {/* Resumen: card blanca con borde sutil */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{accounts.length}</Text>
            <Text style={styles.summaryLabel}>Cuenta{accounts.length !== 1 ? 's' : ''}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValueAlt}>
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
    backgroundColor: COLORS.background,
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.lg + 8,
    paddingBottom: THEME.spacing.md,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 6,
  },
  greeting: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
    headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },

  // Resumen rápido
  summaryRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: THEME.borderRadius.xl,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: THEME.spacing.md,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginVertical: 2,
  },
  summaryValue: { fontSize: 18, fontWeight: '700', color: COLORS.primary },
  summaryValueAlt: { fontSize: 18, fontWeight: '700', color: COLORS.primary },
  summaryLabel: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },

  // Lista
  list: { padding: THEME.spacing.lg, paddingBottom: 40 },

  // Tarjeta de cuenta
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: THEME.borderRadius.xl,
    padding: THEME.spacing.lg,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center' },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: THEME.borderRadius.round,
    backgroundColor: COLORS.primarySurface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  cardType: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  cardNumber: {
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 2,
  },

  // Badge de estado
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: { fontSize: 12, fontWeight: '600' },

  // Saldo
  balanceLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  balance: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: -0.5,
  },

  // Pie de tarjeta
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 20,
    paddingTop: 6,
  },
  cardFooterText: {
    fontSize: 13,
    color: COLORS.textSecondary,
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