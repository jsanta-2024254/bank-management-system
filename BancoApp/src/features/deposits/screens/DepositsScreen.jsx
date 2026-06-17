import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../shared/constants/colors';
import { COMMON_STYLES, THEME } from '../../../shared/constants/theme';
import { getMyDepositRequests } from '../../../api/deposits';

const formatCurrency = (amount) =>
  `Q ${parseFloat(amount || 0).toLocaleString('es-GT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-GT', { day: '2-digit', month: 'short', year: 'numeric' });
};

const STATUS_CONFIG = {
  pendiente:  { label: 'Pendiente',  color: COLORS.warning,  bg: '#FEF3C7', icon: 'time-outline' },
  aprobada:   { label: 'Aprobada',   color: COLORS.success,  bg: '#E6F9F2', icon: 'checkmark-circle-outline' },
  rechazada:  { label: 'Rechazada',  color: COLORS.error,    bg: '#FEE2E2', icon: 'close-circle-outline' },
};

const DepositRequestCard = ({ item }) => {
  const status = STATUS_CONFIG[item.estado] || STATUS_CONFIG.pendiente;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <View style={[styles.iconBox, { backgroundColor: status.bg }]}>
            <Ionicons name={status.icon} size={20} color={status.color} />
          </View>
          <View>
            <Text style={styles.cardType}>
              {item.tipoDeposito === 'efectivo' ? '💵 Efectivo' : '🧾 Cheque'}
            </Text>
            <Text style={styles.cardDate}>{formatDate(item.createdAt)}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
          <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>

      {/* Cuenta */}
      {item.cuenta && (
        <View style={styles.accountRow}>
          <Ionicons name="card-outline" size={14} color={COLORS.textSecondary} />
          <Text style={styles.accountText}>
            {item.cuenta.tipoCuenta === 'monetaria' ? 'Monetaria' : 'Ahorro'} ••••{item.cuenta.numeroCuenta?.slice(-4)}
          </Text>
        </View>
      )}

      {/* Monto */}
      <Text style={styles.amount}>{formatCurrency(item.monto)}</Text>

      {/* Referencia */}
      {item.referencia ? (
        <Text style={styles.referencia}>Ref: {item.referencia}</Text>
      ) : null}

      {/* Comentario usuario */}
      {item.comentarioUsuario ? (
        <Text style={styles.comentario}>{item.comentarioUsuario}</Text>
      ) : null}

      {/* Motivo de rechazo */}
      {item.estado === 'rechazada' && item.motivoRechazo ? (
        <View style={styles.rejectionBox}>
          <Ionicons name="alert-circle" size={14} color={COLORS.error} />
          <Text style={styles.rejectionText}>{item.motivoRechazo}</Text>
        </View>
      ) : null}
    </View>
  );
};

const DepositsScreen = ({ navigation }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRequests = async () => {
  try {
    const data = await getMyDepositRequests();
    setRequests(data.data || data);
  } catch (error) {
    console.log('ERROR deposits:', error.message);
    console.log('ERROR status:', error.response?.status);
    Alert.alert('Error', 'No se pudieron cargar las solicitudes.');
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};

  useFocusEffect(useCallback(() => { fetchRequests(); }, []));

  const onRefresh = () => { setRefreshing(true); fetchRequests(); };

  if (loading) {
    return (
      <View style={[COMMON_STYLES.container, COMMON_STYLES.center]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={COMMON_STYLES.container}>
      <FlatList
        data={requests}
        keyExtractor={(item) => String(item._id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <TouchableOpacity
            style={styles.newBtn}
            onPress={() => navigation.navigate('RequestDeposit')}
            activeOpacity={0.85}
          >
            <Ionicons name="add-circle" size={22} color={COLORS.white} />
            <Text style={styles.newBtnText}>Nueva solicitud de depósito</Text>
          </TouchableOpacity>
        }
        ListEmptyComponent={
          <View style={[COMMON_STYLES.center, { marginTop: 60 }]}>
            <Ionicons name="arrow-down-circle-outline" size={52} color={COLORS.border} />
            <Text style={styles.emptyTitle}>Sin solicitudes</Text>
            <Text style={styles.emptySubtitle}>Aún no has solicitado ningún depósito.</Text>
          </View>
        }
        renderItem={({ item }) => <DepositRequestCard item={item} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  list: { padding: THEME.spacing.lg, paddingBottom: 40 },
  newBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.primaryLight, borderRadius: 12,
    padding: 14, marginBottom: 20, gap: 8,
  },
  newBtnText: { color: COLORS.white, fontSize: 15, fontWeight: '600' },
  card: {
    backgroundColor: COLORS.surface, borderRadius: 14,
    padding: 14, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBox: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  cardType: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  cardDate: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: '700' },
  accountRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  accountText: { fontSize: 13, color: COLORS.textSecondary },
  amount: { fontSize: 24, fontWeight: '800', color: COLORS.primary, marginBottom: 6 },
  referencia: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 2 },
  comentario: { fontSize: 13, color: COLORS.textSecondary, fontStyle: 'italic', marginBottom: 4 },
  rejectionBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 6,
    backgroundColor: '#FEE2E2', borderRadius: 8, padding: 10, marginTop: 8,
  },
  rejectionText: { fontSize: 13, color: COLORS.error, flex: 1, lineHeight: 18 },
  emptyTitle: { fontSize: 17, fontWeight: '600', color: COLORS.text, marginTop: 14 },
  emptySubtitle: { fontSize: 13, color: COLORS.textSecondary, marginTop: 6, textAlign: 'center' },
});

export default DepositsScreen;