import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProductsScreen from '../../features/products/screens/ProductsScreen';
import ProductDetailScreen from '../../features/products/screens/ProductDetailScreen';
import MyCreditsScreen from '../../features/products/screens/MyCreditsScreen';
import { COLORS } from '../../shared/constants/colors';

const Stack = createNativeStackNavigator();

const ProductsStack = () => (
  <Stack.Navigator screenOptions={{
    headerStyle: { backgroundColor: COLORS.primary },
    headerTintColor: COLORS.white,
    headerTitleStyle: { fontWeight: '700' },
  }}>
    <Stack.Screen name="ProductsHome" component={ProductsScreen} options={{ title: 'Productos' }} />
    <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'Detalle' }} />
    <Stack.Screen name="MyCredits" component={MyCreditsScreen} options={{ title: 'Mis créditos' }} />
  </Stack.Navigator>
);

export default ProductsStack;