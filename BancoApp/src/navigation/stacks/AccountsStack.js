import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AccountsScreen from '../../features/accounts/screens/AccountsScreen';
import AccountDetailScreen from '../../features/accounts/screens/AccountDetailScreen';
import { COLORS } from '../../shared/constants/colors';

const Stack = createNativeStackNavigator();

const AccountsStack = () => (
  <Stack.Navigator screenOptions={{
    headerStyle: { backgroundColor: COLORS.primary },
    headerTintColor: COLORS.white,
    headerTitleStyle: { fontWeight: '700' },
  }}>
    <Stack.Screen name="AccountsHome"  component={AccountsScreen}       options={{ title: 'Mis cuentas' }} />
    <Stack.Screen 
      name="AccountDetail" 
      component={AccountDetailScreen}   
      options={{ 
        title: 'Detalle de cuenta',
        headerStyle: { backgroundColor: COLORS.background },
        headerTintColor: COLORS.primary,
        headerTitleStyle: { fontWeight: '700', color: COLORS.primary },
      }} 
    />
  </Stack.Navigator>
);

export default AccountsStack;