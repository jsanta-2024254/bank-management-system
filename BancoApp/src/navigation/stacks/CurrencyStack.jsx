import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CurrencyScreen from '../../features/currency/screens/CurrencyScreen';
import { COLORS } from '../../shared/constants/colors';

const Stack = createNativeStackNavigator();

const CurrencyStack = () => (
  <Stack.Navigator screenOptions={{
    headerStyle: { backgroundColor: COLORS.primary },
    headerTintColor: COLORS.white,
    headerTitleStyle: { fontWeight: '700' },
  }}>
    <Stack.Screen name="CurrencyHome" component={CurrencyScreen} options={{ title: 'Divisas' }} />
  </Stack.Navigator>
);

export default CurrencyStack;