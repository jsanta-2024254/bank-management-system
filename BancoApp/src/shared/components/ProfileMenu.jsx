import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../constants/colors';
import { THEME } from '../constants/theme';
import useAuthStore from '../../store/useAuthStore';

const ProfileMenu = () => {
  const [visible, setVisible] = useState(false);
  const navigation = useNavigation();
  const { user, logout } = useAuthStore();

  const initials = `${user?.name?.charAt(0) || ''}${user?.surname?.charAt(0) || ''}`.toUpperCase() || 'U';

  const handleLogout = () => {
    setVisible(false);
    Alert.alert('Cerrar sesión', '¿Estás seguro que deseas salir?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: logout },
    ]);
  };

    const goTo = (screen, stackName) => {
    setVisible(false);
    navigation.navigate(stackName, { screen });
    };

    const MENU_ITEMS = [
    { icon: 'person-outline',      label: 'Mi perfil',           onPress: () => goTo('ProfileHome', 'ProfileStack') },
    { icon: 'cube-outline',        label: 'Productos',           onPress: () => goTo('ProductsHome', 'ProductsStack') },
    { icon: 'lock-closed-outline', label: 'Cambiar contraseña',  onPress: () => goTo('ChangePassword', 'ProfileStack') },
    ];

  return (
    <>
      <TouchableOpacity style={styles.avatarBtn} onPress={() => setVisible(true)} activeOpacity={0.8}>
        <Text style={styles.avatarText}>{initials}</Text>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setVisible(false)}>
          <View style={styles.menuBox}>
            {/* Info usuario */}
            <View style={styles.userInfo}>
              <View style={styles.userAvatarBig}>
                <Text style={styles.userAvatarText}>{initials}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.userName}>{user?.name} {user?.surname}</Text>
                <Text style={styles.userEmail}>{user?.email}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {MENU_ITEMS.map((item, i) => (
              <TouchableOpacity key={i} style={styles.menuItem} onPress={item.onPress}>
                <Ionicons name={item.icon} size={20} color={COLORS.text} />
                <Text style={styles.menuItemText}>{item.label}</Text>
              </TouchableOpacity>
            ))}

            <View style={styles.divider} />

            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
              <Text style={[styles.menuItemText, { color: COLORS.error }]}>Cerrar sesión</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  avatarBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 15, fontWeight: '700', color: COLORS.white },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  menuBox: {
    position: 'absolute', top: 90, right: 16,
    backgroundColor: COLORS.surface, borderRadius: 16,
    paddingVertical: 8, width: 250,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 12, elevation: 8,
  },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14 },
  userAvatarBig: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.primarySurface, justifyContent: 'center', alignItems: 'center',
  },
  userAvatarText: { fontSize: 17, fontWeight: '700', color: COLORS.primary },
  userName: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  userEmail: { fontSize: 12, color: COLORS.textSecondary, marginTop: 1 },
  divider: { height: 1, backgroundColor: COLORS.borderLight, marginVertical: 4 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 16 },
  menuItemText: { fontSize: 14, fontWeight: '500', color: COLORS.text },
});

export default ProfileMenu;