import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileScreen from '../../features/profile/screens/ProfileScreen';
import EditProfileScreen from '../../features/profile/screens/EditProfileScreen';
import ChangePasswordScreen from '../../features/profile/screens/ChangePasswordScreen';
import { COLORS } from '../../shared/constants/colors';

const Stack = createNativeStackNavigator();

const ProfileStack = () => (
  <Stack.Navigator screenOptions={{
    headerStyle: { backgroundColor: COLORS.primary },
    headerTintColor: COLORS.white,
    headerTitleStyle: { fontWeight: '700' },
  }}>
    <Stack.Screen name="ProfileHome"    component={ProfileScreen}       options={{ title: 'Mi perfil' }} />
    <Stack.Screen name="EditProfile"    component={EditProfileScreen}   options={{ title: 'Editar perfil' }} />
    <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ title: 'Cambiar contraseña' }} />
  </Stack.Navigator>
);

export default ProfileStack;