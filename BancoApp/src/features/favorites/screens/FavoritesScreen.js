import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, RefreshControl, Modal,
  TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../shared/constants/colors';
import { COMMON_STYLES, THEME } from '../../../shared/constants/theme';
import { getFavorites, deleteFavorite, updateFavorite, transferToFavorite } from '../../../api/favorites';
import { getMyAccounts } from '../../../api/accounts';

const formatCurrency = (amount) =>
  `Q ${parseFloat(amount || 0).toLocaleString('es-GT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const FavoritesScreen = ({ navigation }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal transferencia rápida
  const [transferModal, setTransferModal] = useState(false);
  const [selectedFav, setSelectedFav] = useState(null);
  const [monto, setMonto] = useState('');
  const [tipoCuentaOrigen, setTipoCuentaOrigen] = useState('monetaria');
  const [descripcion, setDescripcion] = useState('');
  const [transferLoading, setTransferLoading] = useState(false);
  const [myAccounts, setMyAccounts] = useState([]);

  // Modal editar alias
  const [editModal, setEditModal] = useState(false);
  const [editFav, setEditFav] = useState(null);
  const [newAlias, setNewAlias] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [favsData, accsData] = await Promise.all([
        getFavorites(),
        getMyAccounts(),
      ]);
      setFavorites(favsData.data || favsData);
      setMyAccounts(accsData.data || accsData);
    } catch {
      Alert.alert('Error', 'No se pudieron cargar los favoritos.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchData(); }, []));

  const handleDelete = (fav) => {
    Alert.alert(
      'Eliminar favorito',
      `¿Eliminar "${fav.alias}" de tus favoritos?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar', style: 'destructive',
          onPress: async () => {
            try {
              await deleteFavorite(fav._id);
              setFavorites(prev => prev.filter(f => f._id !== fav._id));
            } catch {
              Alert.alert('Error', 'No se pudo eliminar el favorito.');
            }
          },
        },
      ]
    );
  };

  const handleOpenTransfer = (fav) => {
    setSelectedFav(fav);
    setMonto('');
    setDescripcion('');
    setTipoCuentaOrigen(myAccounts[0]?.tipoCuenta || 'monetaria');
    setTransferModal(true);
  };

  const handleTransfer = async () => {
    const numAmount = parseFloat(monto);
    if (!monto || isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Monto inválido', 'Ingresa un monto válido.'); return;
    }
    if (numAmount > 2000) {
      Alert.alert('Límite excedido', 'El máximo por transferencia es Q2,000.'); return;
    }

    const cuentaOrigen = myAccounts.find(a => a.tipoCuenta === tipoCuentaOrigen);
    if (cuentaOrigen && numAmount > parseFloat(cuentaOrigen.saldo || 0)) {
      Alert.alert('Saldo insuficiente', 'No tienes saldo suficiente.'); return;
    }

    setTransferLoading(true);
    try {
      await transferToFavorite(selectedFav._id, {
        monto: numAmount,
        tipoCuentaOrigen,
        descripcion: descripcion.trim() || undefined,
      });
      setTransferModal(false);
      Alert.alert('✅ Transferencia exitosa', `Se enviaron ${formatCurrency(numAmount)} a ${selectedFav.alias}.`);
      fetchData();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'No se pudo completar la transferencia.');
    } finally {
      setTransferLoading(false);
    }
  };

  const handleOpenEdit = (fav) => {
    setEditFav(fav);
    setNewAlias(fav.alias);
    setEditModal(true);
  };

  const handleEditAlias = async () => {
    if (!newAlias.trim()) {
      Alert.alert('Requerido', 'El alias no puede estar vacío.'); return;
    }
    setEditLoading(true);
    try {
      await updateFavorite(editFav._id, { alias: newAlias.trim() });
      setFavorites(prev => prev.map(f => f._id === editFav._id ? { ...f, alias: newAlias.trim() } : f));
      setEditModal(false);
    } catch {
      Alert.alert('Error', 'No se pudo actualizar el alias.');
    } finally {
      setEditLoading(false);
    }
  };

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
        data={favorites}
        keyExtractor={item => String(item._id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} colors={[COLORS.primary]} />}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('AddFavorite')} activeOpacity={0.85}>
            <Ionicons name="add-circle" size={22} color={COLORS.white} />
            <Text style={styles.addBtnText}>Agregar cuenta favorita</Text>
          </TouchableOpacity>
        }
        ListEmptyComponent={
          <View style={[COMMON_STYLES.center, { marginTop: 60 }]}>
            <Ionicons name="heart-outline" size={52} color={COLORS.border} />
            <Text style={styles.emptyTitle}>Sin favoritos aún</Text>
            <Text style={styles.emptySubtitle}>Agrega cuentas frecuentes para transferir más rápido.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardLeft}>
              <View style={styles.avatarBox}>
                <Text style={styles.avatarText}>{item.alias?.charAt(0).toUpperCase() || '?'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.alias}>{item.alias}</Text>
                <Text style={styles.accountInfo}>
                  {item.tipoCuenta === 'monetaria' ? 'Monetaria' : 'Ahorro'} · {item.numeroCuenta}
                </Text>
                {item.cuenta?.saldo !== undefined && (
                  <Text style={styles.saldo}>{formatCurrency(item.cuenta.saldo)}</Text>
                )}
              </View>
            </View>
            <View style={styles.cardActions}>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: COLORS.primarySurface }]} onPress={() => handleOpenTransfer(item)}>
                <Ionicons name="swap-horizontal" size={18} color={COLORS.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: COLORS.background }]} onPress={() => handleOpenEdit(item)}>
                <Ionicons name="pencil-outline" size={18} color={COLORS.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#FEE2E2' }]} onPress={() => handleDelete(item)}>
                <Ionicons name="trash-outline" size={18} color={COLORS.error} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Modal transferencia rápida */}
      <Modal visible={transferModal} transparent animationType="slide">
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Transferencia rápida</Text>
            <Text style={styles.modalSubtitle}>A: <Text style={{ fontWeight: '700', color: COLORS.primary }}>{selectedFav?.alias}</Text></Text>
            <Text style={styles.modalSubtitle}>{selectedFav?.numeroCuenta} · {selectedFav?.tipoCuenta}</Text>

            <Text style={[COMMON_STYLES.label, { marginTop: 16 }]}>Cuenta origen</Text>
            <View style={styles.typeRow}>
              {myAccounts.map(acc => (
                <TouchableOpacity
                  key={String(acc._id)}
                  style={[styles.typeBtn, tipoCuentaOrigen === acc.tipoCuenta && styles.typeBtnActive]}
                  onPress={() => setTipoCuentaOrigen(acc.tipoCuenta)}
                >
                  <Text style={[styles.typeBtnText, tipoCuentaOrigen === acc.tipoCuenta && styles.typeBtnTextActive]}>
                    {acc.tipoCuenta === 'monetaria' ? 'Monetaria' : 'Ahorro'}
                  </Text>
                  <Text style={[styles.typeBtnSaldo, tipoCuentaOrigen === acc.tipoCuenta && { color: COLORS.primary }]}>
                    {formatCurrency(acc.saldo)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={COMMON_STYLES.label}>Monto (Q)</Text>
            <TextInput
              style={COMMON_STYLES.input}
              placeholder="0.00"
              placeholderTextColor={COLORS.textSecondary}
              value={monto}
              onChangeText={setMonto}
              keyboardType="decimal-pad"
            />

            <Text style={COMMON_STYLES.label}>Descripción (opcional)</Text>
            <TextInput
              style={COMMON_STYLES.input}
              placeholder="Ej. Pago de renta"
              placeholderTextColor={COLORS.textSecondary}
              value={descripcion}
              onChangeText={setDescripcion}
              maxLength={100}
            />

            <TouchableOpacity
              style={[COMMON_STYLES.primaryButton, transferLoading && COMMON_STYLES.primaryButtonDisabled]}
              onPress={handleTransfer}
              disabled={transferLoading}
            >
              {transferLoading
                ? <ActivityIndicator color={COLORS.white} />
                : <Text style={COMMON_STYLES.buttonText}>Transferir</Text>
              }
            </TouchableOpacity>
            <TouchableOpacity style={[COMMON_STYLES.secondaryButton, { marginTop: 10 }]} onPress={() => setTransferModal(false)}>
              <Text style={COMMON_STYLES.secondaryButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal editar alias */}
      <Modal visible={editModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Editar alias</Text>
            <Text style={COMMON_STYLES.label}>Nuevo alias</Text>
            <TextInput
              style={COMMON_STYLES.input}
              value={newAlias}
              onChangeText={setNewAlias}
              maxLength={80}
              autoFocus
            />
            <TouchableOpacity
              style={[COMMON_STYLES.primaryButton, editLoading && COMMON_STYLES.primaryButtonDisabled]}
              onPress={handleEditAlias}
              disabled={editLoading}
            >
              {editLoading
                ? <ActivityIndicator color={COLORS.white} />
                : <Text style={COMMON_STYLES.buttonText}>Guardar</Text>
              }
            </TouchableOpacity>
            <TouchableOpacity style={[COMMON_STYLES.secondaryButton, { marginTop: 10 }]} onPress={() => setEditModal(false)}>
              <Text style={COMMON_STYLES.secondaryButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  list: { padding: THEME.spacing.lg, paddingBottom: 40 },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.primaryLight, borderRadius: 12,
    padding: 14, marginBottom: 20, gap: 8,
  },
  addBtnText: { color: COLORS.white, fontSize: 15, fontWeight: '600' },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: 14,
    padding: 14, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  avatarBox: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: COLORS.primarySurface, justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 20, fontWeight: '700', color: COLORS.primary },
  alias: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  accountInfo: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  saldo: { fontSize: 13, fontWeight: '600', color: COLORS.primary, marginTop: 2 },
  cardActions: { flexDirection: 'row', gap: 6 },
  actionBtn: {
    width: 36, height: 36, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
  },
  emptyTitle: { fontSize: 17, fontWeight: '600', color: COLORS.text, marginTop: 14 },
  emptySubtitle: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', marginTop: 6, lineHeight: 19 },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: COLORS.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: THEME.spacing.lg, paddingBottom: 32,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 6 },
  modalSubtitle: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 2 },
  typeRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  typeBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 8,
    borderWidth: 1.5, borderColor: COLORS.border,
    alignItems: 'center', backgroundColor: COLORS.surface,
  },
  typeBtnActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primarySurface },
  typeBtnText: { fontSize: 13, fontWeight: '500', color: COLORS.textSecondary },
  typeBtnTextActive: { color: COLORS.primary, fontWeight: '700' },
  typeBtnSaldo: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
});

export default FavoritesScreen;