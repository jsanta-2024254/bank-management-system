import React, { useCallback } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, ScrollView, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../shared/constants/colors';
import { COMMON_STYLES, THEME } from '../../../shared/constants/theme';
import useAuthStore from '../../../store/useAuthStore';

const MenuItem = ({ icon, label, sublabel, onPress, danger }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
    <View style={[styles.menuIcon, { backgroundColor: danger ? '#FEE2E2' : COLORS.primarySurface }]}>
      <Ionicons name={icon} size={20} color={danger ? COLORS.error : COLORS.primary} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={[styles.menuLabel, danger && { color: COLORS.error }]}>{label}</Text>
      {sublabel ? <Text style={styles.menuSublabel}>{sublabel}</Text> : null}
    </View>
    <Ionicons name="chevron-forward" size={18} color={COLORS.border} />
  </TouchableOpacity>
);

const ProfileScreen = ({ navigation }) => {
  const { user, logout, refreshProfile } = useAuthStore();

  useFocusEffect(useCallback(() => { refreshProfile(); }, []));

  const handleLogout = () => {
    Alert.alert('Cerrar sesión', '¿Estás seguro que deseas salir?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: logout },
    ]);
  };

  const initials = `${user?.firstName?.charAt(0) || ''}${user?.lastName?.charAt(0) || ''}`.toUpperCase() || 'U';

  return (
    <ScrollView style={COMMON_STYLES.container} contentContainerStyle={{ paddingBottom: 40 }}>

      {/* Header de perfil */}
      <View style={styles.header}>
        <View style={styles.avatarBox}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.name}>{user?.firstName} {user?.lastName}</Text>
        <Text style={styles.username}>@{user?.username}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      {/* Menú */}
      <View style={styles.section}>
        <Text style={COMMON_STYLES.sectionTitle}>Mi cuenta</Text>
        <MenuItem
          icon="person-outline"
          label="Editar perfil"
          sublabel="Nombre, dirección, trabajo, ingresos"
          onPress={() => navigation.navigate('EditProfile')}
        />
        <MenuItem
          icon="lock-closed-outline"
          label="Cambiar contraseña"
          sublabel="Actualiza tu contraseña de acceso"
          onPress={() => navigation.navigate('ChangePassword')}
        />
      </View>

      <View style={styles.section}>
        <Text style={COMMON_STYLES.sectionTitle}>Sesión</Text>
        <MenuItem
          icon="log-out-outline"
          label="Cerrar sesión"
          onPress={handleLogout}
          danger
        />
      </View>

      <Text style={styles.version}>BancoApp v1.0.0</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.primary, alignItems: 'center',
    paddingTop: 48, paddingBottom: 32, paddingHorizontal: THEME.spacing.lg,
  },
  avatarBox: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  avatarText: { fontSize: 30, fontWeight: '800', color: COLORS.white },
  name: { fontSize: 20, fontWeight: '700', color: COLORS.white },
  username: { fontSize: 14, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  email: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  section: { padding: THEME.spacing.lg, paddingBottom: 0 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: 14,
    padding: 14, marginBottom: 10, gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  menuIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  menuLabel: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  menuSublabel: { fontSize: 12, color: COLORS.textSecondary, marginTop: 1 },
  version: { textAlign: 'center', fontSize: 12, color: COLORS.border, marginTop: 32 },
});

export default ProfileScreen;