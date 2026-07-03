import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../shared/constants/colors';
import { COMMON_STYLES, THEME } from '../../../shared/constants/theme';
import { getMyCreditRequests } from '../../../api/products';

const formatCurrency = (amount) =>
  `Q ${parseFloat(amount || 0).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const STATUS_CONFIG = {
  pendiente:  { label: 'Pendiente',  color: COLORS.warning, bg: '#FEF3C7' },
  aprobada:   { label: 'Aprobada',   color: COLORS.success, bg: '#E6F9F2' },
  rechazada:  { label: 'Rechazada',  color: COLORS.error,   bg: '#FEE2E2' },
  cancelada:  { label: 'Cancelada',  color: COLORS.textSecondary, bg: COLORS.borderLight },
  finalizada: { label: 'Finalizada', color: COLORS.info,    bg: '#DBEAFE' },
};

const MyCreditsScreen = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRequests = async () => {
    try {
      const data = await getMyCreditRequests();
      setRequests(data.data || data);
    } catch {
      Alert.alert('Error', 'No se pudieron cargar tus solicitudes.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchRequests(); }, []));

  if (loading) {
    return <View style={[COMMON_STYLES.container, COMMON_STYLES.center]}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  }

  return (
    <View style={COMMON_STYLES.container}>
      <FlatList
        data={requests}
        keyExtractor={(item) => String(item._id)}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchRequests(); }} colors={[COLORS.primary]} />}
        ListEmptyComponent={
          <View style={[COMMON_STYLES.center, { marginTop: 60 }]}>
            <Ionicons name="document-text-outline" size={52} color={COLORS.border} />
            <Text style={styles.emptyText}>No tienes solicitudes de crédito</Text>
          </View>
        }
        renderItem={({ item }) => {
          const status = STATUS_CONFIG[item.estado] || STATUS_CONFIG.pendiente;
          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.amount}>{formatCurrency(item.montoSolicitado)}</Text>
                <View style={[styles.badge, { backgroundColor: status.bg }]}>
                  <Text style={[styles.badgeText, { color: status.color }]}>{status.label}</Text>
                </View>
              </View>
              <Text style={styles.plazo}>{item.plazoMeses} meses</Text>
              {item.comentarioAdmin ? (
                <Text style={styles.comment}>{item.comentarioAdmin}</Text>
              ) : null}
            </View>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  list: { padding: THEME.spacing.lg, paddingBottom: 40 },
  card: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  amount: { fontSize: 20, fontWeight: '800', color: COLORS.primary },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  plazo: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
  comment: { fontSize: 12, color: COLORS.textSecondary, fontStyle: 'italic', marginTop: 6 },
  emptyText: { fontSize: 15, color: COLORS.textSecondary, marginTop: 12 },
});

export default MyCreditsScreen;