import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FavoritesScreen from '../../features/favorites/screens/FavoritesScreen';
import AddFavoriteScreen from '../../features/favorites/screens/AddFavoriteScreen';
import { COLORS } from '../../shared/constants/colors';

const Stack = createNativeStackNavigator();

const FavoritesStack = () => (
  <Stack.Navigator screenOptions={{
    headerStyle: { backgroundColor: COLORS.primary },
    headerTintColor: COLORS.white,
    headerTitleStyle: { fontWeight: '700' },
  }}>
    <Stack.Screen name="FavoritesList" component={FavoritesScreen}    options={{ title: 'Cuentas favoritas' }} />
    <Stack.Screen name="AddFavorite"   component={AddFavoriteScreen}  options={{ title: 'Agregar favorito' }} />
  </Stack.Navigator>
);

export default FavoritesStack;