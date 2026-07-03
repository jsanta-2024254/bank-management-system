import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../shared/constants/colors';
import { COMMON_STYLES, THEME } from '../../../shared/constants/theme';
import { getProducts } from '../../../api/products';

const TYPE_CONFIG = {
  ahorro:       { label: 'Ahorro',       icon: 'wallet-outline',         color: COLORS.success },
  credito:      { label: 'Crédito',      icon: 'cash-outline',           color: COLORS.primary },
  inversion:    { label: 'Inversión',    icon: 'trending-up-outline',    color: COLORS.warning },
  servicio:     { label: 'Servicio',     icon: 'construct-outline',      color: COLORS.info },
  suscripcion:  { label: 'Suscripción',  icon: 'repeat-outline',         color: COLORS.primaryLight },
};

const FILTERS = [
  { key: null,           label: 'Todos' },
  { key: 'credito',      label: 'Créditos' },
  { key: 'ahorro',       label: 'Ahorro' },
  { key: 'inversion',    label: 'Inversión' },
  { key: 'servicio',     label: 'Servicios' },
  { key: 'suscripcion',  label: 'Suscripciones' },
];

const ProductCard = ({ product, onPress }) => {
  const config = TYPE_CONFIG[product.tipo] || TYPE_CONFIG.servicio;
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.iconBox, { backgroundColor: `${config.color}20` }]}>
        <Ionicons name={config.icon} size={24} color={config.color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardType}>{config.label}</Text>
        <Text style={styles.cardName}>{product.nombre}</Text>
        <Text style={styles.cardDesc} numberOfLines={2}>{product.descripcion}</Text>
        {product.tipo === 'credito' && product.tasaInteres ? (
          <Text style={styles.cardRate}>Tasa: {product.tasaInteres}% anual</Text>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color={COLORS.border} />
    </TouchableOpacity>
  );
};

const ProductsScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProducts = async (tipo) => {
    try {
      const params = tipo ? { tipo } : {};
      const data = await getProducts(params);
      setProducts(data.data || data);
    } catch {
      Alert.alert('Error', 'No se pudieron cargar los productos.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchProducts(filter); }, [filter]));

  const onRefresh = () => { setRefreshing(true); fetchProducts(filter); };

  return (
    <View style={COMMON_STYLES.container}>
      {/* Filtros */}
      <View style={styles.filtersWrapper}>
        <FlatList
          horizontal
          data={FILTERS}
          keyExtractor={(item) => String(item.key)}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.chip, filter === item.key && styles.chipActive]}
              onPress={() => setFilter(item.key)}
            >
              <Text style={[styles.chipText, filter === item.key && styles.chipTextActive]}>{item.label}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => String(item._id)}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
          renderItem={({ item }) => (
            <ProductCard product={item} onPress={() => navigation.navigate('ProductDetail', { product: item })} />
          )}
          ListEmptyComponent={
            <View style={[COMMON_STYLES.center, { marginTop: 60 }]}>
              <Ionicons name="cube-outline" size={52} color={COLORS.border} />
              <Text style={styles.emptyText}>No hay productos disponibles</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity
        style={styles.myCreditsBtn}
        onPress={() => navigation.navigate('MyCredits')}
      >
        <Ionicons name="document-text-outline" size={18} color={COLORS.primary} />
        <Text style={styles.myCreditsText}>Mis solicitudes de crédito</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  filtersWrapper: { borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  filtersList: { paddingHorizontal: THEME.spacing.lg, paddingVertical: 12, gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    backgroundColor: COLORS.borderLight, borderWidth: 1, borderColor: COLORS.border, marginRight: 8,
  },
  chipActive: { backgroundColor: COLORS.primarySurface, borderColor: COLORS.primaryLight },
  chipText: { fontSize: 13, fontWeight: '500', color: COLORS.textSecondary },
  chipTextActive: { color: COLORS.primary, fontWeight: '700' },
  list: { padding: THEME.spacing.lg, paddingBottom: 80 },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  iconBox: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  cardType: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '600', textTransform: 'uppercase' },
  cardName: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginTop: 2 },
  cardDesc: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  cardRate: { fontSize: 12, color: COLORS.primary, fontWeight: '600', marginTop: 4 },
  emptyText: { fontSize: 15, color: COLORS.textSecondary, marginTop: 12 },
  myCreditsBtn: {
    position: 'absolute', bottom: 16, left: 16, right: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 14,
    borderWidth: 1.5, borderColor: COLORS.primaryLight,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3,
  },
  myCreditsText: { fontSize: 14, fontWeight: '600', color: COLORS.primary },
});

export default ProductsScreen;