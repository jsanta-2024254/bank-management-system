import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../shared/constants/colors';
import { COMMON_STYLES, THEME } from '../../../shared/constants/theme';
import { getFavorites, deleteFavorite } from '../../../api/favorites';

const FavoritesScreen = ({ navigation }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFavorites = async () => {
    try {
      const data = await getFavorites();
      setFavorites(data.data || data);
    } catch {
      Alert.alert('Error', 'No se pudieron cargar los favoritos.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchFavorites(); }, []));

  const handleDelete = (id, alias) => {
    Alert.alert(
      'Eliminar favorito',
      `¿Eliminar "${alias}" de tus favoritos?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar', style: 'destructive',
          onPress: async () => {
            try {
              await deleteFavorite(id);
              setFavorites(prev => prev.filter(f => f._id !== id));
            } catch {
              Alert.alert('Error', 'No se pudo eliminar el favorito.');
            }
          },
        },
      ]
    );
  };

  const handleTransfer = (fav) => {
    navigation.navigate('Transferir', {
      screen: 'Transfer',
      params: { favorite: fav },
    });
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
        keyExtractor={item => item._id || item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchFavorites(); }} colors={[COLORS.primary]} />}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('AddFavorite')}>
            <Ionicons name="add-circle" size={22} color={COLORS.white} />
            <Text style={styles.addBtnText}>Agregar favorito</Text>
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
              <View>
                <Text style={styles.alias}>{item.alias}</Text>
                <Text style={styles.accountInfo}>
                  {item.accountType === 'monetaria' ? 'Monetaria' : 'Ahorro'} · {item.accountNumber}
                </Text>
              </View>
            </View>
            <View style={styles.cardActions}>
              <TouchableOpacity style={styles.actionBtn} onPress={() => handleTransfer(item)}>
                <Ionicons name="swap-horizontal" size={20} color={COLORS.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item._id || item.id, item.alias)}>
                <Ionicons name="trash-outline" size={20} color={COLORS.error} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
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
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.surface, borderRadius: 14,
    padding: 14, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  avatarBox: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.primarySurface, justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: '700', color: COLORS.primary },
  alias: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  accountInfo: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  cardActions: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center',
  },
  emptyTitle: { fontSize: 17, fontWeight: '600', color: COLORS.text, marginTop: 14 },
  emptySubtitle: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', marginTop: 6, lineHeight: 19 },
});

export default FavoritesScreen;