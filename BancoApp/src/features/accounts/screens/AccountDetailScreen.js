import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  ActivityIndicator, RefreshControl, TouchableOpacity, Alert, ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../shared/constants/colors';
import { COMMON_STYLES, THEME } from '../../../shared/constants/theme';
import { getAccountBalance } from '../../../api/accounts';
import { getTransactionsByAccount } from '../../../api/transactions';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const formatCurrency = (amount) =>
  `Q ${parseFloat(amount || 0).toLocaleString('es-GT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-GT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

// ─── Etiquetas de tipo de transacción (backend en español) ───────────────────
const TX_LABELS = {
  transferencia: 'Transferencia',
  deposito:      'Depósito',
  compra:        'Compra',
  credito:       'Crédito',
  reversion:     'Reversión',
};

const TX_ICONS = {
  transferencia: 'swap-horizontal',
  deposito:      'arrow-down-circle',
  compra:        'bag',
  credito:       'trending-up',
  reversion:     'refresh-circle',
};

// ─── Filtros disponibles ─────────────────────────────────────────────────────
const FILTERS = [
  { key: 'todos',        label: 'Todos'         },
  { key: 'transferencia', label: 'Transferencias' },
  { key: 'deposito',     label: 'Depósitos'     },
  { key: 'compra',       label: 'Compras'        },
  { key: 'credito',      label: 'Créditos'       },
  { key: 'reversion',    label: 'Reversiones'    },
];

// ─── Item de transacción ─────────────────────────────────────────────────────
const TransactionItem = ({ tx, accountId }) => {
  // El backend devuelve: cuentaDestino, cuentaOrigen, tipo, monto, descripcion, createdAt, estado
  const isIncoming =
    String(tx.cuentaDestino) === String(accountId) ||
    tx.tipo === 'credito' ||
    tx.tipo === 'deposito';

  const label = TX_LABELS[tx.tipo] || tx.tipo;
  const icon  = TX_ICONS[tx.tipo]  || 'ellipse';

  const bgColor     = isIncoming ? '#E6F9F2' : '#FEE2E2';
  const iconColor   = isIncoming ? COLORS.credit : COLORS.debit;
  const amountColor = isIncoming ? COLORS.credit : COLORS.debit;
  const prefix      = isIncoming ? '+' : '-';

  return (
    <View style={styles.txItem}>
      <View style={[styles.txIcon, { backgroundColor: bgColor }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>

      <View style={styles.txInfo}>
        <Text style={styles.txLabel}>{label}</Text>
        {tx.descripcion ? (
          <Text style={styles.txDesc} numberOfLines={1}>{tx.descripcion}</Text>
        ) : null}
        <Text style={styles.txDate}>{formatDate(tx.createdAt)}</Text>
      </View>

      <View style={styles.txRight}>
        <Text style={[styles.txAmount, { color: amountColor }]}>
          {prefix}{formatCurrency(tx.monto)}
        </Text>
        {tx.estado === 'revertida' && (
          <Text style={styles.txReverted}>Revertida</Text>
        )}
      </View>
    </View>
  );
};

// ─── Chip de filtro ──────────────────────────────────────────────────────────
const FilterChip = ({ label, active, onPress }) => (
  <TouchableOpacity
    style={[styles.chip, active && styles.chipActive]}
    onPress={onPress}
    activeOpacity={0.75}
  >
    <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
  </TouchableOpacity>
);

// ─── Pantalla de detalle ─────────────────────────────────────────────────────
const AccountDetailScreen = ({ route }) => {
  const { account } = route.params;
  const accountId = account._id || account.id;

  const [balance, setBalance]           = useState(account.saldo ?? null);
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter]             = useState('todos');
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);

  const fetchData = async () => {
    try {
      const [balanceRes, txRes] = await Promise.all([
        getAccountBalance(accountId),
        getTransactionsByAccount(accountId),
      ]);

      // GET /accounts/:id/balance → { success, data: { saldo, ... } }
      if (balanceRes?.data?.saldo !== undefined) {
        setBalance(balanceRes.data.saldo);
      }

      setTransactions(txRes.data || txRes);
    } catch {
      Alert.alert('Error', 'No se pudieron cargar los movimientos.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchData(); }, []));

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  // Filtrado
  const filtered = filter === 'todos'
    ? transactions
    : transactions.filter((tx) => tx.tipo === filter);

  const isActive = account.estado === true;
  const label = account.tipoCuenta === 'monetaria' ? 'Cuenta Monetaria' : 'Cuenta de Ahorro';

  return (
    <View style={COMMON_STYLES.container}>

      {/* ── Tarjeta resumen ── */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <View>
            <Text style={styles.accountType}>{label}</Text>
            <Text style={styles.accountNumber}>N° {account.numeroCuenta}</Text>
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

        <Text style={styles.balanceLabel}>Saldo actual</Text>
        <Text style={styles.balance}>
          {balance !== null ? formatCurrency(balance) : '—'}
        </Text>

        {/* Mini stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="arrow-up" size={14} color="rgba(255,255,255,0.6)" />
            <Text style={styles.statValue}>
              {formatCurrency(
                transactions
                  .filter((t) =>
                    String(t.cuentaOrigen) === String(accountId) &&
                    t.tipo !== 'credito' && t.tipo !== 'deposito'
                  )
                  .reduce((s, t) => s + (t.monto || 0), 0)
              )}
            </Text>
            <Text style={styles.statLabel}>Salidas</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="arrow-down" size={14} color="rgba(255,255,255,0.6)" />
            <Text style={styles.statValue}>
              {formatCurrency(
                transactions
                  .filter((t) =>
                    String(t.cuentaDestino) === String(accountId) ||
                    t.tipo === 'credito' || t.tipo === 'deposito'
                  )
                  .reduce((s, t) => s + (t.monto || 0), 0)
              )}
            </Text>
            <Text style={styles.statLabel}>Entradas</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="list" size={14} color="rgba(255,255,255,0.6)" />
            <Text style={styles.statValue}>{transactions.length}</Text>
            <Text style={styles.statLabel}>Movimientos</Text>
          </View>
        </View>
      </View>

      {/* ── Filtros ── */}
      <View style={styles.filtersWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersList}
        >
          {FILTERS.map((f) => (
            <FilterChip
              key={f.key}
              label={f.label}
              active={filter === f.key}
              onPress={() => setFilter(f.key)}
            />
          ))}
        </ScrollView>
      </View>

      {/* ── Encabezado de sección ── */}
      <Text style={styles.sectionTitle}>
        {filter === 'todos' ? 'Todos los movimientos' : TX_LABELS[filter]}
        {filtered.length > 0 && (
          <Text style={styles.sectionCount}> ({filtered.length})</Text>
        )}
      </Text>

      {/* ── Lista de transacciones ── */}
      {loading ? (
        <ActivityIndicator color={COLORS.primary} style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item._id || item.id)}
          renderItem={({ item }) => (
            <TransactionItem tx={item} accountId={accountId} />
          )}
          contentContainerStyle={styles.txList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          ListEmptyComponent={
            <View style={[COMMON_STYLES.center, { marginTop: 50 }]}>
              <Ionicons name="receipt-outline" size={52} color={COLORS.border} />
              <Text style={styles.emptyText}>
                {filter === 'todos'
                  ? 'Sin movimientos registrados'
                  : `Sin ${TX_LABELS[filter]?.toLowerCase() ?? 'movimientos'}`}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

// ─── Estilos ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Tarjeta resumen
  summaryCard: {
    backgroundColor: COLORS.primary,
    padding: THEME.spacing.lg,
    paddingTop: 24,
    paddingBottom: 20,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  accountType: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  accountNumber: {
    fontSize: 15,
    color: COLORS.white,
    fontWeight: '600',
    marginTop: 2,
    letterSpacing: 0.5,
  },
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

  balanceLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.65)',
    marginBottom: 4,
  },
  balance: {
    fontSize: 34,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -0.5,
    marginBottom: 20,
  },

  // Mini stats
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: THEME.borderRadius.md,
    paddingVertical: 12,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginVertical: 2,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.white,
    marginTop: 4,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },

  // Filtros
  filtersWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  filtersList: {
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: 12,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: THEME.borderRadius.round,
    backgroundColor: COLORS.borderLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: COLORS.accentSurface,
    borderColor: COLORS.accent,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  chipTextActive: {
    color: COLORS.accentDark,
    fontWeight: '700',
  },

  // Encabezado sección
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: 14,
    paddingBottom: 6,
  },
  sectionCount: {
    fontWeight: '400',
    color: COLORS.textSecondary,
  },

  // Lista de transacciones
  txList: {
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: 6,
    paddingBottom: 40,
  },
  txItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: THEME.borderRadius.lg,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  txIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  txInfo: { flex: 1 },
  txLabel: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  txDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  txDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  txRight: { alignItems: 'flex-end' },
  txAmount: { fontSize: 15, fontWeight: '700' },
  txReverted: {
    fontSize: 10,
    color: COLORS.error,
    fontWeight: '600',
    marginTop: 2,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },

  // Empty
  emptyText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginTop: 12,
    textAlign: 'center',
  },
});

export default AccountDetailScreen;